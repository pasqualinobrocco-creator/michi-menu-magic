import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { fetchPageVisits } from "@/lib/data";
import { formatDateLong } from "@/lib/menu";

const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/menu": "Menu del giorno",
  "/orari": "Orari",
};

export const Route = createFileRoute("/_authenticated/statistiche")({
  head: () => ({
    meta: [
      { title: "Visite — Michì Menu Manager" },
      {
        name: "description",
        content:
          "Statistiche delle visite alle pagine pubbliche di MICHÍ, giorno per giorno.",
      },
    ],
  }),
  component: StatistichePage,
});

function StatistichePage() {
  const visits = useQuery({
    queryKey: ["page-visits"],
    queryFn: () => fetchPageVisits(30),
    refetchInterval: 30000,
  });

  const rows = visits.data ?? [];
  const byDay = new Map<string, { total: number; pages: Map<string, number> }>();
  for (const r of rows) {
    const day = byDay.get(r.visit_date) ?? { total: 0, pages: new Map() };
    day.total += r.visits;
    day.pages.set(r.page, (day.pages.get(r.page) ?? 0) + r.visits);
    byDay.set(r.visit_date, day);
  }
  const days = [...byDay.entries()];
  const maxTotal = Math.max(1, ...days.map(([, d]) => d.total));
  const grandTotal = rows.reduce((s, r) => s + r.visits, 0);

  return (
    <AppShell title="Visite del sito">
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="font-serif text-4xl">{grandTotal}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Visite totali negli ultimi 30 giorni
          </p>
        </div>

        {visits.isPending ? (
          <p className="text-sm text-muted-foreground">Caricamento…</p>
        ) : days.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nessuna visita registrata finora. Il conteggio parte da oggi.
          </p>
        ) : (
          days.map(([date, d]) => (
            <section
              key={date}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-xl">{formatDateLong(date)}</h2>
                <p className="text-sm font-medium">
                  {d.total} {d.total === 1 ? "visita" : "visite"}
                </p>
              </div>
              <div
                className="mt-2 h-2 rounded-full bg-secondary"
                role="img"
                aria-label={`${d.total} visite`}
              >
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.round((d.total / maxTotal) * 100)}%` }}
                />
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {[...d.pages.entries()].map(([page, n]) => (
                  <li key={page} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {PAGE_LABELS[page] ?? page}
                    </span>
                    <span className="font-medium">{n}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </AppShell>
  );
}
