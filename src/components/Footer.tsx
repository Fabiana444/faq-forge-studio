import { useState } from "react";
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
          <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
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
            <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed">
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
    <div className="space-y-4 whitespace-pre-wrap text-xs">
      <h2 className="text-lg font-bold">TERMOS DE USO – DOCSPACE FAQ</h2>
      <p className="text-muted-foreground">Última atualização: Julho de 2026</p>
      
      <p>Bem-vindo ao DocSpace FAQ.</p>
      
      <p>Estes Termos de Uso regulam o acesso e a utilização da plataforma DocSpace FAQ. Ao criar uma conta, acessar ou utilizar a plataforma, o usuário declara ter lido, compreendido e aceitado integralmente as condições descritas neste documento.</p>
      
      <p>Caso não concorde com estes Termos, o usuário não deverá utilizar a plataforma.</p>

      <section>
        <h3 className="font-semibold">1. SOBRE O SERVIÇO</h3>
        <p>O DocSpace FAQ é uma plataforma de software como serviço (SaaS) destinada à criação, organização, personalização e disponibilização de FAQs (Perguntas Frequentes) em formato interativo.</p>
        <p>A plataforma permite que usuários criem, editem, publiquem e integrem FAQs em websites, landing pages, aplicações, portais corporativos e outros ambientes compatíveis, utilizando os recursos disponibilizados pelo sistema.</p>
        <p>O DocSpace FAQ não fornece hospedagem de websites, domínios, e-mails corporativos ou infraestrutura de terceiros.</p>
        <p>A publicação e utilização das FAQs em ambientes externos são de responsabilidade exclusiva do usuário.</p>
      </section>

      <section>
        <h3 className="font-semibold">2. CADASTRO E ACESSO</h3>
        <p>Para utilizar determinados recursos da plataforma poderá ser necessário criar uma conta.</p>
        <p>O usuário compromete-se a fornecer informações verdadeiras, completas e atualizadas.</p>
        <p>O usuário é exclusivamente responsável:
- pela guarda de suas credenciais;
- pela confidencialidade de login e senha;
- pelas atividades realizadas em sua conta.</p>
        <p>O compartilhamento de credenciais com terceiros não é recomendado e poderá comprometer a segurança da conta.</p>
        <p>O DocSpace FAQ não se responsabiliza por acessos indevidos decorrentes de negligência do próprio usuário.</p>
      </section>

      <section>
        <h3 className="font-semibold">3. PLANOS, ASSINATURAS E PAGAMENTOS</h3>
        <p>A plataforma poderá disponibilizar planos gratuitos, promocionais ou pagos.</p>
        <p>As funcionalidades disponíveis dependerão do plano contratado.</p>
        <p>Os recursos pagos permanecerão disponíveis exclusivamente durante a vigência da assinatura ativa e adimplente.</p>
        <p>Enquanto os pagamentos estiverem em dia, o usuário poderá utilizar os recursos correspondentes ao plano contratado.</p>
        <p>Em caso de:
- inadimplência;
- cancelamento;
- estorno;
- fraude;
- falha de cobrança;
- violação destes Termos;
o acesso poderá ser suspenso, limitado ou cancelado.</p>
        <p>O usuário poderá solicitar alteração ou cancelamento de plano a qualquer momento.</p>
        <p>O cancelamento interrompe futuras cobranças, permanecendo o acesso ativo até o encerramento do período já pago, quando aplicável.</p>
        <p>Os preços, funcionalidades e características dos planos poderão ser alterados para novas contratações a qualquer momento.</p>
      </section>

      <section>
        <h3 className="font-semibold">4. CONTEÚDO DO USUÁRIO</h3>
        <p>Todo conteúdo inserido na plataforma é de responsabilidade exclusiva do usuário.</p>
        <p>Isso inclui, entre outros:
- perguntas;
- respostas;
- textos;
- imagens;
- links;
- documentos;
- materiais incorporados;
- informações disponibilizadas em FAQs.</p>
        <p>O usuário declara possuir todos os direitos, permissões e autorizações necessários para utilização e publicação dos conteúdos inseridos.</p>
        <p>O DocSpace FAQ não realiza validação jurídica, regulatória, fiscal, comercial ou técnica dos conteúdos cadastrados.</p>
      </section>

      <section>
        <h3 className="font-semibold">5. PROPRIEDADE INTELECTUAL</h3>
        <p>Todo conteúdo criado ou inserido pelo usuário permanece sob sua titularidade e responsabilidade.</p>
        <p>O DocSpace FAQ não reivindica propriedade sobre os conteúdos cadastrados pelos usuários.</p>
        <p>Para viabilizar a prestação dos serviços, o usuário concede ao DocSpace FAQ autorização limitada, não exclusiva e revogável para:
- armazenar;
- processar;
- transmitir;
- exibir;
os conteúdos cadastrados exclusivamente para execução das funcionalidades da plataforma.</p>
        <p>O software, marca, identidade visual, documentação, banco de dados, funcionalidades, código-fonte, APIs, modelos e demais ativos relacionados ao DocSpace FAQ permanecem protegidos pela legislação aplicável de propriedade intelectual.</p>
        <p>Nenhuma disposição destes Termos transfere ao usuário direitos de propriedade sobre a plataforma.</p>
      </section>

      <section>
        <h3 className="font-semibold">6. USOS PROIBIDOS</h3>
        <p>É expressamente proibido utilizar a plataforma para:
- atividades ilícitas;
- violação da legislação brasileira ou internacional aplicável;
- envio de spam;
- phishing;
- engenharia social;
- disseminação de malware;
- distribuição de vírus ou códigos maliciosos;
- violação de direitos autorais;
- utilização indevida de marcas de terceiros;
- fraude;
- golpes;
- atividades enganosas;
- coleta indevida de dados pessoais;
- tentativa de acesso não autorizado a sistemas;
- exploração de vulnerabilidades;
- ataques automatizados;
- engenharia reversa;
- scraping não autorizado;
- utilização abusiva das APIs disponibilizadas;
- qualquer atividade que comprometa a segurança ou estabilidade da plataforma.</p>
        <p>O DocSpace FAQ poderá suspender ou encerrar contas que apresentem indícios de uso indevido, sem aviso prévio.</p>
        <p>Quando aplicável, o DocSpace FAQ poderá colaborar com autoridades competentes para investigação de atividades ilícitas.</p>
      </section>

      <section>
        <h3 className="font-semibold">7. DISPONIBILIDADE DO SERVIÇO</h3>
        <p>O DocSpace FAQ envidará esforços razoáveis para manter seus serviços disponíveis.</p>
        <p>Entretanto, não garante funcionamento ininterrupto ou livre de falhas.</p>
        <p>Poderão ocorrer interrupções decorrentes de:
- manutenção;
- atualização de sistemas;
- falhas de infraestrutura;
- indisponibilidade de serviços de terceiros;
- incidentes de segurança;
- caso fortuito;
- força maior.</p>
      </section>

      <section>
        <h3 className="font-semibold">8. SERVIÇOS DE TERCEIROS</h3>
        <p>O funcionamento da plataforma poderá depender de serviços fornecidos por terceiros, incluindo provedores de:
- hospedagem;
- autenticação;
- infraestrutura em nuvem;
- banco de dados;
- envio de e-mails;
- processamento de pagamentos;
- monitoramento;
- segurança.</p>
        <p>O DocSpace FAQ não se responsabiliza por falhas, indisponibilidades ou limitações decorrentes desses serviços.</p>
      </section>

      <section>
        <h3 className="font-semibold">9. LIMITAÇÃO DE RESPONSABILIDADE</h3>
        <p>A plataforma é disponibilizada no estado em que se encontra.</p>
        <p>O DocSpace FAQ não garante:
- adequação a objetivos específicos do usuário;
- ausência de erros;
- disponibilidade contínua;
- resultados comerciais;
- geração de receita;
- conformidade regulatória dos conteúdos criados.</p>
        <p>O DocSpace FAQ não será responsável por:
- perdas financeiras;
- perda de receita;
- perda de oportunidades de negócio;
- danos indiretos;
- danos emergentes;
- danos morais;
- perda de dados causada por terceiros;
- decisões tomadas com base em conteúdos cadastrados pelos usuários.</p>
        <p>Em nenhuma hipótese a responsabilidade total do DocSpace FAQ excederá o valor efetivamente pago pelo usuário nos 12 (doze) meses anteriores ao evento que originar eventual reclamação.</p>
      </section>

      <section>
        <h3 className="font-semibold">10. SUSPENSÃO E ENCERRAMENTO DE CONTAS</h3>
        <p>O DocSpace FAQ poderá suspender, restringir ou encerrar contas que:
- violem estes Termos;
- utilizem a plataforma de forma abusiva;
- coloquem em risco a segurança do sistema;
- pratiquem atividades fraudulentas;
- utilizem a plataforma para fins ilícitos.</p>
        <p>O encerramento poderá ocorrer sem aviso prévio quando necessário para preservação da segurança da plataforma ou cumprimento de obrigações legais.</p>
      </section>

      <section>
        <h3 className="font-semibold">11. ALTERAÇÕES DA PLATAFORMA E DOS TERMOS</h3>
        <p>O DocSpace FAQ poderá modificar:
- funcionalidades;
- planos;
- recursos;
- integrações;
- características técnicas;
- Termos de Uso;
a qualquer momento.</p>
        <p>A versão vigente permanecerá disponível para consulta na plataforma.</p>
        <p>O uso continuado da plataforma após a publicação das alterações será considerado como concordância com as novas condições.</p>
      </section>

      <section>
        <h3 className="font-semibold">12. COMUNICAÇÃO E SUPORTE</h3>
        <p>As comunicações oficiais do DocSpace FAQ poderão ocorrer por:
- e-mail;
- notificações na plataforma;
- canais oficiais disponibilizados pelo serviço.</p>
        <p>O canal oficial de suporte é: contato@docspace.tec.br</p>
      </section>

      <section>
        <h3 className="font-semibold">13. LEGISLAÇÃO APLICÁVEL</h3>
        <p>Estes Termos são regidos pelas leis da República Federativa do Brasil.</p>
        <p>Ao utilizar a plataforma, o usuário declara ter lido, compreendido e concordado integralmente com estes Termos de Uso.</p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-4 whitespace-pre-wrap text-xs">
      <h2 className="text-lg font-bold">POLÍTICA DE PRIVACIDADE – DOCSPACE FAQ</h2>
      <p className="text-muted-foreground">Última atualização: Julho de 2026</p>

      <p>Esta Política de Privacidade descreve como o DocSpace FAQ realiza o tratamento de dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD).</p>
      <p>Ao utilizar a plataforma, o usuário declara estar ciente das práticas descritas neste documento.</p>

      <section>
        <h3 className="font-semibold">1. DADOS COLETADOS</h3>
        <p>Poderão ser coletados dados necessários para utilização da plataforma, incluindo:
- nome;
- endereço de e-mail;
- telefone ou WhatsApp;
- identificadores de autenticação;
- registros de acesso;
- endereço IP;
- informações do navegador;
- informações do dispositivo;
- logs técnicos;
- dados relacionados ao uso da plataforma.</p>
        <p>Também poderão ser armazenados os conteúdos criados pelo usuário dentro do sistema.</p>
      </section>

      <section>
        <h3 className="font-semibold">2. FINALIDADES DO TRATAMENTO</h3>
        <p>Os dados poderão ser utilizados para:
- permitir acesso à plataforma;
- autenticar usuários;
- administrar contas;
- fornecer suporte;
- processar assinaturas e pagamentos;
- prevenir fraudes;
- garantir a segurança do sistema;
- cumprir obrigações legais;
- melhorar funcionalidades e desempenho da plataforma.</p>
        <p>O tratamento ocorrerá com base nas hipóteses legais previstas pela LGPD, incluindo execução de contrato, cumprimento de obrigação legal, legítimo interesse e consentimento, quando aplicável.</p>
      </section>

      <section>
        <h3 className="font-semibold">3. COMPARTILHAMENTO DE DADOS</h3>
        <p>O DocSpace FAQ não comercializa dados pessoais.</p>
        <p>Os dados poderão ser compartilhados apenas quando necessário para:
- prestação dos serviços;
- autenticação;
- hospedagem;
- processamento de pagamentos;
- envio de e-mails;
- monitoramento e segurança;
- cumprimento de obrigações legais;
- atendimento de determinações judiciais ou administrativas.</p>
      </section>

      <section>
        <h3 className="font-semibold">4. SERVIÇOS E PROVEDORES TERCEIRIZADOS</h3>
        <p>A plataforma poderá utilizar serviços fornecidos por terceiros para viabilizar sua operação.</p>
        <p>Esses fornecedores poderão processar dados necessários para execução dos serviços contratados, observadas medidas razoáveis de segurança e proteção de dados.</p>
      </section>

      <section>
        <h3 className="font-semibold">5. SEGURANÇA DAS INFORMAÇÕES</h3>
        <p>São adotadas medidas técnicas e organizacionais razoáveis destinadas à proteção dos dados tratados.</p>
        <p>Entretanto, nenhum sistema tecnológico pode garantir segurança absoluta.</p>
        <p>O usuário também é responsável por proteger suas credenciais de acesso.</p>
      </section>

      <section>
        <h3 className="font-semibold">6. RETENÇÃO DOS DADOS</h3>
        <p>Os dados poderão ser mantidos pelo período necessário para:
- execução do contrato;
- prestação dos serviços;
- cumprimento de obrigações legais;
- prevenção a fraudes;
- exercício regular de direitos.</p>
        <p>Após esse período, os dados poderão ser eliminados, anonimizados ou mantidos quando houver obrigação legal que justifique sua retenção.</p>
      </section>

      <section>
        <h3 className="font-semibold">7. DIREITOS DO TITULAR</h3>
        <p>Nos termos da LGPD, o titular poderá solicitar, quando aplicável:
- confirmação da existência de tratamento;
- acesso aos dados;
- correção de dados incompletos ou desatualizados;
- anonimização, bloqueio ou eliminação quando cabível;
- informações sobre compartilhamento;
- revogação do consentimento quando aplicável.</p>
        <p>As solicitações serão analisadas conforme a legislação vigente.</p>
      </section>

      <section>
        <h3 className="font-semibold">8. COOKIES E TECNOLOGIAS SEMELHANTES</h3>
        <p>A plataforma poderá utilizar cookies e tecnologias similares para:
- autenticação;
- funcionamento do sistema;
- segurança;
- personalização da experiência;
- análise de desempenho.</p>
        <p>A desativação de cookies poderá afetar determinadas funcionalidades.</p>
      </section>

      <section>
        <h3 className="font-semibold">9. TRANSFERÊNCIA INTERNACIONAL DE DADOS</h3>
        <p>Determinados fornecedores utilizados pelo DocSpace FAQ poderão armazenar ou processar dados em servidores localizados fora do Brasil.</p>
        <p>Nesses casos, serão adotadas medidas compatíveis com os requisitos da LGPD e padrões razoáveis de segurança da informação.</p>
      </section>

      <section>
        <h3 className="font-semibold">10. ALTERAÇÕES DESTA POLÍTICA</h3>
        <p>Esta Política poderá ser atualizada periodicamente.</p>
        <p>A versão vigente permanecerá disponível para consulta na plataforma.</p>
        <p>O uso continuado da plataforma após alterações significativas poderá ser interpretado como ciência das novas condições.</p>
      </section>

      <section>
        <h3 className="font-semibold">11. TRATAMENTO DE DADOS PESSOAIS</h3>
        <p>Para assuntos relacionados à privacidade, proteção de dados ou exercício de direitos previstos na LGPD:</p>
        <p>Canal de suporte: contato@docspace.tec.br</p>
      </section>
    </div>
  );
}
