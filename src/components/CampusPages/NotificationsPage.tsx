import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Empty, PageHeading } from "@/components/CampusContent";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LoginPrompt } from "./LoginPrompt";

export function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <AppShell>
      <PageHeading title="NotificaÃ§ões" subtitle="Novidades para você." />
      {!user ? (
        <LoginPrompt />
      ) : (
        <div className="space-y-3">
          {data?.map((n) => (
            <div
              key={n.id}
              className="flex items-center gap-3 rounded-md border border-border bg-card p-4"
            >
              <Bell className="h-5 w-5 text-primary-deep" />
              <p className="flex-1 text-sm">{n.message}</p>
              {!n.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await supabase.from("notifications").update({ read: true }).eq("id", n.id);
                    queryClient.invalidateQueries({ queryKey: ["notifications"] });
                    queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
                  }}
                >
                  Marcar como lida
                </Button>
              )}
            </div>
          ))}
          {data?.length === 0 && <Empty text="Nenhuma notificação por enquanto." />}
        </div>
      )}
    </AppShell>
  );
}
