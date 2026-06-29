-- =============================================================================
-- FAQ FORGE STUDIO — BANCO DE DADOS COMPLETO E HARDENED
-- Projeto: idgecdnkauhklvedmawh
-- Data: 2026-06-13
-- ORDEM DE CRIAÇÃO:
--   1. Revogar permissões padrão excessivas
--   2. Enums
--   3. Tabelas (sem policies ainda)
--   4. Funções auxiliares (has_role, is_approved, etc.)
--   5. Policies RLS (agora que as funções existem)
--   6. Triggers
--   7. Backfill de segurança
--   8. Comentários
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. REVOGAR PERMISSÕES PADRÃO EXCESSIVAS DO SCHEMA PUBLIC
-- ─────────────────────────────────────────────────────────────────────────────
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TABELAS (sem policies, elas vêm depois das funções)
-- ─────────────────────────────────────────────────────────────────────────────

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  display_name    TEXT,
  access_status   TEXT        NOT NULL DEFAULT 'pending',
  request_reason  TEXT,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at      TIMESTAMPTZ,
  decided_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_access_status_check
    CHECK (access_status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT profiles_email_length     CHECK (char_length(email) <= 320),
  CONSTRAINT profiles_display_name_length CHECK (char_length(display_name) <= 120)
);

CREATE INDEX IF NOT EXISTS profiles_access_status_idx ON public.profiles (access_status);
CREATE INDEX IF NOT EXISTS profiles_email_idx         ON public.profiles (email);

REVOKE ALL ON public.profiles FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL                    ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID             NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role  NOT NULL,
  created_at TIMESTAMPTZ      NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);

REVOKE ALL ON public.user_roles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL    ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- faqs
CREATE TABLE IF NOT EXISTS public.faqs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL DEFAULT 'Minha FAQ',
  template    TEXT        NOT NULL DEFAULT 'categorized',
  visibility  TEXT        NOT NULL DEFAULT 'public',
  config      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  items       JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT faqs_visibility_check  CHECK (visibility IN ('public', 'private')),
  CONSTRAINT faqs_title_length      CHECK (char_length(title) <= 200),
  CONSTRAINT faqs_template_length   CHECK (char_length(template) <= 60)
);

CREATE INDEX IF NOT EXISTS faqs_user_id_idx    ON public.faqs (user_id);
CREATE INDEX IF NOT EXISTS faqs_visibility_idx ON public.faqs (visibility);
CREATE INDEX IF NOT EXISTS faqs_updated_at_idx ON public.faqs (updated_at DESC);

REVOKE ALL ON public.faqs FROM PUBLIC, anon, authenticated;
GRANT SELECT                         ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL                            ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FUNÇÕES AUXILIARES (devem existir ANTES das policies que as usam)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.has_role(
  _user_id uuid,
  _role    public.app_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role    = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id            = _user_id
      AND access_status = 'approved'
  );
$$;

REVOKE ALL     ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL     ON FUNCTION public.is_approved(uuid)               FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT  EXECUTE ON FUNCTION public.is_approved(uuid)               TO authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. POLÍTICAS RLS (agora que has_role e is_approved existem)
-- ─────────────────────────────────────────────────────────────────────────────

-- --- profiles ---
DROP POLICY IF EXISTS profiles_select_own    ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own    ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own    ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_select  ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_update  ON public.profiles;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_admin_select ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE TO authenticated
  USING  (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- --- user_roles ---
DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;

CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- (sem INSERT/UPDATE/DELETE para authenticated — só service_role pode escrever)

-- --- faqs ---
DROP POLICY IF EXISTS faqs_owner_select  ON public.faqs;
DROP POLICY IF EXISTS faqs_public_select ON public.faqs;
DROP POLICY IF EXISTS faqs_owner_insert  ON public.faqs;
DROP POLICY IF EXISTS faqs_owner_update  ON public.faqs;
DROP POLICY IF EXISTS faqs_owner_delete  ON public.faqs;
DROP POLICY IF EXISTS faqs_owner_all     ON public.faqs;
DROP POLICY IF EXISTS faqs_public_select ON public.faqs;

CREATE POLICY faqs_owner_select ON public.faqs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY faqs_public_select ON public.faqs
  FOR SELECT TO anon, authenticated
  USING (visibility = 'public');

CREATE POLICY faqs_owner_insert ON public.faqs
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.is_approved(auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY faqs_owner_update ON public.faqs
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND (
      public.is_approved(auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  )
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY faqs_owner_delete ON public.faqs
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. TRIGGER: set_updated_at (auditoria automática de modificações em faqs)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL     ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.set_updated_at() TO service_role;

DROP TRIGGER IF EXISTS faqs_set_updated_at ON public.faqs;
CREATE TRIGGER faqs_set_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TRIGGER: handle_new_user
--    · 1º usuário  → admin aprovado
--    · Demais      → pending (aguardam aprovação manual)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first   boolean;
  clean_name text;
BEGIN
  clean_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1)
  );
  clean_name := LEFT(clean_name, 120);

  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first;

  INSERT INTO public.profiles (
    id, email, display_name, access_status, requested_at, decided_at
  )
  VALUES (
    NEW.id,
    LEFT(NEW.email, 320),
    clean_name,
    CASE WHEN is_first THEN 'approved' ELSE 'pending' END,
    now(),
    CASE WHEN is_first THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;

  IF is_first THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL     ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. BACKFILL DE SEGURANÇA
--    Se já há usuários e nenhum admin, o mais antigo vira admin aprovado.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  uid       uuid;
  cnt       int;
  has_admin boolean;
BEGIN
  SELECT count(*) INTO cnt FROM public.profiles;
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) INTO has_admin;

  IF cnt >= 1 AND NOT has_admin THEN
    SELECT id INTO uid
    FROM public.profiles
    ORDER BY created_at ASC
    LIMIT 1;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT DO NOTHING;

    UPDATE public.profiles
    SET access_status = 'approved',
        decided_at    = now()
    WHERE id = uid;
  END IF;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO INTERNA
-- ─────────────────────────────────────────────────────────────────────────────
COMMENT ON TABLE  public.profiles      IS 'Perfis de usuario com status de aprovacao de acesso.';
COMMENT ON TABLE  public.user_roles    IS 'Papeis dos usuarios (admin, user). Escrita apenas via service_role.';
COMMENT ON TABLE  public.faqs          IS 'FAQs criadas pelos usuarios. Visibilidade public|private.';
COMMENT ON COLUMN public.faqs.config   IS 'Configuracoes visuais da FAQ em JSONB.';
COMMENT ON COLUMN public.faqs.items    IS 'Itens/categorias/perguntas da FAQ em JSONB.';
COMMENT ON FUNCTION public.has_role    IS 'Verifica papel de usuario. SECURITY DEFINER — nunca exposta a anon.';
COMMENT ON FUNCTION public.is_approved IS 'Verifica aprovacao de usuario. SECURITY DEFINER — nunca exposta a anon.';
