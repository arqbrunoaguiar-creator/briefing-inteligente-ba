export interface StyleMoodboard {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image?: string;
  palette: string[];
  paletteNames: string[];
  materials: {
    category: string;
    items: string[];
  }[];
  keywords: string[];
  avoid: string[];
}

export const styleMoodboards: StyleMoodboard[] = [
  {
    id: 'minimalista',
    name: 'Minimalista',
    subtitle: 'Menos é mais',
    image: '/styles/minimalista.jpg',
    description: 'Ambientes limpos e funcionais onde cada peça tem propósito. Linhas retas, superfícies contínuas e ausência de excessos. O silêncio visual como protagonista.',
    palette: ['#FFFFFF', '#F5F0EB', '#C4B9A8', '#8C7E6A', '#2C2C2C'],
    paletteNames: ['Branco Puro', 'Areia', 'Linho', 'Terra Quente', 'Carvão'],
    materials: [
      { category: '🪵 Madeiras', items: ['Carvalho Europeu', 'Freijó Natural', 'Tauari', 'Bambu'] },
      { category: '🪨 Pedras', items: ['Nanoglass Branco', 'Quartzo Branco', 'Concreto Polido', 'Cimento Queimado'] },
      { category: '🧵 Tecidos', items: ['Linho Cru', 'Algodão Orgânico', 'Bouclé Off-White', 'Couro Natural'] },
      { category: '🔩 Metais', items: ['Aço Escovado', 'Alumínio Anodizado', 'Preto Fosco'] },
      { category: '🏗️ Revestimentos', items: ['Porcelanato Acetinado', 'Pintura Suvinil Gelo', 'Madeira Clara'] },
    ],
    keywords: ['Clean', 'Funcional', 'Silêncio Visual', 'Essencial', 'Ordem'],
    avoid: ['Excessos decorativos', 'Estampas fortes', 'Cores vibrantes', 'Muitos objetos'],
  },
  {
    id: 'classico',
    name: 'Clássico Contemporâneo',
    subtitle: 'Elegância atemporal',
    image: '/styles/classico.jpg',
    description: 'A sofisticação dos elementos clássicos traduzida para a linguagem atual. Molduras, simetria e materiais nobres em composições refinadas.',
    palette: ['#F8F4EF', '#C9A96E', '#5C4B35', '#1C1C2E', '#8B7332'],
    paletteNames: ['Pérola', 'Dourado', 'Nogueira', 'Azul Noite', 'Ouro Velho'],
    materials: [
      { category: '🪵 Madeiras', items: ['Nogueira', 'Mogno', 'Ébano', 'Cerejeira'] },
      { category: '🪨 Pedras', items: ['Mármore Carrara', 'Mármore Nero Marquina', 'Ônix Mel', 'Travertino'] },
      { category: '🧵 Tecidos', items: ['Veludo', 'Seda', 'Jacquard', 'Lã Fria', 'Couro Italiano'] },
      { category: '🔩 Metais', items: ['Dourado Polido', 'Latão Escovado', 'Bronze', 'Ouro Rosé'] },
      { category: '🏗️ Revestimentos', items: ['Boiserie', 'Papel de Parede Adamascado', 'Gesso Ornamentado', 'Lambri'] },
    ],
    keywords: ['Simetria', 'Nobreza', 'Requinte', 'Tradição', 'Molduras'],
    avoid: ['Materiais sintéticos aparentes', 'Informalidade excessiva', 'Cores neon'],
  },
  {
    id: 'moderno',
    name: 'Moderno / Contemporâneo',
    subtitle: 'Sofisticação atual',
    image: '/styles/moderno.jpg',
    description: 'O equilíbrio entre ousadia e refinamento. Mix de materiais, texturas contrastantes e uma curadoria precisa de peças que dialogam entre si.',
    palette: ['#1A1A1A', '#333333', '#8C8C8C', '#E8E4DE', '#C17D3C'],
    paletteNames: ['Preto Grafite', 'Chumbo', 'Cinza Médio', 'Off-White', 'Couro Caramelo'],
    materials: [
      { category: '🪵 Madeiras', items: ['Carvalho Defumado', 'Imbuia', 'MDF Laqueado', 'Demolição Tratada'] },
      { category: '🪨 Pedras', items: ['Granito Preto São Gabriel', 'Quartzo Cinza', 'Porcelanato Marble', 'Dekton'] },
      { category: '🧵 Tecidos', items: ['Suede', 'Bouclé Cinza', 'Linho Grafite', 'Couro Ecológico', 'Veludo Canelado'] },
      { category: '🔩 Metais', items: ['Preto Fosco', 'Inox Escovado', 'Cobre Envelhecido', 'Grafite'] },
      { category: '🏗️ Revestimentos', items: ['Ripado de Madeira', 'Painel 3D', 'Pintura Camurça', 'Tijolinho Preto'] },
    ],
    keywords: ['Contraste', 'Curadoria', 'Texturas', 'Peças de Design', 'Statement'],
    avoid: ['Decoração datada', 'Excesso de cores', 'Falta de personalidade'],
  },
  {
    id: 'zen',
    name: 'Zen / Japandi',
    subtitle: 'Serenidade e equilíbrio',
    description: 'A fusão entre a estética japonesa e o design escandinavo. Materiais naturais, simplicidade intencional e uma conexão profunda com a natureza.',
    palette: ['#F5F1E8', '#D4C9B0', '#8B7D6B', '#4A4A40', '#2D4A3E'],
    paletteNames: ['Arroz', 'Bambu', 'Argila', 'Pedra', 'Musgo'],
    materials: [
      { category: '🪵 Madeiras', items: ['Hinoki (Cipreste Japonês)', 'Pinus Natural', 'Bambu Prensado', 'Teca'] },
      { category: '🪨 Pedras', items: ['Seixos Naturais', 'Basalto', 'Ardósia', 'Pedra Sabão'] },
      { category: '🧵 Tecidos', items: ['Linho Natural', 'Algodão Cru', 'Juta', 'Palha de Arroz'] },
      { category: '🔩 Metais', items: ['Ferro Forjado', 'Preto Fosco Minimalista'] },
      { category: '🏗️ Revestimentos', items: ['Tatami', 'Shoji (Painéis de Papel)', 'Madeira Natural', 'Textura de Terra'] },
    ],
    keywords: ['Wabi-Sabi', 'Imperfeição Bela', 'Natureza', 'Silêncio', 'Respiração'],
    avoid: ['Excesso visual', 'Materiais artificiais', 'Brilho excessivo', 'Tecnologia aparente'],
  },
  {
    id: 'industrial',
    name: 'Industrial',
    subtitle: 'Caráter bruto e autêntico',
    image: '/styles/industrial.jpg',
    description: 'A beleza do inacabado. Estruturas aparentes, materiais crus e uma estética que celebra a honestidade construtiva dos espaços.',
    palette: ['#2C2C2C', '#6B6B6B', '#A0522D', '#B87333', '#D4C9B0'],
    paletteNames: ['Concreto Escuro', 'Aço', 'Tijolo', 'Cobre', 'Areia'],
    materials: [
      { category: '🪵 Madeiras', items: ['Madeira de Demolição', 'Pinus Envelhecido', 'OSB', 'Compensado Naval'] },
      { category: '🪨 Pedras', items: ['Concreto Aparente', 'Cimento Queimado', 'Granilite', 'Tijolo Aparente'] },
      { category: '🧵 Tecidos', items: ['Couro Envelhecido', 'Lona', 'Jeans', 'Algodão Rústico'] },
      { category: '🔩 Metais', items: ['Ferro Bruto', 'Cobre Oxidado', 'Aço Corten', 'Tubulação Aparente'] },
      { category: '🏗️ Revestimentos', items: ['Tijolinho', 'Subway Tile', 'Chapas Metálicas', 'Tela Expandida'] },
    ],
    keywords: ['Autenticidade', 'Brutalismo', 'Estrutura', 'Loft', 'Raw'],
    avoid: ['Acabamentos polidos demais', 'Tons pastel', 'Decoração fofa'],
  },
  {
    id: 'boho',
    name: 'Boho Chic',
    subtitle: 'Liberdade e personalidade',
    description: 'A arte de misturar com alma. Texturas, estampas e memórias afetivas convivem num espaço vibrante, acolhedor e cheio de histórias.',
    palette: ['#F5E6D3', '#C4956A', '#8B4513', '#2E4A3E', '#D4A76A'],
    paletteNames: ['Creme', 'Terracota', 'Mogno', 'Verde Folha', 'Mostarda'],
    materials: [
      { category: '🪵 Madeiras', items: ['Rattan', 'Vime', 'Bambu', 'Madeira Reciclada'] },
      { category: '🪨 Pedras', items: ['Pedra Moledo', 'Terracota', 'Cerâmica Artesanal'] },
      { category: '🧵 Tecidos', items: ['Macramê', 'Crochê', 'Kilim', 'Ikat', 'Linho Tingido', 'Patchwork'] },
      { category: '🔩 Metais', items: ['Latão Envelhecido', 'Cobre Martelado', 'Ferro Artesanal'] },
      { category: '🏗️ Revestimentos', items: ['Ladrilho Hidráulico', 'Azulejo Artesanal', 'Palha Natural', 'Papel de Parede Floral'] },
    ],
    keywords: ['Ecletismo', 'Afetividade', 'Viagem', 'Artesanal', 'Camadas'],
    avoid: ['Frieza', 'Ambientes vazios', 'Uniformidade', 'Produção em série'],
  },
  {
    id: 'escandinavo',
    name: 'Escandinavo',
    subtitle: 'Funcionalidade acolhedora',
    description: 'Design democrático e humano. Espaços luminosos, organizados e confortáveis onde a funcionalidade convive com a beleza de forma natural.',
    palette: ['#FFFFFF', '#F0EDE5', '#B0A896', '#5A5A52', '#3D6B5E'],
    paletteNames: ['Neve', 'Aveia', 'Areia Nórdica', 'Grafite Suave', 'Pinheiro'],
    materials: [
      { category: '🪵 Madeiras', items: ['Pinus Finlandês', 'Bétula', 'Carvalho Claro', 'Freixo'] },
      { category: '🪨 Pedras', items: ['Granito Cinza Claro', 'Concreto Liso', 'Cerâmica Branca'] },
      { category: '🧵 Tecidos', items: ['Lã Merino', 'Bouclé', 'Algodão Orgânico', 'Pele de Carneiro (Sheepskin)'] },
      { category: '🔩 Metais', items: ['Preto Fosco', 'Branco Mate', 'Cobre Discreto'] },
      { category: '🏗️ Revestimentos', items: ['Pintura Branca Matte', 'Madeira Clara', 'Tijolinho Branco', 'Cerâmica Hexagonal'] },
    ],
    keywords: ['Hygge', 'Luminosidade', 'Organização', 'Democrático', 'Cozy'],
    avoid: ['Escuridão', 'Ornamentação pesada', 'Materiais frios'],
  },
  {
    id: 'tropical',
    name: 'Tropical Brasileiro',
    subtitle: 'Natureza e brasilidade',
    description: 'A exuberância da natureza tropical integrada ao design. Plantas, madeiras nobres brasileiras, cores quentes e a energia vibrante dos trópicos.',
    palette: ['#F5E6C8', '#228B22', '#8B4513', '#DAA520', '#004D40'],
    paletteNames: ['Palha', 'Verde Mata', 'Madeira', 'Dourado Sol', 'Verde Profundo'],
    materials: [
      { category: '🪵 Madeiras', items: ['Cumaru', 'Ipê', 'Peroba Rosa', 'Jatobá', 'Buriti'] },
      { category: '🪨 Pedras', items: ['Pedra Hijau', 'Pedra Natural', 'Seixo de Rio', 'Arenito'] },
      { category: '🧵 Tecidos', items: ['Palha de Buriti', 'Fibra de Bananeira', 'Algodão Brasileiro', 'Sisal'] },
      { category: '🔩 Metais', items: ['Latão Natural', 'Cobre Polido', 'Ferro Artesanal'] },
      { category: '🏗️ Revestimentos', items: ['Ladrilho Colorido', 'Azulejo Português', 'Cobogó', 'Painel de Madeira Ripada'] },
    ],
    keywords: ['Brasilidade', 'Exuberância', 'Natureza', 'Calor', 'Vida'],
    avoid: ['Frieza nórdica', 'Ambientes fechados', 'Artificialidade'],
  },
  {
    id: 'atemporal',
    name: 'Atemporal',
    subtitle: 'Além das tendências',
    description: 'O design que transcende épocas. Peças icônicas, proporções perfeitas e materiais que envelhecem com beleza. Não segue modas — cria referências. Um ambiente atemporal é aquele que parece certo hoje, pareceu certo ontem e parecerá certo daqui a 20 anos.',
    palette: ['#F5F0E8', '#D8CFC0', '#9C8E7C', '#5C534A', '#1E1E1E'],
    paletteNames: ['Marfim', 'Caxemira', 'Camurça', 'Grafite Quente', 'Ébano'],
    materials: [
      { category: '🪵 Madeiras', items: ['Nogueira Americana', 'Carvalho Natural', 'Teca Envelhecida', 'Freijó'] },
      { category: '🪨 Pedras', items: ['Mármore Calacatta', 'Travertino Romano', 'Limestone', 'Granito Absolute Black'] },
      { category: '🧵 Tecidos', items: ['Linho Belga', 'Cashmere', 'Couro Full-Grain', 'Veludo de Algodão', 'Tweed'] },
      { category: '🔩 Metais', items: ['Latão Acetinado', 'Bronze Patinado', 'Aço Inox Escovado', 'Níquel'] },
      { category: '🏗️ Revestimentos', items: ['Lambri de Madeira', 'Pintura Fosca Premium', 'Pedra Natural', 'Herringbone (Espinha de Peixe)'] },
    ],
    keywords: ['Perene', 'Icônico', 'Proporção', 'Qualidade', 'Legado'],
    avoid: ['Tendências passageiras', 'Materiais descartáveis', 'Exagero ornamental', 'Cores da moda'],
  },
];
