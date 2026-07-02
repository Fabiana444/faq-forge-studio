import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Lock, Globe, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DEFAULT_CONFIG, DEFAULT_ITEMS, TEMPLATE_META } from "@/lib/faq-types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Minhas FAQs — DocSpace.tec" }] }),
  component: Dashboard,
});

interface Row {
  id: string;
  title: string;
  template: string;
  visibility: string;
  updated_at: string;
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("id,title,template,visibility,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      
      if (error) {
        toast.error("Erro ao carregar FAQs: " + error.message);
        setRows([]);
      } else {
        setRows((data as Row[]) || []);
      }
    } catch (err) {
      toast.error("Erro ao carregar FAQs");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id]);

  const create = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("faqs")
        .insert({
          user_id: user.id,
          title: "Minha FAQ",
          template: "categorized",
          visibility: "public",
          config: DEFAULT_CONFIG as any,
          items: DEFAULT_ITEMS as any,
        })
        .select("id")
        .single();
      
      if (error) {
        toast.error("Erro ao criar FAQ: " + error.message);
        return;
      }
      
      navigate({ to: "/builder/$id", params: { id: data.id } });
    } catch (err) {
      toast.error("Erro ao criar FAQ");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta FAQ? Esta ação não pode ser desfeita.")) return;
    
    setDeleting(id);
    try {
      const { error } = await supabase
        .from("faqs")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);
      
      if (error) {
        toast.error("Erro ao excluir: " + error.message);
        setDeleting(null);
        return;
      }
      
      // Remover do estado local imediatamente
      setRows(rows.filter(r => r.id !== id));
      toast.success("FAQ excluída com sucesso");
    } catch (err) {
      toast.error("Erro inesperado ao excluir FAQ");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Minhas FAQs</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie e edite suas perguntas frequentes
              </p>
            </div>
            <Button onClick={create}>
              <Plus className="mr-2 h-4 w-4" /> Nova FAQ
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar FAQs por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">Nenhuma FAQ ainda</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie sua primeira FAQ em segundos
            </p>
            <Button className="mt-4" onClick={create}>
              <Plus className="mr-2 h-4 w-4" /> Criar agora
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {rows
              .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition hover:shadow-[var(--shadow-soft)]"
              >
                <Link
                  to="/builder/$id"
                  params={{ id: r.id }}
                  className="flex-1"
                >
                  <div className="font-medium">{r.title}</div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{TEMPLATE_META[r.template as keyof typeof TEMPLATE_META]?.name || r.template}</span>
                    <span className="inline-flex items-center gap-1">
                      {r.visibility === "private" ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Globe className="h-3 w-3" />
                      )}
                      {r.visibility}
                    </span>
                  </div>

                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(r.id)}
                  disabled={deleting === r.id}
                >
                  <Trash2 className={`h-4 w-4 ${deleting === r.id ? "opacity-50" : ""}`} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
