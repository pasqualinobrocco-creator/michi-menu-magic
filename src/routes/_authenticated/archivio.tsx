import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/AppShell";
import { fetchArchive } from "@/lib/data";
import { formatDateLong } from "@/lib/menu";

export const Route = createFileRoute("/_authenticated/archivio")({
  head: () => ({
    meta: [
      { title: "Archivio menu — Michì" },
      {
        name: "description",
        content: "Tutti i menu dei giorni passati di MICHÍ, pronti da riutilizzare.",
      },
      { property: "og:title", content: "Archivio menu — Michì" },
      {
        property: "og:description",
        content: "Tutti i menu dei giorni passati di MICHÍ, pronti da riutilizzare.",
      },
    ],
  }),
  component: ArchivioPage,
});

function ArchivioPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["archive"],
    queryFn: fetchArchive,
  });

  return (
    <AppShell title="Archivio">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Caricamento…</p>
      ) : !data?.length ? (
        <p className="text-sm text-muted-foreground">
          Nessun menu salvato per ora.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() =>
                  void navigate({ to: "/", search: { data: m.menu_date } })
                }
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary"
              >
                <span className="font-serif text-lg">
                  {formatDateLong(m.menu_date)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                    m.status === "published"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {m.status === "published" ? "Pubblicato" : "Bozza"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
