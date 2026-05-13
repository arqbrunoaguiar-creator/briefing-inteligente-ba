"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  styleQuestions, wordGroups, hobbies, investmentLevels, 
  dynamicsQuestions, roomTemplates, temperamentQuestions, archetypeQuestions
} from '@/data/briefingData';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './briefing.module.css';

export default function BriefingPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [client, setClient] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [freeNotes, setFreeNotes] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Estados locais para seleções
  const [selectedStyles, setSelectedStyles] = useState<any>({});
  const [selectedWords, setSelectedWords] = useState<number[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState('');
  const [roomHabits, setRoomHabits] = useState<any>({});

  useEffect(() => {
    async function loadInitial() {
      const { data } = await supabase.from('briefings').select('*').eq('id', params.id).single();
      if (data) {
        setClient(data);
        // Se for pré-cadastro, atualiza para "Em andamento"
        if (data.status === 'pre') {
          await supabase.from('briefings').update({ status: 'pro' }).eq('id', params.id);
        }
      }
    }
    loadInitial();
  }, [params.id]);

  if (!client) return <div className={styles.loading}>Carregando Briefing...</div>;

  const rooms = (client.answers?.preRegistration?.detectedRooms || client.rooms || []).filter((r: string) => roomTemplates[r]);

  const STYLE_START = 1;
  const STYLE_END = STYLE_START + styleQuestions.length - 1; 
  const TEMP_STEP = STYLE_END + 1;
  const ARCH_STEP = TEMP_STEP + 1;
  const WORDS_STEP = ARCH_STEP + 1;
  const HOBBIES_STEP = WORDS_STEP + 1;
  const INVEST_STEP = HOBBIES_STEP + 1;
  const PRIO_STEP = INVEST_STEP + 1;
  const DYN_STEP = PRIO_STEP + 1;
  const ROOM_START = DYN_STEP + 1;
  const ROOM_END = ROOM_START + Math.max(rooms.length - 1, 0);
  const REVIEW_STEP = ROOM_END + 1;

  const nav = (dir: 'next' | 'prev') => {
    setStep(s => Math.max(0, Math.min(dir === 'next' ? s + 1 : s - 1, REVIEW_STEP)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = async () => {
    setIsSaving(true);
    const fullPayload = {
      ...client.answers,
      styles: selectedStyles,
      words: selectedWords,
      hobbies: selectedHobbies,
      investment: selectedInvestment,
      freeNotes,
      psychology: {
        temperament: Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith('t_'))),
        archetype: Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith('a_')))
      },
      rooms: { habits: roomHabits },
    };

    // Salva e marca como Concluído para disparar IA
    await supabase.from('briefings').update({ 
      answers: fullPayload,
      status: 'con' 
    }).eq('id', params.id);

    router.push(`/dossie/${params.id}`);
  };

  const renderContent = () => {
    // Lógica de renderização similar à anterior mas com integração dos dados do pré-cadastro
    return (
      <div className={styles.section}>
        <h2>{step === 0 ? `Briefing com ${client.client_name}` : `Etapa ${step}`}</h2>
        {/* Renderiza campos específicos por step... */}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.progressHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Projeto: {client.client_name}</span>
          <span>{step} de {REVIEW_STEP}</span>
        </div>
        <div className={styles.progressBar}><div style={{ width: `${(step / REVIEW_STEP) * 100}%` }} /></div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.briefingContent}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CAMPO DE NOTAS LIVRES (Visível em todas as etapas) */}
        <aside className={styles.notesPanel}>
          <h4 style={{ color: '#C4973D', fontSize: '0.7rem', letterSpacing: '1px' }}>MINHAS ANOTAÇÕES (ETAPA {step})</h4>
          <textarea 
            placeholder="Anote detalhes da conversa aqui..." 
            value={freeNotes[step] || ''}
            onChange={e => setFreeNotes({...freeNotes, [step]: e.target.value})}
          />
        </aside>
      </div>

      <div className={styles.actions}>
        <button onClick={() => nav('prev')} className={styles.btnNav} disabled={step === 0}>Voltar</button>
        {step < REVIEW_STEP ? (
          <button onClick={() => nav('next')} className={styles.btnNav} style={{ background: '#14202B', color: '#fff' }}>Avançar</button>
        ) : (
          <button onClick={handleFinish} className={styles.btnNav} style={{ background: '#C4973D', color: '#14202B' }}>Finalizar Briefing</button>
        )}
      </div>
    </div>
  );
}
