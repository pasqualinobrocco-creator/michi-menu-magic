import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { MichiLogo } from "@/components/MichiLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchFixedMenus, fetchMenuByDate } from "@/lib/data";
import { useLogos } from "@/lib/logos";
import {
  SECTIONS,
  formatDateDots,
  formatPrice,
  todayISO,
  type GraphicGroup,
} from "@/lib/menu";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu del giorno — MICHÍ Caffè & Cucina" },
      {
        name: "description",
        content:
          "Il menu del giorno di MICHÍ — Caffè & Cucina, con colazione e aperitivo.",
      },
      { property: "og:title", content: "Menu del giorno — MICHÍ Caffè & Cucina" },
      {
        property: "og:description",
        content:
          "Il menu del giorno di MICHÍ — Caffè & Cucina, con colazione e aperitivo.",
      },
    ],
  }),
  component: PublicMenu,
});

function PublicMenu() {
  const today = todayISO();
  const { data: logos } = useLogos();
  const daily = useQuery({
    queryKey: ["public-menu", today],
    queryFn: () => fetchMenuByDate(today),
  });
  const fixed = useQuery({ queryKey: ["public-fixed"], queryFn: fetchFixedMenus });

  const menu = daily.data?.menu ?? null;
  const items = daily.data?.items ?? [];
  const dayGroups: GraphicGroup[] = SECTIONS.map((s) => ({
    label: s.label,
    lines: items
      .filter((i) => i.section === s.key)
      .map((i) => ({ name: i.name, price: i.price })),
  })).filter((g) => g.lines.length > 0);

  return (
    <div
      className="min-h-screen px-5 py-10"
      style={{ backgroundColor: "#527879", color: "#FFFFFF" }}
    >
      <div className="mx-auto max-w-lg text-center font-serif">
        <div className="flex justify-center">
          <MichiLogo variant="light" width={240} src={logos?.light ?? null} />
        </div>

        <Tabs defaultValue="giorno" className="mt-8">
          <TabsList className="mx-auto bg-white/10">
            <TabsTrigger value="giorno">Del giorno</TabsTrigger>
            <TabsTrigger value="colazione">Colazione</TabsTrigger>
            <TabsTrigger value="aperitivo">Aperitivo</TabsTrigger>
          </TabsList>

          <TabsContent value="giorno" className="mt-8">
            {daily.isPending ? (
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
                <p className="mt-4 text-3xl" style={{ color: "#DCA963" }}>
                  {menu.closing_message}
                </p>
              </>
            ) : (
              <p className="mt-6 text-lg opacity-80">
                Il menu di oggi non è ancora stato pubblicato.
              </p>
            )}
          </TabsContent>

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
                  <p className="mt-6 text-3xl" style={{ color: "#DCA963" }}>
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
