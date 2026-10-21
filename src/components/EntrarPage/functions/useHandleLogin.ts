import { useNavigate } from "@tanstack/react-router";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IFMA_SITE, INSTITUTIONAL_DOMAIN, isInstitutionalEmail } from "@/lib/auth";
import { isSafeHttpUrl } from "@/lib/url";

export function useHandleLogin(setLoading: Dispatch<SetStateAction<boolean>>) {
  const navigate = useNavigate();
  return async function (e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!isInstitutionalEmail(email)) {
      toast.error("Você não é aluno do IFMA", {
        description: `Use um e-mail @${INSTITUTIONAL_DOMAIN}. Redirecionando para o site do IFMA...`,
      });
      setTimeout(() => {
        window.location.href = IFMA_SITE;
      }, 2500);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    navigate({ to: "/" });
  };
}
