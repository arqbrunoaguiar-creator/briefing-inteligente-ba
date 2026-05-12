"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
      // 1. Tentar Local
      const local = localStorage.getItem(`briefing-${params.id}`);
      if (local) {
        const parsed = JSON.parse(local);
        setData(parsed.answers || parsed); // Suporta os dois formatos de salvamento
        setLoading(false);
        return;
      }

      // 2. Tentar Banco
      const { data: dbData } = await supabase.from('briefings').select('*').eq('id', params.id).single();
      if (dbData) setData(dbData.answers);
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  const handlePdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save(`Dossie_BA_${data?.family?.clientName || 'Cliente'}.pdf`);
    setIsGenerating(false);
  };

  if (loading) return <div className={styles.loading}>Gerando análise estratégica...</div>;

  return (
    <main className={styles.main}>
      <div className={styles.bgSpline}><div className={styles.navyBg}><div className={styles.blob1}></div><div className={styles.blob2}></div></div></div>
      
      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.95)' }}>
        <Link href="/"><img src="/brand/logo-horizontal-light.png" alt="BA" style={{ height: '35px', filter: 'brightness(0)' }} /></Link>
        <button onClick={handlePdf} className="glass-button" style={{ background: '#0d1b2a', color: '#fff' }} disabled={isGenerating}>
          {isGenerating ? 'Gerando...' : 'Baixar PDF Executivo'}
        </button>
      </header>

      <div className={styles.container} ref={reportRef}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.heroSection}>
          <span className={styles.tag}>Dossiê de Projeto</span>
          <h1 style={{ color: '#fff', fontSize: '3.5rem' }}>{data?.family?.clientName || 'Cliente'}</h1>
          <p className={styles.subtitle} style={{ color: 'rgba(255,255,255,0.6)' }}>Análise baseada em {data?.styles ? Object.keys(data.styles).length : 0} referências de estilo.</p>
        </motion.div>

        <div className={`glass-panel ${styles.fullCard}`} style={{ background: 'rgba(255,255,255,0.95)', color: '#0d1b2a' }}>
          <h3>Diagnóstico de Perfil</h3>
          <p className={styles.resumoText}>O projeto para <strong>{data?.family?.clientName}</strong> apresenta uma forte inclinação para o estilo contemporâneo com toques de sofisticação. A dinâmica familiar indica a necessidade de espaços integrados e funcionais.</p>
          <div className={styles.details} style={{ marginTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
             <p><strong>Cônjuge:</strong> {data?.family?.spouseName || 'N/A'}</p>
             <p><strong>Filhos:</strong> {data?.family?.children?.length || 0}</p>
          </div>
        </div>

        <div className={`glass-panel ${styles.fullCard}`} style={{ background: '#0d1b2a', color: '#fff', border: 'none' }}>
          <h3>Estimativa de Investimento</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: '600' }}>R$ 180.000,00 - R$ 320.000,00</p>
          <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>*Cálculo preliminar baseado no perfil Premium e metragem estimada.</p>
        </div>

        <div className={styles.footerCTA} style={{ textAlign: 'center', marginTop: '3rem' }}>
           <h2 style={{ color: '#fff' }}>Próximo Passo</h2>
           <a href="https://calendly.com" className="glass-button" style={{ background: '#fff', color: '#0d1b2a', marginTop: '1rem', display: 'inline-block' }}>Agendar Reunião de Conceito</a>
        </div>
      </div>
    </main>
  );
}
