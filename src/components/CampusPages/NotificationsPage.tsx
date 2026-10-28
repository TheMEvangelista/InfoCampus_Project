import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Empty, PageHeading } from "@/components/CampusContent";
import { BackButton } from "@/components/CampusContent/BackButton";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/UI/button";
import { Avatar, AvatarFallback } from "@/components/UI/avatar";
import { LoginPrompt } from "./LoginPrompt";
import { Checkbox } from "@/components/UI/checkbox";
import { toast } from "sonner";

type Filter = "all" | "solicitacao" | "mensagem" | "publicacao";
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" }, { id: "solicitacao", label: "Solicitações" },
  { id: "mensagem", label: "Mensagens" }, { id: "publicacao", label: "Publicações" },
];
const category = (type: string): Filter => /friend|request|solicit/i.test(type) ? "solicitacao" : /message|mensag/i.test(type) ? "mensagem" : "publicacao";
const dateTime = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" }).format(new Date(value));
const notificationHref = (notification: { type: string; message: string; link: string | null }) => {
  if (/message|mensag/i.test(notification.type)) {
    const username = notification.message.match(/@([a-z0-9_.]+)/i)?.[1];
    if (username) return `/mensagens?para=${encodeURIComponent(username)}`;
  }
  return notification.link?.startsWith("/") && !notification.link.startsWith("//")
    ? notification.link
    : "/notificacoes";
};

export function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const { data } = useQuery({
    queryKey: ["notifications", user?.id], enabled: !!user, refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`notifications:${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => {
        void queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
        void queryClient.invalidateQueries({ queryKey: ["unread-notifications", user.id] });
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient, user]);
  const filtered = useMemo(() => (data ?? []).filter((n) => filter === "all" || category(n.type) === filter), [data, filter]);
  const allSelected = filtered.length > 0 && filtered.every((n) => selectedIds.has(n.id));
  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }
  function toggleAll(checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const item of filtered) { if (checked) next.add(item.id); else next.delete(item.id); }
      return next;
    });
  }
  async function deleteSelected() {
    if (!user || selectedIds.size === 0) return;
    const ids = [...selectedIds];
    const { error } = await supabase.from("notifications").delete().eq("user_id", user.id).in("id", ids);
    if (error) return toast.error("Não foi possível excluir as notificações.", { description: error.message });
    setSelectedIds(new Set());
    toast.success(ids.length === 1 ? "Notificação excluída." : "Notificações excluídas.");
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["unread-notifications", user.id] }),
    ]);
  }
  async function markAllRead() {
    if (!user) return;
    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    if (error) return;
    await Promise.all([queryClient.invalidateQueries({ queryKey: ["notifications"] }), queryClient.invalidateQueries({ queryKey: ["unread-notifications"] })]);
  }
  async function markNotificationRead(id: string) {
    if (!user) return;
    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("id", id);
    if (error) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications", user.id] }),
      queryClient.invalidateQueries({ queryKey: ["unread-notifications", user.id] }),
    ]);
  }
  return <AppShell>
    <BackButton />
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><PageHeading title="Notificações" /></div>
    {!user ? <LoginPrompt /> : <>
      <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">{filters.map((item) => <Button key={item.id} variant={filter === item.id ? "default" : "ghost"} size="sm" onClick={() => { setFilter(item.id); setSelectedIds(new Set()); }}>{item.label}</Button>)}</div>
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={allSelected} onCheckedChange={(checked) => toggleAll(checked === true)} aria-label="Selecionar todas as notificações" />
          Selecionar todas
        </label>
        <Button variant="destructive" size="sm" disabled={selectedIds.size === 0} onClick={() => void deleteSelected()}>
          Excluir selecionadas{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void markAllRead()}>
          <CheckCheck className="mr-2 h-4 w-4" /> Marcar todas como lidas
        </Button>
      </div>
      <section className="divide-y divide-border rounded-xl border border-border bg-card px-4 shadow-card" aria-label="Notificações">
        {filtered.map((n) => <article key={n.id} className={`flex items-start gap-3 py-4 ${!n.read ? "bg-white" : ""}`}>
          <Checkbox className="mt-1" checked={selectedIds.has(n.id)} onCheckedChange={(checked) => toggleSelected(n.id, checked === true)} aria-label={`Selecionar notificação: ${n.message}`} />
          <Avatar className="mt-0.5 h-11 w-11"><AvatarFallback><UserRound className="h-5 w-5"/></AvatarFallback></Avatar>
          <a href={notificationHref(n)} onClick={() => { if (!n.read) void markNotificationRead(n.id); }} className={`min-w-0 flex-1 rounded-sm text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${!n.read ? "text-green-200" : "text-foreground"}`}>
            <p>{n.message}</p>
            <time className={`mt-1 block text-xs ${!n.read ? "text-green-200" : "text-muted-foreground"}`} dateTime={n.created_at}>{dateTime(n.created_at)}</time>
          </a>
          {!n.read && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-primary" aria-label="Não lida"/>}
        </article>)}
        {filtered.length === 0 && <div className="py-8"><Empty text="Nenhuma notificação por enquanto." /></div>}
      </section>
    </>}
  </AppShell>;
}
