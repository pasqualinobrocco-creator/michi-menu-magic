import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { MichiLogo } from "@/components/MichiLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchFixedMenus, fetchMenuByDate, fetchOpeningHours } from "@/lib/data";
import { useLogos } from "@/lib/logos";
import {
  SECTIONS,
  formatDateDots,
  formatPrice,
  todayISO,
  type GraphicGroup,
} from "@/lib/menu";

import { Button } from "@/components/ui/button";
export function PublicMenu({ showHours = false }: { showHours?: boolean }) {
  const today = todayISO();
  const { data: logos } = useLogos();
  const daily = useQuery({
    queryKey: ["public-menu", today],
    queryFn: () => fetchMenuByDate(today),
    refetchInterval: 15000,
  });
  const fixed = useQuery({ queryKey: ["public-fixed"], queryFn: fetchFixedMenus, refetchInterval: 15000 });
  const hours = useQuery({ queryKey: ["opening-hours"], queryFn: fetchOpeningHours, refetchInterval: 15000 });
  const activeHours = (hours.data ?? [])
    .filter((h) => h.enabled)
    .sort((a, b) => a.position - b.position);

  const menu = daily.data?.menu?.status === "published" ? daily.data.menu : null;
  const items = daily.data?.items ?? [];
  const dayGroups: GraphicGroup[] = SECTIONS.map((s) => ({
    label: s.label,
    lines: items
      .filter((i) => i.section === s.key)
      .map((i) => ({ name: i.name, price: i.price })),
  })).filter((g) => g.lines.length > 0);

  return (
    <div
      className="min-h-screen bg-brand text-primary-foreground px-5 py-10"
    >
      <div className="mx-auto max-w-lg text-center font-serif">
        <div className="flex justify-center">
          <MichiLogo variant="light" width={240} src={logos?.light ?? null} />
        </div>

        <nav aria-label="Navigazione pubblica" className="mt-6 flex justify-center gap-3 font-sans">
          <Button asChild variant="ghost"><Link to="/">Home</Link></Button>
          <Button asChild variant="ghost"><Link to={showHours ? "/menu" : "/orari"}>{showHours ? "Il menu" : "Orari"}</Link></Button>
        </nav>
        <h1 className="mt-6 text-4xl">{showHours ? "Orari & menu" : "Il nostro menu"}</h1>
        {showHours && <section aria-label="Orari di apertura e chiusura" className="mt-8 grid grid-cols-3 gap-2 border-y border-primary-foreground/20 py-6">
          {[["Colazione", "07:30", "10:00"], ["Pranzo", "12:00", "14:00"], ["Aperitivo", "17:00", "19:00"]].map(([label, open, close]) => <div key={label}>
            <h2 className="text-xl text-gold">{label}</h2>
            <p className="mt-2 font-sans text-sm">{open} – {close}</p>
          </div>)}
        </section>}
        <Tabs defaultValue={showHours ? "colazione" : "giorno"} className="mt-8">
          <TabsList className="mx-auto bg-primary-foreground/10">
            <TabsTrigger value="giorno">{showHours ? "Pranzo" : "Del giorno"}</TabsTrigger>
            <TabsTrigger value="colazione">Colazione</TabsTrigger>
            <TabsTrigger value="aperitivo">Aperitivo</TabsTrigger>
          </TabsList>

          <TabsContent value="giorno" className="mt-8">
            {daily.isError ? (<p role="alert">Menu non disponibile. Riprova tra poco.</p>) : daily.isPending ? (
              <p className="mt-6 text-lg opacity-80">Caricamento…</p>
            ) : menu ? (
              <>
                <p className="font-bold tracking-widest">
                  {formatDateDots(menu.menu_date)}
                </p>
                <Groups groups={dayGroups} />
                {menu.bread ? (
                  <p className="mt-8 text-sm font-bold">
                    Pane del giorno: {menu.bread}.
                  </p>
                ) : null}
                <p className="mt-4 text-3xl text-gold" >
                  {menu.closing_message}
                </p>
              </>
            ) : (
              <p className="mt-6 text-lg opacity-80">
                Il menu di oggi non è ancora stato pubblicato.
              </p>
            )}
          </TabsContent>

          {fixed.isError && <p role="alert" className="mt-6">Menu fissi non disponibili. Riprova tra poco.</p>}
          {(fixed.data?.menus ?? []).map((m) => {
            const groups: GraphicGroup[] = (fixed.data?.sections ?? [])
              .filter((s) => s.menu_id === m.id)
              .map((s) => ({
                label: s.name,
                lines: (fixed.data?.items ?? [])
                  .filter((i) => i.section_id === s.id && i.is_active)
                  .map((i) => ({
                    name: i.name,
                    description: i.description,
                    price: i.price,
                  })),
              }))
              .filter((g) => g.lines.length > 0);
            return (
              <TabsContent key={m.id} value={m.slug} className="mt-8">
                <p className="font-bold tracking-[0.3em]">{m.title}</p>
                <Groups groups={groups} />
                {m.closing_message ? (
                  <p className="mt-6 text-3xl text-gold" >
                    {m.closing_message}
                  </p>
                ) : null}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}

function Groups({ groups }: { groups: GraphicGroup[] }) {
  if (!groups.length) {
    return <p className="mt-6 text-lg opacity-80">Menu in preparazione.</p>;
  }
  return (
    <div className="mt-6 space-y-1 text-lg">
      {groups.map((g, gi) => (
        <div key={gi}>
          {gi > 0 ? <p className="py-2 opacity-90">•</p> : null}
          {g.label ? (
            <p className="mb-1 text-xs tracking-[0.3em] opacity-80">
              {g.label.toUpperCase()}
            </p>
          ) : null}
          {g.lines.map((l, li) => (
            <p key={li} className="text-balance">
              • {l.name}
              {l.description ? (
                <span className="italic opacity-80"> {l.description}</span>
              ) : null}
              {l.price !== null && l.price !== undefined ? (
                <span className="font-bold"> {formatPrice(l.price)}</span>
              ) : null}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
