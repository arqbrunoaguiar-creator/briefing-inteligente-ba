"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient'; // Importando o cliente Supabase
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
  const dynStep = 18; // Atualize se necessário
  const reviewStep = 25; // Exemplo de step final
  const totalSteps = 26;

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

    // Tentar salvar no Supabase
    try {
      const { error } = await supabase.from('briefings').upsert(briefingPayload);
      if (error) console.error('Erro ao salvar no Supabase:', error);
    } catch (e) {
      console.error('Falha na conexão com banco de dados:', e);
    }

    // Backup local e navegação
    localStorage.setItem(`briefing-${params.id}`, JSON.stringify(briefingPayload));
    router.push(`/dossie/${params.id}`);
  };

  const nav = (dir: 'next' | 'prev') => { setAnimDir(dir); setStep(s => dir === 'next' ? s + 1 : Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <main className={styles.main}>
      <div className={styles.bgSpline}>
        <div className={styles.navyBg}><div className={styles.blob1}></div><div className={styles.blob2}></div></div>
      </div>

      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.92)' }}>
        <Link href="/" className={styles.logoMini}><Image src="/brand/logo-icon-dark.png" alt="BA" width={32} height={32} /></Link>
        <div className={styles.headerCenter}>
          <span className={styles.phaseName} style={{ color: '#0d1b2a' }}>Briefing Digital</span>
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
             {/* Render Logic Simplified for focus on handleFinish */}
             {step < reviewStep ? (
               <div className={styles.section}>
                 <span className={styles.tag}>Pergunta {step + 1} de {totalSteps}</span>
                 <h2 style={{ color: '#0d1b2a' }}>Etapa em desenvolvimento...</h2>
                 <p className={styles.desc}>Continue para finalizar o briefing.</p>
               </div>
             ) : (
               <div className={styles.section}>
                 <span className={styles.tag}>Finalização</span>
                 <h2 style={{ color: '#0d1b2a' }}>Briefing Concluído ✨</h2>
                 <p className={styles.desc}>Tudo pronto para gerarmos o dossiê exclusivo de {client.clientName}.</p>
                 <button 
                  className={`glass-button ${styles.submitBtn}`} 
                  style={{ background: '#0d1b2a', color: '#fff', marginTop: '1.5rem' }} 
                  onClick={handleFinish}
                  disabled={isSaving}
                 >
                   {isSaving ? 'Salvando no Banco de Dados...' : 'Gerar Dossiê de Projeto'}
                 </button>
               </div>
             )}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className={styles.footer} style={{ background: 'rgba(255,255,255,0.92)' }}>
        {step > 0 && <button className={`glass-button ${styles.btnBack}`} style={{ color: '#0d1b2a', borderColor: '#0d1b2a' }} onClick={() => nav('prev')}>← Voltar</button>}
        <div style={{ flex: 1 }} />
        {step < reviewStep && <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff' }} onClick={() => nav('next')}>Avançar →</button>}
      </footer>
    </main>
  );
}
