export type TemplateKey =
  | "categorized"
  | "shareable"
  | "rich-media"
  | "private"
  | "branded";

export type CodeLayout = "block" | "inline" | "terminal";
export type CodeTheme = "dark" | "light";

export interface FaqItem {
  id: string;
  category?: string;
  question: string;
  /** Pode conter HTML simples: <b>, <i>, <u>, <a href>. */
  answer: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  code?: string;
  codeLang?: string;
  codeLayout?: CodeLayout;
  codeTheme?: CodeTheme;
}

export interface FaqConfig {
  accentColor: string;
  questionColor: string;
  answerColor: string;
  backgroundColor: string;
  borderColor: string;
  logoUrl?: string;
  brandName?: string;
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
      "Organiza perguntas em categorias com cabeçalhos coloridos personalizáveis.",
  },
  shareable: {
    name: "Compartilhável",
    description:
      "Cada pergunta tem botões de copiar link, copiar conteúdo e compartilhar por E-mail ou WhatsApp.",
  },
  "rich-media": {
    name: "Mídia Rica",
    description:
      "Suporta imagens, vídeos, áudios e blocos de código — ideal para docs técnicos.",
  },
  private: {
    name: "Acesso Restrito",
    description:
      "Todas as perguntas aparecem, mas o conteúdo de perguntas marcadas como privadas só é revelado após login.",
  },
  branded: {
    name: "Marca Personalizada",
    description:
      "Cor de fundo customizada e logo do site no topo — ideal para embed institucional.",
  },
};

export const DEFAULT_CONFIG: FaqConfig = {
  accentColor: "#6366f1",
  questionColor: "#1e293b",
  answerColor: "#475569",
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  brandName: "Minha Empresa",
};

export const DEFAULT_ITEMS: FaqItem[] = [
  {
    id: "1",
    category: "Geral",
    question: "O que é esta ferramenta?",
    answer:
      "Um gerador de FAQs inteligente com 5 modelos de sanfona prontos para usar.",
  },
  {
    id: "2",
    category: "Geral",
    question: "Posso personalizar as cores?",
    answer:
      "Sim. Cada modelo permite escolher cores de destaque, fundo e bordas.",
  },
  {
    id: "3",
    category: "Avançado",
    question: "Como exportar a FAQ pronta?",
    answer:
      "Use o botão Compartilhar para copiar o link público ou exporte o HTML.",
  },
];

/** Linguagens de código suportadas no modelo Mídia Rica. */
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
