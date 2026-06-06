import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle2, XCircle, ShieldCheck, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pending")({
  head: () => ({ meta: [{ title: "Solicitação de acesso — DocSpace.tec" }] }),
  component: PendingPage,
});

function PendingPage() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && profile?.accessStatus === "approved")
      navigate({ to: "/dashboard" });
  }, [loading, user, profile, navigate]);

  useEffect(() => {
    if (profile?.requestReason) setReason(profile.requestReason);
  }, [profile?.requestReason]);

  if (loading || !user || !profile)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );

  const sendRequest = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ request_reason: reason, requested_at: new Date().toISOString() })
      .eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Solicitação enviada. Avisaremos por e-mail quando aprovada.");
    refreshProfile();
  };

  const status = profile.accessStatus;
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-4">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
              style={{
                background:
                  status === "rejected"
                    ? "color-mix(in oklab, hsl(var(--destructive)) 15%, transparent)"
                    : "color-mix(in oklab, var(--primary) 15%, transparent)",
              }}
            >
              {status === "rejected" ? (
                <XCircle className="h-6 w-6 text-destructive" />
              ) : status === "approved" ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : (
                <Clock className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold">
                {status === "rejected"
                  ? "Solicitação não aprovada"
                  : "Aguardando aprovação"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {status === "rejected"
                  ? "Sua solicitação foi avaliada e não foi aprovada no momento. Você pode revisar a justificativa abaixo e tentar novamente."
                  : "O DocSpace.tec é uma ferramenta comercial. Cada conta passa por uma análise de aprovação antes de liberar a criação e o uso de FAQs (incluindo API, embed e iframe)."}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" /> {profile.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> Status:{" "}
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  background:
                    status === "rejected"
                      ? "color-mix(in oklab, hsl(var(--destructive)) 15%, transparent)"
                      : "color-mix(in oklab, var(--primary) 15%, transparent)",
                  color:
                    status === "rejected" ? "hsl(var(--destructive))" : "var(--primary)",
                }}
              >
                {status === "pending"
                  ? "Em análise"
                  : status === "rejected"
                  ? "Rejeitado"
                  : "Aprovado"}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium">
              Conte para que você quer usar (opcional, ajuda na aprovação)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex.: vou usar para a FAQ do meu site de e-commerce em WordPress…"
              rows={4}
            />
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button onClick={sendRequest} disabled={busy}>
                {status === "rejected" ? "Reenviar solicitação" : "Atualizar solicitação"}
              </Button>
              <Button variant="ghost" onClick={() => signOut()}>
                Sair
              </Button>
              <Button
                variant="ghost"
                onClick={() => refreshProfile().then(() => toast.success("Atualizado"))}
              >
                Verificar status
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
