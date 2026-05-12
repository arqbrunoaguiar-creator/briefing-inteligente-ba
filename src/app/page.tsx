"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<'home' | 'info' | 'plant' | 'rooms'>('home');
  const [clientName, setClientName] = useState('');
  const [spouseName, setSpouseName] = useState('');
  const [children, setChildren] = useState<{ name: string; age: string }[]>([]);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [detectedRooms, setDetectedRooms] = useState<string[]>([]);

  const roomList = ['Suíte Master', 'Cozinha', 'Living Integrado', 'Lavabo', 'Home Office', 'Banheiro Social', 'Área de Serviço', 'Varanda Gourmet'];

  const handleNextPhase = () => {
    if (childName.trim()) setChildren(p => [...p, { name: childName.trim(), age: childAge.trim() }]);
    setPhase('plant');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAnalyzing(true);
      setScanStep(0);
      setDetectedRooms([]);
      
      // Efeito de Scanner de IA
      const interval = setInterval(() => {
        setScanStep(s => {
          if (s < roomList.length) {
            setDetectedRooms(prev => [...prev, roomList[s]]);
            return s + 1;
          }
          clearInterval(interval);
          setTimeout(() => {
            setAnalyzing(false);
            setPhase('rooms');
          }, 1000);
          return s;
        });
      }, 600);
    }
  };

  const startBriefing = () => {
    const id = Date.now().toString(36);
    const data = { clientName, spouseName, children, rooms: detectedRooms };
    localStorage.setItem(`briefing-${id}`, JSON.stringify(data));
    router.push(`/briefing/${id}`);
  };

  return (
    <main className={styles.main} style={{ background: '#050505' }}>
      <div className={styles.navyBg}><div className={styles.blob1}></div><div className={styles.blob2}></div></div>

      <AnimatePresence mode="wait">
        {phase === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.heroWrap}>
            <div className={`glass-panel ${styles.hero}`} style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Image src="/brand/logo-full-dark.png" alt="BA" width={280} height={120} />
              <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff', marginTop: '2rem' }} onClick={() => setPhase('info')}>Novo Projeto</button>
            </div>
          </motion.div>
        )}

        {phase === 'info' && (
          <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.92)' }}>
              <h2 style={{ color: '#0d1b2a' }}>Dados da Família</h2>
              <input className="glass-input" style={{ color: '#0d1b2a' }} placeholder="Nome do Cliente" value={clientName} onChange={e => setClientName(e.target.value)} />
              <input className="glass-input" style={{ color: '#0d1b2a', marginTop: '1rem' }} placeholder="Cônjuge" value={spouseName} onChange={e => setSpouseName(e.target.value)} />
              <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff', width: '100%', marginTop: '2rem' }} onClick={handleNextPhase}>Próximo</button>
            </div>
          </motion.div>
        )}

        {phase === 'plant' && (
          <motion.div key="plant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.92)', minHeight: '400px' }}>
              <h2 style={{ color: '#0d1b2a' }}>Análise de Planta IA</h2>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
              
              {!analyzing ? (
                <div className={styles.uploadZone} onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', border: '2px dashed #0d1b2a', padding: '3rem', borderRadius: '20px', textAlign: 'center', color: '#0d1b2a' }}>
                   <p>Selecione a planta baixa para escaneamento</p>
                </div>
              ) : (
                <div className={styles.scanContainer}>
                   <div className={styles.scanLine} style={{ height: '2px', background: '#0d1b2a', width: '100%', position: 'absolute', top: 0, animation: 'scan 2s linear infinite' }} />
                   <div style={{ marginTop: '2rem' }}>
                      {detectedRooms.map((r, i) => (
                        <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ color: '#0d1b2a', fontSize: '0.9rem', marginBottom: '5px' }}>
                          🔍 Detectado: <strong>{r}</strong>
                        </motion.p>
                      ))}
                   </div>
                </div>
              )}
              <style>{`@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }`}</style>
            </div>
          </motion.div>
        )}

        {phase === 'rooms' && (
          <motion.div key="rooms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <h2 style={{ color: '#0d1b2a' }}>Ambientes Identificados</h2>
              <p style={{ color: '#0d1b2a', opacity: 0.6 }}>Confirmamos os seguintes cômodos na planta de {clientName}:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '1.5rem 0' }}>
                {detectedRooms.map(r => <div key={r} style={{ background: '#0d1b2a', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '0.8rem' }}>{r}</div>)}
              </div>
              <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff', width: '100%' }} onClick={startBriefing}>Iniciar Briefing Especializado →</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
