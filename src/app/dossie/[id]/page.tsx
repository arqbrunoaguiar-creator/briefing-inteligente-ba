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

const mockProfile = {
  client: 'Maria Fernanda Silva',
  arquetipo: { name: 'O Criador', icon: '🎨', desc: 'Busca inovação, originalidade e liberdade de expressão.' },
  temperamento: { name: 'Melancólico', icon: '🌙', desc: 'Detalhista e sensível.' },
  estiloResumo: 'A cliente valoriza o conforto tátil com preferência por texturas naturais.',
  paleta: ['#f0ece3', '#d5c4a1', '#8b7355', '#5c4033', '#2c3e50'],
  investimento: 'Premium Selection',
  estimativa: 'R$ 150.000 - R$ 250.000',
  ambientes: 8,
};

export default function DossiePage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportTemplateRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      // 1. Tentar Local
      const local = localStorage.getItem(`briefing-${params.id}`);
      if (local) {
        setData(JSON.parse(local));
        setLoading(false);
        return;
      }

      // 2. Tentar Supabase (Se o link for compartilhado)
      const { data: dbData, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('id', params.id)
        .single();

      if (dbData) setData(dbData);
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  if (loading) return <div className={styles.loading}>Sincronizando Dossiê com o Banco de Dados...</div>;

  const clientName = data?.client_name || data?.clientName || mockProfile.client;

  const handleGeneratePdf = async () => {
    if (!reportTemplateRef.current) return;
    setIsGenerating(true);
    const canvas = await html2canvas(reportTemplateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save(`Dossie_${clientName}.pdf`);
    setIsGenerating(false);
  };

  return (
    <main className={styles.main}>
      <div className={styles.bgSpline}>
        <div className={styles.navyBg}><div className={styles.blob1}></div><div className={styles.blob2}></div></div>
      </div>

      <header className={styles.header} style={{ background: 'rgba(255,255,255,0.92)' }}>
        <Link href="/">
          <Image src="/brand/logo-horizontal-light.png" alt="Bruno Aguiar Interiores" width={180} height={40} style={{ filter: 'brightness(0) saturate(100%) invert(8%) sepia(21%) saturate(3133%) hue-rotate(188deg) brightness(92%) contrast(97%)' }} />
        </Link>
      </header>

      <div className={styles.container} ref={reportTemplateRef}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.heroSection}>
          <span className={styles.tag}>Dossiê Digital Exclusivo</span>
          <h1 style={{ color: '#fff', fontSize: '3.5rem' }}>{clientName}</h1>
          <p className={styles.subtitle} style={{ color: 'rgba(255,255,255,0.6)' }}>Análise Estratégica · {data?.answers?.rooms?.length || mockProfile.ambientes} Ambientes</p>
        </motion.div>

        {/* REPLICANDO CARDS DO DOSSIÊ COM DADOS REAIS OU MOCK */}
        <div className={styles.grid2}>
          <div className={`glass-panel ${styles.profileCard}`} style={{ background: 'rgba(255,255,255,0.95)', color: '#0d1b2a' }}>
            <span className={styles.profileIcon}>🎨</span>
            <h3>Arquétipo Sugerido</h3>
            <p>Com base nas suas escolhas de estilo, detectamos um perfil focado em inovação e bem-estar.</p>
          </div>
        </div>

        <div className={`glass-panel ${styles.ctaSection}`} style={{ background: '#fff', color: '#0d1b2a', textAlign: 'center', padding: '3rem' }}>
          <h2>Agendar Apresentação</h2>
          <p>Deseja ver como transformamos esse dossiê em um projeto real?</p>
          <div className={styles.ctaButtons}>
            <a href="https://calendly.com/brunoaguiar" className={`glass-button ${styles.calBtn}`}>Ver Agenda →</a>
          </div>
        </div>

        <div className={styles.exportBar}>
          <button onClick={handleGeneratePdf} className="glass-button" style={{ background: '#0d1b2a', color: '#fff' }}>
            {isGenerating ? 'Preparando Documento...' : 'Gerar PDF Executivo'}
          </button>
        </div>
      </div>
    </main>
  );
}
