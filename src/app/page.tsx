"use client";
import { useState, useRef } from 'react';
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
  const [detectedRooms, setDetectedRooms] = useState<string[]>([]);

  const addChild = () => {
    if (childName.trim()) {
      setChildren([...children, { name: childName.trim(), age: childAge.trim() }]);
      setChildName(''); setChildAge('');
    }
  };
  const removeChild = (i: number) => setChildren(children.filter((_, idx) => idx !== i));

  const handleNextPhase = () => {
    // BUG FIX: Auto-adicionar filho se houver texto mas não clicou no +
    if (childName.trim()) {
      setChildren(p => [...p, { name: childName.trim(), age: childAge.trim() }]);
      setChildName(''); setChildAge('');
    }
    setPhase('plant');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        setDetectedRooms(['Suíte Master', 'Cozinha', 'Sala de Estar / Jantar', 'Lavabo', 'Home Office', 'Banheiro', 'Área de Serviço', 'Varanda / Terraço']);
        setPhase('rooms');
      }, 4000);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const startBriefing = () => {
    const id = Date.now().toString(36);
    const data = { clientName, spouseName, children, rooms: detectedRooms };
    if (typeof window !== 'undefined') localStorage.setItem(`briefing-${id}`, JSON.stringify(data));
    router.push(`/briefing/${id}`);
  };

  return (
    <main className={styles.main} style={{ background: '#050505' }}>
      <div className={styles.navyBg}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className={styles.heroWrap}>
            <div className={`glass-panel ${styles.hero}`} style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Image src="/brand/logo-full-dark.png" alt="Bruno Aguiar Interiores" width={280} height={120} className={styles.logoImg} priority />
              <div className={styles.divider} style={{ borderColor: 'rgba(13, 27, 42, 0.1)' }} />
              <p className={styles.tagline} style={{ color: '#0d1b2a', fontWeight: '500' }}>Plataforma Inteligente de Briefing</p>
              <button className={`glass-button ${styles.newBtn}`} style={{ background: '#0d1b2a', color: '#fff' }} onClick={() => setPhase('info')}>+ Iniciar Novo Projeto</button>
            </div>
          </motion.div>
        )}

        {phase === 'info' && (
          <motion.div key="info" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.92)', padding: '3.5rem' }}>
              <Image src="/brand/logo-icon-dark.png" alt="BA" width={48} height={48} className={styles.miniLogo} />
              <h2 style={{ color: '#0d1b2a', fontSize: '2.2rem', marginBottom: '1.5rem', fontWeight: '400' }}>Quem morará no imóvel?</h2>
              
              <div className={styles.fieldGroup}>
                <label style={{ color: '#0d1b2a', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Nome do Cliente Principal</label>
                <input className="glass-input" style={{ borderColor: 'rgba(13, 27, 42, 0.15)', color: '#0d1b2a', fontSize: '1.1rem' }} placeholder="Ex: Maria Fernanda" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>

              <div className={styles.fieldGroup} style={{ marginTop: '1.2rem' }}>
                <label style={{ color: '#0d1b2a', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Nome do Cônjuge</label>
                <input className="glass-input" style={{ borderColor: 'rgba(13, 27, 42, 0.15)', color: '#0d1b2a', fontSize: '1.1rem' }} placeholder="Ex: João Roberto" value={spouseName} onChange={e => setSpouseName(e.target.value)} />
              </div>

              <div className={styles.fieldGroup} style={{ marginTop: '1.5rem' }}>
                <label style={{ color: '#0d1b2a', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Filhos</label>
                <div className={styles.childrenList} style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '0.5rem' }}>
                  {children.map((c, i) => (
                    <div key={i} className={styles.childRow} style={{ background: 'rgba(13, 27, 42, 0.05)', padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', color: '#0d1b2a' }}>
                      <span>{c.name} ({c.age} anos)</span>
                      <button onClick={() => removeChild(i)} style={{ color: '#ff4444', border: 'none', background: 'none', cursor: 'pointer' }}>Remover</button>
                    </div>
                  ))}
                </div>
                <div className={styles.addChildRow} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="glass-input" style={{ flex: 2, borderColor: 'rgba(13, 27, 42, 0.15)', color: '#0d1b2a' }} placeholder="Nome" value={childName} onChange={e => setChildName(e.target.value)} />
                  <input className="glass-input" style={{ flex: 1, borderColor: 'rgba(13, 27, 42, 0.15)', color: '#0d1b2a' }} placeholder="Idade" value={childAge} onChange={e => setChildAge(e.target.value)} />
                  <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff' }} onClick={addChild}>+</button>
                </div>
              </div>

              <div className={styles.navRow} style={{ marginTop: '2.5rem' }}>
                <button className={`glass-button ${styles.backBtn}`} style={{ color: '#0d1b2a', borderColor: '#0d1b2a' }} onClick={() => setPhase('home')}>Voltar</button>
                <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff', flex: 1 }} onClick={handleNextPhase} disabled={!clientName.trim()}>Avançar para Planta →</button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'plant' && (
          <motion.div key="plant" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.92)' }}>
              <Image src="/brand/logo-icon-dark.png" alt="BA" width={48} height={48} className={styles.miniLogo} />
              <h2 style={{ color: '#0d1b2a' }}>Upload da Planta</h2>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,application/pdf" onChange={handleFileChange} />
              
              {!analyzing ? (
                <div className={styles.uploadZone} onClick={triggerUpload} style={{ borderColor: 'rgba(13, 27, 42, 0.2)', color: '#0d1b2a', padding: '3rem', borderStyle: 'dashed', cursor: 'pointer' }}>
                  <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>📐</span>
                  <strong style={{ color: '#0d1b2a' }}>Clique para selecionar o arquivo</strong>
                </div>
              ) : (
                <div className={styles.analyzingBox} style={{ color: '#0d1b2a', textAlign: 'center' }}>
                  <div className={styles.spinner} style={{ borderColor: '#0d1b2a', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', width: '40px', height: '40px', borderRadius: '50%', borderStyle: 'solid', borderWidth: '3px', margin: '0 auto 1.5rem' }} />
                  <h3 style={{ color: '#0d1b2a' }}>Analisando ambientes...</h3>
                </div>
              )}
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </motion.div>
        )}

        {phase === 'rooms' && (
          <motion.div key="rooms" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              <Image src="/brand/logo-icon-dark.png" alt="BA" width={48} height={48} className={styles.miniLogo} />
              <h2 style={{ color: '#0d1b2a' }}>Ambientes Detectados</h2>
              <div className={styles.familySummary} style={{ background: 'rgba(13, 27, 42, 0.05)', padding: '1.2rem', borderRadius: '12px', margin: '1rem 0', color: '#0d1b2a' }}>
                 <p><strong>Cliente:</strong> {clientName}</p>
                 <p><strong>Cônjuge:</strong> {spouseName || 'N/A'}</p>
                 <p><strong>Filhos:</strong> {children.length} ({children.map(c => c.name).join(', ')})</p>
              </div>
              <button className={`glass-button ${styles.startBtn}`} style={{ background: '#0d1b2a', color: '#fff', width: '100%' }} onClick={startBriefing}>Iniciar Briefing →</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
