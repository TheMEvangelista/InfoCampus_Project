import { AppShell } from "@/components/AppShell";
import { BackButton, PageHeading } from "@/components/CampusContent";
import { LoginPrompt } from "@/components/CampusPages";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { dateLong } from "@/lib/format";
import { safeUrl } from "@/lib/url";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useState, useEffect, useMemo, type SyntheticEvent } from "react";
import { Button } from "react-day-picker";
import { Label } from "recharts";
import { toast } from "sonner";

export function MessagesPage() {
  const { user } = useAuth();
  const routeSearch = useRouterState({ select: (state) => state.location.search }) as {
    para?: string;
  };
  const [recipient, setRecipient] = useState(routeSearch.para ?? "");
  const [text, setText] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);
  const queryClient = useQueryClient();
  const {
    data: messages,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["messages", user?.id],
    enabled: !!user,
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id,content,created_at,sender_id,recipient_id,read")
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  const { data: people } = useQuery({
    queryKey: [
      "message-people",
      user?.id,
      messages?.map((m) => m.sender_id + m.recipient_id).join(),
    ],
    enabled: !!user && !!messages,
    queryFn: async () => {
      const ids = [
        ...new Set(
          messages!.flatMap((m) => [m.sender_id, m.recipient_id]).filter((id) => id !== user!.id),
        ),
      ];
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,full_name,avatar_url")
        .in("id", ids);
      if (error) throw error;
      return data ?? [];
    },
  });
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["messages", user.id] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // ✏️ ALTERAÇÃO 5: removido "user?.id" duplicado (já existe "user")
  }, [queryClient, user]);

  // ✏️ ALTERAÇÃO 2: tipo da mensagem + agrupamento com useMemo
  // (substitui o antigo `reduce`)
  type Message = NonNullable<typeof messages>[number];

  const conversations = useMemo(() => {
    const groups: Record<string, Message[]> = {};
    for (const message of messages ?? []) {
      const other = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
      (groups[other] ??= []).push(message);
    }
    return groups;
  }, [messages, user?.id]);

  // ✏️ ALTERAÇÃO 3: lista pronta e ordenada, com `last` já garantido.
  // O flatMap descarta conversas vazias e prova ao TypeScript que `last` existe.
  const sortedConversations = useMemo(
    () =>
      Object.entries(conversations)
        .flatMap(([id, list]) => {
          const last = list[list.length - 1];
          return last ? [{ id, list, last }] : [];
        })
        .sort((a, b) => b.last.created_at.localeCompare(a.last.created_at)),
    [conversations],
  );

  const peopleById = new Map((people ?? []).map((person) => [person.id, person]));
  useEffect(() => {
    if (!routeSearch.para || !people) return;
    const requested = people.find(
      (person) =>
        person.username.toLowerCase() === routeSearch.para!.replace(/^@/, "").toLowerCase(),
    );
    if (requested) setActiveId(requested.id);
  }, [routeSearch.para, people]);

  // ✏️ ALTERAÇÃO 4: a conversa padrão agora é a mais recente (topo da lista),
  // e não mais a primeira inserida em `conversations`
  const selected = activeId ?? sortedConversations[0]?.id ?? null;

  const currentMessages = selected ? (conversations[selected] ?? []) : [];
  useEffect(() => {
    if (!user || !selected) return;
    const unreadIds = (conversations[selected] ?? [])
      .filter((m) => m.recipient_id === user.id && !m.read)
      .map((m) => m.id);
    if (!unreadIds.length) return;
    void supabase
      .from("messages")
      .update({ read: true })
      .in("id", unreadIds)
      .then(({ error }) => {
        if (!error) void queryClient.invalidateQueries({ queryKey: ["messages", user.id] });
      });
    // ✏️ ALTERAÇÃO 5: removidos "messages" e "user?.id" (redundantes).
    // `conversations` já muda quando `messages` muda.
  }, [selected, user, conversations, queryClient]);

  // ✏️ ALTERAÇÃO 6: tipo correto do evento de submit do React
  async function send(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const contentText = text.trim();
    if (!contentText) return toast.error("Escreva uma mensagem.");
    if (contentText.length > 2000)
      return toast.error("A mensagem pode ter no máximo 2000 caracteres.");
    if (Date.now() - lastSentAt < 1500)
      return toast.error("Aguarde um instante antes de enviar outra mensagem.");
    setBusy(true);
    let targetId = selected;
    if (recipient.trim()) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", recipient.replace(/^@/, "").trim())
        .maybeSingle();
      if (error || !profile) {
        setBusy(false);
        return toast.error("Usuário não encontrado.");
      }
      targetId = profile.id;
    }
    if (!targetId || targetId === user.id) {
      setBusy(false);
      return toast.error("Escolha uma conversa válida.");
    }
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: user.id, recipient_id: targetId, content: contentText });
    setBusy(false);
    if (error) toast.error("Não foi possível enviar a mensagem.", { description: error.message });
    else {
      setLastSentAt(Date.now());
      setText("");
      setRecipient("");
      setActiveId(targetId);
      toast.success("Mensagem enviada.");
      void queryClient.invalidateQueries({ queryKey: ["messages", user.id] });
    }
  }
  return (
    <AppShell>
      <BackButton fallbackTo="/" />
      <PageHeading title="Mensagens" subtitle="Suas conversas privadas com pessoas do campus." />
      {!user ? (
        <LoginPrompt />
      ) : (
        <div className="grid gap-5 md:grid-cols-[280px_1fr]">
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <h2 className="border-b border-border p-4 font-bold">Conversas</h2>
            {isLoading ? (
              // ✏️ ALTERAÇÃO 7: encoding corrigido ("â€¦" virou "…")
              <p className="p-4 text-sm text-muted-foreground">Carregando conversas…</p>
            ) : isError ? (
              <p className="p-4 text-sm text-destructive">
                Não foi possível carregar suas conversas.
              </p>
            ) : // ✏️ ALTERAÇÃO 8: checa a lista ordenada em vez de Object.keys(...)
            sortedConversations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Você ainda não tem conversas.</p>
            ) : (
              // ✏️ ALTERAÇÃO 9: o .map agora usa a lista pronta.
              // Sem Object.entries/.sort aqui, sem `!`, e sem calcular `last`.
              sortedConversations.map(({ id, list, last }) => {
                const person = peopleById.get(id);
                const unread = list.some((m) => m.recipient_id === user.id && !m.read);
                return (
                  <button
                    key={id}
                    onClick={() => setActiveId(id)}
                    className={`flex w-full items-center gap-3 border-b border-border p-4 text-left hover:bg-muted ${selected === id ? "bg-muted" : ""}`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-bold text-primary-deep">
                      {safeUrl(person?.avatar_url) ? (
                        <img
                          src={safeUrl(person?.avatar_url)!}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (person?.full_name?.[0] ?? "?")
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-2">
                        <strong className="truncate text-sm">
                          {person?.full_name ?? "Estudante"}
                        </strong>
                        {unread && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-primary"
                            aria-label="Não lida"
                          />
                        )}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {last.content}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {dateLong(last.created_at)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </section>
          <section className="flex min-h-96 flex-col rounded-xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <h2 className="font-bold">
                {selected ? (peopleById.get(selected)?.full_name ?? "Conversa") : "Nova conversa"}
              </h2>
              {selected && (
                <p className="text-xs text-muted-foreground">
                  @{peopleById.get(selected)?.username}
                </p>
              )}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {currentMessages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-xl p-3 text-sm ${m.sender_id === user.id ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className="mt-1 text-right text-[10px] opacity-70">
                    {new Date(m.created_at).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="space-y-2 border-t border-border p-4">
              {!selected && (
                <>
                  <Label htmlFor="recipient">Iniciar conversa com @usuário</Label>
                  <Input
                    id="recipient"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="@ana.souza"
                    required
                  />
                </>
              )}
              <div className="flex gap-2">
                <Textarea
                  aria-label="Mensagem"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  // ✏️ ALTERAÇÃO 7 (de novo): encoding corrigido aqui também
                  placeholder="Escreva uma mensagem…"
                  maxLength={2000}
                  required
                  className="min-h-10"
                />
                <Button type="submit" disabled={busy}>
                  <Send /> Enviar
                </Button>
              </div>
              <p className="text-right text-xs text-muted-foreground">{text.length}/2000</p>
            </form>
          </section>
        </div>
      )}
    </AppShell>
  );
}
