import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, BriefcaseBusiness, CalendarDays, ChevronDown, Home, LogOut, Menu, Newspaper, Search, Settings, UserRound, Users, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useProfile } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { safeUrl } from "@/lib/url";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
import { Badge } from "@/components/UI/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";
import { useIsDesktop } from "./functions/useIsDesktop";
import { useOpenSearchResult } from "./functions/useOpenSearchResult";
import { useSidebarControls } from "./functions/useSidebarControls";
import { useUnreadCount } from "./functions/useUnreadCount";

const mobileNavItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/noticias", label: "Notícias", icon: Newspaper },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/oportunidades", label: "Vagas", icon: BriefcaseBusiness },
  { to: "/comunidades", label: "Rede", icon: Users },
] as const;

export function AppShell({ children, aside, immersive = false }: { children: ReactNode; aside?: ReactNode; immersive?: boolean }) {
  const [term, setTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSidebarTop, setMobileSidebarTop] = useState(0);
  const headerRef = useRef<HTMLElement>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: unread } = useUnreadCount();
  const isDesktop = useIsDesktop();
  const { mobileOpen, collapsed, toggleSidebar, closeMobileSidebar, collapseSidebar } =
    useSidebarControls(isDesktop);
  const openSearchResult = useOpenSearchResult(term, () => setMobileSearchOpen(false));
  useLayoutEffect(() => {
    if (!mobileSearchOpen) return;
    const header = headerRef.current;
    if (!header) return;
    const updateSidebarTop = () => setMobileSidebarTop(header.getBoundingClientRect().height);
    updateSidebarTop();
    const observer = new ResizeObserver(updateSidebarTop);
    observer.observe(header);
    return () => observer.disconnect();
  }, [mobileSearchOpen]);
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/entrar", replace: true });
  }

  return (
    <div className={immersive ? "h-dvh overflow-hidden bg-background" : "min-h-screen bg-background"}>
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[auto_1fr] items-center gap-3 px-3 py-3 md:grid-cols-[auto_1fr_auto]">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={(isDesktop ? !collapsed : mobileOpen) ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isDesktop ? !collapsed : mobileOpen}
              className="hidden lg:inline-flex lg:ml-3.5 [&_svg]:size-6 hover:bg-muted hover:text-foreground"
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
              void openSearchResult();
            }}
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar pessoas, artigos ou comunidades..."
              aria-label="Buscar no InfoCampus"
              maxLength={100}
              className="rounded-full bg-muted pl-9"
            />
          </form>

          <div className="flex shrink-0 items-center gap-1 justify-self-end sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Abrir pesquisa"
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((open) => !open)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative hidden md:inline-flex"
              aria-label="Notificações"
            >
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
              <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Abrir menu do perfil"
                    className="group flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-transparent transition-all group-hover:ring-primary/50 group-data-[state=open]:ring-primary">
                      <AvatarImage src={safeUrl(profile?.avatar_url) ?? undefined} alt="" />
                      <AvatarFallback>
                        {(profile?.full_name ?? "?").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown
                      className={`mr-1 h-4 w-4 text-muted-foreground transition-all duration-200 group-hover:text-primary ${profileMenuOpen ? "rotate-180 text-primary" : "rotate-0"}`}
                      aria-hidden="true"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2">
                  <DropdownMenuLabel className="flex items-center gap-3 rounded-xl border border-border p-3 font-normal">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={safeUrl(profile?.avatar_url) ?? undefined} alt="" />
                      <AvatarFallback>
                        {(profile?.full_name ?? "?").slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-foreground">
                        {profile?.full_name ?? "Estudante"}
                      </span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        @{profile?.username ?? "usuário"}
                      </span>
                    </span>
                  </DropdownMenuLabel>
                  {profile && (
                    <DropdownMenuItem asChild className="mt-1.5">
                      <Link to="/perfil/$username" params={{ username: profile.username }}>
                        <UserRound className="mr-2 h-4 w-4" /> Perfil
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="mt-1 md:hidden">
                    <Link to="/notificacoes" className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" /> Notificações
                      {!!unread && (
                        <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-secondary px-1 text-[10px] text-secondary-foreground">
                          {unread}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="mt-1">
                    <Link to="/configuracoes">
                      <Settings className="mr-2 h-4 w-4" /> Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      void signOut();
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair da conta
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
        {mobileSearchOpen && (
          <form
            role="search"
            className="flex gap-2 border-t border-border px-3 py-3 md:hidden"
            onSubmit={(e) => {
              e.preventDefault();
              void openSearchResult();
            }}
          >
            <Input
              autoFocus
              aria-label="Pesquisar no InfoCampus"
              maxLength={100}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar pessoas ou artigos..."
            />
            <Button type="submit" aria-label="Pesquisar">
              <Search />
            </Button>
          </form>
        )}
      </header>

      <div
        className={cn(
          "mx-auto flex max-w-[1600px] gap-5 px-3",
          immersive ? "h-[calc(100dvh-4.0625rem)] py-0 pb-16 lg:pb-0" : "pt-4 pb-24 lg:pb-6",
        )}
      >
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
              <SidebarNav collapsed={collapsed} onNavigate={collapseSidebar} />
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
              "fixed top-0 bottom-0 left-0 flex w-64 flex-col bg-sidebar shadow-card transition-transform duration-500 ease-in-out motion-reduce:transition-none",
              !mobileSearchOpen && "pt-16",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
            style={mobileSearchOpen ? { top: `${mobileSidebarTop}px` } : undefined}
          >
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <SidebarNav onNavigate={collapseSidebar} />
            </div>
          </div>
        </div>

        <main className={cn("min-w-0 flex-1", immersive && "h-full min-h-0")}>{children}</main>

        {aside && <aside className="hidden w-80 shrink-0 space-y-6 xl:block">{aside}</aside>}
      </div>

      <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card px-2 pt-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
        {mobileNavItems.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return <Link key={to} to={to} className={`flex flex-col items-center gap-1 pb-1 text-[10px] ${active ? "font-semibold text-primary" : "text-muted-foreground"}`}><Icon className="h-5 w-5" /><span>{label}</span></Link>;
        })}
      </nav>

      {!immersive && <footer className="border-t border-border px-3 pt-6 pb-24 text-center text-xs text-muted-foreground lg:px-0 lg:pb-6">
        InfoCampus · Comunidade acadêmica do IFMA ·{" "}
        <Link to="/termos" className="underline">
          Termos de uso
        </Link>{" "}
        ·{" "}
        <Link to="/privacidade" className="underline">
          Política de privacidade
        </Link>
      </footer>}
    </div>
  );
}
