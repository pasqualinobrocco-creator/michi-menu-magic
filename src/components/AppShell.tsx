import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Banknote, CalendarDays, CalendarRange, Archive, ChartColumn, Clock, Coffee, Settings, LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { MichiLogo } from "@/components/MichiLogo";
import { supabase } from "@/integrations/supabase/client";
import { useLogos } from "@/lib/logos";

const NAV = [
  { to: "/gestione", label: "Oggi", icon: CalendarDays },
  { to: "/settimana", label: "Settimana", icon: CalendarRange },
  { to: "/fissi", label: "Fissi", icon: Coffee },
  { to: "/prezzi", label: "Prezzi", icon: Banknote },
  { to: "/orari-gestione", label: "Orari", icon: Clock },
  { to: "/archivio", label: "Archivio", icon: Archive },
  { to: "/statistiche", label: "Visite", icon: ChartColumn },
  { to: "/impostazioni", label: "Impostazioni", icon: Settings },
] as const;

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: logos } = useLogos();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-card/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <MichiLogo variant="dark" width={110} src={logos?.dark ?? null} />
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary"
          >
            <LogOut className="h-3.5 w-3.5" /> Esci
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        <h1 className="mb-4 font-serif text-3xl tracking-tight text-foreground">
          {title}
        </h1>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card">
        <div className="mx-auto flex max-w-3xl">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/gestione" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
