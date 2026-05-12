"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import {
  styleQuestions, wordGroups, hobbies, priorityItems,
  investmentLevels, dynamicsQuestions, propertyQuestions,
  roomTemplates,
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`briefing-${params.id}`);
      if (raw) setClient(JSON.parse(raw));
    }
  }, [params.id]);

  if (!client) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff' }}>
      Carregando briefing...
    </div>
  );

  // Filtra rooms válidos que existem no roomTemplates
  const rooms = (client.rooms || []).filter((r: string) => roomTemplates[r]);

  // MAPA DE STEPS FIXO
  const STYLE_START = 1;
  const STYLE_END = STYLE_START + styleQuestions.length - 1; // 1..11
  const WORDS_STEP = STYLE_END + 1;      // 12
  const HOBBIES_STEP = WORDS_STEP + 1;   // 13
  const PROPERTY_STEP = HOBBIES_STEP + 1; // 14
  const INVEST_STEP = PROPERTY_STEP + 1;  // 15
  const PRIO_STEP = INVEST_STEP + 1;      // 16
  const DYN_STEP = PRIO_STEP + 1;         // 17
  const ROOM_START = DYN_STEP + 1;        // 18
  const ROOM_END = ROOM_START + Math.max(rooms.length - 1, 0);
  const REVIEW_STEP = ROOM_END + 1;
  const TOTAL = REVIEW_STEP + 1;

  const getPhase = () => {
    if (step === 0) return 'Identidade';
    if (step <= STYLE_END) return 'Estilos';
    if (step <= HOBBIES_STEP) return 'Perfil';
    if (step <= DYN_STEP) return 'Diretrizes';
    if (step <= ROOM_END && rooms.length > 0) return 'Ambientes';
    return 'Finalização';
  };

  const nav = (dir: 'next' | 'prev') => {
    setStep(s => {
      const next = dir === 'next' ? s + 1 : s - 1;
      // Pula seção de rooms se não há rooms
      if (rooms.length === 0 && next >= ROOM_START && next <= ROOM_END) {
        return dir === 'next' ? REVIEW_STEP : DYN_STEP;
      }
      return Math.max(0, Math.min(next, REVIEW_STEP));
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setA = (key: string, val: any) => setAnswers((p: any) => ({ ...p, [key]: val }));
  const tog = (arr: any[], item: any) => arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const currentRoom = (step >= ROOM_START && step <= ROOM_END && rooms.length > 0)
    ? roomTemplates[rooms[step - ROOM_START]]
    : null;

  const handleFinish = async () => {
    setIsSaving(true);
    const fullPayload = {
      id: params.id,
      client_name: client.clientName,
      answers: {
        family: { clientName: client.clientName, spouseName: client.spouseName, children: client.children },
        styles: selectedStyles,
        words: selectedWords,
        hobbies: selectedHobbies,
        investment: selectedInvestment,
        priorities: selectedPriorities,
        property: Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith('p_'))),
        dynamics: Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith('d_'))),
        rooms: { habits: roomHabits, notes: roomNotes },
        detectedRooms: client.rooms,
      },
    };
    try { await supabase.from('briefings').upsert(fullPayload); } catch (e) { console.error(e); }
    localStorage.setItem(`briefing-answers-${params.id}`, JSON.stringify(fullPayload));
    router.push(`/dossie/${params.id}`);
  };

  // =========== RENDER ENGINE ===========
  const renderContent = () => {
    // 0. BOAS VINDAS
    if (step === 0) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a', fontSize: '2.2rem' }}>Olá, {client.clientName}!</h2>
        <p style={{ color: '#333', fontSize: '1rem', lineHeight: 1.6 }}>Nas próximas etapas vamos mapear o seu estilo, rotina e desejos para criar um projeto sob medida.</p>
        <div style={{ background: 'rgba(13,27,42,0.04)', padding: '1.2rem', borderRadius: '14px', marginTop: '1.5rem', color: '#0d1b2a', fontSize: '0.95rem' }}>
          <p><strong>Cônjuge:</strong> {client.spouseName || 'Não informado'}</p>
          <p style={{ marginTop: '0.3rem' }}><strong>Filhos:</strong> {client.children?.length > 0 ? client.children.map((c: any) => `${c.name} (${c.age})`).join(', ') : 'Nenhum informado'}</p>
          <p style={{ marginTop: '0.3rem' }}><strong>Ambientes:</strong> {rooms.length} detectados</p>
        </div>
      </div>
    );

    // 1-11. ESTILOS (usa as imagens originais da pasta /styles/)
    if (step >= STYLE_START && step <= STYLE_END) {
      const q = styleQuestions[step - STYLE_START];
      return (
        <div className={styles.section}>
          <p style={{ color: 'rgba(13,27,42,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>Pergunta {step} de {styleQuestions.length}</p>
          <h2 style={{ color: '#0d1b2a' }}>{q.question}</h2>
          <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1rem' }}>{q.context}</p>
          <div className={styles.styleGrid}>
            {q.options.map((opt) => {
              const isActive = selectedStyles[q.id] === opt.id;
              return (
                <button key={opt.id}
                  className={`${styles.styleCard} ${isActive ? styles.styleActive : ''}`}
                  onClick={() => setSelectedStyles((s: any) => ({ ...s, [q.id]: opt.id }))}>
                  <div className={styles.styleImg}>
                    {opt.image
                      ? <img src={opt.image} alt={opt.label} className={styles.stylePhoto} />
                      : <div style={{ width: '100%', height: '100%', background: opt.gradient }} />
                    }
                  </div>
                  <div className={styles.styleInfo}>
                    <strong>{opt.label}</strong>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6, display: 'block', marginTop: '2px', color: isActive ? 'rgba(255,255,255,0.7)' : '#555' }}>{opt.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // 12. PALAVRAS
    if (step === WORDS_STEP) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a' }}>Essência do Projeto</h2>
        <p style={{ color: '#555', marginBottom: '1rem' }}>Selecione os grupos de palavras que mais representam o lar ideal:</p>
        <div className={styles.wordGroups}>
          {wordGroups.map(g => (
            <button key={g.id} className={`${styles.wordGroup} ${selectedWords.includes(g.id) ? styles.wordActive : ''}`} onClick={() => setSelectedWords(p => tog(p, g.id))}>
              {g.words.map(w => <span key={w} style={{ color: selectedWords.includes(g.id) ? '#fff' : '#0d1b2a' }}>{w}</span>)}
            </button>
          ))}
        </div>
      </div>
    );

    // 13. HOBBIES
    if (step === HOBBIES_STEP) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a' }}>Estilo de Vida</h2>
        <p style={{ color: '#555', marginBottom: '1rem' }}>O que faz parte do dia a dia da família?</p>
        <div className={styles.chipGrid}>
          {hobbies.map(h => (
            <button key={h} className={`${styles.chip} ${selectedHobbies.includes(h) ? styles.chipActive : ''}`} onClick={() => setSelectedHobbies(p => tog(p, h))}>{h}</button>
          ))}
        </div>
      </div>
    );

    // 14. IMÓVEL
    if (step === PROPERTY_STEP) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a' }}>Sobre o Imóvel</h2>
        <div className={styles.formGrid}>
          {propertyQuestions.map(q => (
            <div key={q.id} className={styles.field}>
              <label style={{ color: '#0d1b2a' }}>{q.question}</label>
              <div className={styles.chipGrid}>
                {q.options!.map(o => (
                  <button key={o} className={`${styles.chip} ${answers[`p_${q.id}`] === o ? styles.chipActive : ''}`} onClick={() => setA(`p_${q.id}`, o)}>{o}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    // 15. INVESTIMENTO
    if (step === INVEST_STEP) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a' }}>Nível de Investimento</h2>
        <p style={{ color: '#555', marginBottom: '1rem' }}>Qual é a faixa de investimento prevista para o projeto?</p>
        <div className={styles.styleGrid}>
          {investmentLevels.map(lv => (
            <button key={lv.id} className={`${styles.styleCard} ${selectedInvestment === lv.id ? styles.styleActive : ''}`} style={{ padding: '1.5rem', textAlign: 'center' }} onClick={() => setSelectedInvestment(lv.id)}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{lv.icon}</span>
              <strong style={{ color: selectedInvestment === lv.id ? '#fff' : '#0d1b2a' }}>{lv.label}</strong>
              <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '4px', opacity: 0.6, color: selectedInvestment === lv.id ? 'rgba(255,255,255,0.7)' : '#555' }}>{lv.description}</span>
            </button>
          ))}
        </div>
      </div>
    );

    // 16. PRIORIDADES
    if (step === PRIO_STEP) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a' }}>Prioridades do Projeto</h2>
        <p style={{ color: '#555', marginBottom: '1rem' }}>Selecione o que é mais importante para você:</p>
        <div className={styles.chipGrid}>
          {priorityItems.map(p => (
            <button key={p} className={`${styles.chip} ${selectedPriorities.includes(p) ? styles.chipActive : ''}`} onClick={() => setSelectedPriorities(prev => tog(prev, p))}>{p}</button>
          ))}
        </div>
      </div>
    );

    // 17. DINÂMICA (com selects para perguntas que têm options)
    if (step === DYN_STEP) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a' }}>Dinâmica Familiar</h2>
        <div className={styles.formGrid} style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {dynamicsQuestions.map(q => (
            <div key={q.id} className={styles.field}>
              <label style={{ color: '#0d1b2a' }}>{q.question}</label>
              {q.type === 'select' && q.options ? (
                <div className={styles.chipGrid}>
                  {q.options.map(o => (
                    <button key={o} className={`${styles.chip} ${answers[`d_${q.id}`] === o ? styles.chipActive : ''}`} onClick={() => setA(`d_${q.id}`, o)}>{o}</button>
                  ))}
                </div>
              ) : (
                <input
                  className={styles.lightInput || 'glass-input'}
                  style={{ borderColor: 'rgba(13,27,42,0.1)', color: '#0d1b2a', background: 'rgba(13,27,42,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(13,27,42,0.12)', width: '100%', fontSize: '0.95rem', outline: 'none' }}
                  value={answers[`d_${q.id}`] || ''}
                  onChange={e => setA(`d_${q.id}`, e.target.value)}
                  placeholder="Sua resposta..."
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );

    // 18+. AMBIENTES
    if (currentRoom) return (
      <div className={styles.section}>
        <h2 style={{ color: '#0d1b2a' }}>{currentRoom.icon} {currentRoom.name}</h2>
        <p style={{ color: '#555', marginBottom: '1rem' }}>Quais são os hábitos neste espaço?</p>
        <div className={styles.chipGrid}>
          {currentRoom.habits.map((h: string) => (
            <button key={h} className={`${styles.chip} ${(roomHabits[currentRoom.id] || []).includes(h) ? styles.chipActive : ''}`}
              onClick={() => setRoomHabits((p: any) => ({ ...p, [currentRoom.id]: tog(p[currentRoom.id] || [], h) }))}>
              {h}
            </button>
          ))}
        </div>
        <p style={{ color: '#555', marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Equipamentos desejados:</p>
        <div className={styles.chipGrid}>
          {currentRoom.equipment.map((eq: string) => (
            <button key={eq} className={`${styles.chip} ${(roomHabits[`${currentRoom.id}_equip`] || []).includes(eq) ? styles.chipActive : ''}`}
              onClick={() => setRoomHabits((p: any) => ({ ...p, [`${currentRoom.id}_equip`]: tog(p[`${currentRoom.id}_equip`] || [], eq) }))}>
              {eq}
            </button>
          ))}
        </div>
        <textarea
          style={{ marginTop: '1.5rem', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(13,27,42,0.12)', color: '#0d1b2a', background: 'rgba(13,27,42,0.03)', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', minHeight: '80px' }}
          rows={3}
          placeholder={`Algum desejo especial para o(a) ${currentRoom.name}?`}
          value={roomNotes[currentRoom.id] || ''}
          onChange={e => setRoomNotes((p: any) => ({ ...p, [currentRoom.id]: e.target.value }))}
        />
      </div>
    );

    // FINAL. REVISÃO
    if (step === REVIEW_STEP) return (
      <div className={styles.section} style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '3rem' }}>✅</span>
        <h2 style={{ color: '#0d1b2a', marginTop: '1rem' }}>Briefing Completo!</h2>
        <p style={{ color: '#555', margin: '1rem 0 2rem' }}>Todas as informações foram coletadas. Clique abaixo para gerar o dossiê executivo do projeto.</p>
        <button
          style={{ background: '#0d1b2a', color: '#fff', border: 'none', borderRadius: '14px', padding: '1.2rem', width: '100%', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 500 }}
          onClick={handleFinish} disabled={isSaving}>
          {isSaving ? 'Salvando e gerando...' : 'Gerar Dossiê do Projeto ✨'}
        </button>
      </div>
    );

    return null;
  };

  return (
    <main className={styles.main}>
      <div className={styles.bgSpline}><div className={styles.navyBg}><div className={styles.blob1} /><div className={styles.blob2} /></div></div>

      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.96)' }}>
        <Link href="/" className={styles.logoMiniContainer}>
          <img src="/brand/logo-icon-dark.png" alt="BA" className={styles.logoMiniFixed} />
        </Link>
        <div className={styles.headerCenter}>
          <span className={styles.phaseName} style={{ color: '#0d1b2a' }}>{getPhase()}</span>
          <div className={styles.progressTrack} style={{ background: 'rgba(13,27,42,0.08)' }}>
            <motion.div className={styles.progressFill} style={{ background: '#0d1b2a' }} animate={{ width: `${((step + 1) / TOTAL) * 100}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>
        <span className={styles.stepCount} style={{ color: '#0d1b2a' }}>{step + 1}/{TOTAL}</span>
      </header>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
            className={`glass-panel ${styles.card}`} style={{ background: 'rgba(255,255,255,0.96)' }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className={styles.footer} style={{ background: 'rgba(255,255,255,0.96)' }}>
        {step > 0 && (
          <button style={{ color: '#0d1b2a', border: '1px solid rgba(13,27,42,0.2)', background: 'transparent', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem' }}
            onClick={() => nav('prev')}>← Voltar</button>
        )}
        <div style={{ flex: 1 }} />
        {step < REVIEW_STEP && (
          <button style={{ background: '#0d1b2a', color: '#fff', border: 'none', padding: '0.7rem 2rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
            onClick={() => nav('next')}>Próximo →</button>
        )}
      </footer>
    </main>
  );
}
