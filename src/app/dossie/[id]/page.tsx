"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabaseClient';
import styles from './dossie.module.css';

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
        // Dispara análise IA se não existir ou se a anterior teve erro
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
      
      // Salva a análise no banco para não repetir
      await supabase.from('briefings').update({ ai_analysis: analysis }).eq('id', params.id);
      
      // Integra com o Notion (opcional automático)
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

  return (
    <main className={styles.main}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <Link href="/admin" style={{ color: '#C4973D', textDecoration: 'none' }}>← Voltar ao Dashboard</Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => console.log(JSON.stringify(data))} className={styles.btnSecondary}>JSON</button>
          <button onClick={handlePdf} className={styles.btnPrimary} style={{ background: '#C4973D', color: '#14202B' }}>
            {isGenerating ? 'Gerando...' : 'Baixar PDF Premium'}
          </button>
        </div>
      </header>

      <div className={styles.document} ref={reportRef}>
        {/* CAPA */}
        <section className={styles.cover}>
          <img src="/brand/BRUNO-AGUIAR-VERTICAL2---BRANCA.png" alt="Bruno Aguiar" style={{ height: '80px', marginBottom: '3rem' }} />
          {data?.client_photo ? (
            <img src={data.client_photo} alt={data.client_name} style={{ width: '180px', height: '180px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff' }} />
          ) : (
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#14202B' }}>
              {data?.client_name?.[0]}
            </div>
          )}
          <h1>{data?.client_name}</h1>
          <p style={{ letterSpacing: '3px', opacity: 0.7 }}>BRIEFING ESTRATÉGICO DE INTERIORES</p>
        </section>

        {/* ANÁLISE IA */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>01</span><h2>Inteligência do Projeto</h2></div>
          
          {analyzing ? (
            <p>IA analisando dados do projeto... isso pode levar 10 segundos.</p>
          ) : aiAnalysis?.error ? (
            <p style={{ color: '#c0392b' }}>⚠️ Análise IA indisponível: {aiAnalysis.error}. Verifique a configuração da chave Gemini no Vercel.</p>
          ) : aiAnalysis?.archetype ? (
            <div className={styles.aiContent}>
              <div className={styles.aiInsightCard}>
                <h3>Arquétipo: {aiAnalysis.archetype.name}</h3>
                <p>{aiAnalysis.archetype.reason}</p>
              </div>

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
                    <p key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '0.5rem 0' }}>
                      <strong>[{c.level?.toUpperCase()}] {c.type}:</strong> {c.issue}
                    </p>
                  ))}
                </div>
              )}

              {aiAnalysis.concept?.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h4>Diretrizes de Conceito</h4>
                  <ul>
                    {aiAnalysis.concept.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : <p>Aguardando análise da IA...</p>}
        </section>

        {/* ANOTAÇÕES DO ARQUITETO */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>02</span><h2>Observações de Campo</h2></div>
          {data?.answers?.freeNotes ? (
            Object.entries(data.answers.freeNotes).map(([step, note]: any) => (
              <div key={step} className={styles.freeNotes}>
                <strong>Etapa {step}:</strong> {note}
              </div>
            ))
          ) : <p>Sem anotações adicionais.</p>}
        </section>

        {/* ... (restante do dossiê: ambientes, estilos, etc) */}
      </div>
    </main>
  );
}
