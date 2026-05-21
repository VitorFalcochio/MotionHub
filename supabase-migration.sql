-- ============================================================
-- Motion Hub — Migração para Workspace Colaborativo
-- Execute no Supabase: Dashboard > SQL Editor > New Query
-- ============================================================

-- 1. Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name  TEXT NOT NULL DEFAULT 'Usuário',
  avatar_color  TEXT NOT NULL DEFAULT '#6366f1',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_all"   ON public.profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_manage_own" ON public.profiles FOR ALL   USING (auth.uid() = id);

-- Trigger: cria perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Adicionar workspace_id à tabela app_data
ALTER TABLE public.app_data ADD COLUMN IF NOT EXISTS workspace_id TEXT DEFAULT 'main';

-- Migra dados existentes para o workspace 'main'
UPDATE public.app_data SET workspace_id = 'main' WHERE workspace_id IS NULL;

-- Garante unicidade do workspace_id
ALTER TABLE public.app_data DROP CONSTRAINT IF EXISTS app_data_workspace_id_key;
ALTER TABLE public.app_data ADD CONSTRAINT app_data_workspace_id_key UNIQUE (workspace_id);

-- 3. Atualizar RLS do app_data para acesso compartilhado
--    (remova políticas antigas se houver — os nomes podem variar no seu projeto)
DROP POLICY IF EXISTS "Users can only access their own data" ON public.app_data;
DROP POLICY IF EXISTS "Enable read access for own data"     ON public.app_data;
DROP POLICY IF EXISTS "Enable write access for own data"    ON public.app_data;
DROP POLICY IF EXISTS "app_data_own_policy"                ON public.app_data;

ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

-- Todos os usuários autenticados podem ler e escrever no workspace
CREATE POLICY "workspace_all_access" ON public.app_data
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. (Opcional) Criar perfil manual para usuários existentes
--    Execute apenas se você já tinha conta antes desta migração:
-- INSERT INTO public.profiles (id, display_name)
-- SELECT id, split_part(email, '@', 1)
-- FROM auth.users
-- ON CONFLICT (id) DO NOTHING;
