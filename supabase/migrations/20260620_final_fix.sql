-- 1. ADICIONAR COLUNAS DE TERMOS DE USO NA TABELA PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- 2. DEFINIR ADMINS (BASEADO NOS EMAILS DO BRIEFING)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM public.profiles 
WHERE email IN ('fabinonjah@gmail.com', 'fnonjah@yahoo.com.br')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. CRIAR TABELA DE LIMITES DE USUÁRIO (TRIAL)
CREATE TABLE IF NOT EXISTS public.user_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT DEFAULT 'free',
  faq_count INT DEFAULT 0,
  faq_limit INT DEFAULT 7,
  trial_started_at TIMESTAMPTZ DEFAULT now(),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  subscription_starts_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HABILITAR RLS NA TABELA DE LIMITES
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICA DE ACESSO AOS LIMITES (SE NÃO EXISTIR)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_limits' AND policyname = 'Users can view their own limits'
    ) THEN
        CREATE POLICY "Users can view their own limits" ON public.user_limits
          FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- FUNÇÃO PARA CRIAR LIMITES AUTOMATICAMENTE PARA NOVOS USUÁRIOS
CREATE OR REPLACE FUNCTION public.handle_new_user_limits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_limits (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

-- TRIGGER PARA VINCULAR A FUNÇÃO AO CADASTRO DO USUÁRIO
DROP TRIGGER IF EXISTS on_auth_user_created_limits ON auth.users;
CREATE TRIGGER on_auth_user_created_limits
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_limits();

-- POPULAR LIMITES PARA USUÁRIOS QUE JÁ EXISTEM
INSERT INTO public.user_limits (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. CRIAR TABELA DE PLANOS DE ASSINATURA
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT,
  price DECIMAL(10,2),
  billing_cycle INT,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HABILITAR RLS NA TABELA DE PLANOS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICA DE ACESSO AOS PLANOS (SE NÃO EXISTIR)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'Users can view their own subscriptions'
    ) THEN
        CREATE POLICY "Users can view their own subscriptions" ON public.subscription_plans
          FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. FUNÇÃO E TRIGGER PARA ATUALIZAR O CONTADOR DE FAQS
CREATE OR REPLACE FUNCTION public.update_faq_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_limits 
    SET faq_count = faq_count + 1 
    WHERE user_id = NEW.user_id;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Não decrementamos para travar a cota conforme briefing
    NULL;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS on_faq_created_updated_count ON public.faqs;
CREATE TRIGGER on_faq_created_updated_count
AFTER INSERT OR DELETE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.update_faq_count();

-- SINCRONIZAR CONTADOR DE FAQS EXISTENTES
UPDATE public.user_limits ul
SET faq_count = (SELECT count(*) FROM public.faqs f WHERE f.user_id = ul.user_id);
