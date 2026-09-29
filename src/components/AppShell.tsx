import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  CalendarDays,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
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

function SidebarNav({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
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
            onClick={onNavigate}
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
          onClick={onNavigate}
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
            className="flex w-full items-center gap-3 rounded-xl bg-secondary/10 px-3 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/20"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && "Sair da conta"}
          </button>
        ) : (
          <Button asChild className="w-full">
            <Link to="/entrar" onClick={onNavigate}>
              {collapsed ? "→" : "Entrar"}
            </Link>
          </Button>
        )}
      </div>
    </nav>
  );
}

export function AppShell({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: unread } = useUnreadCount();
  const isDesktop = useIsDesktop();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir ou fechar menu"
              onClick={() => {
                if (window.matchMedia("(min-width: 1024px)").matches) setCollapsed((v) => !v);
                else setMobileOpen((v) => !v);
              }}
            >
              <Menu className="h-5 w-5" />
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

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className={cn("sticky top-20 hidden h-[calc(100vh-6rem)] shrink-0 flex-col rounded-2xl border border-sidebar-border bg-sidebar shadow-card transition-[width] lg:flex", collapsed ? "w-16" : "w-60")}>
          <button
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className={cn("m-3 mb-0 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground", collapsed && "justify-center px-0")}
          >
            {collapsed ? <PanelLeftOpen className="h-4.5 w-4.5" /> : <><PanelLeftClose className="h-4.5 w-4.5" /> Recolher</>}
          </button>
          <div className="min-h-0 flex-1"><SidebarNav collapsed={collapsed} /></div>
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-foreground/40"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex h-full w-64 flex-col bg-sidebar shadow-card"><div className="contents">
              <div className="flex items-center justify-between p-4">
                <Logo />
                <Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={() => setMobileOpen(false)}>
                  <PanelLeftClose className="h-5 w-5" />
                </Button>
              </div>
              <div className="min-h-0 flex-1"><SidebarNav onNavigate={() => setMobileOpen(false)} /></div>
            </div></div>
          </div>
        )}

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
