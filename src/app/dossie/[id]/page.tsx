"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabaseClient';
import { styleQuestions, investmentLevels, wordGroups, roomTemplates } from '@/data/briefingData';
import styles from './dossie.module.css';

const INVEST_RANGES: Record<string, { label: string; range: string; pct: number }> = {
  eco: { label: 'Econômico', range: 'R$ 50.000 – R$ 120.000', pct: 25 },
  int: { label: 'Intermediário', range: 'R$ 120.000 – R$ 250.000', pct: 50 },
  pre: { label: 'Premium', range: 'R$ 250.000 – R$ 450.000', pct: 75 },
  lux: { label: 'Alto Luxo', range: 'R$ 450.000+', pct: 95 },
};

export default function DossiePage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      // 1. Tentar dados de resposta do localStorage
      const answersLocal = localStorage.getItem(`briefing-answers-${params.id}`);
      if (answersLocal) {
        const parsed = JSON.parse(answersLocal);
        setData(parsed.answers || parsed);
        setLoading(false);
        return;
      }
      // 2. Tentar do Supabase
      try {
        const { data: dbData } = await supabase.from('briefings').select('*').eq('id', params.id).single();
        if (dbData?.answers) { setData(dbData.answers); setLoading(false); return; }
      } catch (e) {}
      // 3. Fallback: dados brutos do briefing
      const raw = localStorage.getItem(`briefing-${params.id}`);
      if (raw) setData(JSON.parse(raw));
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const ratio = pageW / imgW;
      const scaledH = imgH * ratio;
      let position = 0;
      // Multi-page support
      while (position < scaledH) {
        if (position > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, pageW, scaledH);
        position += pageH;
      }
      pdf.save(`Dossie_BA_${data?.family?.clientName || 'Projeto'}.pdf`);
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff' }}>
      Gerando Dossiê...
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff', gap: '1rem' }}>
      <p>Nenhum dado encontrado para este briefing.</p>
      <Link href="/" style={{ color: '#0d1b2a', background: '#fff', padding: '0.8rem 2rem', borderRadius: '10px', textDecoration: 'none' }}>Voltar ao Início</Link>
    </div>
  );

  const clientName = data?.family?.clientName || 'Cliente';
  const spouseName = data?.family?.spouseName || '';
  const childrenList = data?.family?.children || [];
  const investKey = data?.investment || '';
  const investInfo = INVEST_RANGES[investKey] || { label: 'Não informado', range: '—', pct: 0 };
  const selectedPriorities = data?.priorities || [];
  const selectedHobbies = data?.hobbies || [];
  const roomNotes = data?.rooms?.notes || {};
  const roomHabs = data?.rooms?.habits || {};
  const detectedRooms = data?.detectedRooms || [];
  const dynAnswers = data?.dynamics || {};
  const propAnswers = data?.property || {};

  // Monta resumo de estilo
  const styleChoices = data?.styles || {};
  const styleSummary: string[] = [];
  Object.entries(styleChoices).forEach(([qId, optId]) => {
    const q = styleQuestions.find(sq => sq.id === Number(qId));
    if (q) {
      const opt = q.options.find(o => o.id === optId);
      if (opt) styleSummary.push(opt.label);
    }
  });

  const wordsSummary: string[] = [];
  (data?.words || []).forEach((wId: number) => {
    const g = wordGroups.find(wg => wg.id === wId);
    if (g) wordsSummary.push(...g.words);
  });

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/arquiteto" className={styles.backLink}>← Dashboard</Link>
        <button onClick={handlePdf} style={{ background: '#0d1b2a', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem' }} disabled={isGenerating}>
          {isGenerating ? 'Processando...' : 'Exportar PDF'}
        </button>
      </header>

      <div className={styles.document} ref={reportRef}>
        {/* CAPA */}
        <section className={styles.cover}>
          <img src="/brand/logo-full-dark.png" alt="BA" className={styles.coverLogo} />
          <div className={styles.coverTitle}>
            <span className={styles.clientTag}>Dossiê de Projeto</span>
            <h1>{clientName}</h1>
            <p>Briefing Estratégico de Interiores</p>
          </div>
          <div className={styles.coverFooter}>
            <span>BRUNO AGUIAR INTERIORES © {new Date().getFullYear()}</span>
            <span>{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </section>

        {/* 01. FAMÍLIA */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>01</span><h2>A Família</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className={styles.dataCard}>
              <span className={styles.dataLabel}>Cliente</span>
              <p className={styles.dataValue}>{clientName}</p>
            </div>
            <div className={styles.dataCard}>
              <span className={styles.dataLabel}>Cônjuge</span>
              <p className={styles.dataValue}>{spouseName || '—'}</p>
            </div>
            {childrenList.length > 0 && (
              <div className={styles.dataCard} style={{ gridColumn: 'span 2' }}>
                <span className={styles.dataLabel}>Filhos</span>
                <p className={styles.dataValue}>{childrenList.map((c: any) => `${c.name} (${c.age})`).join(' · ')}</p>
              </div>
            )}
          </div>
        </section>

        {/* 02. DNA VISUAL */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>02</span><h2>DNA Visual</h2></div>
          <div className={styles.gridStyle}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Estilos Selecionados</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {styleSummary.length > 0 ? styleSummary.map((s, i) => (
                  <span key={i} style={{ background: '#0d1b2a', color: '#fff', padding: '6px 14px', borderRadius: '50px', fontSize: '0.8rem' }}>{s}</span>
                )) : <p style={{ opacity: 0.5 }}>Nenhum estilo selecionado</p>}
              </div>
              {wordsSummary.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Essência</h3>
                  <p style={{ color: '#555', lineHeight: 1.6 }}>{wordsSummary.join(' · ')}</p>
                </div>
              )}
            </div>
            <div>
              {selectedHobbies.length > 0 && (
                <>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Estilo de Vida</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {selectedHobbies.map((h: string) => (
                      <span key={h} style={{ background: 'rgba(13,27,42,0.06)', padding: '5px 12px', borderRadius: '50px', fontSize: '0.75rem', color: '#0d1b2a' }}>{h}</span>
                    ))}
                  </div>
                </>
              )}
              {selectedPriorities.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Prioridades</h3>
                  <ol style={{ paddingLeft: '1.2rem', color: '#555', fontSize: '0.9rem' }}>
                    {selectedPriorities.map((p: string, i: number) => <li key={i} style={{ marginBottom: '0.3rem' }}>{p}</li>)}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 03. IMÓVEL */}
        {Object.keys(propAnswers).length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>03</span><h2>O Imóvel</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {Object.entries(propAnswers).map(([key, val]) => (
                <div key={key} className={styles.dataCard}>
                  <span className={styles.dataLabel}>{key.replace('p_', '').replace(/_/g, ' ')}</span>
                  <p className={styles.dataValue}>{val as string}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 04. DINÂMICA */}
        {Object.keys(dynAnswers).length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>04</span><h2>Dinâmica Familiar</h2></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {Object.entries(dynAnswers).map(([key, val]) => (
                <div key={key} className={styles.dataCard}>
                  <span className={styles.dataLabel}>{key.replace('d_', '').replace(/_/g, ' ')}</span>
                  <p className={styles.dataValue}>{val as string}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 05. AMBIENTES */}
        {detectedRooms.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>05</span><h2>Ambientes</h2></div>
            <div className={styles.roomsGrid}>
              {detectedRooms.map((roomId: string) => {
                const tmpl = roomTemplates[roomId];
                const name = tmpl?.name || roomId;
                const icon = tmpl?.icon || '🏠';
                const habits = roomHabs[roomId] || [];
                const equip = roomHabs[`${roomId}_equip`] || [];
                const notes = roomNotes[roomId] || '';
                return (
                  <div key={roomId} className={styles.roomCard}>
                    <h4>{icon} {name}</h4>
                    {habits.length > 0 && (
                      <div className={styles.roomHabits}>
                        {habits.map((h: string) => <span key={h}>{h}</span>)}
                      </div>
                    )}
                    {equip.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Equipamentos:</span>
                        <div className={styles.roomHabits} style={{ marginTop: '0.3rem' }}>
                          {equip.map((e: string) => <span key={e} style={{ background: 'rgba(13,27,42,0.08)', color: '#0d1b2a' }}>{e}</span>)}
                        </div>
                      </div>
                    )}
                    {notes && <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.7 }}>"{notes}"</p>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 06. INVESTIMENTO */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>06</span><h2>Viabilidade Financeira</h2></div>
          <div className={styles.investCard}>
            <div className={styles.investInfo}>
              <p>Perfil Selecionado</p>
              <h3>{investInfo.label.toUpperCase()}</h3>
            </div>
            <div className={styles.investRange}>
              <div className={styles.rangeBar}><div className={styles.rangeFill} style={{ width: `${investInfo.pct}%` }} /></div>
              <div className={styles.rangeLabels}>
                <span>{investInfo.range}</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className={styles.finalCta}>
          <h2>Pronto para materializar?</h2>
          <p>Agende a reunião de conceituação para transformar este dossiê em projeto executivo.</p>
          <div className={styles.ctaActions}>
            <a href="https://wa.me/5551999999999?text=Ol%C3%A1%20Bruno%2C%20acabei%20de%20preencher%20o%20briefing%20e%20gostaria%20de%20agendar%20uma%20reuni%C3%A3o!" target="_blank" rel="noopener" className={styles.primaryCta}>
              Falar com Bruno via WhatsApp
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
