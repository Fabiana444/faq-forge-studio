# 📧 Guia de Configuração: E-mail e SMS no Supabase

Para que o fluxo de verificação funcione completamente, você precisa configurar o Supabase para enviar e-mails e SMS. Siga este guia passo a passo.

---

## 1. Configurar E-mail (SMTP)

### Opção A: Usar o SMTP Padrão do Supabase (Recomendado para Testes)

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **Authentication** → **Email Templates**
4. Verifique se o template de "Confirmation" está habilitado
5. Configure o remetente (From Email) em **Authentication** → **Providers** → **Email**

### Opção B: Usar SMTP Customizado (Produção)

1. Em **Authentication** → **Email**, clique em **Configure SMTP**
2. Preencha os dados do seu provedor de SMTP:
   - **Host:** smtp.seuservidor.com
   - **Port:** 587 (ou 465 para SSL)
   - **User:** seu-email@seuservidor.com
   - **Password:** sua-senha
   - **From Email:** noreply@docspace.tec
   - **From Name:** DocSpace FAQ

3. Clique em **Test Connection** para validar

### Provedores Recomendados:
- **SendGrid:** https://sendgrid.com (Grátis até 100 e-mails/dia)
- **Mailgun:** https://mailgun.com (Grátis até 1.000 e-mails/mês)
- **AWS SES:** https://aws.amazon.com/ses/ (Muito barato)

---

## 2. Configurar SMS (Twilio ou Vonage)

### Opção A: Usar Twilio (Recomendado)

1. Crie uma conta em https://www.twilio.com
2. Obtenha seu **Account SID** e **Auth Token**
3. Compre um número de telefone (ex: +55 11 9999-9999)
4. No Supabase, vá para **Authentication** → **SMS Provider**
5. Selecione **Twilio**
6. Preencha:
   - **Account SID:** (de sua conta Twilio)
   - **Auth Token:** (de sua conta Twilio)
   - **Twilio Phone Number:** seu número comprado

7. Clique em **Save**

### Opção B: Usar Vonage (ex-Nexmo)

1. Crie uma conta em https://www.vonage.com
2. Obtenha sua **API Key** e **API Secret**
3. No Supabase, vá para **Authentication** → **SMS Provider**
4. Selecione **Vonage**
5. Preencha suas credenciais
6. Clique em **Save**

### Custo Estimado:
- **Twilio:** ~$0.01 por SMS (Brasil)
- **Vonage:** ~$0.008 por SMS (Brasil)

---

## 3. Testar o Fluxo Completo

### Teste Local (Sandbox)

1. Acesse a aplicação: http://localhost:5173
2. Clique em "Entrar" → "Criar Conta"
3. Preencha:
   - E-mail: seu-email-teste@gmail.com
   - Senha: Teste@123
   - Confirmação: Teste@123
4. Clique em "Cadastrar"
5. Você será redirecionado para o overlay de verificação
6. Verifique seu e-mail para o código
7. Digite o código no campo
8. Clique em "Confirmar E-mail"
9. Você será redirecionado para o formulário de celular
10. Digite seu número (ex: 11999999999)
11. Clique em "Enviar Código SMS"
12. Verifique seu SMS para o código
13. Digite o código e clique em "Confirmar Celular"
14. Você terá acesso completo à plataforma

### Teste em Produção

Repita os passos acima, mas acesse a URL de produção do seu projeto.

---

## 4. Solucionar Problemas

### E-mail não chega

**Problema:** O código de verificação não chega por e-mail.

**Soluções:**
1. Verifique se o SMTP está configurado corretamente
2. Verifique a pasta de spam/lixo
3. Verifique os logs do Supabase: **Authentication** → **Logs**
4. Se usar Gmail, habilite "Acesso de apps menos seguros"
5. Teste a conexão SMTP no Supabase

### SMS não chega

**Problema:** O código de verificação não chega por SMS.

**Soluções:**
1. Verifique se o provedor de SMS está configurado
2. Verifique se seu número de telefone é válido (com +55)
3. Verifique se tem saldo/crédito na conta Twilio/Vonage
4. Verifique os logs do Supabase
5. Teste com um número diferente

### Código expirado

**Problema:** O código expirou antes de ser digitado.

**Solução:** O código padrão do Supabase expira em 24 horas. Você pode aumentar isso em **Authentication** → **Policies** → **Email Verification Expiry**.

---

## 5. Configurações Recomendadas para Produção

| Configuração | Valor Recomendado |
|---|---|
| Email Verification Expiry | 24 horas |
| SMS Verification Expiry | 10 minutos |
| Rate Limit (Email) | 5 por hora por usuário |
| Rate Limit (SMS) | 3 por hora por usuário |
| Reenvio Cooldown | 60 segundos |

---

## 6. Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

---

## 7. Próximos Passos

1. ✅ Configure o SMTP para e-mail
2. ✅ Configure o provedor de SMS (Twilio/Vonage)
3. ✅ Teste o fluxo completo
4. ✅ Monitore os logs
5. ✅ Ajuste as políticas conforme necessário

---

**Dúvidas?** Consulte a documentação oficial do Supabase:
- E-mail: https://supabase.com/docs/guides/auth/auth-email
- SMS: https://supabase.com/docs/guides/auth/auth-twilio

---

**Última atualização:** 21 de Junho de 2026
