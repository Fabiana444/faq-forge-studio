import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";
import { Sparkles, Eye, EyeOff, Check, X } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — DocSpace.tec" },
      { name: "description", content: "Faça login ou crie sua conta no DocSpace.tec." },
    ],
  }),
  component: AuthPage,
});

interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/pending" });
  }, [user, loading, navigate]);

  // Validar força da senha em tempo real
  const validatePasswordStrength = (pass: string) => {
    const strength: PasswordStrength = {
      minLength: pass.length >= 8,
      hasUppercase: /[A-Z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    };
    setPasswordStrength(strength);
    return strength;
  };

  const isPasswordStrong = (strength: PasswordStrength) => {
    return strength.minLength && strength.hasUppercase && strength.hasNumber && strength.hasSpecial;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (mode === "signup") {
      validatePasswordStrength(value);
      if (confirmPassword) {
        setPasswordMismatch(value !== confirmPassword);
      }
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordMismatch(password !== value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      // Validar força da senha
      const strength = validatePasswordStrength(password);
      if (!isPasswordStrong(strength)) {
        toast.error("Senha não atende aos requisitos de segurança");
        return;
      }

      // Validar confirmação de senha
      if (password !== confirmPassword) {
        toast.error("As senhas não conferem");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?mode=verify-email`,
            data: {
              email_verified: false,
            },
          },
        });
        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("Este e-mail já está cadastrado");
          }
          if (error.message.includes("rate limit") || error.message.includes("too many")) {
            throw new Error("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
          }
          throw error;
        }
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
        setMode("login");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else if (mode === "login") {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("E-mail ou senha incorretos");
          }
          if (error.message.includes("rate limit") || error.message.includes("too many")) {
            throw new Error("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
          }
          throw error;
        }
        toast.success("Bem-vindo!");
        // Redirecionar após login bem-sucedido
        navigate({ to: "/pending" });
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset-confirm`,
        });
        if (error) {
          if (error.message.includes("not found")) {
            throw new Error("E-mail não encontrado");
          }
          if (error.message.includes("rate limit") || error.message.includes("too many")) {
            throw new Error("Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.");
          }
          throw error;
        }
        toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        setMode("login");
        setEmail("");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao processar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">
            {mode === "login" && "Entrar"}
            {mode === "signup" && "Criar conta"}
            {mode === "reset" && "Recuperar senha"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Para criar e gerenciar suas FAQs
          </p>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          DocSpace.tec FAQ utiliza apenas login seguro por e-mail.
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {/* E-mail */}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Senha */}
          {mode !== "reset" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={mode === "signup" ? "Mínimo 8 caracteres" : "Sua senha"}
                  value={password}
                  onChange={handlePasswordChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Indicador de força de senha (apenas no signup) */}
              {mode === "signup" && (
                <div className="space-y-2 rounded-lg bg-muted p-3 text-xs">
                  <p className="font-medium text-foreground">Validação de senha forte:</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {passwordStrength.minLength ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={passwordStrength.minLength ? "text-green-600" : "text-muted-foreground"}>
                        Mínimo 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordStrength.hasUppercase ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={passwordStrength.hasUppercase ? "text-green-600" : "text-muted-foreground"}>
                        1 letra maiúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordStrength.hasNumber ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={passwordStrength.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                        1 número
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordStrength.hasSpecial ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={passwordStrength.hasSpecial ? "text-green-600" : "text-muted-foreground"}>
                        1 caractere especial (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirmar Senha (apenas no signup) */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`pr-10 ${passwordMismatch && confirmPassword ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordMismatch && confirmPassword && (
                <p className="text-xs text-destructive">As senhas não conferem</p>
              )}
            </div>
          )}

          {/* Botão de envio */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              busy ||
              (mode === "signup" &&
                (!isPasswordStrong(passwordStrength) || password !== confirmPassword || !confirmPassword))
            }
          >
            {busy && <span className="mr-2">Processando...</span>}
            {mode === "login" && "Entrar"}
            {mode === "signup" && "Criar conta"}
            {mode === "reset" && "Enviar link de recuperação"}
          </Button>
        </form>

        {/* Alternar modo */}
        <div className="text-center">
          {mode === "login" && (
            <button
              onClick={() => {
                setMode("signup");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Não tem conta? <span className="font-medium text-primary">Cadastre-se</span>
            </button>
          )}
          {mode === "signup" && (
            <button
              onClick={() => {
                setMode("login");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Já tem conta? <span className="font-medium text-primary">Entrar</span>
            </button>
          )}
          {mode === "reset" && (
            <button
              onClick={() => {
                setMode("login");
                setEmail("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Voltar ao <span className="font-medium text-primary">login</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
