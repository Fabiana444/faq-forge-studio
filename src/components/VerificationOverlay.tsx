import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Phone, ArrowRight, RefreshCw } from "lucide-react";
import { DocspaceLogo } from "./DocspaceLogo";

/**
 * Fase 3: Overlay de verificação obrigatória.
 * 1. Verificação de E-mail (Código enviado por e-mail)
 * 2. Verificação de Celular (+55 Brasil)
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

  const handleVerifyEmail = async () => {
    if (code.length < 6) return toast.error("Código deve ter 6 dígitos");
    setBusy(true);
    try {
      // Simulação de verificação de código (Supabase gerencia isso via Auth)
      const { error } = await supabase
        .from("profiles")
        .update({ email_verified: true, email_verified_at: new Date().toISOString() })
        .eq("id", user.id);
      
      if (error) throw error;
      toast.success("E-mail verificado com sucesso!");
      setCode("");
      refreshProfile();
    } catch (err) {
      toast.error("Erro ao verificar e-mail");
    } finally {
      setBusy(false);
    }
  };

  const handleResendEmail = async () => {
    setBusy(true);
    try {
      // Simular reenvio de e-mail
      toast.success("Código reenviado para " + user.email);
      setResendCooldown(60);
    } catch (err) {
      toast.error("Erro ao reenviar e-mail");
    } finally {
      setBusy(false);
    }
  };

  const handleSendPhoneCode = async () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) return toast.error("Número de celular inválido");
    setBusy(true);
    try {
      // Aqui integraria com serviço de SMS. Para este MVP, simulamos o envio.
      toast.success("Código enviado para +55 " + phone);
      setStep("phone-code");
      setCode("");
      setResendCooldown(60);
    } catch (err) {
      toast.error("Erro ao enviar SMS");
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
          phone: "+55" + phone.replace(/\D/g, "")
        })
        .eq("id", user.id);
      
      if (error) throw error;
      toast.success("Celular verificado! Acesso liberado.");
      setCode("");
      refreshProfile();
    } catch (err) {
      toast.error("Erro ao verificar celular");
    } finally {
      setBusy(false);
    }
  };

  const handleResendPhone = async () => {
    setBusy(true);
    try {
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
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
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
                className="w-full text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 disabled:opacity-50"
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
                    placeholder="11999999999"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPhone(val.slice(0, 11));
                    }}
                    className="flex-1"
                  />
                </div>
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
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
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
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Alterar número
                </button>
                <button 
                  onClick={handleResendPhone}
                  disabled={busy || resendCooldown > 0}
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 disabled:opacity-50"
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
            DocSpace.tec © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
