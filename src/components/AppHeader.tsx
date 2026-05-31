import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";

export function AppHeader() {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>FAQ Forge</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link to="/docs" className="px-3 py-2 text-muted-foreground hover:text-foreground">
            Documentação
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                Minhas FAQs
              </Link>
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
