import { supabase } from "@/integrations/supabase/client";
import type {
  DailyItem,
  DailyMenu,
  FixedItem,
  FixedMenu,
  FixedSection,
} from "@/lib/menu";

export async function fetchMenuByDate(date: string) {
  const { data: menu, error } = await supabase
    .from("daily_menus")
    .select("*")
    .eq("menu_date", date)
    .maybeSingle();
  if (error) throw error;
  if (!menu) return { menu: null, items: [] as DailyItem[] };
  const { data: items, error: e2 } = await supabase
    .from("daily_menu_items")
    .select("*")
    .eq("menu_id", menu.id)
    .order("position");
  if (e2) throw e2;
  return {
    menu: menu as DailyMenu,
    items: (items ?? []) as DailyItem[],
  };
}

export async function ensureMenu(date: string): Promise<DailyMenu> {
  const existing = await fetchMenuByDate(date);
  if (existing.menu) return existing.menu;
  const { data, error } = await supabase
    .from("daily_menus")
    .insert({ menu_date: date })
    .select()
    .single();
  if (error) throw error;
  return data as DailyMenu;
}

export async function rememberRecipe(name: string, price: number | null, section: string) {
  const clean = name.trim();
  if (!clean) return;
  await supabase.from("recipe_book").upsert(
    {
      name: clean,
      default_price: price,
      section,
      last_used_at: new Date().toISOString(),
    },
    { onConflict: "name" },
  );
}

export async function fetchRecipeBook() {
  const { data, error } = await supabase
    .from("recipe_book")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchArchive() {
  const { data, error } = await supabase
    .from("daily_menus")
    .select("*")
    .order("menu_date", { ascending: false })
    .limit(120);
  if (error) throw error;
  return (data ?? []) as DailyMenu[];
}

export async function duplicateMenu(fromDate: string, toDate: string) {
  const source = await fetchMenuByDate(fromDate);
  if (!source.menu) throw new Error("Nessun menu trovato per quella data");
  const target = await ensureMenu(toDate);
  await supabase.from("daily_menu_items").delete().eq("menu_id", target.id);
  await supabase
    .from("daily_menus")
    .update({
      bread: source.menu.bread,
      closing_message: source.menu.closing_message,
    })
    .eq("id", target.id);
  if (source.items.length) {
    await supabase.from("daily_menu_items").insert(
      source.items.map((i) => ({
        menu_id: target.id,
        section: i.section,
        name: i.name,
        price: i.price,
        position: i.position,
      })),
    );
  }
}

export async function fetchFixedMenus() {
  const { data: menus, error } = await supabase
    .from("fixed_menus")
    .select("*")
    .order("position");
  if (error) throw error;
  const { data: sections, error: e2 } = await supabase
    .from("fixed_menu_sections")
    .select("*")
    .order("position");
  if (e2) throw e2;
  const { data: items, error: e3 } = await supabase
    .from("fixed_menu_items")
    .select("*")
    .order("position");
  if (e3) throw e3;
  return {
    menus: (menus ?? []) as FixedMenu[],
    sections: (sections ?? []) as FixedSection[],
    items: (items ?? []) as FixedItem[],
  };
}
