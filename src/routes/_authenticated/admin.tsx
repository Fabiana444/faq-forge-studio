import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Check, X, ShieldCheck, Clock, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel administrativo — DocSpace.tec" }] }),
  component: AdminPage,
});

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  access_status: "pending" | "approved" | "rejected";
  request_reason: string | null;
  requested_at: string;
  decided_at: string | null;
}

const ADMIN_EMAILS = [
  "fabinonjah@gmail.com",
  "fnonjah@yahoo.com.br",
  "fabiana.nonjah@gmail.com",
];

function AdminPage() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Profile[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    if (!loading && (!user?.email || !ADMIN_EMAILS.includes(user.email))) {
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, navigate]);

  const load = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,display_name,access_status,request_reason,requested_at,decided_at")
      .order("requested_at", { ascending: false });
    if (error) return toast.error(error.message);
    setRows((data as Profile[]) || []);
  };

  useEffect(() => {
    if (profile?.isAdmin) load();
  }, [profile?.isAdmin]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    const { error } = await supabase
      .from("profiles")
      .update({
        access_status: status,
        decided_at: new Date().toISOString(),
      })
      .eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Usuário aprovado" : "Acesso revogado");
    load();
  };

  const filtered = rows.filter((r) => r.access_status === tab);

  if (loading || !user?.email || !ADMIN_EMAILS.includes(user.email))
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );

  const counts = {
    pending: rows.filter((r) => r.access_status === "pending").length,
    approved: rows.filter((r) => r.access_status === "approved").length,
    rejected: rows.filter((r) => r.access_status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">
              Aprove, recuse ou revogue o acesso de quem solicitou usar o DocSpace FAQ.
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="mr-1.5 h-4 w-4" /> Pendentes ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="approved">
              <UserCheck className="mr-1.5 h-4 w-4" /> Aprovados ({counts.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <UserX className="mr-1.5 h-4 w-4" /> Recusados ({counts.rejected})
            </TabsTrigger>
            <div className="ml-auto text-xs text-muted-foreground">
              Acesso restrito a administradores
            </div>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                Nenhum usuário nesta lista.
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">
                          {r.display_name || r.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.email} ·{" "}
                          {r.access_status === "pending"
                            ? `Solicitou ${formatDistanceToNow(new Date(r.requested_at), { locale: ptBR, addSuffix: true })}`
                            : r.decided_at
                            ? `Decidido ${formatDistanceToNow(new Date(r.decided_at), { locale: ptBR, addSuffix: true })}`
                            : ""}
                        </div>
                        {r.request_reason && (
                          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                            <strong className="font-medium text-foreground">
                              Justificativa:
                            </strong>{" "}
                            {r.request_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {r.access_status !== "approved" && (
                          <Button
                            size="sm"
                            disabled={busy === r.id}
                            onClick={() => decide(r.id, "approved")}
                          >
                            <Check className="mr-1 h-4 w-4" /> Aprovar
                          </Button>
                        )}
                        {r.access_status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy === r.id}
                            onClick={() => decide(r.id, "rejected")}
                          >
                            <X className="mr-1 h-4 w-4" />{" "}
                            {r.access_status === "approved" ? "Revogar" : "Recusar"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
