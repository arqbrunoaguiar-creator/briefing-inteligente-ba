"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [phase, setPhase] = useState<'home' | 'info' | 'plant' | 'rooms'>('home');
  const [clientName, setClientName] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [children, setChildren] = useState<{ name: string; age: string }[]>([]);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedRooms, setDetectedRooms] = useState<string[]>([]);

  const addChild = () => {
    if (childName.trim()) {
      setChildren([...children, { name: childName.trim(), age: childAge.trim() }]);
      setChildName(''); setChildAge('');
    }
  };
  const removeChild = (i: number) => setChildren(children.filter((_, idx) => idx !== i));

  const handleUpload = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setDetectedRooms(['Suíte Master', 'Cozinha', 'Sala de Estar / Jantar', 'Lavabo', 'Home Office', 'Banheiro', 'Área de Serviço', 'Varanda / Terraço']);
      setPhase('rooms');
    }, 3500);
  };

  const startBriefing = () => {
    const id = Date.now().toString(36);
    const data = { clientName, spouseName, children, rooms: detectedRooms };
    if (typeof window !== 'undefined') localStorage.setItem(`briefing-${id}`, JSON.stringify(data));
    router.push(`/briefing/${id}`);
  };

  return (
    <main className={styles.main} style={{ background: '#050505' }}>
      {/* NOVO FUNDO DINÂMICO NAVY (GRADIENTE ANIMADO) */}
      <div className={styles.navyBg}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className={styles.heroWrap}
          >
            <motion.div 
              drag 
              dragConstraints={{ left: -30, right: 30, top: -30, bottom: 30 }}
              className={`glass-panel ${styles.hero}`}
              style={{ background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Image src="/brand/logo-full-dark.png" alt="Bruno Aguiar Interiores" width={280} height={120} className={styles.logoImg} priority />
              <div className={styles.divider} style={{ borderColor: 'rgba(13, 27, 42, 0.1)' }} />
              <p className={styles.tagline} style={{ color: '#0d1b2a', fontWeight: '400' }}>Plataforma Inteligente de Briefing</p>
              <button className={`glass-button ${styles.newBtn}`} style={{ background: '#0d1b2a', color: '#fff' }} onClick={() => setPhase('info')}>+ Novo Briefing</button>
            </motion.div>
          </motion.div>
        )}

        {phase === 'info' && (
          <motion.div 
            key="info"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={styles.formWrap}
          >
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.85)' }}>
              <Image src="/brand/logo-icon-dark.png" alt="BA" width={48} height={48} className={styles.miniLogo} />
              <span className={styles.phaseTag} style={{ color: 'rgba(13, 27, 42, 0.4)' }}>Passo 1 de 3</span>
              <h2 style={{ color: '#0d1b2a' }}>Dados da Família</h2>
              <p className={styles.desc} style={{ color: 'rgba(13, 27, 42, 0.6)' }}>Informe os nomes de todos que morarão no imóvel.</p>

              <div className={styles.fieldGroup}>
                <label style={{ color: '#0d1b2a' }}>Nome do cliente</label>
                <input className="glass-input" style={{ borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} placeholder="Nome completo" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>

              <div className={styles.navRow}>
                <button className={`glass-button ${styles.backBtn}`} style={{ color: '#0d1b2a', borderColor: '#0d1b2a' }} onClick={() => setPhase('home')}>← Voltar</button>
                <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff' }} onClick={() => setPhase('plant')} disabled={!clientName.trim()}>Avançar →</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
