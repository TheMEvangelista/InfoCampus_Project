import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  CalendarDays,
  ChevronDown,
  Home,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Search,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin, useProfile } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/noticias", label: "Notícias", icon: Newspaper },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/oportunidades", label: "Oportunidades", icon: Briefcase },
  { to: "/comunidades", label: "Comunidades", icon: Users },
  { to: "/mensagens", label: "Mensagens", icon: MessageSquare },
] as const;

let persistedMobileOpen = false;
let persistedCollapsed = false;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

function useUnreadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["unread-notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("read", false);
      return count ?? 0;
    },
  });
}

function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      {navItems.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={cn(
              collapsed && "justify-center px-0",
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}

      {isAdmin && (
        <Link
          to="/admin"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Shield className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && "Painel admin"}
        </Link>
      )}

      <div className="mt-auto pt-4">
        {user ? (
          <button
            onClick={signOut}
            title={collapsed ? "Sair da conta" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl bg-secondary/10 px-3 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/20",
              collapsed && "justify-center px-0",
            )}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && "Sair da conta"}
          </button>
        ) : (
          <Button
            asChild
            title={collapsed ? "Entrar" : undefined}
            className={cn("w-full", collapsed && "justify-center px-0")}
          >
            <Link to="/entrar">
              {collapsed ? <LogIn className="h-4.5 w-4.5" /> : "Entrar"}
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
}

export function AppShell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(persistedMobileOpen);
  const [collapsed, setCollapsed] = useState(persistedCollapsed);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: unread } = useUnreadCount();
  const isDesktop = useIsDesktop();

  function toggleSidebar() {
    if (isDesktop) {
      setCollapsed((current) => {
        persistedCollapsed = !current;
        return persistedCollapsed;
      });
      return;
    }

    setMobileOpen((current) => {
      persistedMobileOpen = !current;
      return persistedMobileOpen;
    });
  }

  function closeMobileSidebar() {
    persistedMobileOpen = false;
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={(isDesktop ? !collapsed : mobileOpen) ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isDesktop ? !collapsed : mobileOpen}
              className="lg:ml-3.5 [&_svg]:size-6 hover:bg-muted hover:text-foreground"
              onClick={toggleSidebar}
            >
              {(isDesktop ? !collapsed : mobileOpen) ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
            <Link to="/" className="shrink-0">
              <Logo />
            </Link>
          </div>

          <form
            className="relative mx-auto hidden w-full max-w-xl md:block"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/noticias", search: { q: term } as never });
            }}
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar notícias, pessoas, comunidades..."
              aria-label="Buscar no InfoCampus"
              className="rounded-full bg-muted pl-9"
            />
          </form>

          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notificações">
              <Link to="/notificacoes">
                <Bell className="h-5 w-5" />
                {!!unread && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-5 min-w-5 justify-center rounded-full bg-secondary px-1 text-[10px] text-secondary-foreground">
                    {unread}
                  </Badge>
                )}
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-2xl border border-border bg-card px-2 py-1.5 text-left transition-colors hover:bg-muted">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
                      <AvatarFallback>
                        {(profile?.full_name ?? "?").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden min-w-0 flex-col sm:flex">
                      <span className="truncate text-xs font-semibold">
                        {profile?.full_name ?? "Estudante"}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        @{profile?.username ?? "perfil"}
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {profile && (
                    <DropdownMenuItem asChild>
                      <Link to="/perfil/$username" params={{ username: profile.username }}>
                        Meu perfil
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/configuracoes">
                      <Settings className="mr-2 h-4 w-4" /> Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/criar-artigo">Escrever artigo</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/mensagens">Mensagens</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/entrar">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-5 px-3 py-6">
        <div
          className={cn(
            "hidden shrink-0 transition-[width] duration-500 ease-in-out motion-reduce:transition-none lg:block",
            collapsed ? "w-16" : "w-60",
          )}
        >
          <aside
            className={cn(
              "fixed top-20 bottom-4 left-[max(0.75rem,calc((100vw-1600px)/2+0.75rem))] z-20 flex flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-card transition-[width] duration-500 ease-in-out motion-reduce:transition-none",
              collapsed ? "w-16" : "w-60",
            )}
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <SidebarNav collapsed={collapsed} />
            </div>
          </aside>
        </div>

        <div
          className={cn(
            "fixed inset-0 z-30 transition-visibility duration-500 motion-reduce:transition-none lg:hidden",
            mobileOpen ? "visible" : "invisible delay-500",
          )}
          aria-hidden={!mobileOpen}
        >
          <button
            className={cn(
              "absolute inset-0 bg-foreground/40 transition-opacity duration-500 ease-in-out motion-reduce:transition-none",
              mobileOpen ? "opacity-100" : "opacity-0",
            )}
            aria-label="Fechar menu"
            tabIndex={mobileOpen ? 0 : -1}
            onClick={closeMobileSidebar}
          />
          <div
            className={cn(
              "fixed inset-y-0 left-0 flex w-64 flex-col bg-sidebar pt-16 shadow-card transition-transform duration-500 ease-in-out motion-reduce:transition-none",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <SidebarNav />
            </div>
          </div>
        </div>

        <main className="min-w-0 flex-1">{children}</main>

        {aside && <aside className="hidden w-80 shrink-0 space-y-6 xl:block">{aside}</aside>}
      </div>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        InfoCampus · Comunidade acadêmica do IFMA ·{" "}
        <Link to="/termos" className="underline">
          Termos de uso
        </Link>{" "}
        ·{" "}
        <Link to="/privacidade" className="underline">
          Política de privacidade
        </Link>
      </footer>
    </div>
  );
}
