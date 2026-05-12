"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabaseClient';
import styles from './dossie.module.css';

export default function DossiePage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      const local = localStorage.getItem(`briefing-${params.id}`);
      if (local) {
        const parsed = JSON.parse(local);
        setData(parsed.answers || parsed);
        setLoading(false);
        return;
      }
      const { data: dbData } = await supabase.from('briefings').select('*').eq('id', params.id).single();
      if (dbData) setData(dbData.answers);
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Dossie_BA_${data?.family?.clientName || 'Projeto'}.pdf`);
    setIsGenerating(false);
  };

  if (loading) return <div className={styles.loading}>Sincronizando Dossiê Elite...</div>;

  const clientName = data?.family?.clientName || data?.client_name || "Cliente";

  return (
    <main className={styles.main}>
      <div className={styles.bgSpline}><div className={styles.navyBg}><div className={styles.blob1}></div><div className={styles.blob2}></div></div></div>
      
      <header className={styles.header}>
        <Link href="/arquiteto" className={styles.backLink}>← Dashboard</Link>
        <div className={styles.headerActions}>
          <button onClick={handlePdf} className="glass-button" style={{ background: '#0d1b2a', color: '#fff' }} disabled={isGenerating}>
            {isGenerating ? 'Processando PDF...' : 'Exportar Dossiê PDF'}
          </button>
        </div>
      </header>

      <div className={styles.document} ref={reportRef}>
        {/* CAPA ELITE */}
        <section className={styles.cover}>
          <img src="/brand/logo-full-dark.png" alt="BA" className={styles.coverLogo} />
          <div className={styles.coverTitle}>
            <span className={styles.clientTag}>Briefing Estratégico</span>
            <h1>{clientName}</h1>
            <p>Dossiê de Conceito e Viabilidade de Interiores</p>
          </div>
          <div className={styles.coverFooter}>
            <span>BRUNO AGUIAR INTERIORES © 2024</span>
            <span>{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </section>

        {/* DIAGNÓSTICO DE ESTILO */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>01</span>
            <h2>DNA Visual</h2>
          </div>
          <div className={styles.gridStyle}>
            <div className={styles.archetypeCard}>
              <h3>O Arquétipo do Lar</h3>
              <p>A análise das referências escolhidas aponta para um perfil que valoriza a <strong>atemporalidade</strong> e o <strong>equilíbrio</strong>. Há uma clara preferência por texturas naturais integradas a um acabamento contemporâneo de luxo.</p>
              <div className={styles.iaInsight}>
                <span>✨ Insight de IA:</span>
                <p>Sua inclinação para espaços amplos e paleta sóbria sugere uma busca por clareza mental e ordem através da arquitetura.</p>
              </div>
            </div>
            <div className={styles.moodSummary}>
              <div className={styles.moodItem}><span>Paleta Dominante:</span> <strong>Navy, Noir e Off-White</strong></div>
              <div className={styles.moodItem}><span>Materiais:</span> <strong>Madeira Natural, Quartzo e Couro</strong></div>
            </div>
          </div>
        </section>

        {/* DETALHAMENTO DE AMBIENTES */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>02</span>
            <h2>Escaneamento de Ambientes</h2>
          </div>
          <div className={styles.roomsGrid}>
            {(data?.rooms?.notes && Object.keys(data.rooms.notes).length > 0) ? Object.keys(data.rooms.notes).map((roomId) => (
              <div key={roomId} className={styles.roomCard}>
                <h4>{roomId.replace('-', ' ').toUpperCase()}</h4>
                <p>{data.rooms.notes[roomId]}</p>
                {data.rooms.habits?.[roomId] && (
                  <div className={styles.roomHabits}>
                    {data.rooms.habits[roomId].map((h: string) => <span key={h}>{h}</span>)}
                  </div>
                )}
              </div>
            )) : <p className={styles.emptyNote}>Nenhum detalhe específico inserido por ambiente.</p>}
          </div>
        </section>

        {/* INVESTIMENTO E VIABILIDADE */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>03</span>
            <h2>Viabilidade Financeira</h2>
          </div>
          <div className={styles.investCard}>
            <div className={styles.investInfo}>
              <p>Perfil de Investimento Selecionado:</p>
              <h3>PREMIUM / LUXO</h3>
            </div>
            <div className={styles.investRange}>
              <div className={styles.rangeBar}><div className={styles.rangeFill} style={{ width: '85%' }}></div></div>
              <div className={styles.rangeLabels}>
                <span>Estimado: R$ 250k</span>
                <span>Teto: R$ 450k</span>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION FINAL */}
        <section className={styles.finalCta}>
          <h2>Pronto para materializar?</h2>
          <p>O próximo passo é a reunião de conceituação para alinhar os detalhes técnicos deste dossiê.</p>
          <div className={styles.ctaActions}>
            <button className={styles.primaryCta}>Agendar Reunião de Conceito</button>
            <button className={styles.secondaryCta}>Falar com Bruno via WhatsApp</button>
          </div>
        </section>
      </div>
    </main>
  );
}
