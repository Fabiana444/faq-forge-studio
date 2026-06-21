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
import { ScrollArea } from "@/components/ui/scroll-area";

export function TermsModal() {
  const { user, profile, refreshProfile } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showFullPolicy, setShowFullPolicy] = useState(false);

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
      <DialogContent className="max-w-2xl [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl">Termos de Uso e Política de Privacidade</DialogTitle>
          <DialogDescription>
            Para garantir a segurança dos seus dados e a qualidade do nosso serviço, leia e aceite as condições abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] rounded-md border border-border p-4 bg-muted/30">
          <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
            <section>
              <h3 className="font-bold text-foreground">1. Definição do Serviço (DocSpace FAQ)</h3>
              <p>O DocSpace.tec FAQ é uma plataforma de software como serviço (SaaS) que permite a criação, personalização e hospedagem de centrais de ajuda e FAQs interativas.</p>
            </section>

            <section>
              <h3 className="font-bold text-foreground">2. Planos e Assinaturas</h3>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Plano Gratuito (Trial):</strong> Acesso por 7 dias, limitado a 1 FAQ por modelo (máximo 9 FAQs no total).</li>
                <li><strong>Planos Pagos:</strong> Assinatura recorrente de R$30,00/mês para uso ilimitado das funcionalidades contratadas.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-foreground">3. LGPD e Privacidade de Dados</h3>
              <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018):</p>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Coleta:</strong> Coletamos e-mail, nome e número de celular para autenticação e segurança.</li>
                <li><strong>Direito ao Esquecimento:</strong> Você pode solicitar a exclusão total de seus dados a qualquer momento através do suporte.</li>
                <li><strong>Retenção:</strong> Após o cancelamento, os dados são mantidos por 30 dias antes da exclusão definitiva.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-foreground text-destructive">4. Proibições e Uso Indevido</h3>
              <p>É estritamente proibido ao usuário:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Publicar conteúdo ilegal, ofensivo, discriminatório ou que viole direitos autorais.</li>
                <li>Utilizar a API para ataques de negação de serviço ou spam.</li>
                <li>Tentar burlar as travas de segurança ou limites do plano trial.</li>
                <li>Hospedar conteúdo malicioso (phishing) através das FAQs públicas.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-foreground">5. Responsabilidade e Backup</h3>
              <p>O DocSpace.tec fornece a ferramenta técnica, mas o conteúdo é de responsabilidade exclusiva do usuário. Recomendamos a exportação regular de seus dados via API JSON, embora realizemos backups diários de segurança.</p>
            </section>

            <section>
              <h3 className="font-bold text-foreground">6. Cancelamento e Reembolso</h3>
              <p>O cancelamento pode ser feito a qualquer momento sem multa. Por se tratar de um serviço de consumo imediato, reembolsos são analisados individualmente conforme o Código de Defesa do Consumidor.</p>
            </section>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">Última atualização: 20 de Junho de 2026. © DocSpace.tec - Todos os direitos reservados.</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-start gap-3 py-2">
          <Checkbox 
            id="terms" 
            checked={accepted} 
            onCheckedChange={(v) => setAccepted(!!v)} 
          />
          <label 
            htmlFor="terms" 
            className="text-sm font-medium leading-tight cursor-pointer"
          >
            Li e concordo integralmente com os Termos de Uso e a Política de Privacidade (LGPD) do DocSpace.tec.
          </label>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button 
            className="w-full h-11 text-base font-semibold" 
            disabled={!accepted || busy} 
            onClick={handleAccept}
          >
            {busy ? "Processando..." : "Aceitar e Começar Agora"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
