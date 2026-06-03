import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { TEMPLATE_META } from "@/lib/faq-types";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentação — DocSpace.tec" },
      {
        name: "description",
        content:
          "Guia completo do DocSpace.tec: modelos, personalização, API de integração e embed em WordPress / qualquer site.",
      },
    ],
  }),
  component: Docs,
});

function Docs() {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://docspace.tec.com.br";
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-10 border-b border-border pb-8">
          <span className="text-xs uppercase tracking-wider text-primary">
            Documentação v2.0
          </span>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            DocSpace.tec
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Ferramenta geradora de FAQs sanfona inteligentes. 7 modelos
            personalizáveis, autenticação, controle de privacidade, API JSON e
            embed em qualquer site.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            © DocSpace.tec · Todos os direitos reservados ·{" "}
            <a className="underline" href="https://docspace.tec.br" target="_blank" rel="noreferrer">
              docspace.tec.br
            </a>
          </p>
        </header>

        <Section title="1. Visão Geral">
          <p>
            O <b>DocSpace.tec</b> permite criar, customizar e compartilhar
            perguntas frequentes em formato sanfona. Cada FAQ é salva na sua
            conta e ganha URL pública compartilhável, API JSON pública e
            snippet de embed.
          </p>
        </Section>

        <Section title="2. Modelos disponíveis">
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
          <ul className="ml-6 mt-2 list-disc space-y-1 text-sm">
            <li>Cor de destaque, perguntas, respostas, fundo e borda</li>
            <li>
              <b>Categorizado:</b> cor de fundo do título e dos itens por
              categoria
            </li>
            <li>
              <b>Acesso Restrito:</b> cor do cadeado, fundo da caixa de login
              e logo da marca na caixa
            </li>
            <li>
              <b>Marca Personalizada:</b> logo + nome no topo
            </li>
            <li>
              <b>Datas Comemorativas:</b> presets prontos (Natal, São João,
              Black Friday, Ano Novo, Namorados, Halloween) — cores editáveis
            </li>
            <li>
              <b>Numerado:</b> sequência 1, 2, 3… para tutoriais
            </li>
            <li>Reordenar perguntas com as setas ↑ ↓ no editor</li>
            <li>Cor de fundo individual por pergunta</li>
            <li>
              Resposta com formatação rica: <b>negrito</b>, <i>itálico</i>,{" "}
              <u>sublinhado</u> e links clicáveis
            </li>
          </ul>
        </Section>

        <Section title="4. Privacidade">
          <p>
            Cada FAQ tem visibilidade <b>pública</b> ou <b>privada</b>. No
            modelo Acesso Restrito, marque a categoria começando com{" "}
            <code>🔒</code> para travar perguntas individuais — visitantes
            veem cadeado com tooltip "Faça login para acessar a FAQ".
          </p>
        </Section>

        <Section title="5. Integração — embed em qualquer site">
          <p>
            <b>Opção A · iframe direto</b> (funciona em WordPress, Wix,
            Webflow, Shopify, HTML puro):
          </p>
          <CodeSample code={`<iframe
  src="${origin}/faq/SEU-ID?embed=1"
  style="width:100%;border:0;min-height:400px"
  title="FAQ DocSpace.tec"
></iframe>`} />

          <p className="mt-4">
            <b>Opção B · snippet JS auto-redimensionável</b> (recomendado):
          </p>
          <CodeSample code={`<div id="docspace-faq" data-id="SEU-ID"></div>
<script src="${origin}/embed.js" defer></script>`} />

          <p className="mt-4">
            <b>WordPress:</b> cole no bloco <i>HTML personalizado</i>, ou use
            o shortcode equivalente do plugin <code>Insert Headers and
            Footers</code>.
          </p>
        </Section>

        <Section title="6. API JSON pública">
          <p>
            Endpoint público (CORS liberado) — perfeito para sites estáticos,
            Next.js, Astro, Hugo ou Jamstack:
          </p>
          <CodeSample code={`GET ${origin}/api/public/faqs/SEU-ID

{
  "id": "...",
  "title": "Minha FAQ",
  "template": "categorized",
  "config": { "accentColor": "#6366f1", ... },
  "items": [
    { "id":"1", "category":"Geral", "question":"...", "answer":"..." }
  ]
}`} />
          <p className="mt-3">
            Apenas FAQs com <code>visibility = public</code> são expostas.
            Privadas exigem login pelo painel.
          </p>
        </Section>

        <Section title="7. Self-hosted — armazenar no seu próprio servidor">
          <p>
            O modelo de dados é simples e portável. Você pode replicar o
            schema em Supabase próprio, Postgres, MySQL, Firebase, GitHub
            (JSON em repo) ou qualquer storage:
          </p>
          <CodeSample code={`-- Tabela compatível
create table faqs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  template text not null,   -- categorized | shareable | rich-media | private | branded | numbered | seasonal
  visibility text not null, -- public | private
  config jsonb not null default '{}',
  items jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);`} />
          <p className="mt-3">
            Versão <b>Self-Hosted Pack</b> (em breve): exporta a FAQ como JSON
            + componente React drop-in para você hospedar onde quiser
            (Supabase próprio, GitHub Pages, Vercel, etc.).
          </p>
        </Section>

        <Section title="8. Autenticação">
          <p>
            Login por e-mail/senha ou Google. Sessão persistida no navegador
            e renovada automaticamente.
          </p>
        </Section>

        <Section title="9. Fluxo recomendado">
          <ol className="ml-6 list-decimal space-y-1 text-sm">
            <li>Criar conta em <code>/auth</code></li>
            <li>Clicar em "Nova FAQ" no dashboard</li>
            <li>Editar conteúdo + estilo (basta clicar em qualquer campo)</li>
            <li>Reordenar com ↑ ↓ se precisar</li>
            <li>Salvar e copiar URL pública, embed ou API</li>
          </ol>
        </Section>

        <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          DocSpace.tec é uma marca registrada. Conteúdo desta documentação ©{" "}
          {new Date().getFullYear()} DocSpace.tec — todos os direitos
          reservados.
        </footer>
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

function CodeSample({ code }: { code: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
      <code>{code}</code>
    </pre>
  );
}
