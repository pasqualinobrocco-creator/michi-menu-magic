import { createFileRoute } from "@tanstack/react-router";
import { PublicMenu } from "@/components/PublicMenu";
import { useTrackVisit } from "@/lib/data";

export const Route = createFileRoute("/orari")({
  head: () => ({ meta: [
    { title: "Orari e menu — MICHÍ Caffè & Cucina" },
    { name: "description", content: "Colazione 7:30–10:00, pranzo 12:00–14:00 e aperitivo 17:00–19:00 da MICHÍ a Pescara. Consulta i menu." },
    { property: "og:title", content: "Orari e menu — MICHÍ Caffè & Cucina" },
    { property: "og:description", content: "Gli orari di colazione, pranzo e aperitivo e i menu aggiornati di MICHÍ." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HoursPage,
});
function HoursPage() {
  useTrackVisit("/orari");
  return <PublicMenu showHours />;
}
