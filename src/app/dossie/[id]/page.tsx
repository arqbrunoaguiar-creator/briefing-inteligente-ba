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

// ── Detalhes ricos de temperamento ───────────────────────────────────────────
const TEMP_DETAIL: Record<string, { home: string; lifestyle: string; project: string; avoid: string; strengths: string[]; color: string }> = {
  san: {
    home: 'Ambientes fluidos e integrados, sem barreiras, que convidem à conversa e ao movimento. Sala conectada à cozinha, mesas generosas, espaços que celebram a presença de pessoas.',
    lifestyle: 'Você se energiza pela interação. Precisa sentir que a vida acontece em casa — luz natural abundante, cores que animam, espaços que convidam a receber com naturalidade.',
    project: 'Priorizaremos integração de ambientes, iluminação vibrante e festiva, pontos de encontro bem definidos. Mesa de jantar, ilha de cozinha e área de convívio serão os protagonistas.',
    avoid: 'Ambientes muito fechados, corredores sem saída, iluminação fria e monocromática, esquemas de cor sem personalidade.',
    strengths: ['Ambientes integrados', 'Iluminação quente e vibrante', 'Espaços sociais amplos', 'Cores com vida e intenção'],
    color: '#e8500a',
  },
  col: {
    home: 'Organização impecável, cada item com seu lugar, funcionalidade como lei. Seu lar deve transmitir controle — tudo à mão, sem desperdício de espaço ou de energia.',
    lifestyle: 'Em casa, você precisa de eficiência. Nada que faça você perder tempo procurando, nada fora do lugar. A ordem aumenta sua produtividade e satisfação diária.',
    project: 'Soluções de armazenamento inteligentes, marcenaria sob medida, layout otimizado para circulação rápida. Contrastes visuais fortes e presença arquitetônica marcante.',
    avoid: 'Desordem e acumulação, móveis sem função clara, layouts confusos, excesso de peças decorativas sem propósito real.',
    strengths: ['Marcenaria inteligente', 'Contraste e impacto visual', 'Layout de alto desempenho', 'Materiais robustos e duráveis'],
    color: '#c0392b',
  },
  mel: {
    home: 'Cada detalhe é intencional. Seu lar é um santuário de ordem, harmonia e beleza cuidadosa. Cada cor foi pensada, cada objeto tem um lugar — e essa perfeição silenciosa é o que te restaura.',
    lifestyle: 'A ordem é o seu combustível criativo. Com iluminação perfeita e paleta harmoniosa, você pensa com mais clareza, cria mais e descansa de verdade. O caos visual é seu maior inimigo.',
    project: 'Atenção meticulosa aos acabamentos, paleta cromática construída com rigor, iluminação em múltiplas camadas, simetria e equilíbrio como princípios absolutos de layout.',
    avoid: 'Misturas estilísticas sem coerência, acabamentos descuidados, iluminação crua e direta, combinações de cores aleatórias ou sem harmonia.',
    strengths: ['Paleta cromática sofisticada', 'Iluminação em camadas', 'Acabamentos impecáveis', 'Simetria e ordem visual'],
    color: '#2c3e7a',
  },
  fle: {
    home: 'Seu lar deve abraçar quem entra. Conforto máximo em cada superfície, texturas que convidam ao toque, uma atmosfera que desacelera o mundo lá fora e recarrega sua energia de verdade.',
    lifestyle: 'Em casa, você recarrega. Precisa de um espaço que elimine qualquer atrito — sofá onde você desaparece, quarto que é um convite permanente ao descanso, cozinha que te deixa à vontade.',
    project: 'Tecidos de qualidade premium, estofados generosos, tapetes de fibra natural, iluminação quente e aconchegante em todos os cômodos. O conforto sensorial acima de qualquer estética fria.',
    avoid: 'Materiais que parecem bons mas são desconfortáveis, iluminação branca e clínica, layouts que dificultam o relaxamento e o recolhimento.',
    strengths: ['Estofados e tecidos premium', 'Iluminação aconchegante', 'Ambiente de descanso real', 'Elementos sensoriais e táteis'],
    color: '#2d7a4a',
  },
};

// ── Detalhes ricos de arquétipo ───────────────────────────────────────────────
const ARCH_DETAIL: Record<string, { home: string; aesthetic: string; project: string; concept: string; keywords: string[]; color: string }> = {
  sab: {
    home: 'Seu lar é uma extensão da sua mente — um lugar de reflexão, curadoria e descoberta contínua. Biblioteca, canto de leitura, objetos com significado e obras que provocam pensamento.',
    aesthetic: 'Wabi-sabi, nórdico intelectual, artisan. Tons neutros e quentes, madeira natural, livros como decoração, objetos de viagem e coleções com história e propósito.',
    project: 'Estante como peça central do projeto, iluminação de leitura de qualidade, materiais naturais que evocam sabedoria — madeira, pedra, linho. Cada peça escolhida com intenção profunda.',
    concept: 'Um lar que educa os sentidos e alimenta a mente. Onde cada objeto tem uma razão de existir e uma história para contar.',
    keywords: ['Sabedoria', 'Contemplação', 'Curadoria', 'Profundidade', 'Naturalidade'],
    color: '#5b4a2e',
  },
  cri: {
    home: 'Sua casa é uma obra de arte em construção permanente. Espaço para experimentação, paredes que expõem sua coleção, ambientes que estimulam novas ideias a cada olhar.',
    aesthetic: 'Eclético curado, art deco, pós-moderno. Peças únicas, arte contemporânea, móveis com personalidade, mix intencional de épocas, culturas e referências.',
    project: 'Liberdade criativa como princípio. Mix de estilos curado, peças assinadas, parede de arte protagonista, iluminação que valoriza cada objeto. Absolutamente nada genérico.',
    concept: 'Um espaço que é a extensão da sua identidade — sempre em evolução, sempre surpreendente, sempre irrepetível.',
    keywords: ['Originalidade', 'Expressão', 'Arte', 'Surpresa', 'Autenticidade'],
    color: '#7a2d7a',
  },
  gov: {
    home: 'Seu lar comunica excelência e visão. Materiais de primeira linha, simetria que transmite ordem, peças que declaram posição. Um espaço que impressiona antes mesmo de qualquer palavra.',
    aesthetic: 'Neoclássico contemporâneo, luxo discreto, executivo refinado. Tons escuros com dourado, contraste elegante, materiais imponentes que resistem ao tempo.',
    project: 'Mármore, couro, metais nobres. Simetria como lei de composição. Iluminação que dramatiza e destaca. Home office como extensão do escritório executivo. Cada detalhe comunica poder com elegância.',
    concept: 'Um lar que é também um manifesto da sua trajetória — imponente, refinado e à altura de quem você se tornou.',
    keywords: ['Autoridade', 'Excelência', 'Simetria', 'Nobreza', 'Conquista'],
    color: '#1a2e4a',
  },
  ama: {
    home: 'Seu lar é uma ode à beleza e ao afeto. Cada ambiente guarda uma memória ou cria o cenário perfeito para novas. Texturas irresistíveis, luz que cria atmosfera, detalhes que tocam o coração.',
    aesthetic: 'Romântico contemporâneo, boho luxuoso. Curvas suaves, tecidos ricos, tons quentes e profundos, flores e objetos com carga afetiva que contam a história de uma vida.',
    project: 'Veludo, iluminação indireta dourada, espelhos que ampliam e encantam, plantas vivas, aromas como parte do projeto. Beleza que também é sensação e cuidado.',
    concept: 'Um lar que é poesia — onde cada detalhe foi escolhido com amor e onde a beleza é uma forma de cuidar de quem você ama.',
    keywords: ['Afeto', 'Beleza', 'Sensação', 'Memória', 'Poesia'],
    color: '#8b1a3a',
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
      if (!analysis.error) {
        setAiAnalysis(analysis);
        await supabase.from('briefings').update({ ai_analysis: analysis }).eq('id', params.id);
        await fetch('/api/notion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ briefingData, aiAnalysis: analysis }) });
      } else {
        // Fallback local — gera análise sem IA a partir dos dados do briefing
        const localAnalysis = buildLocalAnalysis(briefingData);
        setAiAnalysis(localAnalysis);
        await supabase.from('briefings').update({ ai_analysis: localAnalysis }).eq('id', params.id);
      }
    } catch (e) {
      console.error('AI Analysis failed', e);
      const localAnalysis = buildLocalAnalysis(briefingData);
      setAiAnalysis(localAnalysis);
    }
    setAnalyzing(false);
  }

  function buildLocalAnalysis(briefingData: any) {
    const a = briefingData.answers || {};
    const pr = a.preRegistration || {};
    const ps = a.psychology || {};
    // Resolver temperamento e arquétipo
    const tMap: Record<string, string[]> = {
      san: ['Energizado e feliz','Me traz alegria moderada','Receber amigos e conversar'],
      mel: ['Sinto que é bagunçado','Muita bagunça visual','Ficar sozinho em silêncio','Organizar a casa para relaxar'],
      fle: ['Pode me cansar rápido','Pouco espaço para circulação','Dormir ou ver um filme'],
      col: ['Silêncio absoluto'],
    };
    const aMap: Record<string, string[]> = {
      sab: ['Um guia de sabedoria','Ter paz e clareza mental'],
      cri: ['Uma obra de arte abstrata','Inovar e ser original'],
      gov: ['Uma biografia de sucesso','Transmitir autoridade e status'],
      ama: ['Um romance poético','Criar memórias afetivas'],
    };
    const tVotes: Record<string,number> = {san:0,col:0,mel:0,fle:0};
    const aVotes: Record<string,number> = {sab:0,cri:0,gov:0,ama:0};
    const allT = {...(ps.temperament||{}), ...Object.fromEntries(Object.entries(a.dynamics||{}).filter(([k])=>/^t\d/.test(k)))};
    const allA = {...(ps.archetype||{}), ...Object.fromEntries(Object.entries(a.dynamics||{}).filter(([k])=>/^a\d/.test(k)))};
    Object.values(allT).forEach((v:any)=>{for(const[k,vs] of Object.entries(tMap)){if(vs.includes(v)){tVotes[k]++;break;}}});
    Object.values(allA).forEach((v:any)=>{for(const[k,vs] of Object.entries(aMap)){if(vs.includes(v)){aVotes[k]++;break;}}});
    const tId = Object.entries(tVotes).sort(([,a],[,b])=>b-a)[0]?.[0]||'fle';
    const aId = Object.entries(aVotes).sort(([,a],[,b])=>b-a)[0]?.[0]||'sab';
    const tLabel = temperaments.find(t=>t.id===tId)?.label||'Equilibrado';
    const aLabel = archetypes.find(a=>a.id===aId)?.label||'Contemporâneo';
    const rooms: string[] = briefingData.rooms || [];
    const inv = investmentLevels.find(i=>i.id===a.investment);
    const styleCts: Record<string,number> = {};
    Object.values(a.styles||{}).forEach((id:any)=>{ const f=STYLE_FAMILY[id]; if(f) styleCts[f]=(styleCts[f]||0)+1; });
    const dominant = Object.entries(styleCts).sort(([,a],[,b])=>b-a)[0]?.[0]||'Contemporâneo';
    const conceptMap: Record<string,string[]> = {
      sab: ['Criar espaços que incentivem reflexão e contemplação','Priorizar materiais naturais com história','Curadoria meticulosa de cada elemento visual'],
      cri: ['Desenvolver um projeto único e insubstituível','Integrar arte e design de forma indivisível','Criar surpresa visual em cada ângulo'],
      gov: ['Projetar ambientes que comunicam autoridade e refinamento','Usar materiais nobres e imponentes','Garantir simetria e equilíbrio arquitetônico'],
      ama: ['Criar atmosferas sensorialmente ricas','Priorizar conforto e beleza acima de tudo','Integrar elementos afetivos e poéticos'],
    };
    return {
      archetype: { name: aLabel, reason: `Identificado a partir das respostas sobre propósito e identidade do lar.` },
      narrative: `Perfil ${tLabel} com alma ${aLabel}. Projeto de linguagem ${dominant.toLowerCase()} com ${rooms.length} ambiente${rooms.length!==1?'s':''} e investimento ${inv?.label||'a definir'}.`,
      complexity: { score: Math.min(10, 4+rooms.length+(inv?.id==='alto'?2:inv?.id==='medio'?1:0)), reason: `${rooms.length} ambiente${rooms.length!==1?'s':''} com nível ${inv?.label||'de investimento indefinido'}` },
      conflicts: [],
      concept: conceptMap[aId]||['Criar um projeto único e personalizado','Equilibrar estética e funcionalidade','Refletir a identidade do cliente'],
      keywords: [dominant, tLabel, aLabel].filter(Boolean),
      emotionalState: { state: 'Engajado', recommendation: 'Perfil com identidade estética bem definida e objetivos claros.' },
      openQuestions: [],
      provider: 'local',
    };
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
  // Compatibilidade: respostas podem estar em psych.temperament (t_0,t_1…) ou
  // diretamente em answers.dynamics (t1,t2…) dependendo da versão do briefing
  const tempAnswers: Record<string, string> = {
    ...(psych.temperament || {}),
    ...Object.fromEntries(Object.entries(answers.dynamics || {}).filter(([k]) => /^t\d/.test(k))),
  };
  const archAnswers: Record<string, string> = {
    ...(psych.archetype || {}),
    ...Object.fromEntries(Object.entries(answers.dynamics || {}).filter(([k]) => /^a\d/.test(k))),
  };
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
  Object.values(tempAnswers).forEach((ans: any) => {
    for (const [key, vals] of Object.entries(tempMap)) { if (vals.includes(ans)) { tempVotes[key]++; break; } }
  });
  const topTempId = Object.entries(tempVotes).sort(([, a], [, b]) => b - a)[0]?.[0] || '';
  const topTemp = temperaments.find(t => t.id === topTempId);
  const tempDetail = TEMP_DETAIL[topTempId];

  // Arquétipo predominante
  const archVotes: Record<string, number> = { sab: 0, cri: 0, gov: 0, ama: 0 };
  const archMap: Record<string, string[]> = {
    sab: ['Um guia de sabedoria', 'Ter paz e clareza mental'],
    cri: ['Uma obra de arte abstrata', 'Inovar e ser original'],
    gov: ['Uma biografia de sucesso', 'Transmitir autoridade e status'],
    ama: ['Um romance poético', 'Criar memórias afetivas'],
  };
  Object.values(archAnswers).forEach((ans: any) => {
    for (const [key, vals] of Object.entries(archMap)) { if (vals.includes(ans)) { archVotes[key]++; break; } }
  });
  const topArchId = Object.entries(archVotes).sort(([, a], [, b]) => b - a)[0]?.[0] || '';
  const topArch = archetypes.find(a => a.id === topArchId);
  const archDetail = ARCH_DETAIL[topArchId];

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
            <div>
              <p style={{ color: '#c0392b', marginBottom: '0.5rem' }}>⚠️ {aiAnalysis.error}</p>
              <button onClick={() => data && generateAIAnalysis(data)} style={{ background: '#C4973D', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontSize: '0.85rem' }}>🔄 Tentar novamente</button>
            </div>
          ) : aiAnalysis?.archetype ? (
            <div className={styles.aiContent}>
              {aiAnalysis.provider && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.68rem', background: aiAnalysis.provider === 'local' ? '#f0e8d5' : '#e8f4f0', color: aiAnalysis.provider === 'local' ? '#8b6914' : '#2d6a4f', padding: '0.2rem 0.7rem', borderRadius: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {aiAnalysis.provider === 'local' ? '📊 Análise local' : aiAnalysis.provider === 'claude' ? '✦ Claude AI' : aiAnalysis.provider === 'openai' ? '✦ OpenAI' : '✦ Gemini'}
                  </span>
                  {aiAnalysis.provider === 'local' && (
                    <button onClick={() => data && generateAIAnalysis(data)} style={{ background: 'none', border: '1px solid #C4973D', color: '#C4973D', borderRadius: '8px', padding: '0.2rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem' }}>🔄 Tentar com IA</button>
                  )}
                </div>
              )}
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

        {/* ══ 04 — DNA DO PROJETO ══ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}><span className={styles.sectionNumber}>04</span><h2>DNA do Projeto</h2></div>

          {/* Intro metodologia */}
          <div style={{ background: 'linear-gradient(135deg, #14202B 0%, #1e3348 100%)', borderRadius: '16px', padding: '1.8rem 2rem', marginBottom: '2.5rem', color: '#fff' }}>
            <p style={{ fontSize: '0.7rem', color: '#C4973D', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Nossa metodologia exclusiva</p>
            <p style={{ lineHeight: 1.85, fontSize: '0.92rem', opacity: 0.9, maxWidth: '780px' }}>
              Cada projeto da Bruno Aguiar Interiores começa por dentro. Antes de escolher uma cor ou um material, entendemos <strong style={{ color: '#C4973D' }}>quem você é</strong> — como você reage ao espaço, o que te restaura, o que te inspira. Dois perfis orientam todas as decisões criativas: o <strong style={{ color: '#C4973D' }}>Temperamento</strong> (sua relação com o espaço) e o <strong style={{ color: '#C4973D' }}>Arquétipo de Alma</strong> (o propósito que você projeta no seu lar). Não são rótulos — são a bússola do seu projeto.
            </p>
          </div>

          {/* ── TEMPERAMENTO ── */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '4px', height: '32px', background: topTemp ? TEMP_DETAIL[topTemp.id]?.color || '#C4973D' : '#C4973D', borderRadius: '4px' }} />
              <div>
                <p style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '3px' }}>Perfil Psicológico</p>
                <h3 style={{ color: '#14202B', fontSize: '1.2rem', margin: 0 }}>Temperamento</h3>
              </div>
            </div>

            {/* Respostas do cliente */}
            {Object.keys(tempAnswers).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {temperamentQuestions.map((q) => {
                  const ans = tempAnswers[q.id] || tempAnswers[`t_${temperamentQuestions.indexOf(q)}`];
                  return ans ? (
                    <div key={q.id} style={{ background: '#f8f9fa', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.82rem', color: '#444', borderLeft: `3px solid ${topTemp ? TEMP_DETAIL[topTemp.id]?.color || '#C4973D' : '#C4973D'}` }}>
                      <span style={{ color: '#aaa', fontSize: '0.68rem', display: 'block', marginBottom: '0.2rem' }}>{q.question}</span>
                      <strong style={{ color: '#14202B' }}>{ans}</strong>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {topTemp && tempDetail ? (
              <>
                {/* Card principal do temperamento */}
                <div style={{ background: `linear-gradient(135deg, ${tempDetail.color}ee, ${tempDetail.color}99)`, color: '#fff', borderRadius: '16px', padding: '1.8rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '3rem', lineHeight: 1 }}>{topTemp.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.3rem', letterSpacing: '-0.5px' }}>{topTemp.label}</p>
                    <p style={{ opacity: 0.9, lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '0.8rem' }}>{topTemp.description}</p>
                    <p style={{ opacity: 0.85, fontSize: '0.85rem', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.8rem', lineHeight: 1.6 }}>
                      💡 <strong>Dica de projeto:</strong> {topTemp.tips}
                    </p>
                  </div>
                </div>

                {/* 4 blocos de influência */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { icon: '🏠', label: 'No Lar', text: tempDetail.home },
                    { icon: '☀️', label: 'No Dia a Dia', text: tempDetail.lifestyle },
                    { icon: '✏️', label: 'No Projeto de Interiores', text: tempDetail.project },
                    { icon: '⚠️', label: 'O Que Evitar', text: tempDetail.avoid },
                  ].map(({ icon, label, text }) => (
                    <div key={label} style={{ background: '#f8f9fa', borderRadius: '14px', padding: '1.2rem' }}>
                      <p style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.6rem' }}>{icon} {label}</p>
                      <p style={{ color: '#333', fontSize: '0.87rem', lineHeight: 1.75 }}>{text}</p>
                    </div>
                  ))}
                </div>

                {/* Chips de forças */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {tempDetail.strengths.map(s => (
                    <span key={s} style={{ background: `${tempDetail.color}15`, color: tempDetail.color, border: `1px solid ${tempDetail.color}40`, padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>{s}</span>
                  ))}
                </div>

                {/* Mensagem ao cliente */}
                <div style={{ background: '#fffbf0', border: `1px solid ${tempDetail.color}30`, borderRadius: '14px', padding: '1.3rem' }}>
                  <p style={{ fontSize: '0.68rem', color: '#b8860b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.7rem' }}>✦ Como isso se reflete no seu projeto</p>
                  <p style={{ color: '#333', fontSize: '0.9rem', lineHeight: 1.8, fontStyle: 'italic' }}>{TEMP_CLIENT_TEXT[topTempId]}</p>
                </div>
              </>
            ) : (
              <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Temperamento não identificado nas respostas.</p>
            )}
          </div>

          {/* Divisor */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #C4973D40, transparent)', margin: '0 0 3rem' }} />

          {/* ── ARQUÉTIPO ── */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '4px', height: '32px', background: topArch ? ARCH_DETAIL[topArch.id]?.color || '#C4973D' : '#C4973D', borderRadius: '4px' }} />
              <div>
                <p style={{ fontSize: '0.65rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '3px' }}>Identidade do Espaço</p>
                <h3 style={{ color: '#14202B', fontSize: '1.2rem', margin: 0 }}>Arquétipo de Alma</h3>
              </div>
            </div>

            {/* Respostas do cliente */}
            {Object.keys(archAnswers).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {archetypeQuestions.map((q) => {
                  const ans = archAnswers[q.id] || archAnswers[`a_${archetypeQuestions.indexOf(q)}`];
                  return ans ? (
                    <div key={q.id} style={{ background: '#f8f9fa', borderRadius: '10px', padding: '0.7rem 1rem', fontSize: '0.82rem', color: '#444', borderLeft: `3px solid ${topArch ? ARCH_DETAIL[topArch.id]?.color || '#C4973D' : '#C4973D'}` }}>
                      <span style={{ color: '#aaa', fontSize: '0.68rem', display: 'block', marginBottom: '0.2rem' }}>{q.question}</span>
                      <strong style={{ color: '#14202B' }}>{ans}</strong>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {topArch && archDetail ? (
              <>
                {/* Card principal do arquétipo */}
                <div style={{ background: `linear-gradient(135deg, ${archDetail.color}ee, ${archDetail.color}88)`, color: '#fff', borderRadius: '16px', padding: '1.8rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '3rem', lineHeight: 1 }}>{topArch.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.3rem', letterSpacing: '-0.5px' }}>{topArch.label}</p>
                    <p style={{ opacity: 0.9, lineHeight: 1.7, fontSize: '0.9rem', marginBottom: '0.8rem' }}>{topArch.description}</p>
                    <p style={{ opacity: 0.85, fontSize: '0.85rem', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.8rem', lineHeight: 1.6 }}>
                      🎨 <strong>Linguagem material:</strong> {topArch.materials}
                    </p>
                  </div>
                </div>

                {/* 4 blocos de influência */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { icon: '🏠', label: 'No Lar', text: archDetail.home },
                    { icon: '🎨', label: 'Linguagem Estética', text: archDetail.aesthetic },
                    { icon: '✏️', label: 'No Projeto de Interiores', text: archDetail.project },
                    { icon: '💡', label: 'Conceito Central', text: archDetail.concept },
                  ].map(({ icon, label, text }) => (
                    <div key={label} style={{ background: '#f8f9fa', borderRadius: '14px', padding: '1.2rem' }}>
                      <p style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.6rem' }}>{icon} {label}</p>
                      <p style={{ color: '#333', fontSize: '0.87rem', lineHeight: 1.75 }}>{text}</p>
                    </div>
                  ))}
                </div>

                {/* Chips de palavras-chave */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {archDetail.keywords.map(k => (
                    <span key={k} style={{ background: `${archDetail.color}15`, color: archDetail.color, border: `1px solid ${archDetail.color}40`, padding: '0.35rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>{k}</span>
                  ))}
                </div>

                {/* Mensagem ao cliente */}
                <div style={{ background: '#fdf6ee', border: `1px solid ${archDetail.color}30`, borderRadius: '14px', padding: '1.3rem' }}>
                  <p style={{ fontSize: '0.68rem', color: '#8b6914', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.7rem' }}>✦ O que isso revela sobre o seu espaço</p>
                  <p style={{ color: '#333', fontSize: '0.9rem', lineHeight: 1.8, fontStyle: 'italic' }}>{ARCH_CLIENT_TEXT[topArchId]}</p>
                </div>
              </>
            ) : (
              <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Arquétipo não identificado nas respostas.</p>
            )}
          </div>

          {/* Síntese final */}
          {topTemp && topArch && (
            <div style={{ marginTop: '2.5rem', background: 'linear-gradient(135deg, #14202B, #1e3348)', color: '#fff', borderRadius: '16px', padding: '1.8rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.68rem', color: '#C4973D', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>Síntese do Perfil</p>
              <p style={{ fontSize: '1rem', lineHeight: 1.9, opacity: 0.9, maxWidth: '680px', margin: '0 auto', fontWeight: 300 }}>
                Um perfil <strong style={{ color: '#C4973D', fontWeight: 700 }}>{topTemp.label}</strong> com alma <strong style={{ color: '#C4973D', fontWeight: 700 }}>{topArch.label}</strong> resulta em um projeto que equilibra{' '}
                <em>{temperaments.find(t=>t.id===topTempId)?.description?.toLowerCase()}</em> com{' '}
                <em>{archetypes.find(a=>a.id===topArchId)?.description?.toLowerCase()}</em>. Uma combinação que garante ao mesmo tempo funcionalidade emocional e identidade visual única.
              </p>
            </div>
          )}
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
