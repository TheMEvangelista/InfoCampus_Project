import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Home,
  Newspaper,
  CalendarDays,
  Briefcase,
  Users,
  MessageSquare,
  Shield,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsStaff } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/noticias", label: "Notícias", icon: Newspaper },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/oportunidades", label: "Oportunidades", icon: Briefcase },
  { to: "/comunidades", label: "Comunidades", icon: Users },
  { to: "/mensagens", label: "Mensagens", icon: MessageSquare },
] as const;

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const { data: isAdmin } = useIsStaff();
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

      {user && (
        <div className="mt-auto pt-4">
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
        </div>
      )}
    </nav>
  );
}
