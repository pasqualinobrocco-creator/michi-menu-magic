import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { GraphicStudio } from "@/components/GraphicStudio";
import { SortableList, SortableRow } from "@/components/Sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { fetchFixedMenus } from "@/lib/data";
import { useLogos } from "@/lib/logos";
import type { FixedItem, FixedSection } from "@/lib/menu";

export const Route = createFileRoute("/_authenticated/fissi")({
  head: () => ({
    meta: [
      { title: "Menu fissi — Michì Menu Manager" },
      {
        name: "description",
        content: "Gestisci i menu Colazione e Aperitivo di MICHÍ — Caffè & Cucina.",
      },
      { property: "og:title", content: "Menu fissi — Michì Menu Manager" },
      {
        property: "og:description",
        content: "Gestisci i menu Colazione e Aperitivo di MICHÍ — Caffè & Cucina.",
      },
    ],
  }),
  component: FissiPage,
});

function FissiPage() {
  const qc = useQueryClient();
  const { data: logos } = useLogos();
  const { data, isLoading } = useQuery({
    queryKey: ["fixed"],
    queryFn: fetchFixedMenus,
  });
  const invalidate = () => void qc.invalidateQueries({ queryKey: ["fixed"] });

  if (isLoading || !data) {
    return (
      <AppShell title="Menu fissi">
        <p className="text-sm text-muted-foreground">Caricamento…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Menu fissi">
      <Tabs defaultValue={data.menus[0]?.slug ?? "colazione"}>
        <TabsList className="w-full">
          {data.menus.map((m) => (
            <TabsTrigger key={m.id} value={m.slug} className="flex-1">
              {m.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.menus.map((menu) => {
          const sections = data.sections.filter((s) => s.menu_id === menu.id);
          const groups = sections.map((s) => ({
            label: s.name,
            lines: data.items
              .filter((i) => i.section_id === s.id && i.is_active)
              .map((i) => ({
                name: i.name,
                description: i.description,
                price: i.price,
              })),
          }));

          return (
            <TabsContent key={menu.id} value={menu.slug} className="space-y-5">
              {sections.map((section) => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  items={data.items.filter((i) => i.section_id === section.id)}
                  onChanged={invalidate}
                />
              ))}

              <AddSection menuId={menu.id} count={sections.length} onChanged={invalidate} />

              <div className="rounded-xl border border-border bg-card p-4">
                <h2 className="mb-3 font-serif text-2xl">Grafica {menu.title}</h2>
                <GraphicStudio
                  fileBase={`michi-${menu.slug}`}
                  title={menu.title}
                  groups={groups}
                  closing={menu.closing_message}
                  logoSrc={logos?.light ?? null}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </AppShell>
  );
}

function SectionBlock({
  section,
  items,
  onChanged,
}: {
  section: FixedSection;
  items: FixedItem[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("fixed_menu_items").insert({
      section_id: section.id,
      name: name.trim(),
      description: desc.trim() || null,
      price: price === "" ? null : Number(price.replace(",", ".")),
      position: items.length,
    });
    if (error) toast.error("Non è stato possibile aggiungere la voce");
    setName("");
    setDesc("");
    setPrice("");
    onChanged();
  };

  const reorder = async (ordered: FixedItem[]) => {
    await Promise.all(
      ordered.map((it, idx) =>
        supabase.from("fixed_menu_items").update({ position: idx }).eq("id", it.id),
      ),
    );
    onChanged();
  };

  const removeSection = async () => {
    await supabase.from("fixed_menu_sections").delete().eq("id", section.id);
    onChanged();
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Input
          defaultValue={section.name}
          onBlur={async (e) => {
            if (e.target.value === section.name) return;
            await supabase
              .from("fixed_menu_sections")
              .update({ name: e.target.value })
              .eq("id", section.id);
            onChanged();
          }}
          className="h-9 border-0 bg-transparent px-1 font-serif text-xl shadow-none focus-visible:ring-0"
        />
        <button
          type="button"
          onClick={() => void removeSection()}
          aria-label="Elimina sottosezione"
          className="rounded p-1.5 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {items.length ? (
        <SortableList items={items} onReorder={(o) => void reorder(o)}>
          {(item) => (
            <SortableRow key={item.id} id={item.id}>
              <FixedItemFields item={item} onChanged={onChanged} />
            </SortableRow>
          )}
        </SortableList>
      ) : (
        <p className="text-sm text-muted-foreground">Nessuna voce.</p>
      )}

      <div className="mt-3 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Nome voce"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            className="w-20"
            inputMode="decimal"
            placeholder="5"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Button size="icon" onClick={() => void add()} aria-label="Aggiungi voce">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Input
          placeholder="Descrizione (facoltativa)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
    </section>
  );
}

function FixedItemFields({
  item,
  onChanged,
}: {
  item: FixedItem;
  onChanged: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [desc, setDesc] = useState(item.description ?? "");
  const [price, setPrice] = useState(item.price === null ? "" : String(Number(item.price)));

  useEffect(() => {
    setName(item.name);
    setDesc(item.description ?? "");
    setPrice(item.price === null ? "" : String(Number(item.price)));
  }, [item.name, item.description, item.price]);

  const save = async () => {
    await supabase
      .from("fixed_menu_items")
      .update({
        name: name.trim(),
        description: desc.trim() || null,
        price: price === "" ? null : Number(price.replace(",", ".")),
      })
      .eq("id", item.id);
    onChanged();
  };

  return (
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
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
        <Switch
          checked={item.is_active}
          aria-label="Voce attiva"
          onCheckedChange={async (v) => {
            await supabase
              .from("fixed_menu_items")
              .update({ is_active: v })
              .eq("id", item.id);
            onChanged();
          }}
        />
        <button
          type="button"
          aria-label="Elimina voce"
          onClick={async () => {
            await supabase.from("fixed_menu_items").delete().eq("id", item.id);
            onChanged();
          }}
          className="rounded p-1.5 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <Input
        className="h-8 border-0 bg-transparent px-1 text-xs italic text-muted-foreground shadow-none focus-visible:ring-0"
        placeholder="Descrizione"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onBlur={() => void save()}
      />
    </div>
  );
}

function AddSection({
  menuId,
  count,
  onChanged,
}: {
  menuId: string;
  count: number;
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Nuova sottosezione"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button
        variant="outline"
        onClick={async () => {
          if (!name.trim()) return;
          await supabase
            .from("fixed_menu_sections")
            .insert({ menu_id: menuId, name: name.trim(), position: count });
          setName("");
          onChanged();
        }}
      >
        Aggiungi
      </Button>
    </div>
  );
}
