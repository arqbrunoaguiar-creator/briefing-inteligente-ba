// ==========================================
// DETECTOR DE ESTILOS (11 perguntas visuais)
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
    id: 1, question: "Qual sala de estar mais combina com você?",
    context: "Observe a paleta de cores e a atmosfera geral.",
    options: [
      { id: 'min', label: 'Minimalista', description: 'Tons neutros, linhas retas, espaços amplos', gradient: 'linear-gradient(135deg, #f0ece3, #dcd5c4)', image: '/styles/q1_min.png' },
      { id: 'ind', label: 'Industrial', description: 'Concreto aparente, metal e tijolos à vista', gradient: 'linear-gradient(135deg, #4a4a4a, #2c2c2c)', image: '/styles/q1_ind.png' },
      { id: 'cla', label: 'Clássico', description: 'Elegância atemporal, molduras e dourado', gradient: 'linear-gradient(135deg, #c9a96e, #8b7332)', image: '/styles/q1_cla.png' },
      { id: 'con', label: 'Contemporâneo', description: 'Sofisticado, mix de texturas e tons sóbrios', gradient: 'linear-gradient(135deg, #2c3e50, #4a6274)', image: '/styles/q1_con.png' },
    ]
  },
  {
    id: 2, question: "E esta outra sala? Qual te atrai mais?",
    context: "Pense em como você se sentiria nesse espaço.",
    options: [
      { id: 'esc', label: 'Escandinavo', description: 'Madeira clara, branco, funcionalidade nórdica', gradient: 'linear-gradient(135deg, #f7f5f0, #e8dfd0)', image: '/styles/q2_esc.png' },
      { id: 'boh', label: 'Boho', description: 'Texturas naturais, macramê, tons terrosos', gradient: 'linear-gradient(135deg, #c4956a, #8b6348)', image: '/styles/q2_boh.png' },
      { id: 'mid', label: 'Mid-Century', description: 'Mobiliário icônico, cores quentes, madeira', gradient: 'linear-gradient(135deg, #d4813a, #a65c1e)', image: '/styles/q2_mid.png' },
      { id: 'min', label: 'Minimalista', description: 'Poucos elementos, máximo impacto', gradient: 'linear-gradient(135deg, #e8e8e8, #c0c0c0)', image: '/styles/q2_min.png' },
    ]
  },
  {
    id: 3, question: "Qual destes ambientes de estar você escolheria para viver?",
    context: "Imagine recebendo amigos nesse lugar.",
    options: [
      { id: 'lux', label: 'Luxo Contemporâneo', description: 'Mármore, iluminação indireta, peças de design', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)', image: '/styles/q3_lux.png' },
      { id: 'rus', label: 'Rústico Moderno', description: 'Madeira bruta, pedra, aconchego natural', gradient: 'linear-gradient(135deg, #5c4033, #3e2723)', image: '/styles/q3_rus.png' },
      { id: 'urb', label: 'Urbano', description: 'Grafismo, concreto, arte contemporânea', gradient: 'linear-gradient(135deg, #37474f, #263238)', image: '/styles/q3_urb.png' },
      { id: 'rom', label: 'Romântico', description: 'Tons pastel, tecidos leves, flores', gradient: 'linear-gradient(135deg, #f8e8e0, #e8c8c0)', image: '/styles/q3_rom.png' },
    ]
  },
  {
    id: 4, question: "Qual cozinha faz seus olhos brilharem?",
    context: "Pense na funcionalidade e na beleza do espaço.",
    options: [
      { id: 'gou', label: 'Gourmet Moderna', description: 'Ilha central, eletros embutidos, tudo integrado', gradient: 'linear-gradient(135deg, #2d2d2d, #1a1a1a)', image: '/styles/q4_gou.png' },
      { id: 'cla', label: 'Clássica Provençal', description: 'Armários detalhados, azulejos artesanais', gradient: 'linear-gradient(135deg, #d4c5a9, #b8a88a)', image: '/styles/q4_cla.png' },
      { id: 'min', label: 'Minimalista Branca', description: 'Limpa, sem puxadores, superfícies contínuas', gradient: 'linear-gradient(135deg, #fafafa, #e0e0e0)', image: '/styles/q4_min.png' },
      { id: 'col', label: 'Colorida e Viva', description: 'Revestimentos coloridos, personalidade forte', gradient: 'linear-gradient(135deg, #1b5e20, #2e7d32)', image: '/styles/q4_col.png' },
    ]
  },
  {
    id: 5, question: "E esta outra cozinha? Qual combina com o seu dia a dia?",
    context: "Imagine preparando suas refeições aqui.",
    options: [
      { id: 'ind', label: 'Industrial Gourmet', description: 'Aço escovado, prateleiras abertas, pendentes', gradient: 'linear-gradient(135deg, #555, #333)', image: '/styles/q5_ind.png' },
      { id: 'esc', label: 'Escandinava', description: 'Madeira natural, organização, leveza', gradient: 'linear-gradient(135deg, #f5ebe0, #d5c4a1)' },
      { id: 'lux', label: 'Alto Luxo', description: 'Pedras nobres, marcenaria impecável', gradient: 'linear-gradient(135deg, #1c1c1c, #0d0d0d)' },
      { id: 'cam', label: 'Campestre', description: 'Madeira rústica, panelas à vista, aconchego', gradient: 'linear-gradient(135deg, #795548, #5d4037)' },
    ]
  },
  {
    id: 6, question: "Mais uma cozinha para avaliar. Qual delas?",
    context: "Foque no que te traz conforto visual.",
    options: [
      { id: 'art', label: 'Art Déco', description: 'Geometria, veludo, tons de esmeralda e ouro', gradient: 'linear-gradient(135deg, #004d40, #00695c)' },
      { id: 'mod', label: 'Moderna Clean', description: 'Tons neutros, pedra clara, integração total', gradient: 'linear-gradient(135deg, #e0e0e0, #bdbdbd)' },
      { id: 'tro', label: 'Tropical', description: 'Cores quentes, elementos naturais, frescor', gradient: 'linear-gradient(135deg, #388e3c, #66bb6a)' },
      { id: 'con', label: 'Contemporânea Escura', description: 'Marcenaria escura, iluminação pontual', gradient: 'linear-gradient(135deg, #212121, #424242)' },
    ]
  },
  {
    id: 7, question: "Hora dos quartos. Qual destes refúgios é o seu?",
    context: "Pense em como você quer se sentir ao acordar.",
    options: [
      { id: 'ser', label: 'Sereno e Neutro', description: 'Bege, linho, madeira clara, paz absoluta', gradient: 'linear-gradient(135deg, #efebe9, #d7ccc8)' },
      { id: 'dra', label: 'Dramático', description: 'Paredes escuras, cabeceira estofada, luxo', gradient: 'linear-gradient(135deg, #1a237e, #283593)' },
      { id: 'rom', label: 'Romântico Moderno', description: 'Tons rosé, texturas suaves, acolhedor', gradient: 'linear-gradient(135deg, #f3e5f5, #e1bee7)' },
      { id: 'esc', label: 'Escandinavo Acolhedor', description: 'Branco quente, mantas, luminoso', gradient: 'linear-gradient(135deg, #fafaf0, #f0ece0)' },
    ]
  },
  {
    id: 8, question: "E este outro quarto? Qual é a sua cara?",
    context: "Imagine esse espaço como seu refúgio pessoal.",
    options: [
      { id: 'min', label: 'Minimalista Zen', description: 'Poucos móveis, tatami, serenidade japonesa', gradient: 'linear-gradient(135deg, #e0d8c0, #c8bfa0)' },
      { id: 'ind', label: 'Loft Urbano', description: 'Concreto, cabeceira de ferro, arte na parede', gradient: 'linear-gradient(135deg, #616161, #424242)' },
      { id: 'cla', label: 'Clássico Elegante', description: 'Cortinas pesadas, papel de parede, lustre', gradient: 'linear-gradient(135deg, #8d6e63, #6d4c41)' },
      { id: 'nat', label: 'Natural Orgânico', description: 'Fibras naturais, plantas, tons de terra', gradient: 'linear-gradient(135deg, #a5d6a7, #66bb6a)' },
    ]
  },
  {
    id: 9, question: "Último quarto: qual destes estilos te representa?",
    context: "Foque na sensação que o ambiente transmite.",
    options: [
      { id: 'hig', label: 'High Tech', description: 'Automação, LED, cortinas motorizadas', gradient: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
      { id: 'boh', label: 'Boho Chic', description: 'Mistura de estampas, cores terrosas, personalidade', gradient: 'linear-gradient(135deg, #bf7840, #a0522d)' },
      { id: 'lux', label: 'Suíte de Hotel 5★', description: 'Cortinas black-out, enxoval premium, TV embutida', gradient: 'linear-gradient(135deg, #263238, #37474f)' },
      { id: 'cot', label: 'Cottage Inglês', description: 'Florais, madeira pintada, charme campestre', gradient: 'linear-gradient(135deg, #c5e1a5, #aed581)' },
    ]
  },
  {
    id: 10, question: "Banheiros: qual destes te conquista?",
    context: "Pense no seu ritual de autocuidado.",
    options: [
      { id: 'spa', label: 'Spa Residencial', description: 'Seixos, madeira teca, ducha teto, zen', gradient: 'linear-gradient(135deg, #a1887f, #8d6e63)' },
      { id: 'mar', label: 'Mármore Clássico', description: 'Carrara, metais dourados, banheira freestanding', gradient: 'linear-gradient(135deg, #eceff1, #cfd8dc)' },
      { id: 'mod', label: 'Moderno Escuro', description: 'Porcelanato preto, nicho iluminado, minimalista', gradient: 'linear-gradient(135deg, #1e1e1e, #333)' },
      { id: 'ale', label: 'Alegre e Colorido', description: 'Ladrilho hidráulico, cores vibrantes', gradient: 'linear-gradient(135deg, #00897b, #26a69a)' },
    ]
  },
  {
    id: 11, question: "Último banheiro: qual é a sua escolha final?",
    context: "Confie no seu instinto.",
    options: [
      { id: 'lux', label: 'Ultra Luxo', description: 'Ônix, banheira de imersão, vista privilegiada', gradient: 'linear-gradient(135deg, #4a148c, #6a1b9a)' },
      { id: 'ind', label: 'Industrial Chic', description: 'Cimento queimado, metais pretos, espelho redondo', gradient: 'linear-gradient(135deg, #546e7a, #455a64)' },
      { id: 'esc', label: 'Escandinavo Clean', description: 'Branco, madeira pinus, azulejo subway', gradient: 'linear-gradient(135deg, #fafafa, #f0f0f0)' },
      { id: 'tro', label: 'Tropical Resort', description: 'Plantas, pedra natural, chuveiro aberto', gradient: 'linear-gradient(135deg, #2e7d32, #43a047)' },
    ]
  },
];

// ==========================================
// PERSONALIDADE
// ==========================================
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
  'Fotografia', 'Colecionismo', 'Degustação de vinhos',
];

// ==========================================
// PRIORIDADES (drag and drop)
// ==========================================
export const priorityItems = [
  'Funcionalidade / Praticidade',
  'Conforto',
  'Estética / Beleza',
  'Custo-benefício',
  'Durabilidade',
  'Sustentabilidade',
];

// ==========================================
// INVESTIMENTO
// ==========================================
export const investmentLevels = [
  { id: 'eco', label: 'Econômico', description: 'Reaproveitando bastante, intervenções pontuais', icon: '💡' },
  { id: 'int', label: 'Intermediário', description: 'Planejados essenciais e decoração renovada', icon: '🏠' },
  { id: 'pre', label: 'Premium', description: 'Alto padrão, materiais nobres, personalização', icon: '✨' },
  { id: 'lux', label: 'Alto Luxo', description: 'Sem limites criativos, o melhor do melhor', icon: '👑' },
];

// ==========================================
// DINÂMICA DA CASA
// ==========================================
export const dynamicsQuestions = [
  { id: 'moradores', question: 'Quantas pessoas moram (ou morarão) no imóvel?', type: 'number' as const },
  { id: 'criancas', question: 'Há crianças? Se sim, quais as idades?', type: 'text' as const },
  { id: 'pets', question: 'Tem pets? Quais e quantos?', type: 'text' as const },
  { id: 'pets_moveis', question: 'Os pets sobem nos móveis?', type: 'select' as const, options: ['Sim, sempre', 'Às vezes', 'Não', 'Não tenho pets'] },
  { id: 'home_office', question: 'Alguém trabalha de casa (Home Office)?', type: 'select' as const, options: ['Sim, diariamente', 'Sim, alguns dias', 'Não'] },
  { id: 'visitas', question: 'Com que frequência você recebe visitas?', type: 'select' as const, options: ['Toda semana', 'Quinzenalmente', 'Raramente', 'Nunca'] },
  { id: 'visitas_dormir', question: 'Recebe hóspedes para dormir?', type: 'select' as const, options: ['Sim, frequentemente', 'Às vezes', 'Raramente', 'Nunca'] },
  { id: 'cozinhar', question: 'Como é a rotina de cozinhar?', type: 'select' as const, options: ['Cozinho todos os dias', 'Cozinho às vezes', 'Raramente cozinho', 'Só peço delivery'] },
  { id: 'atmosfera', question: 'Qual atmosfera você prefere para o seu lar?', type: 'select' as const, options: ['Solar / Diurna', 'Cênica / Noturna'] },
  { id: 'automacao', question: 'Deseja integrar tecnologia e automação (Smart Home)?', type: 'select' as const, options: ['Sim, completo (Som, luz, ar)', 'Apenas o básico', 'Não tenho interesse'] },
  { id: 'wow', question: 'Qual elemento não pode faltar para o projeto superar suas expectativas?', type: 'text' as const },
  { id: 'referencias', question: 'Possui algum link de referências (Pinterest / Instagram)?', type: 'text' as const },
];

// ==========================================
// RESTRIÇÕES DO IMÓVEL
// ==========================================
export const propertyQuestions = [
  { id: 'tipo', question: 'Tipo do imóvel:', type: 'select' as const, options: ['Apartamento', 'Casa', 'Cobertura', 'Studio/Loft', 'Comercial'] },
  { id: 'propriedade', question: 'O imóvel é:', type: 'select' as const, options: ['Próprio', 'Alugado', 'Financiado'] },
  { id: 'paredes', question: 'Podemos quebrar ou mover paredes?', type: 'select' as const, options: ['Sim, sem restrições', 'Sim, com aprovação do condomínio', 'Não, prefiro manter a planta original', 'Não sei'] },
  { id: 'condominio', question: 'Há regras rígidas de condomínio para obra?', type: 'select' as const, options: ['Sim, bastante restritivo', 'Sim, mas flexível', 'Não tem condomínio', 'Não sei'] },
  { id: 'prazo', question: 'Qual o prazo ideal para conclusão?', type: 'select' as const, options: ['Urgente (1-2 meses)', 'Normal (3-4 meses)', 'Sem pressa (5-6 meses)', 'Flexível'] },
];

// ==========================================
// AMBIENTES (template por cômodo)
// ==========================================
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
    habits: ['Leitura antes de dormir', 'Assistir TV na cama', 'Café da manhã na cama', 'Meditação/Yoga', 'Home Office eventual'],
    equipment: ['TV', 'Ar-condicionado', 'Closet iluminado', 'Penteadeira', 'Poltrona de leitura', 'Cortina black-out motorizada'],
  },
  'cozinha': {
    id: 'cozinha', name: 'Cozinha', icon: '🍳',
    habits: ['Cozinha diariamente', 'Recebe amigos para cozinhar', 'Apenas refeições rápidas', 'Usa muito forno/air fryer', 'Faz pães/confeitaria'],
    equipment: ['Ilha/bancada', 'Cooktop', 'Forno embutido', 'Lava-louças', 'Adega climatizada', 'Purificador de água', 'Depurador/Coifa'],
  },
  'sala-estar': {
    id: 'sala-estar', name: 'Sala de Estar / Jantar', icon: '🛋️',
    habits: ['Assistir TV/filmes', 'Receber visitas', 'Jogos de tabuleiro', 'Leitura', 'Happy hour'],
    equipment: ['TV grande', 'Home Theater', 'Lareira', 'Bar/Adega', 'Mesa de jantar 6+ lugares', 'Aparador/Buffet'],
  },
  'lavabo': {
    id: 'lavabo', name: 'Lavabo', icon: '🚿',
    habits: ['Uso de visitas', 'Espaço para impressionar', 'Funcional e prático'],
    equipment: ['Cuba de apoio', 'Espelho com LED', 'Papel de parede especial'],
  },
  'home-office': {
    id: 'home-office', name: 'Home Office', icon: '💻',
    habits: ['Trabalho diário 8h+', 'Videoconferências frequentes', 'Trabalho criativo/design', 'Estudo/leitura', 'Reuniões presenciais'],
    equipment: ['Mesa ampla', 'Cadeira ergonômica', '2+ monitores', 'Iluminação para câmera', 'Estante de livros', 'Quadro branco'],
  },
  'quarto': {
    id: 'quarto', name: 'Quarto', icon: '🛏️',
    habits: ['Quarto de hóspedes', 'Quarto de criança', 'Quarto de adolescente', 'Quarto do casal'],
    equipment: ['TV', 'Ar-condicionado', 'Escrivaninha', 'Guarda-roupa planejado', 'Beliche', 'Berço'],
  },
  'banheiro': {
    id: 'banheiro', name: 'Banheiro', icon: '🛁',
    habits: ['Banhos longos relaxantes', 'Banhos rápidos e práticos', 'Autocuidado/skincare', 'Compartilhado por 2+ pessoas'],
    equipment: ['Banheira', 'Ducha higiênica', 'Nicho iluminado', 'Espelho com LED', 'Aquecedor de toalha', 'Chuveiro teto (rain shower)'],
  },
  'area-servico': {
    id: 'area-servico', name: 'Área de Serviço', icon: '🧺',
    habits: ['Lava e passa em casa', 'Usa lavanderia externa', 'Precisa secar roupa dentro de casa'],
    equipment: ['Lava e seca', 'Tanque', 'Varal retrátil', 'Tábua de passar embutida', 'Armário para produtos'],
  },
  'varanda': {
    id: 'varanda', name: 'Varanda / Terraço', icon: '🌿',
    habits: ['Churrascos', 'Relaxamento', 'Refeições ao ar livre', 'Jardim/horta', 'Espaço pet'],
    equipment: ['Churrasqueira', 'Bancada gourmet', 'Sofá/rede', 'Jardim vertical', 'Spa/ofurô', 'Iluminação cênica'],
  },
};

// Mock de ambientes detectados pela IA a partir da planta
export const mockDetectedRooms = [
  'suite-master', 'cozinha', 'sala-estar', 'lavabo', 'home-office', 'banheiro', 'area-servico', 'varanda'
];
