import { useNavigate } from "@tanstack/react-router";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IFMA_SITE, INSTITUTIONAL_DOMAIN, isInstitutionalEmail } from "@/lib/auth";
import { isSafeHttpUrl } from "@/lib/url";

export function useHandleSignup(setLoading: Dispatch<SetStateAction<boolean>>) {
  const navigate = useNavigate();
  return async function (e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("full_name") ?? "").trim();
    const username = String(form.get("username") ?? "")
      .trim()
      .toLowerCase();
    const avatarUrl = String(form.get("avatar_url") ?? "").trim();

    if (!isInstitutionalEmail(email)) {
      toast.error("Cadastro somente para estudantes do IFMA", {
        description: `Use um e-mail @${INSTITUTIONAL_DOMAIN}.`,
      });
      setTimeout(() => {
        window.location.href = IFMA_SITE;
      }, 2500);
      return;
    }
    if (fullName.length < 3) return toast.error("Informe seu nome completo.");
    if (username.length < 3) return toast.error("Escolha um nome de usuário com 3+ caracteres.");
    if (password.length < 6) return toast.error("A senha precisa ter ao menos 6 caracteres.");
    if (avatarUrl && !isSafeHttpUrl(avatarUrl)) {
      return toast.error("Link da foto inválido", {
        description: "Use um endereço que comece com http:// ou https://.",
      });
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, username, avatar_url: avatarUrl || null },
      },
    });
    setLoading(false);
    if (error) {
      if (
        /already registered|already been registered|user exists|duplicate key/i.test(error.message)
      ) {
        toast.error("Este e-mail institucional já possui uma conta.", {
          description: "Entre com a conta existente ou recupere sua senha.",
        });
        return;
      }
      // O banco bloqueia domínios externos no trigger de auth.users.
      const blockedByDatabase = /database error|institucion/i.test(error.message);
      toast.error("Não foi possível cadastrar", {
        description: blockedByDatabase
          ? `Confirme que está usando seu e-mail institucional (@${INSTITUTIONAL_DOMAIN}).`
          : error.message,
      });
      return;
    }
    toast.success("Conta criada com sucesso. Você já está conectado.");
    navigate({ to: "/" });
  };
}
