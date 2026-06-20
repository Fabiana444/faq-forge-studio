-- ==========================================
-- DOCSPACE FAQ - ATUALIZAÇÃO FASES 1 E 2 (V2)
-- Data: 20/06/2026
-- ==========================================

-- 1. TERMOS DE USO
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- 2. CONFIGURAÇÃO DE ADMINS
-- Promove os e-mails especificados para o papel de admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM public.profiles 
WHERE email IN ('fabinonjah@gmail.com', 'fnonjah@yahoo.com.br')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. SISTEMA DE TRIAL E LIMITES
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

-- Habilitar RLS
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- Políticas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_limits' AND policyname = 'Users can view their own limits'
    ) THEN
        CREATE POLICY "Users can view their own limits" ON public.user_limits
          FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- Trigger para limites
CREATE OR REPLACE FUNCTION public.handle_new_user_limits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_limits (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created_limits ON auth.users;
CREATE TRIGGER on_auth_user_created_limits
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_limits();

-- Backfill
INSERT INTO public.user_limits (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. PLANOS PAGOS
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

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'Users can view their own subscriptions'
    ) THEN
        CREATE POLICY "Users can view their own subscriptions" ON public.subscription_plans
          FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;
END $$;

-- 5. CONTADOR DE FAQS
CREATE OR REPLACE FUNCTION public.update_faq_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_limits 
    SET faq_count = faq_count + 1 
    WHERE user_id = NEW.user_id;
  ELSIF (TG_OP = 'DELETE') THEN
    NULL;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS on_faq_created_updated_count ON public.faqs;
CREATE TRIGGER on_faq_created_updated_count
AFTER INSERT OR DELETE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.update_faq_count();

-- Sincronizar
UPDATE public.user_limits ul
SET faq_count = (SELECT count(*) FROM public.faqs f WHERE f.user_id = ul.user_id);
