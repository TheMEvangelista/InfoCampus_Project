import { AppShell } from "@/components/AppShell";
import { BackButton, PageHeading } from "@/components/CampusContent";
import { LoginPrompt } from "@/components/CampusPages/LoginPrompt";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/lib/auth";
import { safeUrl } from "@/lib/url";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Heart, Send, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

type Person = { id: string; username: string; full_name: string; avatar_url: string | null };
const FAVORITES_LIMIT = 3;
const EMPTY_PEOPLE: Person[] = [];

export function MessagesPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const routeSearch = useRouterState({ select: (state) => state.location.search }) as {
    para?: string;
  };
  const [recipient, setRecipient] = useState(routeSearch.para ?? "");
  const [text, setText] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const lastSentAt = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    try {
      const value = localStorage.getItem(`message-favorites:${user.id}`);
      setFavorites(value ? (JSON.parse(value) as string[]).slice(0, FAVORITES_LIMIT) : []);
    } catch {
      setFavorites([]);
    }
  }, [user]);

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
      if (!ids.length) return [] as Person[];
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,full_name,avatar_url")
        .in("id", ids);
      if (error) throw error;
      return (data ?? []) as Person[];
    },
  });
  const {
    data: friends = EMPTY_PEOPLE,
    isLoading: friendsLoading,
    isError: friendsError,
  } = useQuery({
    queryKey: ["message-friends", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: requests, error: requestsError } = await supabase
        .from("friend_requests")
        .select("requester_id,recipient_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user!.id},recipient_id.eq.${user!.id}`);
      if (requestsError) throw requestsError;
      const ids = [
        ...new Set(
          (requests ?? []).map((request) =>
            request.requester_id === user!.id ? request.recipient_id : request.requester_id,
          ),
        ),
      ];
      if (!ids.length) return [] as Person[];
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username,full_name,avatar_url")
        .in("id", ids);
      if (error) throw error;
      return ((data ?? []) as Person[]).sort((a, b) =>
        a.full_name.localeCompare(b.full_name, "pt-BR") ||
        a.username.localeCompare(b.username, "pt-BR"),
      );
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`messages:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        () => void queryClient.invalidateQueries({ queryKey: ["messages", user.id] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  type Message = NonNullable<typeof messages>[number];
  const conversations = useMemo(() => {
    const groups: Record<string, Message[]> = {};
    for (const message of messages ?? []) {
      const other = message.sender_id === user?.id ? message.recipient_id : message.sender_id;
      (groups[other] ??= []).push(message);
    }
    return groups;
  }, [messages, user?.id]);
  const sortedConversations = useMemo(
    () =>
      Object.entries(conversations)
        .flatMap(([id, list]) => {
          const last = list[list.length - 1];
          return last ? [{ id, list, last }] : [];
        })
        .sort(
          (a, b) =>
            Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)) ||
            b.last.created_at.localeCompare(a.last.created_at),
        ),
    [conversations, favorites],
  );
  const peopleById = new Map([...(people ?? []), ...friends].map((person) => [person.id, person]));
  const friendIds = new Set(friends.map((person) => person.id));
  const lastMessagedFriendId = useMemo(() => {
    const latestSentMessage = (messages ?? [])
      .filter((message) => message.sender_id === user?.id)
      .reduce<Message | null>(
        (latest, message) =>
          !latest || message.created_at > latest.created_at ? message : latest,
        null,
      );
    return latestSentMessage && friends.some((friend) => friend.id === latestSentMessage.recipient_id)
      ? latestSentMessage.recipient_id
      : null;
  }, [messages, user?.id, friends]);
  const orderedFriends = useMemo(() => {
    if (!lastMessagedFriendId) return friends;
    const first = friends.find((friend) => friend.id === lastMessagedFriendId);
    return first ? [first, ...friends.filter((friend) => friend.id !== first.id)] : friends;
  }, [friends, lastMessagedFriendId]);
  const friendConversations = orderedFriends.map((person) => {
    const list = conversations[person.id] ?? [];
    return { id: person.id, person, list, last: list[list.length - 1] };
  });
  const otherConversations = sortedConversations
    .filter(({ id }) => !friendIds.has(id))
    .map(({ id, list, last }) => ({ id, person: peopleById.get(id), list, last }));
  const term = search.trim().toLocaleLowerCase("pt-BR");
  const matchesSearch = (person?: Person) =>
    !term ||
    Boolean(
      person?.full_name.toLocaleLowerCase("pt-BR").includes(term) ||
        person?.username.toLocaleLowerCase("pt-BR").includes(term),
    );
  const visibleFriends = friendConversations.filter(({ person }) => matchesSearch(person));
  const visibleOtherConversations = otherConversations.filter(({ person }) => matchesSearch(person));
  const visibleConversations = [...visibleFriends, ...visibleOtherConversations];
  const selected = activeId ?? orderedFriends[0]?.id ?? sortedConversations[0]?.id ?? null;
  const currentMessages = selected ? (conversations[selected] ?? []) : [];

  useEffect(() => {
    if (!routeSearch.para) return;
    const requested = [...(people ?? []), ...friends].find(
      (person) =>
        person.username.toLowerCase() === routeSearch.para!.replace(/^@/, "").toLowerCase(),
    );
    if (requested) {
      setActiveId(requested.id);
      setMobileThreadOpen(true);
    }
  }, [routeSearch.para, people, friends]);

  function renderConversation(contact: {
    id: string;
    person?: Person;
    list: Message[];
    last?: Message;
  }) {
    const { id, person, list, last } = contact;
    const unread = list.some((message) => message.recipient_id === user?.id && !message.read);
    return (
      <div
        key={id}
        className={`group flex items-center gap-3 border-b border-border/70 px-4 py-3 ${selected === id ? "bg-primary/10" : "hover:bg-background/70"}`}
      >
        <button
          onClick={() => {
            setActiveId(id);
            setMobileThreadOpen(true);
          }}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarImage src={safeUrl(person?.avatar_url) ?? undefined} />
            <AvatarFallback>{person?.full_name?.slice(0, 1) ?? "?"}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <strong className="truncate text-sm">{person?.full_name ?? "Estudante"}</strong>
              {last && (
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {new Date(last.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </span>
            <span className="flex items-center justify-between gap-2">
              <span className="truncate text-xs text-muted-foreground">
                {last?.content ?? "Comece uma conversa"}
              </span>
              {unread && (
                <i className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Mensagem não lida" />
              )}
            </span>
          </span>
        </button>
        <button
          onClick={() => toggleFavorite(id)}
          aria-label={favorites.includes(id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          title={favorites.includes(id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-background hover:text-primary"
        >
          <Star className={`h-4 w-4 ${favorites.includes(id) ? "fill-primary text-primary" : ""}`} />
        </button>
      </div>
    );
  }

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
  }, [selected, user, conversations, queryClient]);

  function toggleFavorite(id: string) {
    const next = favorites.includes(id)
      ? favorites.filter((favorite) => favorite !== id)
      : [...favorites, id];
    if (next.length > FAVORITES_LIMIT) return toast.error("Você pode favoritar apenas 3 conversas");
    setFavorites(next);
    if (user) localStorage.setItem(`message-favorites:${user.id}`, JSON.stringify(next));
    toast.success(
      next.includes(id) ? "Perfil adicionado aos favoritos." : "Perfil removido dos favoritos.",
    );
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const content = text.trim();
    if (!content) return toast.error("Escreva uma mensagem.");
    if (content.length > 2000) return toast.error("A mensagem pode ter no máximo 2000 caracteres.");
    if (Date.now() - lastSentAt.current < 1500)
      return toast.error("Aguarde um instante antes de enviar outra mensagem.");
    setBusy(true);
    let targetId = selected;
    if (recipient.trim()) {
      const { data: target, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", recipient.replace(/^@/, "").trim())
        .maybeSingle();
      if (error || !target) {
        setBusy(false);
        return toast.error("Usuário não encontrado.");
      }
      targetId = target.id;
    }
    if (!targetId || targetId === user.id) {
      setBusy(false);
      return toast.error("Escolha uma conversa válida.");
    }
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: user.id, recipient_id: targetId, content });
    setBusy(false);
    if (error)
      return toast.error("Não foi possível enviar a mensagem.", { description: error.message });
    lastSentAt.current = Date.now();
    setText("");
    setRecipient("");
    setActiveId(targetId);
    setMobileThreadOpen(true);
    void queryClient.invalidateQueries({ queryKey: ["messages", user.id] });
  }

  return (
    <AppShell immersive>
      <div className="flex h-full min-h-0 flex-col px-1 md:px-0">
        <div className="shrink-0 pt-1 md:pt-4">
          <BackButton fallbackTo="/" />
          <div className="hidden md:block">
            <PageHeading title="Mensagens" className="mb-5 border-b border-border pb-3" />
          </div>
        </div>
        {!user ? (
          <div className="grid min-h-0 flex-1 place-items-center p-6">
            <LoginPrompt />
          </div>
        ) : (
          <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden pb-4 md:grid-cols-[300px_minmax(0,1fr)]">
            <aside
              className={`${mobileThreadOpen ? "hidden md:flex" : "flex"} min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card`}
            >
              <div className="flex items-center gap-3 border-b border-border px-5 py-5">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={safeUrl(profile?.avatar_url) ?? undefined} />
                  <AvatarFallback>{profile?.full_name?.slice(0, 1) ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{profile?.full_name ?? "Mensagens"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile ? `@${profile.username}` : "Suas conversas"}
                  </p>
                </div>
              </div>
              <div className="border-b border-border p-4">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar amigos e conversas"
                  aria-label="Buscar amigos e conversas"
                  className="rounded-full bg-background"
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">
                <div className="px-4 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Amigos
                </div>
                {isLoading || friendsLoading ? (
                  <p className="p-4 text-sm text-muted-foreground">Carregando conversas…</p>
                ) : isError || friendsError ? (
                  <p className="p-4 text-sm text-destructive">
                    Não foi possível carregar suas conversas.
                  </p>
                ) : visibleConversations.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    {search ? "Nenhuma conversa encontrada." : "Você ainda não tem conversas."}
                  </p>
                ) : (
                  <>
                    {visibleFriends.map(renderConversation)}
                    {visibleOtherConversations.length > 0 && (
                      <>
                        <div className="px-4 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Outras conversas
                        </div>
                        {visibleOtherConversations.map(renderConversation)}
                      </>
                    )}
                  </>
                )}
              </div>
            </aside>

            <section
              className={`${mobileThreadOpen ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card`}
            >
              <header className="flex min-h-19 items-center gap-3 border-b border-border px-4 md:px-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Voltar para conversas"
                  onClick={() => setMobileThreadOpen(false)}
                >
                  <ArrowLeft />
                </Button>
                {selected ? (
                  <>
                    <Avatar className="h-11 w-11">
                      <AvatarImage
                        src={safeUrl(peopleById.get(selected)?.avatar_url) ?? undefined}
                      />
                      <AvatarFallback>
                        {peopleById.get(selected)?.full_name?.slice(0, 1) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h1 className="truncate font-semibold">
                        {peopleById.get(selected)?.full_name ?? "Conversa"}
                      </h1>
                      <p className="truncate text-xs text-muted-foreground">
                        @{peopleById.get(selected)?.username}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={
                        favorites.includes(selected)
                          ? "Remover perfil dos favoritos"
                          : "Favoritar perfil"
                      }
                      title={
                        favorites.includes(selected) ? "Remover dos favoritos" : "Favoritar perfil"
                      }
                      onClick={() => toggleFavorite(selected)}
                    >
                      <Heart
                        className={`h-5 w-5 ${favorites.includes(selected) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <h1 className="font-semibold">Nova conversa</h1>
                      <p className="text-xs text-muted-foreground">
                        Envie uma mensagem para alguém do campus
                      </p>
                    </div>
                  </>
                )}
              </header>
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 scrollbar-none md:px-8 md:py-6">
                {currentMessages.map((message) => {
                  const mine = message.sender_id === user.id;
                  const sender = peopleById.get(message.sender_id);
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                    >
                      {!mine && (
                        <Avatar className="mb-1 h-7 w-7 shrink-0">
                          <AvatarImage src={safeUrl(sender?.avatar_url) ?? undefined} />
                          <AvatarFallback>{sender?.full_name?.slice(0, 1) ?? "?"}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm md:max-w-[70%] ${mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground"}`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`mt-1 text-right text-[10px] ${mine ? "opacity-70" : "text-muted-foreground"}`}
                        >
                          {new Date(message.created_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={send} className="border-t border-border p-3 md:px-6 md:py-4">
                {!selected && (
                  <Input
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value)}
                    placeholder="Iniciar conversa com @usuário"
                    aria-label="Nome de usuário do destinatário"
                    className="mb-3"
                    required
                  />
                )}
                <div className="flex items-end gap-2 rounded-2xl p-2">
                  <Textarea
                    aria-label="Mensagem"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Escreva uma mensagem…"
                    maxLength={2000}
                    required
                    className="max-h-28 min-h-11 resize-none border-1 bg-background shadow-none"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={busy}
                    aria-label="Enviar mensagem"
                    className="h-11 w-11 shrink-0 rounded-full"
                  >
                    <Send />
                  </Button>
                </div>
                <p className="mt-1 text-right text-[10px] text-muted-foreground">
                  {text.length}/2000
                </p>
              </form>
            </section>
          </main>
        )}
      </div>
    </AppShell>
  );
}
