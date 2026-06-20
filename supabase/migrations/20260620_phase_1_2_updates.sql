-- ==========================================
-- DOCSPACE FAQ - ATUALIZAÇÃO FASES 1 E 2
-- Data: 20/06/2026
-- ==========================================

-- 1. TERMOS DE USO (Fase 1.2)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- 2. CONFIGURAÇÃO DE ADMINS (Fase 1.3)
-- Promove os e-mails especificados no briefing para o papel de admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM public.profiles 
WHERE email IN ('fabinonjah@gmail.com', 'fnonjah@yahoo.com.br')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. SISTEMA DE TRIAL E LIMITES (Fase 2.1)
CREATE TABLE IF NOT EXISTS public.user_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT DEFAULT 'free',  -- free|monthly|quarterly|semi-annual|annual
  faq_count INT DEFAULT 0,
  faq_limit INT DEFAULT 7,  -- 1 por modelo
  trial_started_at TIMESTAMPTZ DEFAULT now(),
  trial_ends_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  subscription_starts_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para user_limits
ALTER TABLE public.user_limits ENABLE ROW LEVEL SECURITY;

-- Políticas para user_limits
DROP POLICY IF EXISTS "Users can view their own limits" ON public.user_limits;
CREATE POLICY "Users can view their own limits" ON public.user_limits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Trigger para criar limites automaticamente ao cadastrar novo usuário
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

-- Backfill para usuários existentes sem registro de limites
INSERT INTO public.user_limits (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. PLANOS PAGOS E ASSINATURAS (Fase 2.2)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT,  -- monthly|quarterly|semi-annual|annual
  price DECIMAL(10,2),
  billing_cycle INT,  -- 1|3|6|12
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',  -- active|cancelled|expired
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_plans
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscription_plans;
CREATE POLICY "Users can view their own subscriptions" ON public.subscription_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. FUNÇÃO PARA ATUALIZAR CONTADOR DE FAQS
CREATE OR REPLACE FUNCTION public.update_faq_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.user_limits 
    SET faq_count = faq_count + 1 
    WHERE user_id = NEW.user_id;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Conforme briefing 2.1: "Não permitir deletar FAQ para criar nova (segurança)"
    -- Mas para manter o banco íntegro, apenas não decrementamos o contador se quisermos travar a cota.
    -- Se desejar que a cota seja liberada ao deletar, descomente a linha abaixo:
    -- UPDATE public.user_limits SET faq_count = faq_count - 1 WHERE user_id = OLD.user_id;
    NULL;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS on_faq_created_updated_count ON public.faqs;
CREATE TRIGGER on_faq_created_updated_count
AFTER INSERT OR DELETE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.update_faq_count();

-- Sincronizar contagem atual
UPDATE public.user_limits ul
SET faq_count = (SELECT count(*) FROM public.faqs f WHERE f.user_id = ul.user_id);
