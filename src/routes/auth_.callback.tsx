import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { takeOAuthRedirect } from "@/lib/oauth";

export const Route = createFileRoute("/auth_/callback")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Signing in — Dearkin" }, { name: "robots", content: "noindex" }],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const providerError =
        url.searchParams.get("error_description") ?? hash.get("error_description");
      if (providerError) {
        toast.error(providerError);
        navigate({ to: "/auth", replace: true });
        return;
      }

      // getSession waits for the client to finish reading tokens from the URL.
      let {
        data: { session },
      } = await supabase.auth.getSession();
      const code = url.searchParams.get("code");
      if (!session && code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) toast.error(error.message);
        session = data.session;
      }
      if (cancelled) return;
      if (!session) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      const redirect = takeOAuthRedirect();
      if (redirect) window.location.replace(redirect);
      else navigate({ to: "/today", replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <p className="font-serif text-lg text-muted-foreground">Signing you in…</p>
    </div>
  );
}
