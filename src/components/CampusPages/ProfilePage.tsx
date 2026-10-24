import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Search,
  Settings,
  UserRoundPlus,
  UserRoundCheck,
  MessageCircle,
  GraduationCap,
  Users,
  UserRound,
  FileText,
  Instagram,
  Music2,
  AtSign,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Empty, PostCard } from "@/components/CampusContent";
import { Composer } from "@/components/CampusContent/Composer";
import { useAuth, useProfile } from "@/lib/auth";
import { safeUrl } from "@/lib/url";
import { supabase } from "@/integrations/supabase/client";
import { dateLong } from "@/lib/format";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
import { useCampusData } from "@/hooks/useCampusData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/UI/popover";

const sortName = (a: { full_name: string }, b: { full_name: string }) =>
  a.full_name.localeCompare(b.full_name, "pt-BR");

export function ProfilePage({ username }: { username: string }) {
  const { user } = useAuth();
  const { data: self } = useProfile();
  const { posts, communities } = useCampusData();
  const queryClient = useQueryClient();
  const [communityFilter, setCommunityFilter] = useState<string | null>(null);
  const [communitySearch, setCommunitySearch] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [communityLimit, setCommunityLimit] = useState(4);
  const [friendLimit, setFriendLimit] = useState(6);
  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const isOwner = self?.id === profile?.id;
  const allProfilePosts = useMemo(
    () => (posts.data ?? []).filter((post) => post.author_id === profile?.id),
    [posts.data, profile?.id],
  );
  const profilePosts = useMemo(
    () =>
      allProfilePosts.filter((post) => !communityFilter || post.community_id === communityFilter),
    [allProfilePosts, communityFilter],
  );
  const { data: friendship } = useQuery({
    queryKey: ["friendship", user?.id, profile?.id],
    enabled: !!user && !!profile && !isOwner,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friend_requests")
        .select("*")
        .or(
          `and(requester_id.eq.${user!.id},recipient_id.eq.${profile!.id}),and(requester_id.eq.${profile!.id},recipient_id.eq.${user!.id})`,
        )
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: profileCommunities = [] } = useQuery({
    queryKey: ["profile-communities", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("communities(id,name,slug,cover_url)")
        .eq("user_id", profile!.id);
      if (error) throw error;
      return (data ?? [])
        .flatMap((row) => (row.communities ? [row.communities] : []))
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    },
  });
  const { data: profileFriends = [] } = useQuery({
    queryKey: ["profile-friends", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friend_requests")
        .select("requester_id,recipient_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${profile!.id},recipient_id.eq.${profile!.id}`);
      if (error) throw error;
      const ids = [
        ...new Set(
          (data ?? []).map((row) =>
            row.requester_id === profile!.id ? row.recipient_id : row.requester_id,
          ),
        ),
      ];
      if (!ids.length) return [];
      const { data: people, error: peopleError } = await supabase
        .from("profiles")
        .select("id,username,full_name,avatar_url,course")
        .in("id", ids);
      if (peopleError) throw peopleError;
      return (people ?? []).sort(sortName);
    },
  });

  async function requestFriend() {
    if (!user || !profile) return toast.error("Entre na sua conta para adicionar amigos.");
    if (friendship) {
      if (friendship.status === "pending" && friendship.recipient_id === user.id) {
        const { error } = await supabase
          .from("friend_requests")
          .update({ status: "accepted" })
          .eq("id", friendship.id);
        if (error) return toast.error(error.message);
        toast.success("Solicitação aceita!");
      } else if (friendship.status === "accepted") {
        const { error } = await supabase.from("friend_requests").delete().eq("id", friendship.id);
        if (error) return toast.error(error.message);
        toast.success("Amizade removida.");
      } else return toast.info("Solicitação de amizade enviada.");
    } else {
      const { error } = await supabase
        .from("friend_requests")
        .insert({ requester_id: user.id, recipient_id: profile.id });
      if (error) return toast.error(error.message);
      toast.success("Solicitação de amizade enviada!");
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["friendship", user.id, profile.id] }),
      queryClient.invalidateQueries({ queryKey: ["profile-friends"] }),
    ]);
  }

  const filteredCommunities = profileCommunities.filter((item) =>
    item.name.toLocaleLowerCase("pt-BR").includes(communitySearch.toLocaleLowerCase("pt-BR")),
  );
  const filteredFriends = profileFriends.filter((item) =>
    item.full_name.toLocaleLowerCase("pt-BR").includes(friendSearch.toLocaleLowerCase("pt-BR")),
  );
  const ownCommunityOptions = (communities.data ?? [])
    .filter((item) => item.community_members.some((member) => member.user_id === profile?.id))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const friendLabel =
    friendship?.status === "accepted"
      ? "Amigos"
      : friendship?.recipient_id === user?.id
        ? "Aceitar amizade"
        : friendship?.status === "pending"
          ? "Solicitação enviada"
          : "Adicionar amigo";
  const publicLinks = profile?.links && typeof profile.links === "object" && !Array.isArray(profile.links)
    ? profile.links as Record<string, unknown>
    : {};
  const profileLinks = ([
    ["curriculo", "Currículo", FileText],
    ["instagram", "Instagram", Instagram],
    ["tiktok", "TikTok", Music2],
    ["twitter", "Twitter / X", AtSign],
  ] as const).flatMap(([key, label, Icon]) => {
    const value = publicLinks[key];
    const url = typeof value === "string" ? safeUrl(value) : null;
    return url ? [{ label, url, Icon }] : [];
  });

  return (
    <AppShell>
      {!profile ? (
        <Empty text={isLoading ? "Carregando perfil..." : "Perfil não encontrado."} />
      ) : (
        <>
          <section
            className="overflow-hidden rounded-xl border border-border bg-card shadow-card sm: pt-14"
            aria-label="Informações do perfil"
          >
            <div className="px-4 pb-4 sm:px-7">
              <div className="-mt-8 flex flex-wrap items-center gap-3 sm:-mt-9">
                <Avatar className="h-16 w-16 border-4 border-card sm:h-18 sm:w-18">
                  <AvatarImage src={safeUrl(profile.avatar_url) ?? undefined} />
                  <AvatarFallback className="text-xl">{profile.full_name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-40 flex-1">
                  <h1 className="text-xl font-extrabold">{profile.full_name}</h1>
                  {isOwner && user?.email && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pb-1">
                  {isOwner ? (
                    <>
                      <Button asChild>
                        <Link to="/editar-perfil">Editar</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to="/configuracoes">
                          <Settings /> Configurações
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => void requestFriend()}
                        disabled={
                          friendship?.status === "pending" && friendship.requester_id === user?.id
                        }
                        variant={friendship?.status === "accepted" ? "outline" : "default"}
                      >
                        {friendship?.status === "accepted" ? <UserRoundCheck /> : <UserRoundPlus />}
                        {friendLabel}
                      </Button>
                      <Button asChild variant="outline">
                        <Link to="/mensagens" search={{ para: profile.username }}>
                          <MessageCircle /> Mensagem
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <p className="flex gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span>
                    <b>Curso:</b> {profile.course || "Não informado"}
                  </span>
                </p>
                <p className="flex gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>
                    <b>Turma:</b> {profile.cohort || "Não informada"}
                  </span>
                </p>
              </div>
              {profile.bio && (
                <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm leading-relaxed">
                  <UserRound className="mt-0.5 hidden h-4 w-4 shrink-0 text-primary sm:block" />
                  <span><b>Bio:</b> {profile.bio}</span>
                </p>
              )}
              {profileLinks.length > 0 && (
                <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Links do perfil">
                  {profileLinks.map(({ label, url, Icon }) => (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline">
                      <Icon className="hidden h-4 w-4 sm:block" />
                      {label}
                    </a>
                  ))}
                </nav>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Na comunidade desde {dateLong(profile.created_at)}
              </p>
              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-4 text-sm">
                <span>
                  <b>{allProfilePosts.length}</b>{" "}
                  <span className="text-muted-foreground">posts</span>
                </span>
                <span>
                  <b>{profileCommunities.length}</b>{" "}
                  <span className="text-muted-foreground">comunidades</span>
                </span>
                <span>
                  <b>{profileFriends.length}</b>{" "}
                  <span className="text-muted-foreground">amigos</span>
                </span>
              </div>
            </div>
          </section>
          <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section className="min-w-0" aria-label="Publicações">
              {isOwner && (
                <div className="mb-10 rounded-xl">
                  <Composer />
                </div>
              )}
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">Publicações</h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-32 justify-between rounded-lg">
                      {communityFilter
                        ? ownCommunityOptions.find((item) => item.id === communityFilter)?.name
                        : "Todas"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-56 p-1">
                    <button
                      className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                      onClick={() => setCommunityFilter(null)}
                    >
                      Todas
                    </button>
                    {ownCommunityOptions.map((item) => (
                      <button
                        key={item.id}
                        className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => setCommunityFilter(item.id)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-4">
                {profilePosts.map((post) => (
                  <PostCard post={post} key={post.id} />
                ))}
                {!posts.isLoading && profilePosts.length === 0 && (
                  <Empty text="Nenhuma publicação encontrada." />
                )}
              </div>
            </section>
            <aside className="space-y-4">
              <section className="rounded-xl border border-border bg-card p-4 shadow-card">
                <h2 className="font-bold">Comunidades</h2>
                <div className="relative my-3">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    aria-label="Buscar comunidades"
                    placeholder="Buscar comunidades"
                    value={communitySearch}
                    onChange={(event) => {
                      setCommunitySearch(event.target.value);
                      setCommunityLimit(4);
                    }}
                  />
                </div>
                <div
                  className="max-h-112 space-y-2 overflow-y-auto"
                  onScroll={(event) => {
                    const el = event.currentTarget;
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20)
                      setCommunityLimit((limit) => Math.min(limit + 4, filteredCommunities.length));
                  }}
                >
                  {filteredCommunities.slice(0, communityLimit).map((item) => (
                    <Link
                      to="/comunidades"
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
                    >
                      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-muted">
                        {safeUrl(item.cover_url) ? (
                          <img
                            src={safeUrl(item.cover_url)!}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                      </span>
                      <span className="truncate text-sm font-medium">{item.name}</span>
                    </Link>
                  ))}
                  {filteredCommunities.length === 0 && (
                    <p className="py-3 text-sm text-muted-foreground">Nenhuma comunidade.</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="mt-2 w-full bg-emerald-100"
                  onClick={() =>
                    setCommunityLimit((limit) =>
                      Math.min(Math.max(4, profileCommunities.length), limit === 4 ? 8 : limit + 4),
                    )
                  }
                >
                  Ver comunidades
                </Button>
              </section>
              <section className="rounded-xl border border-border bg-card p-4 shadow-card">
                <h2 className="font-bold">Amigos</h2>
                <div className="relative my-3">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    aria-label="Buscar amigos"
                    placeholder="Buscar amigos"
                    value={friendSearch}
                    onChange={(event) => {
                      setFriendSearch(event.target.value);
                      setFriendLimit(6);
                    }}
                  />
                </div>
                <div
                  className="max-h-112 space-y-2 overflow-y-auto"
                  onScroll={(event) => {
                    const el = event.currentTarget;
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20)
                      setFriendLimit((limit) => Math.min(limit + 6, filteredFriends.length));
                  }}
                >
                  {filteredFriends.slice(0, friendLimit).map((person) => (
                    <Link
                      to="/perfil/$username"
                      params={{ username: person.username }}
                      key={person.id}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={safeUrl(person.avatar_url) ?? undefined} />
                        <AvatarFallback>{person.full_name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {person.full_name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {person.course || "Estudante"}
                        </span>
                      </span>
                    </Link>
                  ))}
                  {filteredFriends.length === 0 && (
                    <p className="py-3 text-sm text-muted-foreground">Nenhum amigo.</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="mt-2 w-full bg-emerald-100"
                  onClick={() =>
                    setFriendLimit((limit) =>
                      Math.min(Math.max(6, profileFriends.length), limit === 6 ? 12 : limit + 6),
                    )
                  }
                >
                  Ver amigos
                </Button>
              </section>
            </aside>
          </div>
        </>
      )}
    </AppShell>
  );
}
