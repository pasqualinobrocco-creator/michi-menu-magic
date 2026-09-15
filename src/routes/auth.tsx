import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MichiLogo } from "@/components/MichiLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accesso — Michì Menu Manager" },
      {
        name: "description",
        content: "Area riservata al personale di MICHÍ — Caffè & Cucina.",
      },
      { property: "og:title", content: "Accesso — Michì Menu Manager" },
      {
        property: "og:description",
        content: "Area riservata al personale di MICHÍ — Caffè & Cucina.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const fn =
      mode === "in"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          });
    const { data, error } = await fn;
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "Email o password non corretti"
          : error.message,
      );
      return;
    }
    if (!data.session) {
      toast.success("Account creato. Ora puoi accedere.");
      setMode("in");
      return;
    }
    void navigate({ to: "/", replace: true });
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#527879" }}
    >
      <MichiLogo variant="light" width={220} />
      <form
        onSubmit={submit}
        className="mt-10 w-full max-w-sm space-y-4 rounded-2xl bg-card p-6 shadow-xl"
      >
        <h1 className="text-center font-serif text-2xl">
          {mode === "in" ? "Accedi" : "Crea account"}
        </h1>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {mode === "in" ? "Entra" : "Registrati"}
        </Button>
        <button
          type="button"
          className="w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
        >
          {mode === "in"
            ? "Non hai un account? Registrati"
            : "Hai già un account? Accedi"}
        </button>
      </form>
    </div>
  );
}
