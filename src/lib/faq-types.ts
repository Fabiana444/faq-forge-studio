export type TemplateKey =
  | "categorized"
  | "shareable"
  | "rich-media"
  | "private"
  | "branded";

export interface FaqItem {
  id: string;
  category?: string;
  question: string;
  answer: string;
  imageUrl?: string;
  code?: string;
  codeLang?: string;
}

export interface FaqConfig {
  accentColor: string;       // primary accent (oklch/hex)
  questionColor: string;     // question text color
  answerColor: string;       // answer text color
  backgroundColor: string;   // surface background
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
      "Cada pergunta tem botões de copiar e compartilhar ao lado da resposta.",
  },
  "rich-media": {
    name: "Mídia Rica",
    description:
      "Suporta imagens e blocos de código dentro das respostas — ideal para docs técnicos.",
  },
  private: {
    name: "Acesso Restrito",
    description:
      "Perguntas marcadas como privadas aparecem com cadeado para visitantes não logados.",
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
