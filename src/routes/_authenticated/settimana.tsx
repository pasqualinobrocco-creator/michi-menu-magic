import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { addDays, startOfWeek, isValid, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GraphicStudio } from "@/components/GraphicStudio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchMenuByDate } from "@/lib/data";
import { useLogos } from "@/lib/logos";
import { SECTIONS, todayISO, toISODate, formatDateLong, formatDateDots } from "@/lib/menu";

function monday(date: string) { return toISODate(startOfWeek(parseISO(date), { weekStartsOn: 1 })); }
function weekQuery(date: string) {
  const start = monday(date);
  return queryOptions({
    queryKey: ["weekly-menus", start],
    queryFn: () => Promise.all(Array.from({ length: 7 }, async (_, i) => {
      const day = toISODate(addDays(parseISO(start), i));
      return { date: day, ...await fetchMenuByDate(day) };
    })),
    refetchInterval: 15000,
  });
}

export const Route = createFileRoute("/_authenticated/settimana")({
  validateSearch: (search: Record<string, unknown>) => ({
    data: typeof search["data"] === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search["data"]) && isValid(parseISO(search["data"])) ? search["data"] : todayISO(),
  }),
  loaderDeps: ({ search }) => ({ data: search["data"] }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(weekQuery(deps.data)),
  head: () => ({ meta: [
    { title: "Menu della settimana — Michì" },
    { name: "description", content: "I sette menu della settimana con anteprime, download PNG e testo da condividere." },
    { property: "og:title", content: "Menu della settimana — Michì" },
    { property: "og:description", content: "Gestisci le grafiche e i testi dei menu settimanali di MICHÍ." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  errorComponent: () => <AppShell title="Menu della settimana"><p role="alert">Impossibile caricare i menu.</p><Button asChild variant="outline"><Link to="/settimana" search={{ data: todayISO() }} reloadDocument>Riprova</Link></Button></AppShell>,
  notFoundComponent: () => <AppShell title="Menu della settimana"><p>Settimana non trovata.</p></AppShell>,
  component: WeekPage,
});

function WeekPage() {
  const { data: date } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: days } = useSuspenseQuery(weekQuery(date));
  const { data: logos } = useLogos();
  const start = monday(date);
  const changeWeek = (offset: number) => void navigate({ search: { data: toISODate(addDays(parseISO(start), offset)) } });
  return <AppShell title="Menu della settimana">
    <div className="mb-6 flex flex-wrap items-end gap-2">
      <Button variant="outline" size="icon" aria-label="Settimana precedente" onClick={() => changeWeek(-7)}><ChevronLeft /></Button>
      <label className="min-w-0 flex-1 text-sm">Settimana del<Input aria-label="Seleziona settimana" type="date" value={start} onChange={e => { if (e.target.value) void navigate({ search: { data: e.target.value } }); }} /></label>
      <Button variant="outline" size="icon" aria-label="Settimana successiva" onClick={() => changeWeek(7)}><ChevronRight /></Button>
      <Button variant="secondary" onClick={() => void navigate({ search: { data: todayISO() } })}>Oggi</Button>
    </div>
    <p className="mb-6 text-sm text-muted-foreground">{formatDateLong(start)} – {formatDateLong(toISODate(addDays(parseISO(start), 6)))}</p>
    <div className="space-y-10">
      {days.map(day => <section key={day.date} aria-label={formatDateLong(day.date)} className="border-t border-border pt-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-serif text-2xl">{formatDateLong(day.date)}</h2><p className="text-sm text-muted-foreground">{day.menu ? day.menu.status === "published" ? "Pubblicato" : "Bozza" : "Menu non ancora creato"}</p></div>
          <Button asChild variant="outline"><Link to="/gestione" search={{ data: day.date }}><Pencil className="size-4" />{day.menu ? "Modifica" : "Crea menu"}</Link></Button>
        </div>
        {day.menu && <GraphicStudio fileBase={`michi-menu-${day.date}`} dateLabel={formatDateDots(day.date)} logoSrc={logos?.light} bread={day.menu.bread} closing={day.menu.closing_message} groups={SECTIONS.map(s => ({ label: s.label, lines: day.items.filter(i => i.section === s.key).map(i => ({ name: i.name, price: i.price })) }))} />}
      </section>)}
    </div>
  </AppShell>;
}
