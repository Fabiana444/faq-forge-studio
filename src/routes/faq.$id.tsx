import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { FaqRenderer } from "@/components/FaqRenderer";
import { AppHeader } from "@/components/AppHeader";
import {
  DEFAULT_CONFIG,
  type FaqConfig,
  type FaqItem,
  type TemplateKey,
} from "@/lib/faq-types";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/faq/$id")({
  head: () => ({ meta: [{ title: "FAQ — Docspace.tec" }] }),
  component: PublicFaq,
});

interface Row {
  id: string;
  title: string;
  template: TemplateKey;
  visibility: "public" | "private";
  config: FaqConfig;
  items: FaqItem[];
  user_id: string;
}

function PublicFaq() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const [row, setRow] = useState<Row | null>(null);
  const [notFound, setNotFound] = useState(false);
  const isEmbed =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("embed") === "1";

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("faqs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!data) setNotFound(true);
      else setRow(data as unknown as Row);
    })();
  }, [id, user]);

  // Post height to parent for iframe embed
  useEffect(() => {
    if (!isEmbed) return;
    const post = () => {
      window.parent.postMessage(
        { type: "docspace:height", height: document.body.scrollHeight },
        "*",
      );
    };
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [isEmbed, row]);

  if (notFound)
    return (
      <Shell embed={isEmbed}>
        <Empty
          icon={<Lock className="h-8 w-8" />}
          title="FAQ não encontrada ou privada"
          desc="O criador desta FAQ definiu o conteúdo como privado. Faça login se você for o autor."
        />
      </Shell>
    );

  if (!row || loading)
    return (
      <Shell embed={isEmbed}>
        <div className="py-20 text-center text-muted-foreground">Carregando…</div>
      </Shell>
    );

  return (
    <Shell embed={isEmbed}>
      {!isEmbed && <h1 className="mb-6 text-3xl font-semibold">{row.title}</h1>}
      <FaqRenderer
        template={row.template}
        items={row.items}
        config={{ ...DEFAULT_CONFIG, ...row.config }}
        isAuthenticated={!!user}
      />
    </Shell>
  );
}

function Shell({ children, embed }: { children: React.ReactNode; embed?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      {!embed && <AppHeader />}
      <main className={embed ? "px-2 py-2" : "mx-auto max-w-3xl px-6 py-10"}>
        {children}
      </main>
    </div>
  );
}


function Empty({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <Link to="/auth" className="mt-4 inline-block">
        <Button>Fazer login</Button>
      </Link>
    </div>
  );
}
