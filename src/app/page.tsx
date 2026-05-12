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
      <div className={styles.navyBg}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className={styles.heroWrap}>
            <div className={`glass-panel ${styles.hero}`} style={{ background: 'rgba(255, 255, 255, 0.92)' }}>
              <Image src="/brand/logo-full-dark.png" alt="Bruno Aguiar Interiores" width={280} height={120} className={styles.logoImg} priority />
              <div className={styles.divider} style={{ borderColor: 'rgba(13, 27, 42, 0.1)' }} />
              <p className={styles.tagline} style={{ color: '#0d1b2a' }}>Plataforma Inteligente de Briefing</p>
              <button className={`glass-button ${styles.newBtn}`} style={{ background: '#0d1b2a', color: '#fff' }} onClick={() => setPhase('info')}>+ Iniciar Novo Projeto</button>
            </div>
          </motion.div>
        )}

        {phase === 'info' && (
          <motion.div key="info" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '3.5rem' }}>
              <Image src="/brand/logo-icon-dark.png" alt="BA" width={48} height={48} className={styles.miniLogo} />
              <span className={styles.phaseTag} style={{ color: 'rgba(13, 27, 42, 0.4)' }}>Configuração da Família</span>
              <h2 style={{ color: '#0d1b2a', fontSize: '2.2rem', marginBottom: '1.5rem' }}>Quem morará no imóvel?</h2>

              <div className={styles.fieldGroup}>
                <label style={{ color: '#0d1b2a' }}>Nome do Cliente Principal</label>
                <input className="glass-input" style={{ borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} placeholder="Ex: Maria Fernanda" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>

              <div className={styles.fieldGroup} style={{ marginTop: '1rem' }}>
                <label style={{ color: '#0d1b2a' }}>Nome do Cônjuge (Opcional)</label>
                <input className="glass-input" style={{ borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} placeholder="Ex: João Roberto" value={spouseName} onChange={e => setSpouseName(e.target.value)} />
              </div>

              <div className={styles.fieldGroup} style={{ marginTop: '1.5rem' }}>
                <label style={{ color: '#0d1b2a' }}>Filhos e Idades</label>
                <div className={styles.childrenList}>
                  {children.map((c, i) => (
                    <motion.div layout key={i} className={styles.childRow} style={{ background: 'rgba(13, 27, 42, 0.05)', padding: '0.8rem 1.2rem', borderRadius: '12px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', color: '#0d1b2a' }}>
                      <span>{c.name} {c.age ? `(${c.age} anos)` : ''}</span>
                      <button onClick={() => removeChild(i)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>Remover</button>
                    </motion.div>
                  ))}
                </div>
                <div className={styles.addChildRow} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input className="glass-input" style={{ flex: 2, borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} placeholder="Nome do filho" value={childName} onChange={e => setChildName(e.target.value)} />
                  <input className="glass-input" style={{ flex: 1, borderColor: 'rgba(13, 27, 42, 0.1)', color: '#0d1b2a' }} placeholder="Idade" value={childAge} onChange={e => setChildAge(e.target.value)} />
                  <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff', padding: '0 1.5rem' }} onClick={addChild}>+</button>
                </div>
              </div>

              <div className={styles.navRow} style={{ marginTop: '2.5rem' }}>
                <button className={`glass-button ${styles.backBtn}`} style={{ color: '#0d1b2a', borderColor: '#0d1b2a' }} onClick={() => setPhase('home')}>← Voltar</button>
                <button className="glass-button" style={{ background: '#0d1b2a', color: '#fff', flex: 1 }} onClick={() => setPhase('plant')} disabled={!clientName.trim()}>Continuar para Planta →</button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'plant' && (
          <motion.div key="plant" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <Image src="/brand/logo-icon-dark.png" alt="BA" width={48} height={48} className={styles.miniLogo} />
              <span className={styles.phaseTag}>Passo 2 de 3</span>
              <h2 style={{ color: '#0d1b2a' }}>Planta Baixa</h2>
              <p className={styles.desc} style={{ color: 'rgba(13, 27, 42, 0.6)' }}>Faça o upload da planta para identificarmos os ambientes de <strong>{clientName}</strong>.</p>

              {!analyzing ? (
                <div className={styles.uploadZone} onClick={handleUpload} style={{ borderColor: 'rgba(13, 27, 42, 0.2)', color: '#0d1b2a' }}>
                  <span style={{ fontSize: '2rem' }}>📐</span>
                  <span>Clique para enviar a planta</span>
                </div>
              ) : (
                <div className={styles.analyzingBox} style={{ color: '#0d1b2a' }}>
                  <div className={styles.spinner} style={{ borderColor: '#0d1b2a' }} />
                  <span>IA analisando ambientes...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'rooms' && (
          <motion.div key="rooms" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255, 255, 255, 0.9)' }}>
              <Image src="/brand/logo-icon-dark.png" alt="BA" width={48} height={48} className={styles.miniLogo} />
              <h2 style={{ color: '#0d1b2a' }}>Pronto para o Briefing!</h2>
              <p className={styles.desc} style={{ color: 'rgba(13, 27, 42, 0.6)' }}>Detectamos os ambientes e salvamos os dados da família.</p>
              
              <div className={styles.familySummary} style={{ background: 'rgba(13, 27, 42, 0.04)', padding: '1.5rem', borderRadius: '16px', margin: '1rem 0' }}>
                 <p style={{ color: '#0d1b2a' }}><strong>Cliente:</strong> {clientName}</p>
                 {spouseName && <p style={{ color: '#0d1b2a' }}><strong>Cônjuge:</strong> {spouseName}</p>}
                 {children.length > 0 && <p style={{ color: '#0d1b2a' }}><strong>Filhos:</strong> {children.map(c => c.name).join(', ')}</p>}
              </div>

              <button className={`glass-button ${styles.startBtn}`} style={{ background: '#0d1b2a', color: '#fff', width: '100%' }} onClick={startBriefing}>
                Iniciar Experiência de Briefing →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
