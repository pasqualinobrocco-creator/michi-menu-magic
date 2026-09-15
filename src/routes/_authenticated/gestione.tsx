import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { CopyPlus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { GraphicStudio } from "@/components/GraphicStudio";
import { SortableList, SortableRow } from "@/components/Sortable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import {
  duplicateMenu,
  ensureMenu,
  fetchMenuByDate,
  fetchRecipeBook,
  rememberRecipe,
} from "@/lib/data";
import { useLogos } from "@/lib/logos";
import {
  CLOSING_PRESETS,
  SECTIONS,
  formatDateDots,
  formatDateLong,
  todayISO,
  type DailyItem,
  type SectionKey,
} from "@/lib/menu";

type Search = { data?: string };

export const Route = createFileRoute("/_authenticated/gestione")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search['data'] === "string" ? { data: search['data'] } : {},
  head: () => ({
    meta: [
      { title: "Menu del giorno — Michì Menu Manager" },
      {
        name: "description",
        content:
          "Prepara il menu del giorno di MICHÍ e scarica la grafica per Instagram e WhatsApp.",
      },
      { property: "og:title", content: "Menu del giorno — Michì Menu Manager" },
      {
        property: "og:description",
        content:
          "Prepara il menu del giorno di MICHÍ e scarica la grafica per Instagram e WhatsApp.",
      },
    ],
  }),
  component: OggiPage,
});

function OggiPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: logos } = useLogos();
  const date = search.data ?? todayISO();

  const menuQuery = useQuery({
    queryKey: ["menu", date],
    queryFn: () => fetchMenuByDate(date),
  });

  const menu = menuQuery.data?.menu ?? null;
  const items = useMemo(() => menuQuery.data?.items ?? [], [menuQuery.data]);
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["menu", date] });
    void qc.invalidateQueries({ queryKey: ["archive"] });
    void qc.invalidateQueries({ queryKey: ["recipes"] });
  };

  const [bread, setBread] = useState("");
  const [closing, setClosing] = useState(CLOSING_PRESETS[0]!);
  useEffect(() => {
    setBread(menu?.bread ?? "");
    setClosing(menu?.closing_message ?? CLOSING_PRESETS[0]!);
  }, [menu?.id, menu?.bread, menu?.closing_message]);

  const saveMenuFields = async (patch: {
    bread?: string;
    closing_message?: string;
    status?: string;
  }) => {
    const m = await ensureMenu(date);
    const { error } = await supabase
      .from("daily_menus")
      .update(patch)
      .eq("id", m.id);
    if (error) toast.error("Salvataggio non riuscito");
    invalidate();
  };

  const addDish = useMutation({
    mutationFn: async (input: {
      section: SectionKey;
      name: string;
      price: number | null;
    }) => {
      const m = await ensureMenu(date);
      const count = items.filter((i) => i.section === input.section).length;
      const { error } = await supabase.from("daily_menu_items").insert({
        menu_id: m.id,
        section: input.section,
        name: input.name.trim(),
        price: input.price,
        position: count,
      });
      if (error) throw error;
      await rememberRecipe(input.name, input.price, input.section);
    },
    onSuccess: invalidate,
    onError: () => toast.error("Non è stato possibile aggiungere il piatto"),
  });

  const groups = SECTIONS.map((s) => ({
    label: s.label,
    lines: items
      .filter((i) => i.section === s.key)
      .map((i) => ({ name: i.name, price: i.price })),
  }));

  return (
    <AppShell title="Menu del giorno">
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-4">
          <Label htmlFor="data" className="text-xs text-muted-foreground">
            Data del menu
          </Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Input
              id="data"
              type="date"
              value={date}
              onChange={(e) =>
                void navigate({ to: "/gestione", search: { data: e.target.value } })
              }
            />
            <Button
              variant="outline"
              onClick={() => void navigate({ to: "/gestione", search: {} })}
            >
              Oggi
            </Button>
          </div>
          <p className="mt-2 font-serif text-lg">{formatDateLong(date)}</p>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
            <span className="text-sm">
              {menu?.status === "published" ? "Pubblicato" : "Bozza"}
            </span>
            <Switch
              checked={menu?.status === "published"}
              onCheckedChange={(v) =>
                void saveMenuFields({ status: v ? "published" : "draft" })
              }
            />
          </div>

          <div className="mt-3 flex gap-2">
            <DuplicateDialog targetDate={date} onDone={invalidate} />
          </div>
        </div>

        {SECTIONS.map((section) => (
          <SectionEditor
            key={section.key}
            sectionKey={section.key}
            label={section.label}
            items={items.filter((i) => i.section === section.key)}
            onAdd={(name, price) =>
              addDish.mutate({ section: section.key, name, price })
            }
            onChanged={invalidate}
          />
        ))}

        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div>
            <Label htmlFor="pane">Pane del giorno</Label>
            <Input
              id="pane"
              value={bread}
              placeholder="Integrale e Noci"
              onChange={(e) => setBread(e.target.value)}
              onBlur={() => void saveMenuFields({ bread })}
            />
          </div>
          <div>
            <Label htmlFor="chiusura">Messaggio di chiusura</Label>
            <div className="mb-2 mt-1 flex gap-2">
              {CLOSING_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setClosing(p);
                    void saveMenuFields({ closing_message: p });
                  }}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    closing === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <Input
              id="chiusura"
              value={closing}
              onChange={(e) => setClosing(e.target.value)}
              onBlur={() => void saveMenuFields({ closing_message: closing })}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-serif text-2xl">Grafica del menu</h2>
          <GraphicStudio
            fileBase={`michi-menu-${date}`}
            dateLabel={formatDateDots(date)}
            groups={groups}
            bread={bread}
            closing={closing}
            logoSrc={logos?.light ?? null}
          />
        </div>
      </div>
    </AppShell>
  );
}

function SectionEditor({
  sectionKey,
  label,
  items,
  onAdd,
  onChanged,
}: {
  sectionKey: SectionKey;
  label: string;
  items: DailyItem[];
  onAdd: (name: string, price: number | null) => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const reorder = async (ordered: DailyItem[]) => {
    await Promise.all(
      ordered.map((it, idx) =>
        supabase
          .from("daily_menu_items")
          .update({ position: idx })
          .eq("id", it.id),
      ),
    );
    onChanged();
  };

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name, price === "" ? null : Number(price.replace(",", ".")));
    setName("");
    setPrice("");
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-2xl">{label}</h2>
        <RecipeBookDialog section={sectionKey} onPick={onAdd} />
      </div>

      {items.length ? (
        <SortableList items={items} onReorder={(o) => void reorder(o)}>
          {(item) => (
            <SortableRow key={item.id} id={item.id}>
              <DishFields item={item} onChanged={onChanged} />
            </SortableRow>
          )}
        </SortableList>
      ) : (
        <p className="text-sm text-muted-foreground">Nessun piatto.</p>
      )}

      <div className="mt-3 flex gap-2">
        <Input
          placeholder="Nome del piatto"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Input
          className="w-20"
          inputMode="decimal"
          placeholder="12"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <Button size="icon" onClick={submit} aria-label="Aggiungi piatto">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

function DishFields({
  item,
  onChanged,
}: {
  item: DailyItem;
  onChanged: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price === null ? "" : String(item.price));

  useEffect(() => {
    setName(item.name);
    setPrice(item.price === null ? "" : String(Number(item.price)));
  }, [item.name, item.price]);

  const save = async () => {
    const parsed = price === "" ? null : Number(price.replace(",", "."));
    if (name === item.name && parsed === item.price) return;
    await supabase
      .from("daily_menu_items")
      .update({ name: name.trim(), price: parsed })
      .eq("id", item.id);
    await rememberRecipe(name, parsed, item.section);
    onChanged();
  };

  const remove = async () => {
    await supabase.from("daily_menu_items").delete().eq("id", item.id);
    onChanged();
  };

  return (
    <>
      <Input
        className="h-9 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => void save()}
      />
      <Input
        className="h-9 w-14 border-0 bg-transparent px-1 text-right shadow-none focus-visible:ring-0"
        inputMode="decimal"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onBlur={() => void save()}
      />
      <button
        type="button"
        onClick={() => void remove()}
        aria-label="Elimina piatto"
        className="rounded p-1.5 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  );
}

function RecipeBookDialog({
  section,
  onPick,
}: {
  section: SectionKey;
  onPick: (name: string, price: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { data } = useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipeBook,
    enabled: open,
  });

  const results = (data ?? [])
    .filter((r) => r.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      const sa = a.section === section ? 0 : 1;
      const sb = b.section === section ? 0 : 1;
      return sa - sb || a.name.localeCompare(b.name);
    })
    .slice(0, 40);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="mr-1.5 h-3.5 w-3.5" /> Ricettario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Ricettario</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Cerca un piatto…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                onPick(r.name, r.default_price);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
            >
              <span>{r.name}</span>
              <span className="font-medium">
                {r.default_price === null ? "" : Number(r.default_price)}
              </span>
            </button>
          ))}
          {!results.length ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Nessun piatto trovato.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DuplicateDialog({
  targetDate,
  onDone,
}: {
  targetDate: string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("");

  const run = async () => {
    try {
      await duplicateMenu(from, targetDate);
      toast.success("Menu copiato");
      setOpen(false);
      onDone();
    } catch {
      toast.error("Nessun menu trovato per quella data");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <CopyPlus className="mr-2 h-4 w-4" /> Duplica da…
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Duplica un altro menu
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          I piatti di questa data sostituiranno quelli attuali.
        </p>
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Button disabled={!from} onClick={() => void run()}>
          Copia su {formatDateLong(targetDate)}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
