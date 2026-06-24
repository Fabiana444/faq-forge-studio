-- Adicionar coluna full_name na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Adicionar coluna para rastrear modelos usados no trial
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_models_used TEXT[] DEFAULT '{}';

-- Adicionar coluna para rastrear total de perguntas por modelo no trial
ALTER TABLE public.user_limits ADD COLUMN IF NOT EXISTS questions_per_model JSONB DEFAULT '{}';

-- Criar função para validar limite de perguntas no trial
CREATE OR REPLACE FUNCTION public.check_trial_question_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_plan TEXT;
  v_question_count INT;
  v_model_count INT;
BEGIN
  -- Obter o plano do usuário
  SELECT plan INTO v_user_plan FROM public.user_limits WHERE user_id = NEW.user_id;
  
  -- Se for trial/free, validar limites
  IF v_user_plan = 'free' THEN
    -- Contar perguntas da FAQ atual
    v_question_count := array_length(NEW.items, 1);
    
    -- Validar máximo de 5 perguntas por FAQ
    IF v_question_count > 5 THEN
      RAISE EXCEPTION 'Limite de 5 perguntas atingido para FAQs em período de teste';
    END IF;
  END IF;
  
  RETURN NEW;
END; $$;

-- Criar trigger para validar limite de perguntas
DROP TRIGGER IF EXISTS validate_trial_questions ON public.faqs;
CREATE TRIGGER validate_trial_questions
BEFORE INSERT OR UPDATE ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.check_trial_question_limit();

-- Criar função para validar limite de modelos no trial
CREATE OR REPLACE FUNCTION public.check_trial_model_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFIER SET search_path = public AS $$
DECLARE
  v_user_plan TEXT;
  v_models_used TEXT[];
  v_model_count INT;
BEGIN
  -- Obter o plano do usuário
  SELECT plan, trial_models_used INTO v_user_plan, v_models_used 
  FROM public.profiles WHERE id = NEW.user_id;
  
  -- Se for trial/free, validar limites
  IF v_user_plan = 'free' THEN
    -- Contar quantas vezes este modelo foi usado
    v_model_count := (SELECT COUNT(*) FROM public.faqs 
                      WHERE user_id = NEW.user_id AND template = NEW.template);
    
    -- Validar máximo de 1 FAQ por modelo
    IF v_model_count > 0 THEN
      RAISE EXCEPTION 'Você já criou uma FAQ com este modelo. No período de teste, pode criar apenas uma FAQ de cada modelo.';
    END IF;
  END IF;
  
  RETURN NEW;
END; $$;

-- Criar trigger para validar limite de modelos
DROP TRIGGER IF EXISTS validate_trial_models ON public.faqs;
CREATE TRIGGER validate_trial_models
BEFORE INSERT ON public.faqs
FOR EACH ROW EXECUTE FUNCTION public.check_trial_model_limit();
