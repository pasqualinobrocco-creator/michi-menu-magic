import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchMenuByDate, fetchFixedMenus } from "@/lib/data";
import { todayISO, SECTIONS } from "@/lib/menu";
import { supabase } from "@/integrations/supabase/client";

const pricesQuery = (date: string) => queryOptions({
  queryKey: ["prices", date],
  queryFn: async () => {
    const [daily, fixed] = await Promise.all([fetchMenuByDate(date), fetchFixedMenus()]);
    return { daily, fixed };
  },
});
export const Route = createFileRoute("/_authenticated/prezzi")({
  validateSearch: (search: Record<string, unknown>) => ({ data: typeof search.data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search.data) && !Number.isNaN(Date.parse(search.data)) ? search.data : todayISO() }),
  loaderDeps: ({ search }) => ({ data: search.data }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(pricesQuery(deps.data)),
  head: () => ({ meta: [
    { title: "Prezzi dei menu — Michì" },
    { name: "description", content: "Gestione centralizzata dei prezzi del menu del giorno, colazione e aperitivo di MICHÍ." },
    { property: "og:title", content: "Prezzi dei menu — Michì" },
    { property: "og:description", content: "Tutti i prezzi dei menu MICHÍ in un’unica schermata riservata." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  errorComponent: () => <AppShell title="Prezzi"><p role="alert">Impossibile caricare i prezzi. Ricarica la pagina per riprovare.</p></AppShell>,
  notFoundComponent: () => <AppShell title="Prezzi"><p>Menu non trovato.</p></AppShell>,
  component: PricesPage,
});

function PriceRow({ id, name, price, table, inactive = false }: { id: string; name: string; price: number | null; table: "daily_menu_items" | "fixed_menu_items"; inactive?: boolean }) {
  const [value, setValue] = useState(price === null ? "" : String(price).replace(".", ","));
  const [busy, setBusy] = useState(false);
  const client = useQueryClient();
  const normalized = value.trim().replace(",", ".");
  const number = normalized === "" ? null : Number(normalized);
  const valid = number === null || (/^\d+(\.\d{1,2})?$/.test(normalized) && Number.isFinite(number) && number >= 0 && number < 100000000);
  const changed = valid && number !== (price === null ? null : Number(price));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !changed || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.from(table).update({ price: number }).eq("id", id).select("id").single();
      if (error || !data) throw error ?? new Error("Voce non trovata");
      await client.invalidateQueries();
      toast.success("Prezzo aggiornato");
    } catch { toast.error("Prezzo non salvato. Riprova."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="flex items-center gap-3 border-b border-border py-3">
    <label htmlFor={`price-${id}`} className="min-w-0 flex-1 font-serif text-lg leading-snug">{name}{inactive && <span className="block font-sans text-xs text-muted-foreground">Non attivo</span>}</label>
    <div className="w-24 shrink-0"><Input id={`price-${id}`} aria-label={`Prezzo ${name}`} inputMode="decimal" value={value} disabled={busy} aria-invalid={!valid} onChange={e => setValue(e.target.value)} className="text-right" />{!valid && <p className="mt-1 text-xs text-destructive">Prezzo non valido</p>}</div>
    <Button type="submit" variant="outline" size="icon" title={`Salva prezzo ${name}`} aria-label={`Salva prezzo ${name}`} disabled={!changed || busy}><Save className="size-4" /></Button>
  </form>;
}

function PricesPage() {
  const { data: date } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(pricesQuery(date));
  return <AppShell title="Prezzi">
    <section className="pb-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><h2 className="font-serif text-2xl">Menu del giorno</h2><label className="text-sm">Data<Input aria-label="Data menu" type="date" value={date} onChange={e => { if (e.target.value) void navigate({ search: { data: e.target.value } }); }} /></label></div>
      {!data.daily.items.length && <p className="text-sm text-muted-foreground">Nessun piatto per questa data.</p>}
      {SECTIONS.map(s => {
        const items = data.daily.items.filter(i => i.section === s.key);
        return items.length ? <div key={s.key} className="mt-5"><h3 className="text-sm text-primary">{s.label}</h3>{items.map(i => <PriceRow key={`${i.id}-${i.price}`} {...i} table="daily_menu_items" />)}</div> : null;
      })}
    </section>
    {data.fixed.menus.map(menu => <section key={menu.id} className="border-t border-border py-8">
      <h2 className="mb-5 font-serif text-2xl">{menu.title}</h2>
      {data.fixed.sections.filter(s => s.menu_id === menu.id).map(s => {
        const items = data.fixed.items.filter(i => i.section_id === s.id);
        return <div key={s.id} className="mt-5"><h3 className="text-sm text-primary">{s.name}</h3>{items.length ? items.map(i => <PriceRow key={`${i.id}-${i.price}`} {...i} inactive={!i.is_active} table="fixed_menu_items" />) : <p className="py-3 text-sm text-muted-foreground">Nessuna voce.</p>}</div>;
      })}
    </section>)}
  </AppShell>;
}
