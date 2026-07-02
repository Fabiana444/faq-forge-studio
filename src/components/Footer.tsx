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
          <div className="w-full max-w-3xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
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
            <div className="flex-1 overflow-y-auto p-6 prose prose-sm max-w-none dark:prose-invert">
              {activeTab === "terms" && <TermsContent />}
              {activeTab === "privacy" && <PrivacyContent />}
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
      <div>
        <h2 className="text-xl font-bold mb-2">TERMOS DE USO – DOCSPACE FAQ</h2>
        <p className="text-xs text-muted-foreground mb-4">Última atualização: Julho de 2026</p>
      </div>

      <section>
        <h3 className="font-semibold">1. SOBRE O SERVIÇO</h3>
        <p>O DocSpace FAQ é uma plataforma de software como serviço (SaaS) destinada à criação, organização, personalização e disponibilização de FAQs (Perguntas Frequentes) em formato interativo.</p>
      </section>

      <section>
        <h3 className="font-semibold">2. CADASTRO E ACESSO</h3>
        <p>O usuário compromete-se a fornecer informações verdadeiras, completas e atualizadas durante o processo de cadastro. O usuário é exclusivamente responsável pela guarda de suas credenciais de acesso (e-mail e senha) e pelas atividades realizadas em sua conta.</p>
      </section>

      <section>
        <h3 className="font-semibold">3. PLANOS, ASSINATURAS E PAGAMENTOS</h3>
        <p><strong>Plano Gratuito (Trial):</strong></p>
        <ul className="ml-4 space-y-1">
          <li>Duração: 7 dias</li>
          <li>Limite: 1 FAQ por modelo (máximo 7 FAQs)</li>
          <li>Limite de perguntas: 5 perguntas por FAQ</li>
        </ul>
        <p className="mt-2"><strong>Planos Pagos:</strong> Começam a partir de R$ 30,00/mês com acesso ilimitado.</p>
      </section>

      <section>
        <h3 className="font-semibold">4. CONTEÚDO DO USUÁRIO</h3>
        <p>Todo conteúdo inserido na plataforma é de responsabilidade exclusiva do usuário. O usuário declara possuir todos os direitos, permissões e autorizações necessárias para utilização e publicação dos conteúdos inseridos.</p>
      </section>

      <section>
        <h3 className="font-semibold">5. USOS PROIBIDOS</h3>
        <p>É expressamente proibido utilizar a plataforma para: atividades ilícitas, spam, phishing, malware, fraude, golpes, coleta indevida de dados, violação de direitos autorais, assédio, discriminação, conteúdo pornográfico ou violento, ou qualquer atividade que comprometa a segurança da plataforma.</p>
      </section>

      <section>
        <h3 className="font-semibold">6. ARMAZENAMENTO E BACKUP</h3>
        <p>Os conteúdos criados pelos usuários serão armazenados nos servidores do DocSpace FAQ. Em caso de exclusão de conta, os dados poderão ser mantidos por até 30 dias antes de serem permanentemente deletados.</p>
      </section>

      <section>
        <h3 className="font-semibold">7. CANCELAMENTO E EXCLUSÃO DE CONTA</h3>
        <p>O usuário poderá cancelar sua assinatura a qualquer momento, sem multas ou penalidades. Após cancelamento, o acesso à plataforma será removido imediatamente.</p>
      </section>

      <section>
        <h3 className="font-semibold">8. LIMITAÇÃO DE RESPONSABILIDADE</h3>
        <p>O DocSpace FAQ fornece a plataforma "como está", sem garantias de qualquer tipo. O DocSpace FAQ não é responsável por perda de dados, interrupções de serviço, ou conteúdo criado por usuários.</p>
      </section>

      <section>
        <h3 className="font-semibold">9. CONTATO</h3>
        <p>Para dúvidas ou suporte: <strong>contato@docspace.tec.br</strong></p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h2 className="text-xl font-bold mb-2">POLÍTICA DE PRIVACIDADE – DOCSPACE FAQ</h2>
        <p className="text-xs text-muted-foreground mb-4">Última atualização: Julho de 2026</p>
      </div>

      <section>
        <h3 className="font-semibold">1. DADOS COLETADOS</h3>
        <p>Poderão ser coletados dados necessários para utilização da plataforma, incluindo: nome completo, e-mail, telefone, identificadores de autenticação, registros de acesso, endereço IP, informações do navegador e dispositivo, logs técnicos, e conteúdos criados pelo usuário.</p>
      </section>

      <section>
        <h3 className="font-semibold">2. FINALIDADES DO TRATAMENTO</h3>
        <p>Os dados poderão ser utilizados para: permitir acesso à plataforma, autenticar usuários, administrar contas, fornecer suporte, processar pagamentos, prevenir fraudes, garantir segurança, cumprir obrigações legais, e melhorar funcionalidades da plataforma.</p>
      </section>

      <section>
        <h3 className="font-semibold">3. COMPARTILHAMENTO DE DADOS</h3>
        <p>O DocSpace FAQ não comercializa dados pessoais. Os dados poderão ser compartilhados apenas quando necessário para prestação dos serviços, autenticação, hospedagem, processamento de pagamentos, cumprimento de obrigações legais, ou atendimento de determinações judiciais.</p>
      </section>

      <section>
        <h3 className="font-semibold">4. SEGURANÇA DAS INFORMAÇÕES</h3>
        <p>São adotadas medidas técnicas e organizacionais razoáveis destinadas à proteção dos dados tratados. A transmissão de dados utiliza criptografia SSL/TLS. O usuário também é responsável por proteger suas credenciais de acesso.</p>
      </section>

      <section>
        <h3 className="font-semibold">5. RETENÇÃO DOS DADOS</h3>
        <p>Os dados poderão ser mantidos pelo período necessário para execução do contrato, prestação dos serviços, cumprimento de obrigações legais, e prevenção a fraudes. Em caso de exclusão de conta, os dados pessoais serão deletados em até 30 dias.</p>
      </section>

      <section>
        <h3 className="font-semibold">6. DIREITOS DO TITULAR (LGPD)</h3>
        <p>O titular poderá solicitar: confirmação de tratamento, acesso aos dados, correção, anonimização, bloqueio ou eliminação de dados, informações sobre compartilhamento, e revogação de consentimento.</p>
      </section>

      <section>
        <h3 className="font-semibold">7. COOKIES E TECNOLOGIAS SEMELHANTES</h3>
        <p>A plataforma poderá utilizar cookies para autenticação, funcionamento do sistema, segurança, personalização da experiência, e análise de desempenho. A desativação de cookies poderá afetar determinadas funcionalidades.</p>
      </section>

      <section>
        <h3 className="font-semibold">8. TRANSFERÊNCIA INTERNACIONAL DE DADOS</h3>
        <p>Determinados fornecedores poderão armazenar ou processar dados em servidores fora do Brasil. Nesses casos, serão adotadas medidas compatíveis com os requisitos da LGPD e padrões razoáveis de segurança.</p>
      </section>

      <section>
        <h3 className="font-semibold">9. CONTATO PARA ASSUNTOS DE PRIVACIDADE</h3>
        <p>Para assuntos relacionados à privacidade ou exercício de direitos LGPD: <strong>contato@docspace.tec.br</strong></p>
      </section>
    </div>
  );
}
