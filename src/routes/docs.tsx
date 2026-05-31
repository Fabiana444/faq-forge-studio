import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { TEMPLATE_META } from "@/lib/faq-types";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentação — FAQ Forge" },
      {
        name: "description",
        content:
          "Guia completo do FAQ Forge: modelos, personalização, autenticação e API.",
      },
    ],
  }),
  component: Docs,
});

function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-10 border-b border-border pb-8">
          <span className="text-xs uppercase tracking-wider text-primary">
            Documentação v1.0
          </span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">FAQ Forge</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Ferramenta geradora de FAQs sanfona inteligentes, com 5 modelos
            personalizáveis, autenticação e controle de privacidade.
          </p>
          <a href="/faq-forge-docs.pdf" download>
            <Button className="mt-5" variant="outline">
              <Download className="mr-2 h-4 w-4" /> Baixar PDF
            </Button>
          </a>
        </header>

        <Section title="1. Visão Geral">
          <p>
            O <b>FAQ Forge</b> é uma ferramenta web que permite criar, customizar
            e compartilhar perguntas frequentes em formato sanfona (accordion).
            Cada FAQ é salva na sua conta e recebe uma URL pública compartilhável.
          </p>
        </Section>

        <Section title="2. Modelos disponíveis">
          <p>
            Você pode escolher entre 5 modelos no editor. Cada modelo destaca
            funcionalidades diferentes:
          </p>
          <ul className="mt-3 space-y-3">
            {Object.entries(TEMPLATE_META).map(([k, m]) => (
              <li key={k} className="rounded-lg border border-border bg-card p-4">
                <div className="font-semibold">{m.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {m.description}
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="3. Personalização">
          <p>
            Na aba <b>Estilo</b> do editor, você pode ajustar:
          </p>
          <ul className="ml-6 mt-2 list-disc space-y-1 text-sm">
            <li>Cor de destaque (ícones, categorias)</li>
            <li>Cor das perguntas e respostas</li>
            <li>Cor de fundo e borda</li>
            <li>Logo e nome da marca (modelo Branded)</li>
          </ul>
        </Section>

        <Section title="4. Privacidade">
          <p>
            Cada FAQ tem visibilidade <b>pública</b> ou <b>privada</b>:
          </p>
          <ul className="ml-6 mt-2 list-disc space-y-1 text-sm">
            <li>
              <b>Pública:</b> acessível por qualquer pessoa via{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                /faq/&lt;id&gt;
              </code>
              .
            </li>
            <li>
              <b>Privada:</b> apenas o autor logado consegue visualizar.
            </li>
          </ul>
          <p className="mt-3">
            No modelo <b>Acesso Restrito</b>, perguntas individuais marcadas com
            a categoria começando em <code>🔒</code> aparecem com cadeado para
            visitantes não autenticados, com tooltip "Faça login para acessar a
            FAQ".
          </p>
        </Section>

        <Section title="5. Autenticação">
          <p>
            Login via e-mail/senha ou Google. A sessão é persistida no
            navegador e renovada automaticamente.
          </p>
        </Section>

        <Section title="6. Modelo de dados">
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-4 text-xs">
{`faqs (
  id uuid pk,
  user_id uuid -> auth.users,
  title text,
  template text,           -- categorized | shareable | rich-media | private | branded
  visibility text,         -- public | private
  config jsonb,            -- { accentColor, questionColor, ... logoUrl, brandName }
  items jsonb,             -- [{ id, category?, question, answer, imageUrl?, code? }]
  created_at, updated_at
)`}
          </pre>
        </Section>

        <Section title="7. Fluxo recomendado">
          <ol className="ml-6 list-decimal space-y-1 text-sm">
            <li>Criar conta em /auth</li>
            <li>Clicar em "Nova FAQ" no dashboard</li>
            <li>Editar conteúdo + estilo no editor</li>
            <li>Salvar e copiar a URL pública</li>
            <li>Compartilhar ou embedar via iframe</li>
          </ol>
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
