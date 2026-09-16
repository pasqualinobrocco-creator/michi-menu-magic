import { createFileRoute } from "@tanstack/react-router";
import { PublicMenu } from "@/components/PublicMenu";
import { useTrackVisit } from "@/lib/data";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  component: MenuPage,
});

function MenuPage() {
  useTrackVisit("/menu");
  return <PublicMenu />;
}

