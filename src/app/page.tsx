"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

// Mapeia nomes legíveis para as keys do roomTemplates
const ROOM_MAP: Record<string, string> = {
  'Suíte Master': 'suite-master',
  'Cozinha': 'cozinha',
  'Living Integrado': 'sala-estar',
  'Lavabo': 'lavabo',
  'Home Office': 'home-office',
  'Banheiro Social': 'banheiro',
  'Área de Serviço': 'area-servico',
  'Varanda Gourmet': 'varanda',
};

const ROOM_LIST = Object.keys(ROOM_MAP);

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
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [scanProgress, setScanProgress] = useState<string[]>([]);

  const addChild = () => {
    if (childName.trim()) {
      setChildren(prev => [...prev, { name: childName.trim(), age: childAge.trim() || '?' }]);
      setChildName('');
      setChildAge('');
    }
  };

  const removeChild = (idx: number) => setChildren(prev => prev.filter((_, i) => i !== idx));

  const handleNextPhase = () => {
    if (childName.trim()) {
      setChildren(prev => [...prev, { name: childName.trim(), age: childAge.trim() || '?' }]);
      setChildName('');
      setChildAge('');
    }
    setPhase('plant');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setAnalyzing(true);
    setDetectedRooms([]);
    setScanProgress([]);
    setAiAnalysis('');

    const msgs = ['Carregando imagem...', 'Enviando para análise de IA...', 'Identificando paredes e divisões...', 'Mapeando ambientes...'];
    let msgIdx = 0;
    const progressInterval = setInterval(() => {
      if (msgIdx < msgs.length) {
        setScanProgress(prev => [...prev, msgs[msgIdx]]);
        msgIdx++;
      }
    }, 1200);

    let finalRooms: string[] = [];
    let finalAnalysis = '';

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/analyze-plan', { method: 'POST', body: formData });
      const result = await res.json();

      clearInterval(progressInterval);
      setScanProgress(msgs); // Mostra todas as msgs

      if (result.rooms && result.rooms.length > 0) {
        for (let i = 0; i < result.rooms.length; i++) {
          await new Promise(r => setTimeout(r, 350));
          setDetectedRooms(prev => [...prev, result.rooms[i]]);
        }
        finalRooms = result.rooms;
        finalAnalysis = result.analysis || '';
        if (result.simulated) finalAnalysis = result.analysis || 'Detecção simulada.';
      } else {
        finalRooms = Object.values(ROOM_MAP);
        finalAnalysis = 'Não foi possível analisar a planta. Ambientes padrão carregados.';
      }
    } catch (err) {
      clearInterval(progressInterval);
      finalRooms = Object.values(ROOM_MAP);
      finalAnalysis = 'Erro na conexão. Ambientes padrão carregados.';
    }

    // Esperar 1s para o usuário ver os resultados, depois ir para rooms
    setSelectedRooms(finalRooms);
    setAiAnalysis(finalAnalysis);
    await new Promise(r => setTimeout(r, 1200));
    setAnalyzing(false);
    setPhase('rooms');
  };

  const toggleRoom = (roomKey: string) => {
    setSelectedRooms(prev =>
      prev.includes(roomKey) ? prev.filter(r => r !== roomKey) : [...prev, roomKey]
    );
  };

  const startBriefing = () => {
    const id = Date.now().toString(36);
    const payload = {
      clientName,
      spouseName,
      children,
      rooms: selectedRooms, // Agora envia as keys corretas (suite-master, cozinha, etc.)
    };
    localStorage.setItem(`briefing-${id}`, JSON.stringify(payload));
    router.push(`/briefing/${id}`);
  };

  return (
    <main className={styles.main}>
      <div className={styles.navyBg}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>

      <AnimatePresence mode="wait">
        {/* TELA INICIAL */}
        {phase === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.heroWrap}>
            <div className={`glass-panel ${styles.hero}`} style={{ background: 'rgba(255,255,255,0.96)' }}>
              <Image src="/brand/logo-full-dark.png" alt="Bruno Aguiar Interiores" width={280} height={120} style={{ objectFit: 'contain' }} priority />
              <div className={styles.divider} style={{ borderColor: 'rgba(13,27,42,0.15)' }} />
              <p className={styles.tagline} style={{ color: '#0d1b2a' }}>Plataforma Inteligente de Briefing</p>
              <button className={styles.newBtn} style={{ background: '#0d1b2a', color: '#fff', border: 'none' }} onClick={() => setPhase('info')}>
                + Iniciar Novo Projeto
              </button>
            </div>
          </motion.div>
        )}

        {/* DADOS DA FAMÍLIA */}
        {phase === 'info' && (
          <motion.div key="info" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255,255,255,0.95)' }}>
              <h2 style={{ color: '#0d1b2a', fontSize: '1.8rem', fontWeight: 400 }}>Quem morará no imóvel?</h2>

              <div className={styles.fieldGroup}>
                <label style={{ color: '#0d1b2a' }}>Nome do Cliente Principal</label>
                <input className={styles.lightInput} placeholder="Ex: Maria Fernanda" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>

              <div className={styles.fieldGroup}>
                <label style={{ color: '#0d1b2a' }}>Nome do Cônjuge</label>
                <input className={styles.lightInput} placeholder="Ex: João Roberto" value={spouseName} onChange={e => setSpouseName(e.target.value)} />
              </div>

              <div className={styles.fieldGroup}>
                <label style={{ color: '#0d1b2a' }}>Filhos</label>
                {children.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    {children.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(13,27,42,0.04)', padding: '0.5rem 1rem', borderRadius: '10px', color: '#0d1b2a', fontSize: '0.9rem' }}>
                        <span>{c.name}, {c.age} anos</span>
                        <button onClick={() => removeChild(i)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className={styles.lightInput} style={{ flex: 2 }} placeholder="Nome do filho(a)" value={childName} onChange={e => setChildName(e.target.value)} />
                  <input className={styles.lightInput} style={{ flex: 1 }} placeholder="Idade" value={childAge} onChange={e => setChildAge(e.target.value)} />
                  <button onClick={addChild} style={{ background: '#0d1b2a', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 1rem', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                </div>
              </div>

              <div className={styles.navRow} style={{ marginTop: '1rem' }}>
                <button className={styles.backBtn} style={{ color: '#0d1b2a', border: '1px solid rgba(13,27,42,0.2)', borderRadius: '10px', padding: '0.8rem 1.5rem', background: 'transparent', cursor: 'pointer' }} onClick={() => setPhase('home')}>Voltar</button>
                <button style={{ flex: 1, background: '#0d1b2a', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.8rem', cursor: 'pointer', fontSize: '1rem', opacity: clientName.trim() ? 1 : 0.4 }} onClick={handleNextPhase} disabled={!clientName.trim()}>Avançar para Planta →</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* UPLOAD DE PLANTA + SCANNER IA */}
        {phase === 'plant' && (
          <motion.div key="plant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255,255,255,0.95)', minHeight: '420px', position: 'relative', overflow: 'hidden' }}>
              <h2 style={{ color: '#0d1b2a', fontWeight: 400 }}>Análise de Planta IA</h2>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFileChange} />

              {!analyzing ? (
                <>
                  <div onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', border: '2px dashed rgba(13,27,42,0.25)', padding: '2.5rem 2rem', borderRadius: '20px', textAlign: 'center', color: '#0d1b2a', transition: 'border-color 0.3s' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.8rem' }}>📐</span>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>Clique para enviar a planta baixa</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.5rem' }}>JPG, PNG, WebP ou PDF · máx 4MB</p>
                  </div>

                  {/* INSTRUÇÕES PARA A IA */}
                  <div style={{ marginTop: '1.2rem', background: 'rgba(13,27,42,0.03)', padding: '1rem 1.2rem', borderRadius: '14px', color: '#0d1b2a' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', opacity: 0.7 }}>📋 Para a IA ler bem a planta:</p>
                    <ul style={{ fontSize: '0.78rem', opacity: 0.6, lineHeight: 1.7, paddingLeft: '1.2rem', margin: 0 }}>
                      <li>Envie <strong>imagem nítida ou PDF</strong> da planta</li>
                      <li>Planta com <strong>nomes dos cômodos visíveis</strong> dá melhor resultado</li>
                      <li>Evite fotos com sombras, reflexos ou ângulo torto</li>
                      <li>Máximo 4MB — reduza se necessário</li>
                    </ul>
                  </div>

                  {/* BOTÃO PULAR */}
                  <button onClick={() => {
                    setSelectedRooms(Object.values(ROOM_MAP));
                    setAiAnalysis('Ambientes padrão carregados. Desmarque os que não se aplicam.');
                    setPhase('rooms');
                  }} style={{ marginTop: '1rem', width: '100%', background: 'transparent', border: '1px solid rgba(13,27,42,0.15)', color: '#0d1b2a', padding: '0.7rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', opacity: 0.6 }}>
                    Não tenho a planta — selecionar ambientes manualmente
                  </button>
                </>
              ) : (
                <div style={{ padding: '1.5rem 0' }}>
                  <div style={{ height: '3px', background: 'rgba(13,27,42,0.08)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <div style={{ height: '100%', background: '#0d1b2a', width: detectedRooms.length > 0 ? '90%' : '40%', transition: 'width 1s ease', borderRadius: '10px' }} />
                  </div>

                  {scanProgress.map((msg, i) => (
                    <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      style={{ color: '#0d1b2a', fontSize: '0.8rem', opacity: 0.5, marginBottom: '4px' }}>
                      ⏳ {msg}
                    </motion.p>
                  ))}

                  {detectedRooms.length > 0 && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(13,27,42,0.08)', paddingTop: '1rem' }}>
                      <p style={{ color: '#0d1b2a', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.8rem', opacity: 0.4 }}>Ambientes Detectados pela IA</p>
                      {detectedRooms.map((roomId, i) => {
                        const label = Object.entries(ROOM_MAP).find(([, v]) => v === roomId)?.[0] || roomId;
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', color: '#0d1b2a', fontSize: '0.9rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00b894', flexShrink: 0 }} />
                            <span>{label}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CONFIRMAÇÃO DE AMBIENTES */}
        {phase === 'rooms' && (
          <motion.div key="rooms" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.formWrap}>
            <div className={`glass-panel ${styles.formCard}`} style={{ background: 'rgba(255,255,255,0.96)' }}>
              <h2 style={{ color: '#0d1b2a', fontWeight: 400 }}>Ambientes Identificados</h2>
              <p style={{ color: '#0d1b2a', opacity: 0.5, fontSize: '0.9rem' }}>Confirme ou desmarque os cômodos detectados na planta de <strong>{clientName}</strong>:</p>

              {aiAnalysis && (
                <div style={{ background: 'rgba(13,27,42,0.04)', padding: '1rem', borderRadius: '12px', marginTop: '0.5rem', fontSize: '0.85rem', color: '#0d1b2a', borderLeft: '3px solid #0d1b2a' }}>
                  <strong>🤖 Análise da IA:</strong> {aiAnalysis}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', margin: '1.5rem 0' }}>
                {Object.entries(ROOM_MAP).map(([label, key]) => {
                  const active = selectedRooms.includes(key);
                  return (
                    <button key={key} onClick={() => toggleRoom(key)}
                      style={{ padding: '0.8rem', borderRadius: '12px', border: active ? '2px solid #0d1b2a' : '1px solid rgba(13,27,42,0.1)', background: active ? '#0d1b2a' : 'transparent', color: active ? '#fff' : '#0d1b2a', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s' }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              <div style={{ background: 'rgba(13,27,42,0.04)', padding: '1rem', borderRadius: '12px', margin: '0.5rem 0', color: '#0d1b2a', fontSize: '0.85rem' }}>
                <p><strong>Família:</strong> {clientName}{spouseName ? ` & ${spouseName}` : ''}</p>
                {children.length > 0 && <p><strong>Filhos:</strong> {children.map(c => `${c.name} (${c.age})`).join(', ')}</p>}
                <p><strong>Ambientes:</strong> {selectedRooms.length} selecionados</p>
              </div>

              <button style={{ background: '#0d1b2a', color: '#fff', border: 'none', borderRadius: '12px', padding: '1rem', width: '100%', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }} onClick={startBriefing}>
                Iniciar Briefing Especializado →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
