import { useAuth } from "@/hooks/use-auth";

/**
 * Overlay de verificação de e-mail.
 * A verificação agora é feita automaticamente pelo Supabase via link no e-mail.
 * Este componente foi mantido para compatibilidade mas não renderiza nada.
 */
export function VerificationOverlay() {
  const { loading } = useAuth();
  if (loading) return null;
  return null;
}
