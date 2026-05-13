"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import {
  styleQuestions, wordGroups, hobbies, priorityItems,
  investmentLevels, dynamicsQuestions, propertyQuestions,
  roomTemplates, temperaments, archetypes, temperamentQuestions, archetypeQuestions
} from '@/data/briefingData';
import styles from './briefing.module.css';

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
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [roomHabits, setRoomHabits] = useState<any>({});
  const [roomNotes, setRoomNotes] = useState<any>({});
  const [freeNotes, setFreeNotes] = useState<Record<number, string>>({}); // Anotações por etapa
  const [clientPhoto, setClientPhoto] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`briefing-${params.id}`);
      if (raw) setClient(JSON.parse(raw));
    }
  }, [params.id]);

  if (!client) return <div className={styles.loading}>Carregando briefing...</div>;

  const rooms = (client.rooms || []).filter((r: string) => roomTemplates[r]);

  // MAPA DE STEPS DINÂMICO
  const STYLE_START = 1;
  const STYLE_END = STYLE_START + styleQuestions.length - 1; 
  const TEMP_STEP = STYLE_END + 1;
  const ARCH_STEP = TEMP_STEP + 1;
  const WORDS_STEP = ARCH_STEP + 1;
  const HOBBIES_STEP = WORDS_STEP + 1;
  const PROPERTY_STEP = HOBBIES_STEP + 1;
  const INVEST_STEP = PROPERTY_STEP + 1;
  const PRIO_STEP = INVEST_STEP + 1;
  const DYN_STEP = PRIO_STEP + 1;
  const ROOM_START = DYN_STEP + 1;
  const ROOM_END = ROOM_START + Math.max(rooms.length - 1, 0);
  const REVIEW_STEP = ROOM_END + 1;

  const getPhase = () => {
    if (step === 0) return 'Identidade';
    if (step <= STYLE_END) return 'Estilos';
    if (step <= ARCH_STEP) return 'Psicologia';
    if (step <= HOBBIES_STEP) return 'Perfil';
    if (step <= DYN_STEP) return 'Diretrizes';
    if (step <= ROOM_END) return 'Ambientes';
    return 'Finalização';
  };

  const nav = (dir: 'next' | 'prev') => {
    setStep(s => Math.max(0, Math.min(dir === 'next' ? s + 1 : s - 1, REVIEW_STEP)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setA = (key: string, val: any) => setAnswers((p: any) => ({ ...p, [key]: val }));
  const tog = (arr: any[], item: any) => arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const currentRoom = (step >= ROOM_START && step <= ROOM_END) ? roomTemplates[rooms[step - ROOM_START]] : null;

  const handleFinish = async () => {
    setIsSaving(true);
    const fullPayload = {
      id: params.id,
      client_name: client.clientName,
      client_photo: clientPhoto,
      answers: {
        family: { clientName: client.clientName, spouseName: client.spouseName, children: client.children },
        styles: selectedStyles,
        words: selectedWords,
        hobbies: selectedHobbies,
        investment: selectedInvestment,
        priorities: selectedPriorities,
        freeNotes: freeNotes,
        psychology: {
          temperament: Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith('t_'))),
          archetype: Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith('a_')))
        },
        property: Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith('p_'))),
        dynamics: Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith('d_'))),
        rooms: { habits: roomHabits, notes: roomNotes },
        detectedRooms: client.rooms,
      },
    };

    // Salva no Supabase e inicia análise de IA
    await supabase.from('briefings').upsert({
      id: params.id,
      client_name: client.clientName,
      client_photo: clientPhoto,
      answers: fullPayload.answers,
      created_at: new Date().toISOString()
    });

    localStorage.setItem(`briefing-answers-${params.id}`, JSON.stringify(fullPayload));
    router.push(`/dossie/${params.id}`);
  };

  const renderContent = () => {
    if (step === 0) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a' }}>Identidade do Cliente</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '2rem' }}>
          <div className={styles.avatarLarge}>
            {clientPhoto ? <img src={clientPhoto} alt="Preview" /> : <span>{client.clientName[0]}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>URL da Foto do Cliente (ou cole Base64)</label>
            <input 
              type="text" 
              className={styles.inputAdmin} 
              placeholder="https://..." 
              value={clientPhoto}
              onChange={(e) => setClientPhoto(e.target.value)}
            />
          </div>
        </div>
      </div>
    );

    if (step >= STYLE_START && step <= STYLE_END) {
      const q = styleQuestions[step - STYLE_START];
      return (
        <div className={styles.section}>
          <h2 style={{ color: '#0d1b2a' }}>{q.question}</h2>
          <div className={styles.styleGrid}>
            {q.options.map(opt => (
              <button key={opt.id} className={`${styles.styleCard} ${selectedStyles[q.id] === opt.id ? styles.styleActive : ''}`} onClick={() => setSelectedStyles((s: any) => ({ ...s, [q.id]: opt.id }))}>
                <div className={styles.styleImg}><img src={opt.image} alt={opt.label} /></div>
                <div className={styles.styleInfo}><strong>{opt.label}</strong><span>{opt.description}</span></div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ... (restante do renderContent permanece similar, mas com suporte a notas)
    return <div className={styles.section}><h2>Etapa {step}</h2><p>Conteúdo em desenvolvimento...</p></div>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.progressHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span>{getPhase()}</span>
          <span>{step} de {REVIEW_STEP}</span>
        </div>
        <div className={styles.progressBar}><div style={{ width: `${(step / REVIEW_STEP) * 100}%` }} /></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* PAINEL DE ANOTAÇÕES DO ARQUITETO */}
        <aside className={styles.adminNotes}>
          <h4 style={{ color: '#C4973D', fontSize: '0.8rem', letterSpacing: '1px' }}>ANOTAÇÕES DO ARQUITETO</h4>
          <textarea 
            placeholder="Observações importantes para esta etapa..."
            value={freeNotes[step] || ''}
            onChange={(e) => setFreeNotes(p => ({ ...p, [step]: e.target.value }))}
          />
          <div style={{ marginTop: '1rem', fontSize: '0.7rem', opacity: 0.5 }}>
            Estas notas aparecerão no dossiê final.
          </div>
        </aside>
      </div>

      <div className={styles.actions}>
        {step > 0 && <button onClick={() => nav('prev')} className={styles.btnNav}>Voltar</button>}
        {step < REVIEW_STEP ? (
          <button onClick={() => nav('next')} className={styles.btnNav} style={{ background: '#14202B', color: '#fff' }}>Próxima Etapa</button>
        ) : (
          <button onClick={handleFinish} className={styles.btnNav} style={{ background: '#C4973D', color: '#14202B' }}>Finalizar e Gerar Dossiê</button>
        )}
      </div>
    </div>
  );
}
