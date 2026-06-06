import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  component: Layout,
});

function Layout() {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    // Admins always have access; non-approved go to /pending
    if (profile && !profile.isAdmin && profile.accessStatus !== "approved") {
      navigate({ to: "/pending" });
    }
  }, [user, loading, profile, navigate]);

  if (loading || !user || !profile)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );

  if (!profile.isAdmin && profile.accessStatus !== "approved")
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Redirecionando…
      </div>
    );

  return <Outlet />;
}
