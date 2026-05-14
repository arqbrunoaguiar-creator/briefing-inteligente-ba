"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  styleQuestions, wordGroups, hobbies, investmentLevels, priorityItems,
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

  const [selectedStyles, setSelectedStyles] = useState<Record<number, string>>({});
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState('');
  const [roomHabits, setRoomHabits] = useState<any>({});
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  useEffect(() => {
    async function loadInitial() {
      const { data } = await supabase.from('briefings').select('*').eq('id', params.id).single();
      if (data) {
        setClient(data);
        // Restaura seleção de ambientes se já existir
        const savedRooms = data.rooms || data.answers?.preRegistration?.detectedRooms || [];
        setSelectedRooms(savedRooms.filter((r: string) => roomTemplates[r]));
        if (data.status === 'pre') {
          await supabase.from('briefings').update({ status: 'pro' }).eq('id', params.id);
        }
      }
    }
    loadInitial();
  }, [params.id]);

  if (!client) return <div className={styles.loading}>Carregando Briefing...</div>;

  const rooms = selectedRooms.filter((r: string) => roomTemplates[r]);

  const STYLE_START = 1;
  const STYLE_END = STYLE_START + styleQuestions.length - 1;
  const TEMP_STEP = STYLE_END + 1;
  const ARCH_STEP = TEMP_STEP + 1;
  const WORDS_STEP = ARCH_STEP + 1;
  const HOBBIES_STEP = WORDS_STEP + 1;
  const INVEST_STEP = HOBBIES_STEP + 1;
  const PRIO_STEP = INVEST_STEP + 1;
  const DYN_STEP = PRIO_STEP + 1;
  const ROOMS_SELECT_STEP = DYN_STEP + 1;
  const ROOM_START = ROOMS_SELECT_STEP + 1;
  const ROOM_END = ROOM_START + Math.max(rooms.length - 1, 0);
  const REVIEW_STEP = rooms.length > 0 ? ROOM_END + 1 : ROOMS_SELECT_STEP + 1;

  const nav = (dir: 'next' | 'prev') => {
    setStep(s => Math.max(0, Math.min(dir === 'next' ? s + 1 : s - 1, REVIEW_STEP)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoomsSelect = async (roomKey: string) => {
    const updated = selectedRooms.includes(roomKey)
      ? selectedRooms.filter(r => r !== roomKey)
      : [...selectedRooms, roomKey];
    setSelectedRooms(updated);
    await supabase.from('briefings').update({ rooms: updated }).eq('id', params.id);
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
      priorities: answers.priorities || [],
      dynamics: Object.fromEntries(Object.entries(answers).filter(([k]) => !k.startsWith('t_') && !k.startsWith('a_') && k !== 'priorities')),
    };

    await supabase.from('briefings').update({
      answers: fullPayload,
      rooms: selectedRooms,
      status: 'con'
    }).eq('id', params.id);

    router.push(`/dossie/${params.id}`);
  };

  const renderContent = () => {
    // ── STEP 0: Boas-vindas ──────────────────────────────────────────
    if (step === 0) {
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Início do Briefing</p>
          <h2>Briefing com {client.client_name}</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Vamos iniciar o processo de descoberta. Responda com honestidade — não existe certo ou errado. Cada resposta nos aproxima do projeto perfeito.
          </p>
          <div className={styles.infoGrid}>
            {[
              { label: 'Cliente', value: client.client_name },
              { label: 'Reunião', value: client.answers?.meeting_date || 'A definir' },
              { label: 'Imóvel', value: client.answers?.preRegistration?.propertyType || 'A definir' },
              { label: 'Situação', value: client.answers?.preRegistration?.situation || 'A definir' },
            ].map(({ label, value }) => (
              <div key={label} className={styles.infoCard}>
                <p className={styles.infoLabel}>{label}</p>
                <p className={styles.infoValue}>{value}</p>
              </div>
            ))}
          </div>
          {client.answers?.preRegistration?.observations && (
            <div className={styles.obsCard}>
              <p className={styles.stepLabel}>Observações Prévias</p>
              <p style={{ color: '#14202B', lineHeight: 1.6 }}>{client.answers.preRegistration.observations}</p>
            </div>
          )}
        </div>
      );
    }

    // ── STYLE QUESTIONS (steps 1–5) ──────────────────────────────────
    if (step >= STYLE_START && step <= STYLE_END) {
      const q = styleQuestions[step - STYLE_START];
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Pergunta {step} de {STYLE_END} · Estilo</p>
          <h2>{q.question}</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>{q.context}</p>
          <div className={styles.styleGrid}>
            {q.options.map(opt => {
              const isSelected = selectedStyles[q.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedStyles(prev => ({ ...prev, [q.id]: opt.id }))}
                  className={`${styles.styleCard} ${isSelected ? styles.styleCardActive : ''}`}
                >
                  <div
                    className={styles.styleCardImg}
                    style={{
                      background: opt.gradient,
                      backgroundImage: opt.image ? `url(${opt.image})` : opt.gradient,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className={styles.styleCardBody}>
                    <p className={styles.styleCardTitle}>{opt.label}</p>
                    <p className={styles.styleCardDesc}>{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ── TEMP_STEP: Temperamento ──────────────────────────────────────
    if (step === TEMP_STEP) {
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Perfil Psicológico</p>
          <h2>Como é o seu ritmo de vida?</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Suas respostas calibram a energia do espaço.</p>
          {temperamentQuestions.map(q => (
            <div key={q.id} className={styles.questionBlock}>
              <p className={styles.questionText}>{q.question}</p>
              <div className={styles.chipGrid}>
                {q.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswers((prev: any) => ({ ...prev, [q.id]: opt }))}
                    className={`${styles.chip} ${answers[q.id] === opt ? styles.chipActive : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // ── ARCH_STEP: Arquétipo ─────────────────────────────────────────
    if (step === ARCH_STEP) {
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Arquétipo</p>
          <h2>A alma do seu espaço</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Responda sem pensar demais — a primeira resposta é a mais verdadeira.</p>
          {archetypeQuestions.map(q => (
            <div key={q.id} className={styles.questionBlock}>
              <p className={styles.questionText}>{q.question}</p>
              <div className={styles.chipGrid}>
                {q.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAnswers((prev: any) => ({ ...prev, [q.id]: opt }))}
                    className={`${styles.chip} ${answers[q.id] === opt ? styles.chipActive : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // ── WORDS_STEP: Vocabulário Visual ───────────────────────────────
    if (step === WORDS_STEP) {
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Vocabulário Visual</p>
          <h2>Quais palavras descrevem o seu lar ideal?</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Selecione quantas quiser — cada uma conta uma história.</p>
          {wordGroups.map(group => (
            <div key={group.id} className={styles.questionBlock}>
              <p className={styles.stepLabel}>{group.label}</p>
              <div className={styles.chipGrid}>
                {group.words.map(word => (
                  <button
                    key={word}
                    onClick={() => setSelectedWords(prev =>
                      prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word]
                    )}
                    className={`${styles.chip} ${selectedWords.includes(word) ? styles.chipActive : ''}`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // ── HOBBIES_STEP ─────────────────────────────────────────────────
    if (step === HOBBIES_STEP) {
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Estilo de Vida</p>
          <h2>O que você ama fazer em casa?</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Seus hobbies moldam a funcionalidade dos espaços.</p>
          <div className={styles.chipGrid}>
            {hobbies.map(hobby => (
              <button
                key={hobby}
                onClick={() => setSelectedHobbies(prev =>
                  prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
                )}
                className={`${styles.chip} ${selectedHobbies.includes(hobby) ? styles.chipActive : ''}`}
              >
                {hobby}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ── INVEST_STEP ──────────────────────────────────────────────────
    if (step === INVEST_STEP) {
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Investimento</p>
          <h2>Qual faixa de investimento está no horizonte?</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Sem julgamentos — cada projeto tem sua escala.</p>
          <div className={styles.styleGrid}>
            {investmentLevels.map(level => (
              <button
                key={level.id}
                onClick={() => setSelectedInvestment(level.id)}
                className={`${styles.investCard} ${selectedInvestment === level.id ? styles.investCardActive : ''}`}
              >
                <span className={styles.investIcon}>{level.icon}</span>
                <p className={styles.styleCardTitle} style={{ color: selectedInvestment === level.id ? '#fff' : '#14202B' }}>{level.label}</p>
                <p className={styles.styleCardDesc} style={{ color: selectedInvestment === level.id ? 'rgba(255,255,255,0.7)' : '#8e8e93' }}>{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ── PRIO_STEP ────────────────────────────────────────────────────
    if (step === PRIO_STEP) {
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Prioridades</p>
          <h2>O que é inegociável para você?</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Selecione por ordem de importância.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {priorityItems.map((item, i) => {
              const selected: string[] = answers.priorities || [];
              const isSelected = selected.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => {
                    const updated = isSelected ? selected.filter(p => p !== item) : [...selected, item];
                    setAnswers((prev: any) => ({ ...prev, priorities: updated }));
                  }}
                  className={`${styles.priorityRow} ${isSelected ? styles.priorityRowActive : ''}`}
                >
                  <span className={styles.priorityNum}>{i + 1}</span>
                  <span>{item}</span>
                  {isSelected && <span className={styles.priorityCheck}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // ── DYN_STEP: Dinâmica do Lar ────────────────────────────────────
    if (step === DYN_STEP) {
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Dinâmica do Lar</p>
          <h2>Como é o seu dia a dia?</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Detalhes que fazem toda a diferença no projeto.</p>
          {dynamicsQuestions.map(q => (
            <div key={q.id} className={styles.questionBlock}>
              <p className={styles.questionText}>{q.question}</p>
              {q.type === 'select' ? (
                <div className={styles.chipGrid}>
                  {q.options?.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((prev: any) => ({ ...prev, [q.id]: opt }))}
                      className={`${styles.chip} ${answers[q.id] === opt ? styles.chipActive : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  className={styles.inputAdmin}
                  placeholder="Descreva aqui..."
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers((prev: any) => ({ ...prev, [q.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      );
    }

    // ── ROOMS_SELECT_STEP: Seleção de Ambientes ──────────────────────
    if (step === ROOMS_SELECT_STEP) {
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Ambientes do Projeto</p>
          <h2>Quais ambientes fazem parte deste projeto?</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Selecione todos os cômodos que serão trabalhados. Você detalhará cada um na próxima etapa.</p>
          <div className={styles.chipGrid}>
            {Object.values(roomTemplates).map(room => {
              const isSelected = selectedRooms.includes(room.id);
              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomsSelect(room.id)}
                  className={`${styles.chip} ${isSelected ? styles.chipActive : ''}`}
                  style={{ fontSize: '1rem', padding: '0.8rem 1.5rem' }}
                >
                  {room.icon} {room.name}
                </button>
              );
            })}
          </div>
          {selectedRooms.length > 0 && (
            <p style={{ marginTop: '2rem', color: '#C4973D', fontWeight: 600 }}>
              ✓ {selectedRooms.length} ambiente{selectedRooms.length > 1 ? 's' : ''} selecionado{selectedRooms.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      );
    }

    // ── ROOM STEPS ───────────────────────────────────────────────────
    if (step >= ROOM_START && step <= ROOM_END) {
      const roomKey = rooms[step - ROOM_START];
      const room = roomTemplates[roomKey];
      if (!room) return null;

      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Ambiente {step - ROOM_START + 1} de {rooms.length}</p>
          <h2>{room.icon} {room.name}</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Personalize este espaço com suas necessidades.</p>

          <div className={styles.questionBlock}>
            <p className={styles.questionText}>Como este ambiente é usado?</p>
            <div className={styles.chipGrid}>
              {room.habits.map(habit => {
                const isSelected = roomHabits[roomKey]?.habits?.includes(habit);
                return (
                  <button
                    key={habit}
                    onClick={() => {
                      const current = roomHabits[roomKey]?.habits || [];
                      const updated = isSelected ? current.filter((h: string) => h !== habit) : [...current, habit];
                      setRoomHabits((prev: any) => ({ ...prev, [roomKey]: { ...prev[roomKey], habits: updated } }));
                    }}
                    className={`${styles.chip} ${isSelected ? styles.chipActive : ''}`}
                  >
                    {habit}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.questionBlock}>
            <p className={styles.questionText}>Equipamentos desejados:</p>
            <div className={styles.chipGrid}>
              {room.equipment.map(eq => {
                const isSelected = roomHabits[roomKey]?.equipment?.includes(eq);
                return (
                  <button
                    key={eq}
                    onClick={() => {
                      const current = roomHabits[roomKey]?.equipment || [];
                      const updated = isSelected ? current.filter((e: string) => e !== eq) : [...current, eq];
                      setRoomHabits((prev: any) => ({ ...prev, [roomKey]: { ...prev[roomKey], equipment: updated } }));
                    }}
                    className={`${styles.chip} ${isSelected ? styles.chipActive : ''}`}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.questionBlock}>
            <p className={styles.questionText}>Observações específicas:</p>
            <textarea
              className={styles.inputAdmin}
              style={{ height: '100px', resize: 'none' }}
              placeholder="Requisitos especiais, medidas, referências..."
              value={roomHabits[roomKey]?.notes || ''}
              onChange={e => setRoomHabits((prev: any) => ({ ...prev, [roomKey]: { ...prev[roomKey], notes: e.target.value } }))}
            />
          </div>
        </div>
      );
    }

    // ── REVIEW STEP ──────────────────────────────────────────────────
    if (step === REVIEW_STEP) {
      const firstName = client.client_name?.split(' ')[0] || client.client_name;
      return (
        <div className={styles.section}>
          <p className={styles.stepLabel}>Revisão Final</p>
          <h2>Tudo pronto, {firstName}!</h2>
          <p style={{ color: '#8e8e93', marginBottom: '3rem' }}>Revise antes de gerar o dossiê estratégico.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.keys(selectedStyles).length > 0 && (
              <div className={styles.reviewCard}>
                <p className={styles.stepLabel}>Estilos Selecionados</p>
                <div className={styles.chipGrid}>
                  {Object.entries(selectedStyles).map(([qId, optId]) => {
                    const q = styleQuestions.find(q => q.id === Number(qId));
                    const opt = q?.options.find(o => o.id === optId);
                    return opt ? (
                      <span key={qId} className={styles.reviewTag}>{opt.label}</span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {selectedHobbies.length > 0 && (
              <div className={styles.reviewCard}>
                <p className={styles.stepLabel}>Hobbies</p>
                <p style={{ color: '#14202B' }}>{selectedHobbies.join(' · ')}</p>
              </div>
            )}

            {selectedInvestment && (
              <div className={styles.reviewCard}>
                <p className={styles.stepLabel}>Investimento</p>
                <p style={{ color: '#14202B', fontWeight: 600 }}>
                  {investmentLevels.find(l => l.id === selectedInvestment)?.label}
                </p>
              </div>
            )}

            {selectedWords.length > 0 && (
              <div className={styles.reviewCard}>
                <p className={styles.stepLabel}>Palavras-chave</p>
                <div className={styles.chipGrid}>
                  {selectedWords.map(w => <span key={w} className={styles.reviewTag}>{w}</span>)}
                </div>
              </div>
            )}

            {rooms.length > 0 && (
              <div className={styles.reviewCard}>
                <p className={styles.stepLabel}>Ambientes</p>
                <p style={{ color: '#14202B' }}>{rooms.map((r: string) => roomTemplates[r]?.name).join(' · ')}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.progressHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <span style={{ color: '#14202B', fontWeight: 600 }}>Projeto: {client.client_name}</span>
          <span style={{ color: '#8e8e93', fontSize: '0.9rem' }}>Etapa {step} de {REVIEW_STEP}</span>
        </div>
        <div className={styles.progressBar}>
          <div style={{ width: `${(step / REVIEW_STEP) * 100}%`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.briefingContent}>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className={styles.adminNotes}>
          <h4>MINHAS ANOTAÇÕES · ETAPA {step}</h4>
          <textarea
            placeholder="Anote detalhes da conversa, percepções, alertas..."
            value={freeNotes[step] || ''}
            onChange={e => setFreeNotes({ ...freeNotes, [step]: e.target.value })}
          />
        </aside>
      </div>

      <div className={styles.actions}>
        <button
          onClick={() => nav('prev')}
          className={styles.btnNav}
          disabled={step === 0}
          style={{ background: '#f4f5f7', color: '#14202B', opacity: step === 0 ? 0.4 : 1 }}
        >
          ← Voltar
        </button>
        {step < REVIEW_STEP ? (
          <button
            onClick={() => nav('next')}
            className={styles.btnNav}
            style={{ background: '#14202B', color: '#fff' }}
          >
            Avançar →
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className={styles.btnNav}
            style={{ background: '#C4973D', color: '#14202B', fontWeight: 700 }}
            disabled={isSaving}
          >
            {isSaving ? 'Gerando Dossiê...' : 'Finalizar e Gerar Dossiê →'}
          </button>
        )}
      </div>
    </div>
  );
}
