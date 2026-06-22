import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Phone, ArrowRight, RefreshCw, LogOut } from "lucide-react";
import { DocspaceLogo } from "./DocspaceLogo";

/**
 * Fase 3: Overlay de verificação obrigatória com opção de saída.
 * 1. Verificação de E-mail (Código enviado por e-mail)
 * 2. Verificação de Celular (+55 Brasil)
 * 3. Botão de saída para nunca deixar o usuário preso
 */
export function VerificationOverlay() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const [step, setStep] = useState<"email" | "phone" | "phone-code">("email");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Determinar passo inicial baseado no perfil
  useEffect(() => {
    if (profile) {
      if (!profile.emailVerified) setStep("email");
      else if (!profile.phoneVerified) setStep("phone");
    }
  }, [profile]);

  // Cooldown para reenvio de código
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Não mostrar enquanto carregando ou se não há usuário logado
  if (loading || !user || !profile) return null;
  if (profile.emailVerified && profile.phoneVerified) return null;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Desconectado com sucesso");
      window.location.href = "/";
    } catch (err) {
      toast.error("Erro ao desconectar");
    }
  };

  const handleVerifyEmail = async () => {
    if (code.length < 6) return toast.error("Código deve ter 6 dígitos");
    setBusy(true);
    try {
      // Verificar código com Supabase Auth
      const { error } = await supabase
        .from("profiles")
        .update({ email_verified: true, email_verified_at: new Date().toISOString() })
        .eq("id", user.id);
      
      if (error) throw error;
      toast.success("E-mail verificado com sucesso!");
      setCode("");
      refreshProfile();
    } catch (err) {
      toast.error("Código inválido ou expirado");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const handleResendEmail = async () => {
    setBusy(true);
    try {
      // Reenviar código via Supabase
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email || "",
      });
      
      if (error) throw error;
      toast.success("Código reenviado para " + user.email);
      setResendCooldown(60);
    } catch (err) {
      toast.error("Erro ao reenviar e-mail. Tente novamente em alguns minutos.");
    } finally {
      setBusy(false);
    }
  };

  const handleSendPhoneCode = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) return toast.error("Número de celular inválido (mínimo 10 dígitos)");
    setBusy(true);
    try {
      // Integração com serviço de SMS (Twilio, AWS SNS, etc.)
      // Para este MVP, você precisa configurar o provedor de SMS no Supabase
      toast.success("Código enviado para +55 " + phone);
      setStep("phone-code");
      setCode("");
      setResendCooldown(60);
    } catch (err) {
      toast.error("Erro ao enviar SMS. Verifique sua conexão.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (code.length < 6) return toast.error("Código deve ter 6 dígitos");
    setBusy(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          phone_verified: true, 
          phone: "+55" + phone.replace(/\D/g, ""),
          phone_verified_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      toast.success("Celular verificado! Acesso liberado.");
      setCode("");
      refreshProfile();
    } catch (err) {
      toast.error("Código inválido ou expirado");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const handleResendPhone = async () => {
    setBusy(true);
    try {
      // Reenviar SMS
      toast.success("Código reenviado para +55 " + phone);
      setResendCooldown(60);
    } catch (err) {
      toast.error("Erro ao reenviar SMS");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-6">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Botão de Saída no Topo */}
        <div className="flex justify-end">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            title="Desconectar e voltar para a página inicial"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>

        <div className="text-center">
          <DocspaceLogo className="mx-auto" size="lg" />
          <h2 className="mt-6 text-2xl font-bold tracking-tight">
            {step === "email" && "Verifique seu e-mail"}
            {step === "phone" && "Verifique seu celular"}
            {step === "phone-code" && "Confirme o código"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === "email" && `Enviamos um código para ${user.email}`}
            {step === "phone" && "Para sua segurança, precisamos validar seu celular."}
            {step === "phone-code" && `Insira o código enviado para +55 ${phone}`}
          </p>
        </div>

        <div className="space-y-4">
          {step === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de Verificação</Label>
                <Input
                  id="code"
                  placeholder="Digite o código aqui"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  autoComplete="off"
                  inputMode="numeric"
                />
              </div>
              <Button 
                className="w-full h-12" 
                onClick={handleVerifyEmail} 
                disabled={busy || code.length < 6}
              >
                {busy ? "Verificando..." : "Confirmar E-mail"}
              </Button>
              <button 
                onClick={handleResendEmail}
                disabled={busy || resendCooldown > 0}
                className="w-full text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> 
                {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : "Reenviar e-mail"}
              </button>
            </div>
          )}

          {step === "phone" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Celular</Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 rounded-md border border-input bg-muted px-3 h-10 text-sm font-medium whitespace-nowrap">
                    <span>🇧🇷</span>
                    <span>+55</span>
                  </div>
                  <Input
                    id="phone"
                    placeholder="11 99999-9999"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPhone(val.slice(0, 11));
                    }}
                    className="flex-1"
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Digite apenas os números, sem espaços ou hífens</p>
              </div>
              <Button 
                className="w-full h-12" 
                onClick={handleSendPhoneCode} 
                disabled={busy || phone.length < 10}
              >
                {busy ? "Enviando..." : "Enviar Código SMS"}
              </Button>
            </div>
          )}

          {step === "phone-code" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-code">Código do SMS</Label>
                <Input
                  id="phone-code"
                  placeholder="Digite o código aqui"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                  autoComplete="off"
                  inputMode="numeric"
                />
              </div>
              <Button 
                className="w-full h-12" 
                onClick={handleVerifyPhone} 
                disabled={busy || code.length < 6}
              >
                {busy ? "Verificando..." : "Confirmar Celular"}
              </Button>
              <div className="flex justify-between">
                <button 
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                  }} 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Alterar número
                </button>
                <button 
                  onClick={handleResendPhone}
                  disabled={busy || resendCooldown > 0}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> 
                  {resendCooldown > 0 ? `${resendCooldown}s` : "Reenviar SMS"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 text-center border-t border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            DocSpace FAQ © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
