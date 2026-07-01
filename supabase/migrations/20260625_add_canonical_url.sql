-- Adicionar coluna de URL canônica na tabela faqs
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS canonical_url TEXT;

-- Criar índice para melhorar performance nas buscas
CREATE INDEX IF NOT EXISTS idx_faqs_user_id_title ON public.faqs(user_id, title);
CREATE INDEX IF NOT EXISTS idx_faqs_user_id_template ON public.faqs(user_id, template);
