
-- 1. Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 2. Profile approval columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS access_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS request_reason text,
  ADD COLUMN IF NOT EXISTS requested_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS decided_by uuid;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_access_status_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_access_status_check
  CHECK (access_status IN ('pending','approved','rejected'));

-- helper to check approved
CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND access_status = 'approved'
  )
$$;

-- 3. Admin policies on profiles (in addition to existing self policies)
DROP POLICY IF EXISTS profiles_admin_select ON public.profiles;
CREATE POLICY profiles_admin_select ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS profiles_admin_update ON public.profiles;
CREATE POLICY profiles_admin_update ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 4. Tighten faqs: only approved (or admin) can create/update/delete
DROP POLICY IF EXISTS faqs_owner_all ON public.faqs;

DROP POLICY IF EXISTS faqs_owner_select ON public.faqs;
CREATE POLICY faqs_owner_select ON public.faqs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS faqs_owner_insert ON public.faqs;
CREATE POLICY faqs_owner_insert ON public.faqs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (public.is_approved(auth.uid()) OR public.has_role(auth.uid(),'admin')));

DROP POLICY IF EXISTS faqs_owner_update ON public.faqs;
CREATE POLICY faqs_owner_update ON public.faqs
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND (public.is_approved(auth.uid()) OR public.has_role(auth.uid(),'admin')))
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS faqs_owner_delete ON public.faqs;
CREATE POLICY faqs_owner_delete ON public.faqs
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. handle_new_user — first user becomes approved admin; others pending
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_first boolean;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first;

  INSERT INTO public.profiles (id, email, display_name, access_status, requested_at, decided_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE WHEN is_first THEN 'approved' ELSE 'pending' END,
    now(),
    CASE WHEN is_first THEN now() ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;

  IF is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Backfill: if there is exactly one existing profile and no admin, promote it.
DO $$
DECLARE
  uid uuid;
  cnt int;
  has_admin boolean;
BEGIN
  SELECT count(*) INTO cnt FROM public.profiles;
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role='admin') INTO has_admin;
  IF cnt >= 1 AND NOT has_admin THEN
    SELECT id INTO uid FROM public.profiles ORDER BY created_at ASC LIMIT 1;
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
    UPDATE public.profiles SET access_status='approved', decided_at=now() WHERE id=uid;
  END IF;
END $$;
