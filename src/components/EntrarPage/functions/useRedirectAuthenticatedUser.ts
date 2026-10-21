import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export function useRedirectAuthenticatedUser(isAuthenticated: boolean) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      navigate({ to: "/redefinir-senha", replace: true });
    } else {
      navigate({ to: "/", replace: true });
    }
  }, [isAuthenticated, navigate]);
}
