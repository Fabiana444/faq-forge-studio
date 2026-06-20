import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function TermsModal() {
  const { user, profile, refreshProfile } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  // Só mostra se estiver logado e ainda não aceitou os termos
  const open = !!user && profile !== null && !profile.termsAccepted;

  const handleAccept = async () => {
    if (!user || !accepted) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    
    setBusy(false);
    if (error) {
      toast.error("Erro ao aceitar termos: " + error.message);
    } else {
      toast.success("Termos aceitos!");
      refreshProfile();
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Termos de Uso do DocSpace.tec</DialogTitle>
          <DialogDescription>
            Para continuar usando nossa plataforma de FAQs, você precisa aceitar nossos termos de uso e política de privacidade.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[300px] overflow-y-auto rounded-md border border-border p-4 text-sm text-muted-foreground">
          <h3 className="mb-2 font-semibold text-foreground">1. Descrição do Serviço</h3>
          <p className="mb-4">
            O DocSpace.tec FAQ é uma ferramenta SaaS para criação e gestão de perguntas frequentes altamente personalizáveis.
          </p>
          
          <h3 className="mb-2 font-semibold text-foreground">2. Planos e Trial</h3>
          <p className="mb-4">
            Oferecemos um plano gratuito de teste por 7 dias, limitado a 7 FAQs (1 de cada modelo). Planos pagos estão disponíveis por R$30,00/mês para uso ilimitado.
          </p>
          
          <h3 className="mb-2 font-semibold text-foreground">3. Responsabilidade</h3>
          <p className="mb-4">
            O conteúdo das FAQs é de inteira responsabilidade do usuário. O DocSpace.tec não se responsabiliza por informações incorretas ou uso indevido da ferramenta.
          </p>
          
          <h3 className="mb-2 font-semibold text-foreground">4. Cancelamento</h3>
          <p>
            Você pode cancelar sua assinatura a qualquer momento. Seus dados serão mantidos por 30 dias após o término da assinatura.
          </p>
          
          <div className="mt-4">
            <a 
              href="https://docspace.tec.br/termos" 
              target="_blank" 
              rel="noreferrer"
              className="text-primary underline"
            >
              Ler termos completos em nova aba
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3 py-4">
          <Checkbox 
            id="terms" 
            checked={accepted} 
            onCheckedChange={(v) => setAccepted(!!v)} 
          />
          <label 
            htmlFor="terms" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Li e aceito os Termos de Uso e Política de Privacidade do DocSpace.tec FAQ.
          </label>
        </div>

        <DialogFooter>
          <Button 
            className="w-full" 
            disabled={!accepted || busy} 
            onClick={handleAccept}
          >
            {busy ? "Processando..." : "Aceitar e Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
