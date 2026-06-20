export type TemplateKey =
  | "categorized"
  | "shareable"
  | "rich-media"
  | "private"
  | "branded"
  | "numbered"
  | "seasonal"
  | "menu";

export type CodeLayout = "block" | "inline" | "terminal";
export type CodeTheme = "dark" | "light";

export type SeasonalTheme =
  | "christmas"
  | "sao-joao"
  | "black-friday"
  | "new-year"
  | "valentines"
  | "halloween"
  | "custom";

export interface FaqItem {
  id: string;
  category?: string;
  question: string;
  /** HTML simples permitido: <b>, <i>, <u>, <a href>. */
  answer: string;
  /** Cor de fundo individual da pergunta/resposta (sobrescreve a do tema). */
  bgColor?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  code?: string;
  codeLang?: string;
  codeLayout?: CodeLayout;
  codeTheme?: CodeTheme;
  /** Tipografia individual (sobrescreve a do tema). */
  questionFont?: string;
  questionFontSize?: number;
  answerFont?: string;
  answerFontSize?: number;
}

export interface CustomFont {
  name: string;
  /** Data URL (data:font/woff2;base64,...) ou URL pública. */
  url: string;
  /** woff2 | woff | truetype | opentype */
  format?: "woff2" | "woff" | "truetype" | "opentype";
}


export interface FaqConfig {
  accentColor: string;
  questionColor: string;
  answerColor: string;
  backgroundColor: string;
  borderColor: string;
  logoUrl?: string;
  brandName?: string;

  /** Cores por nome de categoria (modelo Categorizado). */
  categoryColors?: Record<string, { bg?: string; text?: string; itemBg?: string }>;

  /** Modelo Acesso Restrito */
  lockColor?: string;
  loginBoxBg?: string;
  loginBoxLogoUrl?: string;

  /** Modelo Sazonal */
  seasonalTheme?: SeasonalTheme;
  seasonalAccent?: string;
  seasonalSecondary?: string;

  /** Pacotes de fontes pagas/personalizadas enviadas pelo usuário. */
  customFonts?: CustomFont[];
}


export interface FaqDocument {
  id?: string;
  title: string;
  template: TemplateKey;
  visibility: "public" | "private";
  config: FaqConfig;
  items: FaqItem[];
}

export const TEMPLATE_META: Record<
  TemplateKey,
  { name: string; description: string }
> = {
  categorized: {
    name: "Categorizado",
    description:
      "Agrupa perguntas em categorias com cor de cabeçalho e cor de fundo dos itens configurável por categoria.",
  },
  shareable: {
    name: "Compartilhável",
    description:
      "Cada pergunta vira link direto e ganha botões de copiar conteúdo, copiar link e compartilhar (WhatsApp / E-mail).",
  },
  "rich-media": {
    name: "Mídia Rica",
    description:
      "Imagens, vídeo (YouTube/Vimeo/mp4), áudio e blocos de código com seletor de linguagem, layout e tema.",
  },
  private: {
    name: "Acesso Restrito",
    description:
      "Perguntas aparecem para qualquer visitante; respostas marcadas como privadas exigem login para serem reveladas.",
  },
  branded: {
    name: "Marca Personalizada",
    description:
      "Cor de fundo customizada + logo da marca no topo. Ideal para embed institucional.",
  },
  numbered: {
    name: "Numerado",
    description:
      "Perguntas exibidas em sequência numérica (1, 2, 3…). Excelente para tutoriais e processos passo a passo.",
  },
  seasonal: {
    name: "Datas Comemorativas",
    description:
      "Decorações prontas (Natal, São João, Black Friday, Ano Novo, Dia dos Namorados, Halloween) com cores editáveis.",
  },
  menu: {
    name: "Menu Lateral",
    description:
      "Perguntas em menu à esquerda, respostas em painel à direita. Ideal para documentação e guias extensos.",
  },
};

export const DEFAULT_CONFIG: FaqConfig = {
  accentColor: "#6366f1",
  questionColor: "#1e293b",
  answerColor: "#475569",
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  brandName: "Minha Empresa",
  lockColor: "#6366f1",
  loginBoxBg: "#f8fafc",
  seasonalTheme: "christmas",
};

export const DEFAULT_ITEMS: FaqItem[] = [
  {
    id: "1",
    category: "Geral",
    question: "O que é esta ferramenta?",
    answer:
      "Um gerador de FAQs inteligente com 8 modelos de sanfona prontos para usar.",
  },
  {
    id: "2",
    category: "Geral",
    question: "Posso personalizar as cores?",
    answer:
      "Sim. Cada modelo permite escolher cores de destaque, fundo e bordas — e até cor por categoria.",
  },
  {
    id: "3",
    category: "Avançado",
    question: "Como exportar a FAQ pronta?",
    answer:
      "Use o botão Compartilhar para copiar o link público, embede via iframe ou consuma a API JSON.",
  },
];

export const CODE_LANGUAGES: { value: string; label: string }[] = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS / Sass" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash / Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "graphql", label: "GraphQL" },
  { value: "lua", label: "Lua" },
  { value: "perl", label: "Perl" },
  { value: "r", label: "R" },
  { value: "dart", label: "Dart" },
  { value: "elixir", label: "Elixir" },
  { value: "scala", label: "Scala" },
  { value: "haskell", label: "Haskell" },
  { value: "solidity", label: "Solidity" },
  { value: "toml", label: "TOML" },
  { value: "ini", label: "INI" },
  { value: "diff", label: "Diff" },
  { value: "plaintext", label: "Texto puro" },
];

export const CODE_LAYOUTS: { value: CodeLayout; label: string }[] = [
  { value: "block", label: "Bloco padrão" },
  { value: "inline", label: "Compacto / inline" },
  { value: "terminal", label: "Terminal" },
];

export const SEASONAL_PRESETS: Record<
  SeasonalTheme,
  { name: string; accent: string; secondary: string; bg: string; icon: string }
> = {
  christmas: { name: "Natal 🎄", accent: "#c1121f", secondary: "#2d6a4f", bg: "#fff8f0", icon: "🎄" },
  "sao-joao": { name: "São João 🌽", accent: "#e76f51", secondary: "#f4a261", bg: "#fff3d4", icon: "🎪" },
  "black-friday": { name: "Black Friday 🛍️", accent: "#facc15", secondary: "#111111", bg: "#0a0a0a", icon: "🛍️" },
  "new-year": { name: "Ano Novo ✨", accent: "#d4af37", secondary: "#1a1a2e", bg: "#0f0f23", icon: "🎆" },
  valentines: { name: "Dia dos Namorados ❤️", accent: "#e11d48", secondary: "#fb7185", bg: "#fff1f2", icon: "💌" },
  halloween: { name: "Halloween 🎃", accent: "#ea580c", secondary: "#1f1f1f", bg: "#1c1917", icon: "🎃" },
  custom: { name: "Personalizado", accent: "#6366f1", secondary: "#a78bfa", bg: "#ffffff", icon: "✨" },
};
