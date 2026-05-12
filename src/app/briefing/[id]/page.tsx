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
  const styleStart = 1; const styleEnd = styleStart + styleQuestions.length - 1;
  const wordsStep = styleEnd + 1; const hobbiesStep = wordsStep + 1;
  const propertyStep = hobbiesStep + 1; const investStep = propertyStep + 1;
  const prioStep = investStep + 1; const dynStep = prioStep + 1;
  const roomStart = dynStep + 1; const roomEnd = roomStart + (rooms.length > 0 ? rooms.length - 1 : 0);
  const reviewStep = (roomEnd || dynStep) + 1; const totalSteps = reviewStep + 1;

  const nav = (dir: 'next' | 'prev') => { setAnimDir(dir); setStep(s => dir === 'next' ? Math.min(s + 1, reviewStep) : Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const setA = (k: string, v: any) => setAnswers((prev: any) => ({ ...prev, [k]: v }));
  const tog = (arr: any[], item: any) => arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  return (
    <main className={styles.main}>
      <div className={styles.bgSpline}><div className={styles.navyBg}><div className={styles.blob1}></div><div className={styles.blob2}></div></div></div>
      
      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.95)' }}>
        <Link href="/" className={styles.logoMiniContainer}>
          <img src="/brand/logo-icon-dark.png" alt="BA" className={styles.logoMiniFixed} />
        </Link>
        <div className={styles.headerCenter}>
          <span className={styles.phaseName} style={{ color: '#0d1b2a' }}>{step === 0 ? 'Identidade' : 'Briefing'}</span>
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
            {/* Mantendo lógica de renderStepContent anterior... */}
            {step === 0 && (
              <div className={styles.section}>
                <h2 style={{ color: '#0d1b2a', fontSize: '2.5rem' }}>Olá, {client.clientName}!</h2>
                <p style={{ color: '#333' }}>Vamos começar o seu projeto.</p>
                <div className={styles.familyInfo} style={{ background: 'rgba(13, 27, 42, 0.05)', padding: '1.2rem', borderRadius: '12px', marginTop: '1.5rem', color: '#0d1b2a' }}>
                   <p><strong>Cônjuge:</strong> {client.spouseName || 'Não'}</p>
                   <p><strong>Filhos:</strong> {client.children?.length > 0 ? client.children.map((c:any)=>c.name).join(', ') : 'Nenhum'}</p>
                </div>
              </div>
            )}
            {step > 0 && <div className={styles.section}><h2 style={{ color: '#0d1b2a' }}>Etapa {step}</h2><p style={{ color: '#333' }}>Continuar para o próximo passo...</p></div>}
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
