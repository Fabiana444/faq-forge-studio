# 📧 Instruções de Configuração - DocSpace FAQ

## 1. Ativar Usuários Existentes para Teste

Se você já tem usuários cadastrados no banco de dados e quer testar o login sem precisar verificar e-mail:

1. Abra o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Cole o seguinte SQL e execute:

```sql
-- Marcar todos os usuários como verificados
UPDATE public.profiles 
SET email_verified = true, 
    email_verified_at = now()
WHERE email_verified = false;

-- Aprovar todos os usuários pendentes
UPDATE public.profiles 
SET access_status = 'approved'
WHERE access_status = 'pending';
```

Após executar, seus usuários conseguirão fazer login normalmente.

---

## 2. Configurar E-mails de Verificação (Opcional)

O Supabase envia automaticamente e-mails de confirmação. Para personalizar o template:

1. No painel do Supabase, vá para **Authentication** → **Email Templates**
2. Selecione **Confirm signup**
3. Personalize:
   - **Subject:** Bem-vindo ao DocSpace FAQ
   - **From Email:** noreply@docspace.tec.br (ou docspace.tec@outlook.com)
   - **From Name:** DocSpace
   - **HTML:** Use o template abaixo

### Template HTML Recomendado:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 120px; height: auto; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 8px; }
        .button { 
            display: inline-block; 
            background: #3b82f6; 
            color: white; 
            padding: 12px 30px; 
            border-radius: 6px; 
            text-decoration: none; 
            margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://seu-dominio.com/logo.png" alt="DocSpace FAQ" class="logo">
        </div>
        
        <div class="content">
            <h2>Bem-vindo(a) ao DocSpace FAQ!</h2>
            <p>Olá, {{ .Email }}!</p>
            <p>Clique no botão abaixo para confirmar seu cadastro e começar a criar FAQs personalizáveis e dinâmicas.</p>
            
            <a href="{{ .ConfirmationURL }}" class="button">Confirmar Cadastro</a>
            
            <p style="color: #666; font-size: 14px;">
                Se você não criou esta conta, ignore este e-mail.
            </p>
        </div>
        
        <div class="footer">
            <p>© 2026 DocSpace FAQ. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
```

---

## 3. Fluxo de Autenticação (Atualizado)

### Novo Usuário (Cadastro):
1. Preenche e-mail e senha
2. Clica em "Cadastrar"
3. Recebe e-mail com link de confirmação
4. Clica no link
5. É redirecionado para o dashboard
6. Acesso liberado

### Usuário Existente (Login):
1. Preenche e-mail e senha
2. Clica em "Entrar"
3. Acesso imediato ao dashboard (sem modal de verificação)

---

## 4. Testar Localmente

```bash
cd C:\Fabiana\Antigravity\faq-forge-studio
git pull origin main
npm install
npm run dev
```

Acesse: http://localhost:5173

---

## 5. Próximos Passos

- [ ] Executar o SQL para ativar usuários existentes
- [ ] Personalizar o template de e-mail (opcional)
- [ ] Testar cadastro de novo usuário
- [ ] Testar login de usuário existente
- [ ] Configurar domínio customizado no Supabase (produção)

---

**Última atualização:** 23 de Junho de 2026
