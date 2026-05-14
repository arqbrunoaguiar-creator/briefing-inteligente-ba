"use client";
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabaseClient';
import { styleQuestions, temperamentQuestions, archetypeQuestions, temperaments, archetypes, wordGroups, roomTemplates, investmentLevels } from '@/data/briefingData';
import styles from './dossie.module.css';

// ── Mapeamentos de estilo ─────────────────────────────────────────────────────
const STYLE_FAMILY: Record<string, string> = {
  min: 'Minimalista', zen: 'Minimalista', esc: 'Escandinavo',
  ind: 'Industrial',  lof: 'Industrial',
  cla: 'Clássico',
  con: 'Contemporâneo', mod: 'Contemporâneo',
  lux: 'Luxo', gou: 'Luxo', dra: 'Luxo',
  ser: 'Natural', nat: 'Natural', spa: 'Natural',
};
const STYLE_COLORS: Record<string, string> = {
  Minimalista: '#c8bfa0', Industrial: '#6b7280', Clássico: '#c9a96e',
  Contemporâneo: '#2c4a6e', Luxo: '#1a1a2e', Natural: '#7a9e7e', Escandinavo: '#b0c4c0',
};

// ── Paletas de moodboard ──────────────────────────────────────────────────────
const MOODBOARDS: Record<string, any> = {
  Minimalista: {
    colors: [
      { name: 'Branco Quente', hex: '#F5F3EE' },
      { name: 'Bege Suave', hex: '#E8DFD0' },
      { name: 'Areia Natural', hex: '#C4A97A' },
      { name: 'Grafite Quente', hex: '#4A4A48' },
      { name: 'Dourado Sutil', hex: '#C4973D' },
    ],
    materials: ['Concreto polido', 'Madeira clara (carvalho, freixo)', 'Vidro fosco', 'Linho e algodão cru'],
    textures: ['Superfícies mates e lisas', 'Tecidos de trama aberta', 'Pedra natural polida'],
    lighting: 'Iluminação indireta embutida, fitas LED 3000K, pendentes de design minimalista',
    keyPiece: 'Sofá de linha reta em linho natural + mesa de centro em mármore branco + tapete de fibra natural',
    atmosphere: 'Silêncio visual. Cada elemento respira. Leveza e intenção em cada detalhe.',
  },
  Industrial: {
    colors: [
      { name: 'Carvão', hex: '#2C2C2C' },
      { name: 'Aço Escovado', hex: '#6B7280' },
      { name: 'Prata Envelhecida', hex: '#9CA3AF' },
      { name: 'Cobre Oxidado', hex: '#B45309' },
      { name: 'Branco Giz', hex: '#F5F5F0' },
    ],
    materials: ['Concreto aparente', 'Metal preto fosco', 'Couro curtido', 'Madeira de demolição', 'Tijolo de vidro'],
    textures: ['Rugosidades e imperfeições valorizadas', 'Tecidos pesados (lona, camurça)', 'Metal com acabamento escovado'],
    lighting: 'Pendentes de metal com bulbo exposto, trilhos aparentes, Edison vintage 2700K',
    keyPiece: 'Sofá de couro escuro + estante de ferro e madeira + luminária industrial de piso',
    atmosphere: 'Força urbana e autenticidade. Materialidade honesta e sem disfarces.',
  },
  Clássico: {
    colors: [
      { name: 'Marfim', hex: '#F9F3E8' },
      { name: 'Dourado Real', hex: '#C9A96E' },
      { name: 'Bronze Antigo', hex: '#8B7332' },
      { name: 'Azul Noite', hex: '#2C2C4A' },
      { name: 'Areia Clássica', hex: '#E8DCC8' },
    ],
    materials: ['Mármore Calacatta', 'Madeira trabalhada (mogno, cerejeira)', 'Veludo e seda', 'Latão dourado'],
    textures: ['Molduras e relevos', 'Tecidos estruturados', 'Padrões geométricos delicados'],
    lighting: 'Lustres com cristais, arandelas douradas, iluminação de destaque (3000K)',
    keyPiece: 'Sofá capitonê em veludo + mesa de jantar com pés torneados + espelho de moldura dourada',
    atmosphere: 'Elegância que atravessa gerações. Cada peça conta uma história de refinamento.',
  },
  Contemporâneo: {
    colors: [
      { name: 'Branco Glacial', hex: '#F8FAFC' },
      { name: 'Ardósia', hex: '#64748B' },
      { name: 'Marinho Profundo', hex: '#0F172A' },
      { name: 'Dourado Moderno', hex: '#C4973D' },
      { name: 'Prata', hex: '#CBD5E1' },
    ],
    materials: ['Vidro temperado', 'Aço inox escovado', 'Madeira tingida escura', 'Pedra Fusion Basalto'],
    textures: ['Linhas retas e volumes geométricos', 'Contraste mate/brilho', 'Texturas sutis e refinadas'],
    lighting: 'Iluminação cênica com dimmers, spots embutidos, pendentes geométricos (4000K áreas de trabalho)',
    keyPiece: 'Sofá modular em cinza chumbo + painel ripado em madeira escura + aparador de mármore escuro',
    atmosphere: 'Sofisticação sem esforço. Design que é arte — funcional, atual e intemporal.',
  },
  Luxo: {
    colors: [
      { name: 'Preto Absoluto', hex: '#0D0D0D' },
      { name: 'Marinho Nobre', hex: '#1C1C2E' },
      { name: 'Dourado Champagne', hex: '#C9A96E' },
      { name: 'Borgonha', hex: '#6B1A1A' },
      { name: 'Champagne', hex: '#F5E6CC' },
    ],
    materials: ['Mármore Nero Marquina', 'Couro Napa italiano', 'Latão dourado', 'Madeira Wengê', 'Onix iluminado'],
    textures: ['Veludo e seda', 'Metal dourado polido', 'Padrões tridimensionais elaborados'],
    lighting: 'Iluminação cênica exclusiva, dimmers em todos os ambientes, luz em cornija, 2700K quente',
    keyPiece: 'Sofá de couro napa + mesa de centro em onix iluminado + obra de arte como protagonista',
    atmosphere: 'O extraordinário como padrão. Cada material, cada detalhe — tudo à altura do seu estilo de vida.',
  },
  Natural: {
    colors: [
      { name: 'Cru Orgânico', hex: '#F5F0E8' },
      { name: 'Terra Suave', hex: '#C4A97A' },
      { name: 'Musgo', hex: '#7A9E7E' },
      { name: 'Madeira Natural', hex: '#8B7355' },
      { name: 'Linho', hex: '#E8DCC8' },
    ],
    materials: ['Bambu e rattan', 'Madeira maciça natural', 'Pedra bruta', 'Juta e sisal', 'Cerâmica artesanal'],
    textures: ['Fibras naturais e irregulares', 'Grão de madeira aparente', 'Superfícies orgânicas e imperfeitas'],
    lighting: 'Máxima luz natural, cortinas de linho translúcido, pendentes de fibra vegetal (2700K)',
    keyPiece: 'Sofá de rattan com almofadas de linho + mesa de centro em tronco natural + vasos de cerâmica artesanal',
    atmosphere: 'Conexão com o que é real. A natureza como design. Seu lar como refúgio vivo.',
  },
  Escandinavo: {
    colors: [
      { name: 'Branco Neve', hex: '#FAFAF5' },
      { name: 'Bege Nórdico', hex: '#E8E0D4' },
      { name: 'Azul Cinza', hex: '#8FA3B1' },
      { name: 'Verde Sage', hex: '#7A9B7A' },
      { name: 'Carvão Suave', hex: '#3C3C3C' },
    ],
    materials: ['Pinho claro', 'Lã natural', 'Cerâmica branca', 'Vidro simples', 'Couro sueco'],
    textures: ['Malhas e tecidos quentes', 'Madeira com grão suave', 'Simplicidade e leveza'],
    lighting: 'Luz natural maximizada, velas e luminárias de piso aconchegantes, 2700K',
    keyPiece: 'Poltrona de madeira clara com cobertor de lã + luminária Arco + tapete de lã natural',
    atmosphere: 'Hygge — o bem-estar no cotidiano. Simplicidade que abraça. Funcionalidade que encanta.',
  },
};

// ── Textos de temperamento para o cliente ─────────────────────────────────────
const TEMP_CLIENT_TEXT: Record<string, string> = {
  san: 'Sua casa será um palco de encontros e alegria. Você se energiza com cor, luz e movimento — seu projeto precisa de ambientes convidativos, bem iluminados e com espaços de convívio generosos. A socialização é o coração do seu lar.',
  col: 'Você precisa de um espaço que reflita determinação e controle. Ambientes organizados, com impacto visual imediato e funcionalidade impecável falam diretamente com sua personalidade. Menos tempo procurando, mais tempo vivendo.',
  mel: 'Para você, cada detalhe importa. Seu lar ideal é um santuário de ordem e beleza cuidadosa — iluminação pensada, paleta harmoniosa, tudo no lugar certo. Silêncio visual e perfeição são o seu combustível criativo.',
  fle: 'Você busca um lar que envolva como um abraço. Conforto máximo, texturas suaves, paleta aconchegante — seu projeto prioriza o bem-estar absoluto. Um lugar onde o tempo desacelera e a paz é constante.',
};

// ── Textos de arquétipo para o cliente ────────────────────────────────────────
const ARCH_CLIENT_TEXT: Record<string, string> = {
  sab: 'Seu lar é um espaço de reflexão e descoberta. Cada canto deve convidar ao pensamento, à leitura, à contemplação. Materiais naturais, luz suave e uma coleção de objetos com história formam o cenário perfeito para a sua mente.',
  cri: 'Sua casa é uma obra de arte em construção permanente. Você precisa de espaços que estimulem a criatividade — formas inusitadas, peças assinadas, cores que conversam. Seu projeto deve ser tão único quanto você.',
  gov: 'Seu lar transmite autoridade e visão. Materiais nobres, linhas simétricas, presença arquitetônica — cada escolha comunica excelência. Um projeto que inspire respeito e conforte com a sensação de ter chegado onde queria.',
  ama: 'Seu lar é uma ode à beleza e ao afeto. Você quer um espaço que envolva os sentidos — texturas irresistíveis, iluminação que cria atmosfera, detalhes que tocam o coração. Um projeto cheio de intenção poética.',
};

// ── Mensagens inspiracionais por arquétipo ────────────────────────────────────
const INSPIRE_MESSAGES: Record<string, string> = {
  sab: 'Um lar é o lugar onde o mundo para e você começa. Que cada ambiente que vamos criar juntos seja um convite ao melhor de você — à sua curiosidade, à sua profundidade, à sua busca pelo belo e pelo verdadeiro.',
  cri: 'Sua casa não precisa se parecer com nenhuma outra — ela precisa se parecer com você. Vamos criar um espaço que inspire sua criatividade todos os dias, que surpreenda quem entra e que renove sua energia toda vez que você voltar para casa.',
  gov: 'Grandes conquistas merecem grandes cenários. Seu lar será uma extensão da sua visão — um espaço que comunica, que impressiona e que, acima de tudo, é seu porto seguro no ritmo acelerado de uma vida extraordinária.',
  ama: 'O mais belo projeto de interiores começa com emoção — e o seu não será diferente. Vamos construir um espaço que abrace quem você ama, que guarde memórias que durarão décadas e que seja, todos os dias, o melhor lugar do mundo para você.',
};

// ── Resumo de ambiente ────────────────────────────────────────────────────────
function getRoomSummary(roomId: string, habits: any): string {
  const room = roomTemplates[roomId];
  if (!room) return '';
  const h: string[] = habits?.habits || [];
  const e: string[] = habits?.equipment || [];
  if (h.length === 0 && e.length === 0) return `${room.name} integrado ao projeto com foco em funcionalidade e design.`;
  let s = '';
  if (h.length > 0) s += `Voltado para ${h.join(', ').toLowerCase()}`;
  if (e.length > 0) s += `${h.length > 0 ? ', com ' : 'Equipado com '}${e.join(', ').toLowerCase()}`;
  return s + '.';
}

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
        if (!dbData.ai_analysis || dbData.ai_analysis.error) generateAIAnalysis(dbData);
        else setAiAnalysis(dbData.ai_analysis);
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  async function generateAIAnalysis(briefingData: any) {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-briefing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ briefingData }) });
      const analysis = await res.json();
      setAiAnalysis(analysis);
      await supabase.from('briefings').update({ ai_analysis: analysis }).eq('id', params.id);
      await fetch('/api/notion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ briefingData, aiAnalysis: analysis }) });
    } catch (e) { console.error('AI Analysis failed', e); }
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

  // Estilos %
  const styleCounts: Record<string, number> = {};
  Object.values(styleAnswers).forEach(id => { const f = STYLE_FAMILY[id] || 'Outros'; styleCounts[f] = (styleCounts[f] || 0) + 1; });
  const totalStyleVotes = Object.values(styleCounts).reduce((a, b) => a + b, 0);
  const stylesSorted = Object.entries(styleCounts).sort(([, a], [, b]) => b - a);
  const dominantStyle = stylesSorted[0]?.[0] || 'Contemporâneo';
  const moodboard = MOODBOARDS[dominantStyle] || MOODBOARDS['Contemporâneo'];

  // Temperamento predominante
  const tempVotes: Record<string, number> = { san: 0, col: 0, mel: 0, fle: 0 };
  const tempMap: Record<string, string[]> = {
    san: ['Energizado e feliz', 'Me traz alegria moderada', 'Receber amigos e conversar'],
    mel: ['Sinto que é bagunçado', 'Muita bagunça visual', 'Ambientes escuros', 'Ficar sozinho em silêncio', 'Organizar a casa para relaxar'],
    fle: ['Pode me cansar rápido', 'Pouco espaço para circulação', 'Dormir ou ver um filme'],
    col: ['Silêncio absoluto'],
  };
  Object.values(tempAnswers).forEach((ans: any) => { for (const [key, vals] of Object.entries(tempMap)) { if (vals.includes(ans)) { tempVotes[key]++; break; } } });
  const topTempId = Object.entries(tempVotes).sort(([, a], [, b]) => b - a)[0]?.[0] || '';
  const topTemp = temperaments.find(t => t.id === topTempId);

  // Arquétipo predominante
  const archVotes: Record<string, number> = { sab: 0, cri: 0, gov: 0, ama: 0 };
  const archMap: Record<string, string[]> = {
    sab: ['Um guia de sabedoria', 'Ter paz e clareza mental'],
    cri: ['Uma obra de arte abstrata', 'Inovar e ser original'],
    gov: ['Uma biografia de sucesso', 'Transmitir autoridade e status'],
    ama: ['Um romance poético', 'Criar memórias afetivas'],
  };
  Object.values(archAnswers).forEach((ans: any) => { for (const [key, vals] of Object.entries(archMap)) { if (vals.includes(ans)) { archVotes[key]++; break; } } });
  const topArchId = Object.entries(archVotes).sort(([, a], [, b]) => b - a)[0]?.[0] || '';
  const topArch = archetypes.find(a => a.id === topArchId);

  const selectedWords: string[] = answers.words || [];
  const wordsByGroup = wordGroups.map(g => ({ ...g, selected: g.words.filter(w => selectedWords.includes(w)) })).filter(g => g.selected.length > 0);
  const investLevel = investmentLevels.find(i => i.id === answers.investment);

  const inspireMsg = INSPIRE_MESSAGES[topArchId] || 'Seu lar é a expressão mais verdadeira de quem você é. Vamos construir juntos um espaço que te inspire, te acolha e represente cada detalhe da sua essência — todos os dias.';

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

        {/* ══ CAPA ══ */}
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
          <p style={{ opacity: 0.5, fontSize: '0.8rem', marginTop: '0.5rem' }}>{preReg.meetingDate || answers.meeting_date || ''}</p>
        </section>

        {/* ══ CARTA INSPIRACIONAL ══ */}
        <section style={{ background: 'linear-gradient(135deg, #14202B 0%, #1e3348 100%)', color: '#fff', padding: '3rem', margin: '2rem 0', borderRadius: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '4px', color: '#C4973D', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Uma mensagem para você</p>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.9, maxWidth: '680px', margin: '0 auto', fontWeight: 300, fontStyle: 'italic', opacity: 0.95 }}>
            "{inspireMsg}"
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {[1,2,3].map(i => <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C4973D', opacity: i === 2 ? 1 : 0.4 }} />)}
          </div>
          <p style={{ marginTop: '1.5rem', color: '#C4973D', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '2px' }}>Bruno Aguiar Interiores</p>
        </section>

        {/* ══ 01 — PANORAMA DO CLIENTE ══ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>01</span><h2>Panorama do Cliente</h2></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Imóvel', value: preReg.propertyType || '—' },
              { label: 'Situação', value: preReg.situation || '—' },
              { label: 'Investimento', value: investLevel ? `${investLevel.icon} ${investLevel.label}` : (answers.investment || '—') },
              { label: 'Home Office', value: answers.dynamics?.home_office || '—' },
              { label: 'Recebe Visitas', value: answers.dynamics?.visitas || '—' },
              { label: 'Pets', value: answers.dynamics?.pets || '—' },
              { label: 'Atmosfera', value: answers.dynamics?.atmosfera || '—' },
              { label: 'WhatsApp', value: preReg.whatsapp || '—' },
              { label: 'Ambientes', value: selectedRooms.length > 0 ? `${selectedRooms.length} selecionados` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem', borderLeft: '3px solid #C4973D' }}>
                <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>{label}</p>
                <p style={{ fontWeight: 600, color: '#14202B', fontSize: '0.95rem' }}>{value}</p>
              </div>
            ))}
          </div>
          {preReg.observations && (
            <div style={{ background: '#fffbf0', border: '1px solid #f0dba0', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', color: '#b8860b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Observações Iniciais</p>
              <p style={{ color: '#14202B', fontSize: '0.95rem', lineHeight: 1.7 }}>{preReg.observations}</p>
            </div>
          )}
          {answers.priorities?.length > 0 && (
            <div>
              <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>Prioridades do Projeto</p>
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

        {/* ══ 02 — INTELIGÊNCIA DO PROJETO (IA) ══ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>02</span><h2>Inteligência do Projeto</h2></div>
          {analyzing ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>IA analisando dados do projeto... aguarde alguns segundos.</p>
          ) : aiAnalysis?.error ? (
            <p style={{ color: '#c0392b' }}>⚠️ {aiAnalysis.error}</p>
          ) : aiAnalysis?.archetype ? (
            <div className={styles.aiContent}>
              <div className={styles.aiInsightCard}>
                <h3>Arquétipo: {aiAnalysis.archetype.name}</h3>
                <p>{aiAnalysis.archetype.reason}</p>
              </div>
              {aiAnalysis.narrative && (
                <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1.4rem', marginBottom: '1.5rem', borderLeft: '4px solid #C4973D', fontStyle: 'italic', color: '#444', lineHeight: 1.8, fontSize: '0.95rem' }}>
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
                  <ul style={{ lineHeight: 2 }}>{aiAnalysis.concept.map((c: string, i: number) => <li key={i}>{c}</li>)}</ul>
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
          ) : <p style={{ color: '#aaa' }}>Aguardando análise...</p>}
        </section>

        {/* ══ 03 — PERFIL DE ESTILOS ══ */}
        {totalStyleVotes > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>03</span><h2>Perfil de Estilos</h2></div>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              A seguir você vê como suas escolhas visuais se distribuem — cada resposta revela uma camada da sua identidade estética. O estilo dominante guia o conceito do projeto, enquanto os secundários adicionam personalidade e profundidade.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
              {stylesSorted.map(([family, count]) => {
                const pct = Math.round((count / totalStyleVotes) * 100);
                return (
                  <div key={family}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, color: '#14202B', fontSize: '0.9rem' }}>{family}</span>
                      <span style={{ fontWeight: 700, color: '#C4973D', fontSize: '0.9rem' }}>{pct}%</span>
                    </div>
                    <div style={{ background: '#f0f0f0', borderRadius: '20px', height: '10px', overflow: 'hidden' }}>
                      <div style={{ background: STYLE_COLORS[family] || '#ccc', width: `${pct}%`, height: '100%', borderRadius: '20px' }} />
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
                    <p style={{ fontSize: '0.6rem', color: '#aaa', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Pergunta {i + 1}</p>
                    <p style={{ fontWeight: 700, color: '#14202B', fontSize: '0.82rem', marginBottom: '0.2rem' }}>{opt?.label || '—'}</p>
                    <p style={{ fontSize: '0.68rem', color: '#C4973D', fontWeight: 600 }}>{STYLE_FAMILY[answerId || ''] || ''}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══ 04 — TEMPERAMENTO & ARQUÉTIPO ══ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>04</span><h2>Temperamento & Arquétipo</h2></div>

          {/* Explicação geral */}
          <div style={{ background: '#f8f9fa', borderRadius: '14px', padding: '1.4rem', marginBottom: '2rem', borderLeft: '4px solid #14202B' }}>
            <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.8rem' }}>O que isso significa?</p>
            <p style={{ color: '#444', lineHeight: 1.8, fontSize: '0.9rem' }}>
              O <strong>Temperamento</strong> revela como você reage ao espaço ao seu redor — o que te dá energia, o que te incomoda e como você se restaura. O <strong>Arquétipo de Alma</strong> vai além: mostra o <em>propósito</em> que você projeta no seu lar — o que você quer que ele comunique ao mundo e, principalmente, a você mesmo.
            </p>
            <p style={{ color: '#444', lineHeight: 1.8, fontSize: '0.9rem', marginTop: '0.8rem' }}>
              Juntos, esses perfis orientam cada decisão criativa: da paleta de cores à escolha dos materiais, da iluminação ao layout. Não são rótulos — são ferramentas para criar um espaço que seja genuinamente <em>seu</em>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Temperamento */}
            <div>
              <h4 style={{ color: '#C4973D', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Temperamento</h4>
              {Object.keys(tempAnswers).length > 0 ? (
                <>
                  {temperamentQuestions.map((q, i) => {
                    const ans = tempAnswers[`t_${i}`] || tempAnswers[i];
                    return ans ? (
                      <div key={i} style={{ marginBottom: '0.8rem', background: '#f8f9fa', borderRadius: '10px', padding: '0.8rem 1rem' }}>
                        <p style={{ fontSize: '0.72rem', color: '#999', marginBottom: '0.3rem' }}>{q.question}</p>
                        <p style={{ fontWeight: 600, color: '#14202B', fontSize: '0.88rem' }}>→ {ans}</p>
                      </div>
                    ) : null;
                  })}
                  {topTemp && (
                    <>
                      <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #14202B, #1e3348)', color: '#fff', borderRadius: '12px', padding: '1.2rem' }}>
                        <p style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{topTemp.icon}</p>
                        <p style={{ fontWeight: 700, color: '#C4973D', fontSize: '1rem' }}>{topTemp.label}</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.4rem', lineHeight: 1.6 }}>{topTemp.description}</p>
                        <p style={{ fontSize: '0.78rem', color: '#C4973D', marginTop: '0.6rem', fontStyle: 'italic', lineHeight: 1.6 }}>💡 {topTemp.tips}</p>
                      </div>
                      <div style={{ marginTop: '1rem', background: '#fffbf0', border: '1px solid #f0dba0', borderRadius: '12px', padding: '1rem' }}>
                        <p style={{ fontSize: '0.7rem', color: '#b8860b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>O que isso significa para o seu projeto</p>
                        <p style={{ color: '#444', fontSize: '0.85rem', lineHeight: 1.7 }}>{TEMP_CLIENT_TEXT[topTemp.id] || ''}</p>
                      </div>
                    </>
                  )}
                </>
              ) : <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Não respondido.</p>}
            </div>

            {/* Arquétipo */}
            <div>
              <h4 style={{ color: '#C4973D', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Arquétipo de Alma</h4>
              {Object.keys(archAnswers).length > 0 ? (
                <>
                  {archetypeQuestions.map((q, i) => {
                    const ans = archAnswers[`a_${i}`] || archAnswers[i];
                    return ans ? (
                      <div key={i} style={{ marginBottom: '0.8rem', background: '#f8f9fa', borderRadius: '10px', padding: '0.8rem 1rem' }}>
                        <p style={{ fontSize: '0.72rem', color: '#999', marginBottom: '0.3rem' }}>{q.question}</p>
                        <p style={{ fontWeight: 600, color: '#14202B', fontSize: '0.88rem' }}>→ {ans}</p>
                      </div>
                    ) : null;
                  })}
                  {topArch && (
                    <>
                      <div style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #c9a96e, #8b6914)', color: '#fff', borderRadius: '12px', padding: '1.2rem' }}>
                        <p style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{topArch.icon}</p>
                        <p style={{ fontWeight: 700, fontSize: '1rem' }}>{topArch.label}</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.4rem', lineHeight: 1.6 }}>{topArch.description}</p>
                        <p style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '0.6rem', fontStyle: 'italic', lineHeight: 1.6 }}>🎨 {topArch.materials}</p>
                      </div>
                      <div style={{ marginTop: '1rem', background: '#fdf6ee', border: '1px solid #e8d5a0', borderRadius: '12px', padding: '1rem' }}>
                        <p style={{ fontSize: '0.7rem', color: '#8b6914', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>O que isso significa para o seu projeto</p>
                        <p style={{ color: '#444', fontSize: '0.85rem', lineHeight: 1.7 }}>{ARCH_CLIENT_TEXT[topArch.id] || ''}</p>
                      </div>
                    </>
                  )}
                </>
              ) : <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Não respondido.</p>}
            </div>
          </div>
        </section>

        {/* ══ 05 — UNIVERSO PESSOAL ══ */}
        {(selectedWords.length > 0 || answers.hobbies?.length > 0) && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>05</span><h2>Universo Pessoal</h2></div>
            {selectedWords.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Vocabulário do Projeto</p>
                {wordsByGroup.map(g => (
                  <div key={g.id} style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#bbb', minWidth: '60px' }}>{g.label}:</span>
                    {g.selected.map(w => (
                      <span key={w} style={{ background: '#14202B', color: '#C4973D', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600 }}>{w}</span>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {answers.hobbies?.length > 0 && (
              <div>
                <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Hobbies & Lifestyle</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(answers.hobbies as string[]).map((h: string) => (
                    <span key={h} style={{ background: '#f0f0f0', color: '#444', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem' }}>{h}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ══ 06 — SUGESTÃO DE MOODBOARD ══ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>06</span><h2>Sugestão de Moodboard</h2></div>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Com base no seu perfil estético predominante — <strong>{dominantStyle}</strong> — esta é a proposta inicial de paleta, materiais e atmosfera. Uma referência visual para alinhar nossa visão criativa antes de mergulharmos no projeto.
          </p>

          {/* Paleta de cores */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Paleta de Cores</p>
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              {moodboard.colors.map((c: any, i: number) => (
                <div key={i} style={{ textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '14px', background: c.hex, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#333' }}>{c.name}</p>
                  <p style={{ fontSize: '0.62rem', color: '#aaa', fontFamily: 'monospace' }}>{c.hex}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Materiais */}
            <div style={{ background: '#f8f9fa', borderRadius: '14px', padding: '1.2rem' }}>
              <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.8rem' }}>🪵 Materiais</p>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 2, color: '#333', fontSize: '0.88rem' }}>
                {moodboard.materials.map((m: string, i: number) => <li key={i}>{m}</li>)}
              </ul>
            </div>
            {/* Texturas */}
            <div style={{ background: '#f8f9fa', borderRadius: '14px', padding: '1.2rem' }}>
              <p style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.8rem' }}>✦ Texturas & Acabamentos</p>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 2, color: '#333', fontSize: '0.88rem' }}>
                {moodboard.textures.map((t: string, i: number) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Iluminação */}
            <div style={{ background: '#fffbf0', border: '1px solid #f0dba0', borderRadius: '14px', padding: '1.2rem' }}>
              <p style={{ fontSize: '0.7rem', color: '#b8860b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.8rem' }}>💡 Iluminação</p>
              <p style={{ color: '#333', fontSize: '0.88rem', lineHeight: 1.7 }}>{moodboard.lighting}</p>
            </div>
            {/* Peça-âncora */}
            <div style={{ background: 'linear-gradient(135deg, #14202B, #1e3348)', color: '#fff', borderRadius: '14px', padding: '1.2rem' }}>
              <p style={{ fontSize: '0.7rem', color: '#C4973D', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.8rem' }}>🛋 Peça-Âncora</p>
              <p style={{ color: '#fff', fontSize: '0.88rem', lineHeight: 1.7, opacity: 0.9 }}>{moodboard.keyPiece}</p>
            </div>
          </div>

          {/* Frase da atmosfera */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1.5rem', borderTop: '1px solid #eee' }}>
            <p style={{ fontSize: '1rem', fontStyle: 'italic', color: '#14202B', fontWeight: 300, letterSpacing: '0.5px' }}>"{moodboard.atmosphere}"</p>
          </div>
        </section>

        {/* ══ 07 — PANORAMA DOS AMBIENTES ══ */}
        {selectedRooms.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionNumber}>07</span><h2>Panorama dos Ambientes</h2></div>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              Abaixo o resumo de cada ambiente selecionado com os usos prioritários e equipamentos desejados — a base funcional do projeto.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {selectedRooms.map((roomId) => {
                const room = roomTemplates[roomId];
                if (!room) return null;
                const habits = roomHabits[roomId] || {};
                const summary = getRoomSummary(roomId, habits);
                return (
                  <div key={roomId} style={{ background: '#f8f9fa', borderRadius: '14px', padding: '1.2rem', borderTop: '3px solid #C4973D' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>{room.icon}</span>
                      <h4 style={{ color: '#14202B', margin: 0, fontSize: '1rem' }}>{room.name}</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6, marginBottom: '0.8rem', fontStyle: 'italic' }}>{summary}</p>
                    {habits.habits?.length > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        <p style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Usos principais</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {habits.habits.map((h: string) => <span key={h} style={{ background: '#e8f4f0', color: '#2d6a4f', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem' }}>{h}</span>)}
                        </div>
                      </div>
                    )}
                    {habits.equipment?.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Equipamentos</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {habits.equipment.map((e: string) => <span key={e} style={{ background: '#f0e8d5', color: '#8b6914', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.75rem' }}>{e}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══ 08 — OBSERVAÇÕES DE CAMPO ══ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>08</span><h2>Observações de Campo</h2></div>
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
