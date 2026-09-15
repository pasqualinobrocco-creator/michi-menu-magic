export type SectionKey = "antipasti" | "primi" | "secondi" | "dolci";

export const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "antipasti", label: "Antipasti" },
  { key: "primi", label: "Primi" },
  { key: "secondi", label: "Secondi" },
  { key: "dolci", label: "Dolci" },
];

export const CLOSING_PRESETS = ["Buon Pranzo ☀️", "Buona Cena 🌙"];

export type DailyMenu = {
  id: string;
  menu_date: string;
  bread: string;
  closing_message: string;
  status: string;
};

export type DailyItem = {
  id: string;
  menu_id: string;
  section: string;
  name: string;
  price: number | null;
  position: number;
};

export type FixedMenu = {
  id: string;
  slug: string;
  title: string;
  closing_message: string;
  position: number;
};

export type FixedSection = {
  id: string;
  menu_id: string;
  name: string;
  position: number;
};

export type FixedItem = {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: number | null;
  position: number;
  is_active: boolean;
};

export type GraphicGroup = {
  label?: string;
  lines: { name: string; description?: string | null; price: number | null }[];
};

export function toISODate(d: Date): string {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** 15 • 09 • 2026 */
export function formatDateDots(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d} • ${m} • ${y}`;
}

const GIORNI = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];
const MESI = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

export function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatPrice(p: number | null): string {
  if (p === null || p === undefined) return "";
  const n = Number(p);
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
}

export function groupsToPlainText(opts: {
  title?: string | undefined;
  dateLabel?: string | undefined;
  groups: GraphicGroup[];
  bread?: string | undefined;
  closing?: string | undefined;
}): string {
  const out: string[] = [];
  if (opts.title) out.push(opts.title);
  if (opts.dateLabel) out.push(opts.dateLabel);
  if (out.length) out.push("");
  const blocks = opts.groups
    .filter((g) => g.lines.length > 0)
    .map((g) =>
      [
        ...(g.label ? [g.label.toUpperCase()] : []),
        ...g.lines.map(
          (l) =>
            `• ${l.name}${l.description ? ` — ${l.description}` : ""}${
              l.price !== null && l.price !== undefined
                ? ` ${formatPrice(l.price)}`
                : ""
            }`,
        ),
      ].join("\n"),
    );
  out.push(blocks.join("\n•\n"));
  if (opts.bread) out.push("", `Pane del giorno: ${opts.bread}.`);
  if (opts.closing) out.push("", opts.closing);
  return out.join("\n").trim();
}
