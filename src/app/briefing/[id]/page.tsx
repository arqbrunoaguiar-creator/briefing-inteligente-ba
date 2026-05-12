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

type Answers = Record<string, unknown>;
interface ClientData { clientName: string; spouseName: string; children: { name: string; age: string }[]; rooms: string[] }

const roomKeyMap: Record<string, string> = {
  'Suíte Master': 'suite-master', 'Cozinha': 'cozinha', 'Sala de Estar / Jantar': 'sala-estar',
  'Lavabo': 'lavabo', 'Home Office': 'home-office', 'Banheiro': 'banheiro',
  'Área de Serviço': 'area-servico', 'Varanda / Terraço': 'varanda', 'Quarto': 'quarto',
};

export default function BriefingPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [client, setClient] = useState<ClientData | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [selectedStyles, setSelectedStyles] = useState<Record<number, string>>({});
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState('');
  const [priorities, setPriorities] = useState(priorityItems);
  const [roomHabits, setRoomHabits] = useState<Record<string, string[]>>({});
  const [roomEquip, setRoomEquip] = useState<Record<string, string[]>>({});
  const [roomNotes, setRoomNotes] = useState<Record<string, string>>({});
  const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`briefing-${params.id}`);
      if (raw) setClient(JSON.parse(raw));
    }
  }, [params.id]);

  if (!client) return <div className={styles.loading}>Carregando briefing premium...</div>;

  const rooms = client.rooms.map(r => roomKeyMap[r] || r).filter(r => roomTemplates[r]);
  
  // Mapeamento dinâmico dos steps
  const styleStart = 1; 
  const styleEnd = styleStart + styleQuestions.length - 1;
  const wordsStep = styleEnd + 1; 
  const hobbiesStep = wordsStep + 1;
  const propertyStep = hobbiesStep + 1; 
  const investStep = propertyStep + 1;
  const prioStep = investStep + 1; 
  const dynStep = prioStep + 1;
  const roomStart = dynStep + 1; 
  const roomEnd = roomStart + rooms.length - 1;
  const reviewStep = roomEnd + 1; 
  const totalSteps = reviewStep + 1;

  const getPhase = () => {
    if (step === 0) return 'Identidade';
    if (step <= styleEnd) return `Estilo · ${step}`;
    if (step === wordsStep || step === hobbiesStep) return 'Perfil';
    if (step <= dynStep) return 'Diretrizes';
    if (step <= roomEnd) return 'Ambientes';
    return 'Dossiê';
  };

  const nav = (dir: 'next' | 'prev') => { 
    setAnimDir(dir); 
    setStep(s => dir === 'next' ? Math.min(s + 1, reviewStep) : Math.max(s - 1, 0)); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const set = (k: string, v: unknown) => setAnswers(a => ({ ...a, [k]: v }));
  const tog = (arr: string[], item: string) => arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const currentRoom = step >= roomStart && step <= roomEnd ? roomTemplates[rooms[step - roomStart]] : null;

  const handleFinish = async () => {
    setIsSaving(true);
    const briefingPayload = {
      id: params.id,
      client_name: client.clientName,
      answers: {
        family: client,
        styles: selectedStyles,
        words: selectedWords,
        hobbies: selectedHobbies,
        investment: selectedInvestment,
        priorities: priorities,
        dynamics: answers,
        rooms: { habits: roomHabits, equip: roomEquip, notes: roomNotes }
      },
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('briefings').upsert(briefingPayload);
    } catch (e) { console.error(e); }

    localStorage.setItem(`briefing-${params.id}`, JSON.stringify(briefingPayload));
    router.push(`/dossie/${params.id}`);
  };

  // ======= RENDER HELPERS =======
  const renderStepContent = () => {
    if (step === 0) return (
      <div className={styles.section}>
        <span className={styles.tag}>Início</span>
        <h2 style={{ color: '#0d1b2a', fontSize: '2.5rem' }}>Olá, {client.clientName}!</h2>
        <p className={styles.desc}>Seu projeto será moldado pelas próximas respostas. Vamos começar?</p>
        <div className={styles.familyInfo} style={{ background: 'rgba(13, 27, 42, 0.05)', padding: '1.2rem', borderRadius: '12px', marginTop: '1rem', color: '#0d1b2a' }}>
           <p><strong>Cônjuge:</strong> {client.spouseName || 'Nenhum'}</p>
           <p><strong>Filhos:</strong> {client.children.length > 0 ? client.children.map(c => c.name).join(', ') : 'Nenhum'}</p>
        </div>
      </div>
    );

    if (step >= styleStart && step <= styleEnd) {
      const q = styleQuestions[step - styleStart];
      return (
        <div className={styles.section}>
          <span className={styles.tag}>Parte 1: Estilo</span>
          <h2 style={{ color: '#0d1b2a' }}>{q.question}</h2>
          <div className={styles.styleGrid}>
            {q.options.map(opt => (
              <button key={opt.id} className={`${styles.styleCard} ${selectedStyles[q.id] === opt.id ? styles.styleActive : ''}`}
                onClick={() => setSelectedStyles(s => ({ ...s, [q.id]: opt.id }))}>
                <div className={styles.styleImg} style={{ background: opt.gradient }}>{opt.image && <img src={opt.image} alt={opt.label} className={styles.stylePhoto} />}</div>
                <div className={styles.styleInfo}><strong style={{ color: selectedStyles[q.id] === opt.id ? '#fff' : '#0d1b2a' }}>{opt.label}</strong></div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === wordsStep) return (
      <div className={styles.section}>
        <span className={styles.tag}>Parte 2: Essência</span>
        <h2 style={{ color: '#0d1b2a' }}>Palavras que definem seu lar</h2>
        <div className={styles.wordGroups}>
          {wordGroups.map(g => (
            <button key={g.id} className={`${styles.wordGroup} ${selectedWords.includes(g.id) ? styles.wordActive : ''}`}
              onClick={() => setSelectedWords(p => tog(p as unknown as string[], g.id as unknown as string) as unknown as number[])}>
              {g.words.map(w => <span key={w} style={{ color: selectedWords.includes(g.id) ? '#fff' : '#0d1b2a' }}>{w}</span>)}
            </button>
          ))}
        </div>
      </div>
    );

    if (step === hobbiesStep) return (
      <div className={styles.section}>
        <span className={styles.tag}>Parte 2: Perfil</span>
        <h2 style={{ color: '#0d1b2a' }}>O que você ama fazer?</h2>
        <div className={styles.chipGrid}>
          {hobbies.map(h => (
            <button key={h} className={`${styles.chip} ${selectedHobbies.includes(h) ? styles.chipActive : ''}`} onClick={() => setSelectedHobbies(p => tog(p, h))}>{h}</button>
          ))}
        </div>
      </div>
    );

    if (step === dynStep) return (
      <div className={styles.section}>
        <span className={styles.tag}>Parte 3: Dinâmica</span>
        <h2 style={{ color: '#0d1b2a' }}>Rotina e Atmosfera</h2>
        <div className={styles.formGrid}>
          {dynamicsQuestions.map(q => (
            <div key={q.id} className={styles.field}>
              <label style={{ color: '#0d1b2a' }}>{q.question}</label>
              {q.type === 'select' ? (
                <div className={styles.chipGrid}>{q.options!.map(o => (
                  <button key={o} className={`${styles.chip} ${answers[`d_${q.id}`] === o ? styles.chipActive : ''}`} onClick={() => set(`d_${q.id}`, o)}>{o}</button>
                ))}</div>
              ) : (
                <input className="glass-input" style={{ borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} value={(answers[`d_${q.id}`] as string) || ''} onChange={e => set(`d_${q.id}`, e.target.value)} />
              )}
            </div>
          ))}
        </div>
      </div>
    );

    if (currentRoom) return (
      <div className={styles.section}>
        <span className={styles.tag}>Parte 4: {currentRoom.icon}</span>
        <h2 style={{ color: '#0d1b2a' }}>{currentRoom.name}</h2>
        <div className={styles.roomBlock}>
          <h3>Hábitos e Desejos</h3>
          <div className={styles.chipGrid}>{currentRoom.habits.map(h => (
            <button key={h} className={`${styles.chip} ${(roomHabits[currentRoom.id] || []).includes(h) ? styles.chipActive : ''}`}
              onClick={() => setRoomHabits(p => ({ ...p, [currentRoom.id]: tog(p[currentRoom.id] || [], h) }))}>{h}</button>
          ))}</div>
          <textarea className="glass-input" style={{ marginTop: '1.5rem', borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} rows={3} placeholder="Observações..." value={roomNotes[currentRoom.id] || ''} onChange={e => setRoomNotes(p => ({ ...p, [currentRoom.id]: e.target.value }))} />
        </div>
      </div>
    );

    if (step === reviewStep) return (
      <div className={styles.section}>
        <span className={styles.tag}>Finalização</span>
        <h2 style={{ color: '#0d1b2a' }}>Tudo pronto!</h2>
        <p className={styles.desc}>Clique abaixo para salvar e gerar o seu dossiê exclusivo.</p>
        <button className={`glass-button ${styles.submitBtn}`} style={{ background: '#0d1b2a', color: '#fff', width: '100%' }} onClick={handleFinish} disabled={isSaving}>
          {isSaving ? 'Processando...' : 'Gerar Dossiê de Projeto ✨'}
        </button>
      </div>
    );

    return null;
  };

  return (
    <main className={styles.main}>
      <div className={styles.bgSpline}>
        <div className={styles.navyBg}><div className={styles.blob1}></div><div className={styles.blob2}></div></div>
      </div>

      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.92)' }}>
        <Link href="/" className={styles.logoMini}><Image src="/brand/logo-icon-dark.png" alt="BA" width={32} height={32} /></Link>
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
          <motion.div 
            key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`glass-panel ${styles.card}`} style={{ background: 'rgba(255, 255, 255, 0.88)' }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className={styles.footer} style={{ background: 'rgba(255,255,255,0.92)' }}>
        {step > 0 && <button className={`glass-button ${styles.btnBack}`} style={{ color: '#0d1b2a', borderColor: '#0d1b2a' }} onClick={() => nav('prev')}>← Voltar</button>}
        <div style={{ flex: 1 }} />
        {step < reviewStep && <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff' }} onClick={() => nav('next')}>Próxima Pergunta →</button>}
      </footer>
    </main>
  );
}
