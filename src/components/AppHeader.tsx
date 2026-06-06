import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck } from "lucide-react";
import { DocspaceLogo } from "@/components/DocspaceLogo";

export function AppHeader() {
  const { user, signOut, profile } = useAuth();
  const approved = profile?.accessStatus === "approved";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <DocspaceLogo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/docs" className="px-3 py-2 text-muted-foreground hover:text-foreground">
            Documentação
          </Link>
          {user ? (
            <>
              {approved && (
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  Minhas FAQs
                </Link>
              )}
              {!approved && (
                <Link
                  to="/pending"
                  className="px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  Meu acesso
                </Link>
              )}
              {profile?.isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-primary hover:bg-primary/10"
                >
                  <ShieldCheck className="h-4 w-4" /> Admin
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="mr-1.5 h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
