import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  return (
    <>
      <footer className="border-t border-border bg-muted/30 py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <button
              onClick={() => {
                setActiveTab("terms");
                setShowTerms(true);
              }}
              className="hover:text-primary transition-colors underline"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setActiveTab("privacy");
                setShowPrivacy(true);
              }}
              className="hover:text-primary transition-colors underline"
            >
              Política de Privacidade
            </button>
            <span>•</span>
            <a
              href="mailto:contato@docspace.tec.br"
              className="hover:text-primary transition-colors underline"
            >
              contato@docspace.tec.br
            </a>
          </div>
        </div>
      </footer>

      {(showTerms || showPrivacy) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl border border-border bg-card shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header com Abas */}
            <div className="flex items-center justify-between border-b border-border p-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("terms")}
                  className={`pb-2 font-semibold transition-colors ${
                    activeTab === "terms"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Termos de Uso
                </button>
                <button
                  onClick={() => setActiveTab("privacy")}
                  className={`pb-2 font-semibold transition-colors ${
                    activeTab === "privacy"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Política de Privacidade
                </button>
              </div>
              <button
                onClick={() => {
                  setShowTerms(false);
                  setShowPrivacy(false);
                }}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "terms" && (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <h2>Termos de Uso</h2>
                  <p className="text-xs text-muted-foreground">
                    Última atualização: Julho de 2026
                  </p>
                  <TermsContent />
                </div>
              )}
              {activeTab === "privacy" && (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <h2>Política de Privacidade</h2>
                  <p className="text-xs text-muted-foreground">
                    Última atualização: Julho de 2026
                  </p>
                  <PrivacyContent />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TermsContent() {
  return (
    <div className="space-y-4 text-sm">
      <section>
        <h3>1. SOBRE O SERVIÇO</h3>
        <p>
          O DocSpace FAQ é uma plataforma de software como serviço (SaaS) destinada à criação, 
          organização, personalização e disponibilização de FAQs (Perguntas Frequentes) em formato interativo.
        </p>
      </section>
      <section>
        <h3>2. CADASTRO E ACESSO</h3>
        <p>
          O usuário compromete-se a fornecer informações verdadeiras, completas e atualizadas. 
          O usuário é exclusivamente responsável pela guarda de suas credenciais e pelas atividades 
          realizadas em sua conta.
        </p>
      </section>
      <section>
        <h3>3. PLANOS, ASSINATURAS E PAGAMENTOS</h3>
        <p>
          A plataforma poderá disponibilizar planos gratuitos, promocionais ou pagos. 
          As funcionalidades disponíveis dependerão do plano contratado.
        </p>
      </section>
      <section>
        <h3>4. CONTEÚDO DO USUÁRIO</h3>
        <p>
          Todo conteúdo inserido na plataforma é de responsabilidade exclusiva do usuário. 
          O usuário declara possuir todos os direitos, permissões e autorizações necessários 
          para utilização e publicação dos conteúdos inseridos.
        </p>
      </section>
      <section>
        <h3>5. USOS PROIBIDOS</h3>
        <p>
          É expressamente proibido utilizar a plataforma para atividades ilícitas, violação de legislação, 
          spam, phishing, malware, fraude, golpes, coleta indevida de dados, ou qualquer atividade que 
          comprometa a segurança da plataforma.
        </p>
      </section>
      <p className="text-xs text-muted-foreground pt-4">
        Para ver o documento completo, acesse contato@docspace.tec.br
      </p>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-4 text-sm">
      <section>
        <h3>1. DADOS COLETADOS</h3>
        <p>
          Poderão ser coletados dados necessários para utilização da plataforma, incluindo nome, 
          e-mail, telefone, identificadores de autenticação, registros de acesso e logs técnicos.
        </p>
      </section>
      <section>
        <h3>2. FINALIDADES DO TRATAMENTO</h3>
        <p>
          Os dados poderão ser utilizados para permitir acesso, autenticar usuários, administrar contas, 
          fornecer suporte, processar pagamentos, prevenir fraudes e garantir a segurança do sistema.
        </p>
      </section>
      <section>
        <h3>3. COMPARTILHAMENTO DE DADOS</h3>
        <p>
          O DocSpace FAQ não comercializa dados pessoais. Os dados poderão ser compartilhados apenas 
          quando necessário para prestação dos serviços, cumprimento de obrigações legais ou atendimento 
          de determinações judiciais.
        </p>
      </section>
      <section>
        <h3>4. SEGURANÇA DAS INFORMAÇÕES</h3>
        <p>
          São adotadas medidas técnicas e organizacionais razoáveis para proteção dos dados. 
          O usuário também é responsável por proteger suas credenciais de acesso.
        </p>
      </section>
      <section>
        <h3>5. DIREITOS DO TITULAR (LGPD)</h3>
        <p>
          O titular poderá solicitar confirmação de tratamento, acesso aos dados, correção, 
          anonimização, bloqueio ou eliminação de dados. Solicitações devem ser encaminhadas 
          para contato@docspace.tec.br
        </p>
      </section>
      <p className="text-xs text-muted-foreground pt-4">
        Para ver o documento completo, acesse contato@docspace.tec.br
      </p>
    </div>
  );
}
