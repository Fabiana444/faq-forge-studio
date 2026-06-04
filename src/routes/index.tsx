import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { FaqRenderer } from "@/components/FaqRenderer";
import { TEMPLATE_META, DEFAULT_CONFIG, type TemplateKey } from "@/lib/faq-types";
import { useState } from "react";
import { ArrowRight, Layers, Share2, Image, Lock, Palette, ListOrdered, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocSpace.tec — Crie FAQs sanfona personalizadas" },
      {
        name: "description",
        content:
          "7 modelos de FAQ sanfona com cores customizáveis, compartilhamento, mídia, acesso privado, numeração, datas comemorativas e API de integração.",
      },
    ],
  }),
  component: Index,
});

const previewItems = [
  {
    id: "1",
    category: "Geral",
    question: "Como funciona o DocSpace.tec?",
    answer:
      "Escolha um modelo, personalize cores e conteúdo, e publique. Tudo no navegador.",
  },
  {
    id: "2",
    category: "Geral",
    question: "Posso embeddar em outro site (WordPress, etc.)?",
    answer: "Sim — via iframe, snippet JS ou API JSON pública.",
  },
  {
    id: "3",
    category: "🔒 Privado",
    question: "Como funcionam as FAQs privadas?",
    answer: "Apenas usuários logados veem o conteúdo — visitantes veem cadeado.",
  },
];

const ICONS: Record<TemplateKey, React.ReactNode> = {
  categorized: <Layers className="h-4 w-4" />,
  shareable: <Share2 className="h-4 w-4" />,
  "rich-media": <Image className="h-4 w-4" />,
  private: <Lock className="h-4 w-4" />,
  branded: <Palette className="h-4 w-4" />,
  numbered: <ListOrdered className="h-4 w-4" />,
  seasonal: <Sparkles className="h-4 w-4" />,
};


function Index() {
  const [active, setActive] = useState<TemplateKey>("categorized");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-subtle)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            7 modelos · 100% personalizável
          </span>
          <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-6xl">
            FAQs sanfona que{" "}
            <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
              vendem por você
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
            Crie, personalize e compartilhe perguntas frequentes em minutos.
            Escolha entre 7 modelos prontos, ajuste cores, adicione seu logo e
            controle quem pode ver.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg">
                Começar grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline">
                Ver documentação
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(TEMPLATE_META) as TemplateKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                active === k
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {ICONS[k]}
              {TEMPLATE_META[k].name}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">
              {TEMPLATE_META[active].name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {TEMPLATE_META[active].description}
            </p>
            <Link
              to="/auth"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Usar este modelo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-elevated)]">
            <FaqRenderer
              template={active}
              items={previewItems}
              config={DEFAULT_CONFIG}
              isAuthenticated={false}
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Feito com <span className="text-primary">♥</span> · © DocSpace.tec — todos os direitos reservados ·{" "}
        <a href="https://docspace.tec.br" className="underline" target="_blank" rel="noreferrer">docspace.tec.br</a>
      </footer>
    </div>
  );
}

