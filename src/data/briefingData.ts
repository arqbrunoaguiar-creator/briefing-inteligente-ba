// ==========================================
// DETECTOR DE ESTILOS (Imagens Premium 2K)
// ==========================================
export interface StyleOption {
  id: string;
  label: string;
  description: string;
  gradient: string;
  image?: string;
}

export interface StyleQuestion {
  id: number;
  question: string;
  context: string;
  options: StyleOption[];
}

export const styleQuestions: StyleQuestion[] = [
  {
    id: 1, question: "Qual atmosfera de sala mais combina com sua essência?",
    context: "Sinta a energia do espaço.",
    options: [
      { id: 'min', label: 'Minimalista', description: 'Tons neutros, linhas retas, paz visual', gradient: 'linear-gradient(135deg, #f0ece3, #dcd5c4)', image: '/styles/estilo_minimalista_sala.png' },
      { id: 'ind', label: 'Industrial', description: 'Concreto, metal, força urbana', gradient: 'linear-gradient(135deg, #4a4a4a, #2c2c2c)', image: '/styles/estilo_industrial_sala.png' },
      { id: 'cla', label: 'Clássico', description: 'Elegância, molduras, toque de ouro', gradient: 'linear-gradient(135deg, #c9a96e, #8b7332)', image: '/styles/estilo_classico_sala.png' },
      { id: 'con', label: 'Contemporâneo', description: 'Sofisticação, texturas, design atual', gradient: 'linear-gradient(135deg, #2c3e50, #4a6274)', image: '/styles/estilo_contemporaneo_sala.png' },
    ]
  },
  {
    id: 2, question: "Qual cozinha desperta sua criatividade?",
    context: "Pense na funcionalidade unida à estética.",
    options: [
      { id: 'gou', label: 'Gourmet Moderna', description: 'Ilha, mármore escuro, alta tecnologia', gradient: 'linear-gradient(135deg, #2d2d2d, #1a1a1a)', image: '/styles/estilo_cozinha_gourmet.png' },
      { id: 'cla', label: 'Provençal', description: 'Charme clássico, tons claros, acolhimento', gradient: 'linear-gradient(135deg, #d4c5a9, #b8a88a)', image: '/styles/estilo_cozinha_provencal.png' },
      { id: 'min', label: 'Minimalista Clean', description: 'Superfícies contínuas, sem ruído visual', gradient: 'linear-gradient(135deg, #fafafa, #e0e0e0)', image: '/styles/estilo_minimalista_sala.png' }, // Reuso estratégico
      { id: 'lux', label: 'Alto Luxo', description: 'Materiais nobres, marcenaria de autor', gradient: 'linear-gradient(135deg, #1c1c1c, #0d0d0d)', image: '/styles/estilo_contemporaneo_sala.png' },
    ]
  },
  {
    id: 3, question: "Como você imagina seu refúgio de descanso?",
    context: "Onde você recarrega suas energias.",
    options: [
      { id: 'ser', label: 'Sereno', description: 'Linhos, tons crus, paz absoluta', gradient: 'linear-gradient(135deg, #efebe9, #d7ccc8)', image: '/styles/estilo_quarto_sereno.png' },
      { id: 'dra', label: 'Dramático', description: 'Veludos, cores profundas, luxo noturno', gradient: 'linear-gradient(135deg, #1a237e, #283593)', image: '/styles/estilo_quarto_dramatico.png' },
      { id: 'zen', label: 'Minimalista Zen', description: 'Serenidade japonesa, madeira clara', gradient: 'linear-gradient(135deg, #e0d8c0, #c8bfa0)', image: '/styles/estilo_quarto_zen.png' },
      { id: 'lof', label: 'Loft Urbano', description: 'Concreto, metal, estilo industrial', gradient: 'linear-gradient(135deg, #616161, #424242)', image: '/styles/estilo_quarto_loft.png' },
    ]
  },
  {
    id: 4, question: "Qual destes climas mais te atrai para o quarto?",
    context: "Sinta a textura dos materiais.",
    options: [
      { id: 'nat', label: 'Natural Orgânico', description: 'Fibras, plantas, tons terra', gradient: 'linear-gradient(135deg, #a5d6a7, #66bb6a)', image: '/styles/estilo_quarto_natural.png' },
      { id: 'lux', label: 'Suíte de Hotel 5★', description: 'Luxo absoluto, enxoval premium', gradient: 'linear-gradient(135deg, #263238, #37474f)', image: '/styles/estilo_quarto_hotel.png' },
      { id: 'esc', label: 'Escandinavo', description: 'Branco quente, funcional, luminoso', gradient: 'linear-gradient(135deg, #fafaf0, #f0ece0)', image: '/styles/estilo_escandinavo_sala.png' },
      { id: 'mod', label: 'Contemporâneo', description: 'Design limpo, atual, tecnológico', gradient: 'linear-gradient(135deg, #263238, #37474f)', image: '/styles/estilo_contemporaneo_sala.png' },
    ]
  },
  {
    id: 5, question: "Qual experiência de banho você busca?",
    context: "O seu momento de spa privado.",
    options: [
      { id: 'spa', label: 'Spa Natural', description: 'Pedras, madeira, conexão com a natureza', gradient: 'linear-gradient(135deg, #a1887f, #8d6e63)', image: '/styles/estilo_banheiro_spa.png' },
      { id: 'lux', label: 'Luxo Moderno', description: 'Mármore, metais dourados, sofisticação', gradient: 'linear-gradient(135deg, #eceff1, #cfd8dc)', image: '/styles/estilo_banheiro_luxo.png' },
      { id: 'min', label: 'Minimalista', description: 'Limpo, funcional, iluminação cênica', gradient: 'linear-gradient(135deg, #1e1e1e, #333)', image: '/styles/estilo_minimalista_sala.png' },
      { id: 'ind', label: 'Industrial Chic', description: 'Metais pretos, concreto, espelhos redondos', gradient: 'linear-gradient(135deg, #546e7a, #455a64)', image: '/styles/estilo_industrial_sala.png' },
    ]
  },
];

// ==========================================
// TEMPERAMENTOS (Perguntas Situacionais)
// ==========================================
export const temperamentQuestions = [
  { id: 't1', question: 'Como você se sente em um ambiente muito colorido?', options: ['Energizado e feliz', 'Pode me cansar rápido', 'Sinto que é bagunçado', 'Me traz alegria moderada'] },
  { id: 't2', question: 'O que mais te incomoda em casa?', options: ['Silêncio absoluto', 'Muita bagunça visual', 'Ambientes escuros', 'Pouco espaço para circulação'] },
  { id: 't3', question: 'Após um dia estressante, você prefere:', options: ['Receber amigos e conversar', 'Ficar sozinho em silêncio', 'Organizar a casa para relaxar', 'Dormir ou ver um filme'] },
];

export const temperaments = [
  { id: 'san', label: 'Sanguíneo', icon: '💨', description: 'Extrovertido, otimista. Prefere espaços iluminados e sociais.', tips: 'Use cores quentes e áreas amplas de convívio.' },
  { id: 'col', label: 'Colérico', icon: '🔥', description: 'Determinado, enérgico. Prefere funcionalidade e impacto.', tips: 'Invista em contrastes fortes e materiais robustos.' },
  { id: 'mel', label: 'Melancólico', icon: '💧', description: 'Analítico, detalhista. Busca silêncio e ordem perfeita.', tips: 'Use cores sóbrias, iluminação indireta e simetria.' },
  { id: 'fle', label: 'Fleumático', icon: '🌱', description: 'Paciente, calmo. Busca o máximo de conforto e paz.', tips: 'Priorize texturas suaves, linhos e tons terrosos.' },
];

// ==========================================
// ARQUÉTIPOS (Perguntas de Alma)
// ==========================================
export const archetypeQuestions = [
  { id: 'a1', question: 'Se sua casa fosse um livro, qual seria?', options: ['Um guia de sabedoria', 'Uma obra de arte abstrata', 'Uma biografia de sucesso', 'Um romance poético'] },
  { id: 'a2', question: 'Qual o maior objetivo desse projeto?', options: ['Ter paz e clareza mental', 'Inovar e ser original', 'Transmitir autoridade e status', 'Criar memórias afetivas'] },
];

export const archetypes = [
  { id: 'sab', label: 'O Sábio', icon: '📚', description: 'Busca verdade e conhecimento.', materials: 'Madeira clara, livros, linho, luz natural.' },
  { id: 'cri', label: 'O Criador', icon: '🎨', description: 'Inovador e expressivo.', materials: 'Mix de texturas, peças assinadas, cores ousadas.' },
  { id: 'gov', label: 'O Governante', icon: '👑', description: 'Líder e organizado.', materials: 'Mármore, metais nobres, couro, simetria.' },
  { id: 'ama', label: 'O Amante', icon: '🌹', description: 'Focado no prazer e beleza.', materials: 'Veludo, iluminação cênica, espelhos, aromas.' },
];

export const wordGroups = [
  { id: 1, label: 'Grupo A', words: ['Aconchegante', 'Rústico', 'Orgânico', 'Natural', 'Caloroso'] },
  { id: 2, label: 'Grupo B', words: ['Moderno', 'Tecnológico', 'Minimalista', 'Clean', 'Funcional'] },
  { id: 3, label: 'Grupo C', words: ['Luxuoso', 'Sofisticado', 'Clássico', 'Dourado', 'Elegante'] },
  { id: 4, label: 'Grupo D', words: ['Ousado', 'Vibrante', 'Colorido', 'Artístico', 'Eclético'] },
  { id: 5, label: 'Grupo E', words: ['Sereno', 'Zen', 'Neutro', 'Equilibrado', 'Atemporal'] },
];

export const hobbies = [
  'Cozinhar', 'Ler', 'Meditar', 'Receber amigos', 'Home Office',
  'Jardinagem', 'Yoga', 'Assistir filmes/séries', 'Jogar videogame',
  'Ouvir música', 'Pintar/Desenhar', 'Exercícios em casa',
];

export const priorityItems = [
  'Funcionalidade / Praticidade', 'Conforto', 'Estética / Beleza', 'Custo-benefício', 'Durabilidade'
];

export const investmentLevels = [
  { id: 'eco', label: 'Econômico', description: 'Foco em custo-benefício', icon: '💡' },
  { id: 'int', label: 'Intermediário', description: 'Equilíbrio entre luxo e preço', icon: '🏠' },
  { id: 'pre', label: 'Premium', description: 'Materiais nobres e design', icon: '✨' },
  { id: 'lux', label: 'Alto Luxo', description: 'O melhor do melhor', icon: '👑' },
];

export const dynamicsQuestions = [
  { id: 'pets', question: 'Tem pets?', type: 'text' as const },
  { id: 'home_office', question: 'Trabalha de casa?', type: 'select' as const, options: ['Sim', 'Não'] },
  { id: 'visitas', question: 'Recebe muitas visitas?', type: 'select' as const, options: ['Sim', 'Não'] },
  { id: 'atmosfera', question: 'Atmosfera preferida:', type: 'select' as const, options: ['Solar / Diurna', 'Cênica / Noturna'] },
];

export const propertyQuestions = [
  { id: 'tipo', question: 'Tipo do imóvel:', type: 'select' as const, options: ['Apartamento', 'Casa', 'Studio'] },
  { id: 'paredes', question: 'Podemos quebrar paredes?', type: 'select' as const, options: ['Sim', 'Não', 'Talvez'] },
];

export interface RoomTemplate {
  id: string;
  name: string;
  icon: string;
  habits: string[];
  equipment: string[];
}

export const roomTemplates: Record<string, RoomTemplate> = {
  'suite-master': {
    id: 'suite-master', name: 'Suíte Master', icon: '🛏️',
    habits: ['Leitura', 'Assistir TV', 'Meditação'],
    equipment: ['Ar-condicionado', 'Closet', 'Ducha teto'],
  },
  'cozinha': {
    id: 'cozinha', name: 'Cozinha', icon: '🍳',
    habits: ['Cozinha gourmet', 'Refeições rápidas'],
    equipment: ['Ilha', 'Lava-louças', 'Adega'],
  },
  'sala-estar': {
    id: 'sala-estar', name: 'Sala de Estar', icon: '🛋️',
    habits: ['Receber amigos', 'Cinema em casa'],
    equipment: ['TV grande', 'Automação som', 'Bar'],
  },
  'banheiro': {
    id: 'banheiro', name: 'Banheiro', icon: '🛁',
    habits: ['Ritual Spa'],
    equipment: ['Banheira', 'Nicho iluminado'],
  },
};
