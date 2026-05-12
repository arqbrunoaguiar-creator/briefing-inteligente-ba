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

// IMAGENS SELECIONADAS (CURADORIA RS/SC)
const curatedImages = {
  classico: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop",
  moderno: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&auto=format&fit=crop",
  industrial: "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1000&auto=format&fit=crop",
  minimalista: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1000&auto=format&fit=crop",
  luxo: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1000&auto=format&fit=crop"
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
  const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`briefing-${params.id}`);
      if (raw) setClient(JSON.parse(raw));
    }
  }, [params.id]);

  if (!client) return <div className={styles.loading}>Carregando briefing...</div>;

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
    setAnimDir(dir); 
    setStep(s => dir === 'next' ? Math.min(s + 1, reviewStep) : Math.max(s - 1, 0)); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setA = (k: string, v: any) => setAnswers((prev: any) => ({ ...prev, [k]: v }));
  const tog = (arr: any[], item: any) => arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const currentRoomKey = rooms[step - roomStart];
  const currentRoom = roomTemplates[currentRoomKey] || (currentRoomKey ? { name: currentRoomKey, icon: '🏠', habits: ['Viver bem'], equipment: [] } : null);

  const handleFinish = async () => {
    setIsSaving(true);
    const payload = { id: params.id, client_name: client.clientName, answers: { styles: selectedStyles, words: selectedWords, hobbies: selectedHobbies, investment: selectedInvestment, dynamics: answers } };
    try { await supabase.from('briefings').upsert(payload); } catch (e) {}
    router.push(`/dossie/${params.id}`);
  };

  return (
    <main className={styles.main}>
      <div className={styles.bgSpline}><div className={styles.navyBg}><div className={styles.blob1}></div><div className={styles.blob2}></div></div></div>
      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.95)' }}>
        <Link href="/"><Image src="/brand/logo-icon-dark.png" alt="BA" width={32} height={32} /></Link>
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
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`glass-panel ${styles.card}`} style={{ background: 'rgba(255, 255, 255, 0.95)' }}
          >
            {step === 0 && (
              <div className={styles.section}>
                <h2 style={{ color: '#0d1b2a', fontSize: '2.5rem' }}>Olá, {client.clientName}!</h2>
                <p style={{ color: '#333', fontSize: '1.1rem' }}>Vamos iniciar o mapeamento do seu novo lar.</p>
                <div className={styles.familyInfo} style={{ background: 'rgba(13, 27, 42, 0.05)', padding: '1.2rem', borderRadius: '12px', marginTop: '1.5rem', color: '#0d1b2a' }}>
                   <p><strong>Cônjuge:</strong> {client.spouseName || 'Nenhum'}</p>
                   <p><strong>Filhos:</strong> {client.children?.length > 0 ? client.children.map((c: any) => c.name).join(', ') : 'Nenhum'}</p>
                </div>
              </div>
            )}

            {step >= styleStart && step <= styleEnd && (
              <div className={styles.section}>
                <h2 style={{ color: '#0d1b2a' }}>{styleQuestions[step-1].question}</h2>
                <div className={styles.styleGrid}>
                  {styleQuestions[step-1].options.map((opt: any) => (
                    <button key={opt.id} className={`${styles.styleCard} ${selectedStyles[styleQuestions[step-1].id] === opt.id ? styles.styleActive : ''}`}
                      onClick={() => setSelectedStyles((s: any) => ({ ...s, [styleQuestions[step-1].id]: opt.id }))}>
                      <div className={styles.styleImg} style={{ background: '#eee' }}>
                        <img src={curatedImages[opt.id as keyof typeof curatedImages] || curatedImages.moderno} alt={opt.label} className={styles.stylePhoto} />
                      </div>
                      <div className={styles.styleInfo}><strong style={{ color: selectedStyles[styleQuestions[step-1].id] === opt.id ? '#fff' : '#0d1b2a' }}>{opt.label}</strong></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === wordsStep && <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Essência</h2><div className={styles.wordGroups}>{wordGroups.map(g => (
              <button key={g.id} className={`${styles.wordGroup} ${selectedWords.includes(g.id) ? styles.wordActive : ''}`} onClick={() => setSelectedWords(p => tog(p, g.id))}>
                {g.words.map(w => <span key={w} style={{ color: selectedWords.includes(g.id) ? '#fff' : '#0d1b2a' }}>{w}</span>)}
              </button>
            ))}</div></div>}

            {step === hobbiesStep && <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Estilo de Vida</h2><div className={styles.chipGrid}>{hobbies.map(h => (
              <button key={h} className={`${styles.chip} ${selectedHobbies.includes(h) ? styles.chipActive : ''}`} onClick={() => setSelectedHobbies(p => tog(p, h))}>{h}</button>
            ))}</div></div>}

            {step === propertyStep && <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Sobre o Imóvel</h2><div className={styles.formGrid}>{propertyQuestions.map(q => (
              <div key={q.id} className={styles.field}><label style={{ color: '#0d1b2a' }}>{q.question}</label><div className={styles.chipGrid}>{q.options!.map(o => (
                <button key={o} className={`${styles.chip} ${answers[`p_${q.id}`] === o ? styles.chipActive : ''}`} onClick={() => setA(`p_${q.id}`, o)}>{o}</button>
              ))}</div></div>
            ))}</div></div>}

            {step === investStep && <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Investimento</h2><div className={styles.styleGrid}>{investmentLevels.map(lv => (
              <button key={lv.id} className={`${styles.styleCard} ${selectedInvestment === lv.id ? styles.styleActive : ''}`} style={{ padding: '1.5rem' }} onClick={() => setSelectedInvestment(lv.id)}>
                <span style={{ fontSize: '2rem' }}>{lv.icon}</span><strong style={{ color: selectedInvestment === lv.id ? '#fff' : '#0d1b2a', marginTop: '0.5rem' }}>{lv.label}</strong>
              </button>
            ))}</div></div>}

            {step === prioStep && <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Prioridades</h2><div className={styles.chipGrid}>{priorityItems.map(p => (
              <button key={p} className={`${styles.chip} ${priorities.includes(p) ? styles.chipActive : ''}`} onClick={() => setPriorities(tog(priorities, p))}>{p}</button>
            ))}</div></div>}

            {step === dynStep && <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Rotina</h2><div className={styles.formGrid}>{dynamicsQuestions.map(q => (
              <div key={q.id} className={styles.field}><label style={{ color: '#0d1b2a' }}>{q.question}</label><input className="glass-input" style={{ borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} value={answers[`d_${q.id}`] || ''} onChange={e => setA(`d_${q.id}`, e.target.value)} /></div>
            ))}</div></div>}

            {currentRoom && <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>{currentRoom.name}</h2><div className={styles.roomBlock}><h3>O que não pode faltar?</h3><textarea className="glass-input" style={{ borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} rows={4} value={roomNotes[currentRoom.id] || ''} onChange={e => setRoomNotes((p: any) => ({ ...p, [currentRoom.id]: e.target.value }))} /></div></div>}

            {step === reviewStep && <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Finalizar</h2><button className="glass-button" style={{ background: '#0d1b2a', color: '#fff', width: '100%' }} onClick={handleFinish} disabled={isSaving}>{isSaving ? 'Salvando...' : 'Gerar Dossiê →'}</button></div>}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className={styles.footer} style={{ background: 'rgba(255,255,255,0.95)' }}>
        {step > 0 && <button className={`glass-button ${styles.btnBack}`} style={{ color: '#0d1b2a', borderColor: '#0d1b2a' }} onClick={() => nav('prev')}>← Voltar</button>}
        <div style={{ flex: 1 }} />
        {step < reviewStep && <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff' }} onClick={() => nav('next')}>Avançar →</button>}
      </footer>
    </main>
  );
}
