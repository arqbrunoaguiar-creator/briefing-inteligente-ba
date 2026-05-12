"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import {
  styleQuestions, wordGroups, hobbies, priorityItems,
  investmentLevels, dynamicsQuestions, propertyQuestions,
  roomTemplates, type RoomTemplate
} from '@/data/briefingData';
import styles from './briefing.module.css';

// LINKS ESTÁVEIS DE ALTA QUALIDADE (ARQUITETURA DE LUXO)
const curatedLinks = {
  classico: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
  moderno: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
  industrial: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop",
  minimalista: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200&auto=format&fit=crop",
  contemporaneo: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop"
};

export default function BriefingPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [client, setClient] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [selectedStyles, setSelectedStyles] = useState<any>({});
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState('');
  const [priorities, setPriorities] = useState(priorityItems);
  const [roomHabits, setRoomHabits] = useState<any>({});
  const [roomNotes, setRoomNotes] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`briefing-${params.id}`);
      if (raw) setClient(JSON.parse(raw));
    }
  }, [params.id]);

  if (!client) return <div className={styles.loading}>Sincronizando experiência...</div>;

  const rooms = (client.rooms || []).map((r: string) => r).filter((r: string) => roomTemplates[r] || r);
  
  const styleStart = 1; 
  const styleEnd = styleStart + styleQuestions.length - 1;
  const wordsStep = styleEnd + 1; 
  const hobbiesStep = wordsStep + 1;
  const propertyStep = hobbiesStep + 1; 
  const investStep = propertyStep + 1;
  const prioStep = investStep + 1; 
  const dynStep = prioStep + 1;
  const roomStart = dynStep + 1; 
  const roomEnd = roomStart + (rooms.length > 0 ? rooms.length - 1 : 0);
  const reviewStep = roomEnd + 1;
  const totalSteps = reviewStep + 1;

  const getPhase = () => {
    if (step === 0) return 'Identidade';
    if (step <= styleEnd) return 'Estilos';
    if (step <= hobbiesStep) return 'Perfil';
    if (step <= dynStep) return 'Diretrizes';
    if (step <= roomEnd) return 'Ambientes';
    return 'Dossiê';
  };

  const nav = (dir: 'next' | 'prev') => { 
    setStep(s => dir === 'next' ? Math.min(s + 1, reviewStep) : Math.max(s - 1, 0)); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setA = (k: string, v: any) => setAnswers((prev: any) => ({ ...prev, [k]: v }));
  const tog = (arr: any[], item: any) => arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const currentRoomKey = rooms[step - roomStart];
  const currentRoom = roomTemplates[currentRoomKey] || (currentRoomKey ? { name: currentRoomKey, icon: '🏠', habits: [], id: currentRoomKey } : null);

  const handleFinish = async () => {
    setIsSaving(true);
    const payload = { id: params.id, client_name: client.clientName, answers: { family: client, styles: selectedStyles, words: selectedWords, hobbies: selectedHobbies, investment: selectedInvestment, priorities: priorities, dynamics: answers, rooms: { habits: roomHabits, notes: roomNotes } } };
    try { await supabase.from('briefings').upsert(payload); } catch (e) {}
    localStorage.setItem(`briefing-${params.id}`, JSON.stringify(payload));
    router.push(`/dossie/${params.id}`);
  };

  const renderContent = () => {
    if (step === 0) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a', fontSize: '2.5rem' }}>Olá, {client.clientName}!</h2>
        <p style={{ color: '#0d1b2a', opacity: 0.8 }}>Vamos iniciar o seu briefing premium.</p>
        <div className={styles.familyInfo} style={{ background: 'rgba(13, 27, 42, 0.05)', padding: '1.5rem', borderRadius: '16px', marginTop: '1.5rem', color: '#0d1b2a' }}>
           <p style={{ marginBottom: '0.5rem' }}><strong>Cônjuge:</strong> {client.spouseName || 'Não informado'}</p>
           <p><strong>Filhos:</strong> {client.children?.length > 0 ? client.children.map((c: any) => c.name).join(', ') : 'Nenhum'}</p>
        </div>
      </div>
    );

    if (step >= styleStart && step <= styleEnd) {
      const q = styleQuestions[step - styleStart];
      return (
        <div className={styles.section}>
          <h2 style={{ color: '#0d1b2a' }}>{q.question}</h2>
          <div className={styles.styleGrid}>
            {q.options.map((opt: any) => (
              <button key={opt.id} className={`${styles.styleCard} ${selectedStyles[q.id] === opt.id ? styles.styleActive : ''}`}
                onClick={() => setSelectedStyles((s: any) => ({ ...s, [q.id]: opt.id }))}>
                <div className={styles.styleImg}>
                  <img 
                    src={curatedLinks[opt.id as keyof typeof curatedLinks] || curatedLinks.moderno} 
                    alt={opt.label} 
                    className={styles.stylePhoto} 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=1000'; }}
                  />
                </div>
                <div className={styles.styleInfo}><strong>{opt.label}</strong></div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === wordsStep) return (
      <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Essência do Projeto</h2><div className={styles.wordGroups}>{wordGroups.map(g => (
        <button key={g.id} className={`${styles.wordGroup} ${selectedWords.includes(g.id) ? styles.wordActive : ''}`} onClick={() => setSelectedWords(p => tog(p, g.id))}>
          {g.words.map(w => <span key={w} style={{ color: selectedWords.includes(g.id) ? '#fff' : '#0d1b2a' }}>{w}</span>)}
        </button>
      ))}</div></div>
    );

    if (step === hobbiesStep) return (
      <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Estilo de Vida</h2><div className={styles.chipGrid}>{hobbies.map(h => (
        <button key={h} className={`${styles.chip} ${selectedHobbies.includes(h) ? styles.chipActive : ''}`} onClick={() => setSelectedHobbies(p => tog(p, h))}>{h}</button>
      ))}</div></div>
    );

    if (step === propertyStep) return (
      <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Sobre o Imóvel</h2><div className={styles.formGrid}>{propertyQuestions.map(q => (
        <div key={q.id} className={styles.field}><label style={{ color: '#0d1b2a' }}>{q.question}</label><div className={styles.chipGrid}>{q.options!.map(o => (
          <button key={o} className={`${styles.chip} ${answers[`p_${q.id}`] === o ? styles.chipActive : ''}`} onClick={() => setA(`p_${q.id}`, o)}>{o}</button>
        ))}</div></div>
      ))}</div></div>
    );

    if (step === investStep) return (
      <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Nível de Investimento</h2><div className={styles.styleGrid}>{investmentLevels.map(lv => (
        <button key={lv.id} className={`${styles.styleCard} ${selectedInvestment === lv.id ? styles.styleActive : ''}`} style={{ padding: '2rem', textAlign: 'center' }} onClick={() => setSelectedInvestment(lv.id)}>
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>{lv.icon}</span><strong style={{ color: selectedInvestment === lv.id ? '#fff' : '#0d1b2a' }}>{lv.label}</strong>
        </button>
      ))}</div></div>
    );

    if (step === prioStep) return (
      <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Prioridades</h2><div className={styles.chipGrid}>{priorityItems.map(p => (
        <button key={p} className={`${styles.chip} ${priorities.includes(p) ? styles.chipActive : ''}`} onClick={() => setPriorities(tog(priorities, p))}>{p}</button>
      ))}</div></div>
    );

    if (step === dynStep) return (
      <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Dinâmica</h2><div className={styles.formGrid}>{dynamicsQuestions.map(q => (
        <div key={q.id} className={styles.field}><label style={{ color: '#0d1b2a' }}>{q.question}</label><input className="glass-input" style={{ borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} value={answers[`d_${q.id}`] || ''} onChange={e => setA(`d_${q.id}`, e.target.value)} /></div>
      ))}</div></div>
    );

    if (currentRoom) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a' }}>{currentRoom.name}</h2>
        <div className={styles.chipGrid}>{currentRoom.habits.map((h: string) => (
          <button key={h} className={`${styles.chip} ${(roomHabits[currentRoom.id] || []).includes(h) ? styles.chipActive : ''}`} onClick={() => setRoomHabits((p: any) => ({ ...p, [currentRoom.id]: tog(p[currentRoom.id] || [], h) }))}>{h}</button>
        ))}</div>
        <textarea className="glass-input" style={{ marginTop: '1.5rem', borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} rows={4} value={roomNotes[currentRoom.id] || ''} onChange={e => setRoomNotes((p: any) => ({ ...p, [currentRoom.id]: e.target.value }))} />
      </div>
    );

    if (step === reviewStep) return (
      <div className={styles.section} style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#0d1b2a', fontSize: '2.5rem' }}>Concluído!</h2>
        <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff', width: '100%', padding: '1.5rem', marginTop: '2rem' }} onClick={handleFinish} disabled={isSaving}>{isSaving ? 'Salvando...' : 'Ver Dossiê ✨'}</button>
      </div>
    );

    return null;
  };

  return (
    <main className={styles.main}>
      <div className={styles.bgSpline}><div className={styles.navyBg}><div className={styles.blob1}></div><div className={styles.blob2}></div></div></div>
      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.95)' }}>
        <Link href="/" className={styles.logoMiniContainer}><img src="/brand/logo-icon-dark.png" alt="BA" className={styles.logoMiniFixed} /></Link>
        <div className={styles.headerCenter}>
          <span className={styles.phaseName} style={{ color: '#0d1b2a' }}>{getPhase()}</span>
          <div className={styles.progressTrack} style={{ background: 'rgba(13, 27, 42, 0.1)' }}>
            <motion.div className={styles.progressFill} style={{ background: '#0d1b2a' }} animate={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
          </div>
        </div>
        <span className={styles.stepCount} style={{ color: '#0d1b2a' }}>{step + 1}/{totalSteps}</span>
      </header>
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`glass-panel ${styles.card}`} style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
      <footer className={styles.footer} style={{ background: 'rgba(255,255,255,0.95)' }}>
        {step > 0 && <button className={`glass-button ${styles.btnBack}`} style={{ color: '#0d1b2a', borderColor: '#0d1b2a' }} onClick={() => nav('prev')}>← Voltar</button>}
        <div style={{ flex: 1 }} />
        {step < reviewStep && <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff' }} onClick={() => nav('next')}>Próximo →</button>}
      </footer>
    </main>
  );
}
