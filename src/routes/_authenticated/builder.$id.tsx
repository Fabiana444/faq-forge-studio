import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { FaqEditor } from "@/components/FaqEditor";
import {
  DEFAULT_CONFIG,
  type FaqDocument,
  type TemplateKey,
} from "@/lib/faq-types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/builder/$id")({
  head: () => ({ meta: [{ title: "Editor — DocSpace.tec" }] }),
  component: Builder,
});

function Builder() {
  const { id } = Route.useParams();
  const [doc, setDoc] = useState<FaqDocument | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      setDoc({
        id: data.id,
        title: data.title,
        template: data.template as TemplateKey,
        visibility: data.visibility as "public" | "private",
        config: { ...DEFAULT_CONFIG, ...(data.config as object) },
        items: data.items as unknown as FaqDocument["items"],
      });
    })();
  }, [id]);

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (!doc) return;
    const interval = setInterval(() => {
      save();
    }, 30000);
    return () => clearInterval(interval);
  }, [doc, publicUrl]);

  const save = async () => {
    if (!doc) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("faqs")
        .update({
          title: doc.title,
          template: doc.template,
          visibility: doc.visibility,
          config: doc.config as any,
          items: doc.items as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      setSaving(false);
      if (error) {
        toast.error("Erro ao salvar: " + error.message);
      } else {
        setLastSaved(new Date());
        toast.success("Salvo com sucesso");
      }
    } catch (err) {
      setSaving(false);
      toast.error("Erro ao salvar: " + (err instanceof Error ? err.message : "Desconhecido"));
    }
  };

  if (!doc)
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="py-20 text-center text-muted-foreground">Carregando…</div>
      </div>
    );

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/faq/${id}` : "";



  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Última atualização: {lastSaved.toLocaleTimeString("pt-BR")}
            </span>
          )}
        </div>
        <FaqEditor
          doc={doc}
          onChange={setDoc}
          onSave={save}
          saving={saving}
          publicUrl={publicUrl}
        />
      </main>
    </div>
  );
}
