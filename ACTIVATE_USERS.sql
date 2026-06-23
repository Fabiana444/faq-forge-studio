-- Script para ativar todos os usuários existentes para teste
-- Execute isso no SQL Editor do Supabase

-- 1. Marcar todos os usuários como verificados
UPDATE public.profiles 
SET email_verified = true, 
    email_verified_at = now()
WHERE email_verified = false;

-- 2. Aprovar todos os usuários pendentes
UPDATE public.profiles 
SET access_status = 'approved'
WHERE access_status = 'pending';

-- 3. Verificar o resultado
SELECT id, email, email_verified, access_status, created_at 
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;
