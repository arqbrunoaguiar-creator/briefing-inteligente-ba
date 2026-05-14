"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabaseClient';
import { styleQuestions, temperamentQuestions, archetypeQuestions, temperaments, archetypes, wordGroups, roomTemplates, investmentLevels } from '@/data/briefingData';
import styles from './dossie.module.css';

// Mapeamento de IDs de estilo para famílias
const STYLE_FAMILY: Record<string, string> = {
  min: 'Minimalista', zen: 'Minimalista', esc: 'Escandinavo',
  ind: 'Industrial', lof: 'Industrial',
  cla: 'Clássico',
  con: 'Contemporâneo', mod: 'Contemporâneo',
  lux: 'Luxo', gou: 'Luxo', dra: 'Luxo',
  ser: 'Natural', nat: 'Natural', spa: 'Natural',
};
const STYLE_COLORS: Record<string, string> = {
  Minimalista: '#c8bfa0', Industrial: '#6b7280', Clássico: '#c9a96e',
  Contemporâneo: '#2c4a6e', Luxo: '#1a1a2e', Natural: '#7a9e7e', Escandinavo: '#e0d8c0',
};

export default function DossiePage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const { data: dbData } = await supabase.from('briefings').select('*').eq('id', params.id).single();
      if (dbData) {
        setData(dbData);
        if (!dbData.ai_analysis || dbData.ai_analysis.error) {
          generateAIAnalysis(dbData);
        } else {
          setAiAnalysis(dbData.ai_analysis);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  async function generateAIAnalysis(briefingData: any) {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefingData })
      });
      const analysis = await res.json();
      setAiAnalysis(analysis);
      await supabase.from('briefings').update({ ai_analysis: analysis }).eq('id', params.id);
      await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefingData, aiAnalysis: analysis })
      });
    } catch (e) {
      console.error('AI Analysis failed', e);
    }
    setAnalyzing(false);
  }

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, (canvas.height * pageW) / canvas.width);
    pdf.save(`Dossie_BA_${data?.client_name}.pdf`);
    setIsGenerating(false);
  };

  if (loading) return <div className={styles.loading}>Carregando dossiê...</div>;
  if (!data) return <div className={styles.loading}><p>Dossiê não encontrado.</p><a href="/admin" style={{ color: '#C4973D' }}>← Voltar</a></div>;

  const answers = data.answers || {};
  const preReg = answers.preRegistration || {};
  const psych = answers.psychology || {};
  const tempAnswers = psych.temperament || {};
  const archAnswers = psych.archetype || {};
  const styleAnswers: Record<string, string> = answers.styles || {};
  const selectedRooms: string[] = data.rooms || [];
  const roomHabits = answers.rooms?.habits || {};

  // Calcula percentagem de estilos
  const styleCounts: Record<string, number> = {};
  Object.values(styleAnswers).forEach((id) => {
    const family = STYLE_FAMILY[id] || 'Outros';
    styleCounts[family] = (styleCounts[family] || 0) + 1;
  });
  const totalStyleVotes = Object.values(styleCounts).reduce((a, b) => a + b, 0);
  const stylesSorted = Object.entries(styleCounts).sort(([, a], [, b]) => b - a);

  // Determina temperamento predominante
  const tempVotes: Record<string, number> = { san: 0, col: 0, mel: 0, fle: 0 };
  const tempMap: Record<string, string[]> = {
    san: ['Energizado e feliz', 'Me traz alegria moderada', 'Receber amigos e conversar'],
    mel: ['Sinto que é bagunçado', 'Muita bagunça visual', 'Ambientes escuros', 'Ficar sozinho em silêncio', 'Organizar a casa para relaxar'],
    fle: ['Pode me cansar rápido', 'Pouco espaço para circulação', 'Dormir ou ver um filme'],
    col: ['Silêncio absoluto'],
  };
  Object.values(tempAnswers).forEach((ans: any) => {
    for (const [key, vals] of Object.entries(tempMap)) {
      if (vals.includes(ans)) { tempVotes[key]++; break; }
    }
  });
  const topTempId = Object.entries(tempVotes).sort(([, a], [, b]) => b - a)[0]?.[0];
  const topTemp = temperaments.find(t => t.id === topTempId);

  // Determina arquétipo predominante
  const archMap: Record<string, string[]> = {
    sab: ['Um guia de sabedoria', 'Ter paz e clareza mental'],
    cri: ['Uma obra de arte abstrata', 'Inovar e ser original'],
    gov: ['Uma biografia de sucesso', 'Transmitir autoridade e status'],
    ama: ['Um romance poético', 'Criar memórias afetivas'],
  };
  const archVotes: Record<string, number> = { sab: 0, cri: 0, gov: 0, ama: 0 };
  Object.values(archAnswers).forEach((ans: any) => {
    for (const [key, vals] of Object.entries(archMap)) {
      if (vals.includes(ans)) { archVotes[key]++; break; }
    }
  });
  const topArchId = Object.entries(archVotes).sort(([, a], [, b]) => b - a)[0]?.[0];
  const topArch = archetypes.find(a => a.id === topArchId);

  // Palavras por grupo
  const selectedWords: string[] = answers.words || [];
  const wordsByGroup = wordGroups.map(g => ({
    ...g,
    selected: g.words.filter(w => selectedWords.includes(w))
  })).filter(g => g.selected.length > 0);

  // Investimento
  const investId = answers.investment || '';
  const investLevel = investmentLevels.find(i => i.id === investId);

  return (
    <main className={styles.main}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
        <Link href="/admin" style={{ color: '#C4973D', textDecoration: 'none', fontSize: '0.9rem' }}>← Voltar ao Dashboard</Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => console.log(JSON.stringify(data))} className={styles.btnSecondary}>JSON</button>
          <button onClick={handlePdf} className={styles.btnPrimary} style={{ background: '#C4973D', color: '#14202B' }}>
            {isGenerating ? 'Gerando...' : '⬇ Baixar PDF'}
          </button>
        </div>
      </header>

      <div className={styles.document} ref={reportRef}>

        {/* ══════════════════ CAPA ══════════════════ */}
        <section className={styles.cover}>
          <img src="/brand/BRUNO-AGUIAR-VERTICAL2---BRANCA.png" alt="Bruno Aguiar" style={{ height: '80px', marginBottom: '3rem' }} />
          {data.client_photo ? (
            <img src={data.client_photo} alt={data.client_name} style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.6)' }} />
          ) : (
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', border: '2px solid rgba(255,255,255,0.3)' }}>
              {data.client_name?.[0]}
            </div>
          )}
          <h1 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{data.client_name}</h1>
          <p style={{ letterSpacing: '4px', opacity: 0.6, fontSize: '0.75rem' }}>BRIEFING ESTRATÉGICO DE INTERIORES</p>
          <p style={{ opacity: 0.5, fontSize: '0.8rem', marginTop: '0.5rem' }}>{preReg.meetingDate || data.answers?.meeting_date || ''}</p>
        </section>

        {/* ══════════════════ 01 — PANORAMA DO CLIENTE ══════════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>01</span><h2>Panorama do Cliente</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Imóvel', value: preReg.propertyType || '—' },
              { label: 'Situação', value: preReg.situation || '—' },
              { label: 'WhatsApp', value: preReg.whatsapp || '—' },
              { label: 'Investimento', value: investLevel ? `${investLevel.icon} ${investLevel.label}` : (investId || '—') },
              { label: 'Home Office', value: answers.dynamics?.home_office || '—' },
              { label: 'Recebe Visitas', value: answers.dynamics?.visitas || '—' },
              { label: 'Pets', value: answers.dynamics?.pets || '—' },
              { label: 'Atmosfera', value: answers.dynamics?.atmosfera || '—' },
              { label: 'Ambientes', value: selectedRooms.length > 0 ? `${selectedRooms.length} selecionados` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem', borderLeft: '3px solid #C4973D' }}>
                <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>{label}</p>
                <p style={{ fontWeight: 600, color: '#14202B', fontSize: '0.95rem' }}>{value}</p>
              </div>
            ))}
          </div>
          {preReg.observations && (
            <div style={{ background: '#fffbf0', border: '1px solid #f0dba0', borderRadius: '12px', padding: '1.2rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#b8860b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Observações Iniciais</p>
              <p style={{ color: '#14202B', fontSize: '0.95rem', lineHeight: 1.6 }}>{preReg.observations}</p>
            </div>
          )}
          {answers.priorities?.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Prioridades do Projeto</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(answers.priorities as string[]).map((p: string, i: number) => (
                  <span key={i} style={{ background: '#14202B', color: '#C4973D', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {i + 1}. {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ══════════════════ 02 — INTELIGÊNCIA DO PROJETO (IA) ══════════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>02</span><h2>Inteligência do Projeto</h2></div>
          {analyzing ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>IA analisando dados do projeto... aguarde alguns segundos.</p>
          ) : aiAnalysis?.error ? (
            <p style={{ color: '#c0392b' }}>⚠️ Análise IA indisponível: {aiAnalysis.error}</p>
          ) : aiAnalysis?.archetype ? (
            <div className={styles.aiContent}>
              <div className={styles.aiInsightCard}>
                <h3>Arquétipo: {aiAnalysis.archetype.name}</h3>
                <p>{aiAnalysis.archetype.reason}</p>
              </div>
              {aiAnalysis.narrative && (
                <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', borderLeft: '4px solid #C4973D', fontStyle: 'italic', color: '#444', lineHeight: 1.7 }}>
                  "{aiAnalysis.narrative}"
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className={styles.statCard}>
                  <h4>Score de Complexidade</h4>
                  <div className={styles.scoreBadge}>{aiAnalysis.complexity?.score ?? '—'}</div>
                  <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>{aiAnalysis.complexity?.reason}</p>
                </div>
                <div className={styles.statCard}>
                  <h4>Estado Emocional</h4>
                  <p><strong>{aiAnalysis.emotionalState?.state}</strong></p>
                  <p style={{ fontSize: '0.8rem' }}>{aiAnalysis.emotionalState?.recommendation}</p>
                </div>
              </div>
              {aiAnalysis.conflicts?.length > 0 && (
                <div className={styles.conflictAlert}>
                  <h4>Conflitos Detectados</h4>
                  {aiAnalysis.conflicts.map((c: any, i: number) => (
                    <p key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '0.5rem 0' }}>
                      <strong>[{c.level?.toUpperCase()}] {c.type}:</strong> {c.issue}
                    </p>
                  ))}
                </div>
              )}
              {aiAnalysis.concept?.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h4>Diretrizes de Conceito</h4>
                  <ul style={{ lineHeight: 2 }}>
                    {aiAnalysis.concept.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
              {aiAnalysis.keywords?.length > 0 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {aiAnalysis.keywords.map((k: string, i: number) => (
                    <span key={i} style={{ background: '#f0e8d5', color: '#8b6914', padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>{k}</span>
                  ))}
                </div>
              )}
            </div>
          ) : <p style={{ color: '#aaa' }}>Aguardando análise da IA...</p>}
        </section>

        {/* ══════════════════ 03 — PERFIL DE ESTILOS ══════════════════ */}
        {totalStyleVotes > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>03</span><h2>Perfil de Estilos</h2></div>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Baseado nas 5 perguntas visuais — distribuição das preferências estéticas do cliente.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
              {stylesSorted.map(([family, count]) => {
                const pct = Math.round((count / totalStyleVotes) * 100);
                const color = STYLE_COLORS[family] || '#ccc';
                return (
                  <div key={family}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, color: '#14202B', fontSize: '0.9rem' }}>{family}</span>
                      <span style={{ fontWeight: 700, color: '#C4973D', fontSize: '0.9rem' }}>{pct}%</span>
                    </div>
                    <div style={{ background: '#f0f0f0', borderRadius: '20px', height: '10px', overflow: 'hidden' }}>
                      <div style={{ background: color, width: `${pct}%`, height: '100%', borderRadius: '20px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem' }}>
              {styleQuestions.map((q, i) => {
                const answerId = styleAnswers[i];
                const opt = q.options.find(o => o.id === answerId);
                return (
                  <div key={i} style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>P{i + 1}</p>
                    <p style={{ fontWeight: 700, color: '#14202B', fontSize: '0.85rem' }}>{opt?.label || '—'}</p>
                    <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '0.3rem' }}>{STYLE_FAMILY[answerId || ''] || ''}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════════ 04 — TEMPERAMENTO & ARQUÉTIPO ══════════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>04</span><h2>Temperamento & Arquétipo</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* Temperamento */}
            <div>
              <h4 style={{ color: '#C4973D', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Temperamento</h4>
              {Object.keys(tempAnswers).length > 0 ? (
                <>
                  {temperamentQuestions.map((q, i) => {
                    const ans = tempAnswers[`t_${i}`] || tempAnswers[i];
                    return ans ? (
                      <div key={i} style={{ marginBottom: '0.8rem', background: '#f8f9fa', borderRadius: '10px', padding: '0.8rem 1rem' }}>
                        <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>{q.question}</p>
                        <p style={{ fontWeight: 600, color: '#14202B', fontSize: '0.9rem' }}>→ {ans}</p>
                      </div>
                    ) : null;
                  })}
                  {topTemp && (
                    <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #14202B, #1e3348)', color: '#fff', borderRadius: '12px', padding: '1.2rem' }}>
                      <p style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{topTemp.icon}</p>
                      <p style={{ fontWeight: 700, color: '#C4973D' }}>{topTemp.label}</p>
                      <p style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.3rem' }}>{topTemp.description}</p>
                      <p style={{ fontSize: '0.78rem', color: '#C4973D', marginTop: '0.5rem', fontStyle: 'italic' }}>{topTemp.tips}</p>
                    </div>
                  )}
                </>
              ) : <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Não respondido.</p>}
            </div>

            {/* Arquétipo */}
            <div>
              <h4 style={{ color: '#C4973D', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Arquétipo de Alma</h4>
              {Object.keys(archAnswers).length > 0 ? (
                <>
                  {archetypeQuestions.map((q, i) => {
                    const ans = archAnswers[`a_${i}`] || archAnswers[i];
                    return ans ? (
                      <div key={i} style={{ marginBottom: '0.8rem', background: '#f8f9fa', borderRadius: '10px', padding: '0.8rem 1rem' }}>
                        <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>{q.question}</p>
                        <p style={{ fontWeight: 600, color: '#14202B', fontSize: '0.9rem' }}>→ {ans}</p>
                      </div>
                    ) : null;
                  })}
                  {topArch && (
                    <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #c9a96e, #8b6914)', color: '#fff', borderRadius: '12px', padding: '1.2rem' }}>
                      <p style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{topArch.icon}</p>
                      <p style={{ fontWeight: 700 }}>{topArch.label}</p>
                      <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.3rem' }}>{topArch.description}</p>
                      <p style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '0.5rem', fontStyle: 'italic' }}>{topArch.materials}</p>
                    </div>
                  )}
                </>
              ) : <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Não respondido.</p>}
            </div>
          </div>
        </section>

        {/* ══════════════════ 05 — UNIVERSO PESSOAL ══════════════════ */}
        {(selectedWords.length > 0 || answers.hobbies?.length > 0) && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>05</span><h2>Universo Pessoal</h2></div>
            {selectedWords.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Vocabulário do Projeto</h4>
                {wordsByGroup.map(g => (
                  <div key={g.id} style={{ marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#aaa', marginRight: '0.5rem' }}>{g.label}:</span>
                    {g.selected.map(w => (
                      <span key={w} style={{ display: 'inline-block', background: '#14202B', color: '#C4973D', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, margin: '0.2rem' }}>{w}</span>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {answers.hobbies?.length > 0 && (
              <div>
                <h4 style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Hobbies & Lifestyle</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(answers.hobbies as string[]).map((h: string) => (
                    <span key={h} style={{ background: '#f0f0f0', color: '#444', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>{h}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ══════════════════ 06 — PANORAMA DOS AMBIENTES ══════════════════ */}
        {selectedRooms.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>06</span><h2>Panorama dos Ambientes</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {selectedRooms.map((roomId) => {
                const room = roomTemplates[roomId];
                if (!room) return null;
                const habits = roomHabits[roomId] || {};
                return (
                  <div key={roomId} style={{ background: '#f8f9fa', borderRadius: '14px', padding: '1.2rem', borderTop: '3px solid #C4973D' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{room.icon}</span>
                      <h4 style={{ color: '#14202B', margin: 0 }}>{room.name}</h4>
                    </div>
                    {habits.habits?.length > 0 && (
                      <div style={{ marginBottom: '0.6rem' }}>
                        <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Usos</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {habits.habits.map((h: string) => (
                            <span key={h} style={{ background: '#e8f4f0', color: '#2d6a4f', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem' }}>{h}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {habits.equipment?.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Equipamentos</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {habits.equipment.map((e: string) => (
                            <span key={e} style={{ background: '#f0e8d5', color: '#8b6914', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem' }}>{e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════════════ 07 — OBSERVAÇÕES DE CAMPO ══════════════════ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>07</span><h2>Observações de Campo</h2></div>
          {answers.freeNotes && Object.keys(answers.freeNotes).length > 0 ? (
            Object.entries(answers.freeNotes).map(([step, note]: any) => (
              <div key={step} className={styles.freeNotes}>
                <strong>Etapa {step}:</strong> {note}
              </div>
            ))
          ) : <p style={{ color: '#aaa' }}>Sem anotações adicionais.</p>}
        </section>

      </div>
    </main>
  );
}
