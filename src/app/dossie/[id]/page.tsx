"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabaseClient';
import { styleQuestions, investmentLevels, wordGroups, roomTemplates, temperaments, archetypes } from '@/data/briefingData';
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
      const answersLocal = localStorage.getItem(`briefing-answers-${params.id}`);
      if (answersLocal) {
        const parsed = JSON.parse(answersLocal);
        setData(parsed.answers || parsed);
        setLoading(false);
        return;
      }
      try {
        const { data: dbData } = await supabase.from('briefings').select('*').eq('id', params.id).single();
        if (dbData?.answers) { setData(dbData.answers); setLoading(false); return; }
      } catch (e) {}
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) return <div className={styles.loading}>Gerando Dossiê Estratégico...</div>;
  if (!data) return <div className={styles.error}>Dados não encontrados.</div>;

  const clientName = data?.family?.clientName || 'Cliente';
  const investInfo = INVEST_RANGES[data?.investment || 'eco'];
  
  // Lógica de Psicologia
  const psy = data?.psychology || {};
  const tempAnswer = psy.temperament?.t_t1 || '';
  const archAnswer = psy.archetype?.a_a1 || '';
  
  const detectTemp = () => {
    if (tempAnswer.includes('Energizado')) return temperaments.find(t => t.id === 'san');
    if (tempAnswer.includes('bagunçado')) return temperaments.find(t => t.id === 'mel');
    if (tempAnswer.includes('cansar')) return temperaments.find(t => t.id === 'fle');
    return temperaments.find(t => t.id === 'col');
  };

  const detectArch = () => {
    if (archAnswer.includes('sabedoria')) return archetypes.find(a => a.id === 'sab');
    if (archAnswer.includes('arte')) return archetypes.find(a => a.id === 'cri');
    if (archAnswer.includes('sucesso')) return archetypes.find(a => a.id === 'gov');
    return archetypes.find(a => a.id === 'ama');
  };

  const userTemp = detectTemp();
  const userArch = detectArch();

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const ratio = pageW / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, canvas.height * ratio);
    pdf.save(`Dossie_${clientName}.pdf`);
    setIsGenerating(false);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/arquiteto" className={styles.backLink}>← Dashboard</Link>
        <button onClick={handlePdf} className={styles.pdfBtn} disabled={isGenerating}>
          {isGenerating ? 'Processando...' : 'Exportar PDF'}
        </button>
      </header>

      <div className={styles.document} ref={reportRef}>
        {/* CAPA */}
        <section className={styles.cover}>
          <img src="/brand/logo-full-dark.png" alt="BA" className={styles.coverLogo} />
          <div className={styles.coverTitle}>
            <span className={styles.clientTag}>Briefing Estratégico</span>
            <h1>{clientName}</h1>
            <p>Dossiê de Identidade e Conceito</p>
          </div>
        </section>

        {/* 01. PSICOLOGIA DO MORAR */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>01</span><h2>Psicologia do Morar</h2></div>
          <div className={styles.psyGrid}>
            {userTemp && (
              <div className={styles.psyCard}>
                <span className={styles.psyTag}>Temperamento</span>
                <h3>{userTemp.icon} {userTemp.label}</h3>
                <p>{userTemp.description}</p>
                <div className={styles.tipsBox}>
                  <strong>Dica do Arquiteto:</strong> {userTemp.tips}
                </div>
              </div>
            )}
            {userArch && (
              <div className={styles.psyCard}>
                <span className={styles.psyTag}>Arquétipo de Alma</span>
                <h3>{userArch.icon} {userArch.label}</h3>
                <p>{userArch.description}</p>
                <div className={styles.tipsBox}>
                  <strong>Materiais Recomendados:</strong> {userArch.materials}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 02. MOODBOARD CONCEITUAL */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>02</span><h2>Conceito Visual</h2></div>
          <div className={styles.moodboardImg}>
            <img src="/styles/estilo_contemporaneo_sala.png" alt="Conceito" style={{ width: '100%', borderRadius: '20px' }} />
            <div className={styles.moodOverlay}>
              <p>Imagem conceitual gerada a partir da sua planta e perfil psicológico.</p>
            </div>
          </div>
        </section>

        {/* 03. INVESTIMENTO E PRIORIDADES */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>03</span><h2>Estratégia de Investimento</h2></div>
          <div className={styles.investCard}>
            <div className={styles.investText}>
              <h3>Perfil {investInfo.label}</h3>
              <p>Estimativa de investimento: <strong>{investInfo.range}</strong></p>
            </div>
            <div className={styles.progressBar}><div style={{ width: `${investInfo.pct}%` }} /></div>
          </div>
        </section>

        {/* 04. AMBIENTES DETECTADOS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>04</span><h2>Mapa de Ambientes</h2></div>
          <div className={styles.roomsGrid}>
            {(data?.detectedRooms || []).map((r: string) => {
              const tmpl = roomTemplates[r];
              if (!tmpl) return null;
              return (
                <div key={r} className={styles.roomCard}>
                  <h4>{tmpl.icon} {tmpl.name}</h4>
                  <div className={styles.roomHabits}>
                    {(data?.rooms?.habits?.[r] || []).map((h: string) => <span key={h}>{h}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className={styles.finalFooter}>
          <p>Este dossiê é a base para o desenvolvimento do seu projeto executivo.</p>
          <img src="/brand/logo-full-dark.png" alt="BA" style={{ height: '30px', marginTop: '1rem' }} />
        </footer>
      </div>
    </main>
  );
}
