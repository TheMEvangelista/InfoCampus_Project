import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Community } from "@/lib/content";
import { Button } from "@/components/UI/button";

export function CommunityTile({ community }: { community: Community }) {
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const member = community.community_members.some((m) => m.user_id === user?.id);
  async function toggle() {
    if (!user) return toast.error("Entre na sua conta para participar.");
    setBusy(true);
    const result = member
      ? await supabase
          .from("community_members")
          .delete()
          .eq("community_id", community.id)
          .eq("user_id", user.id)
      : await supabase
          .from("community_members")
          .insert({ community_id: community.id, user_id: user.id });
    setBusy(false);
    if (result.error) return toast.error(result.error.message);
    await queryClient.invalidateQueries({ queryKey: ["communities"] });
  }
  const memberCount = community.community_members.length;
  return (
    <article className="flex min-h-[6.3rem] items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm transition-shadow hover:shadow-card">
      <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-deep">
        <Users className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-foreground"><Link to="/comunidade/$slug" params={{ slug: community.slug }} className="hover:text-primary-deep hover:underline">{community.name}</Link></h2>
        <Link to="/comunidade/$slug" params={{ slug: community.slug }} className="mt-0.5 line-clamp-2 text-sm text-muted-foreground hover:underline">{community.description || "Conheça a comunidade e participe das conversas."}</Link>
        <span className="mt-1.5 block text-xs text-muted-foreground">
          {memberCount} {memberCount === 1 ? "membro" : "membros"}
        </span>
      </div>
      <Button
        size="sm"
        variant={member ? "outline" : "default"}
        onClick={toggle}
        disabled={busy}
        className="shrink-0"
      >
        {busy ? "Aguarde..." : member ? "Sair" : "Participar"}
      </Button>
    </article>
  );
}
