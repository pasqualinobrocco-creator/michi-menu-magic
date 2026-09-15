import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { MichiLogo } from "@/components/MichiLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLogos } from "@/lib/logos";

export const Route = createFileRoute("/_authenticated/impostazioni")({
  head: () => ({
    meta: [
      { title: "Impostazioni — Michì Menu Manager" },
      {
        name: "description",
        content: "Logo, QR code per i tavoli e preferenze di MICHÍ — Caffè & Cucina.",
      },
      { property: "og:title", content: "Impostazioni — Michì Menu Manager" },
      {
        property: "og:description",
        content: "Logo, QR code per i tavoli e preferenze di MICHÍ — Caffè & Cucina.",
      },
    ],
  }),
  component: ImpostazioniPage,
});

function ImpostazioniPage() {
  const qc = useQueryClient();
  const { data: logos } = useLogos();
  const [qr, setQr] = useState("");
  const [menuUrl, setMenuUrl] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/menu`;
    setMenuUrl(url);
    void QRCode.toDataURL(url, {
      width: 720,
      margin: 1,
      color: { dark: "#527879", light: "#FFFFFF" },
    }).then(setQr);
  }, []);

  return (
    <AppShell title="Impostazioni">
      <div className="space-y-5">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-1 font-serif text-2xl">Logo</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Carica i file PNG del marchio. Finché non li carichi viene usato il
            logo ricostruito qui sotto.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <LogoSlot
              field="logo_light_url"
              label="Versione chiara (bianco e oro)"
              preview={logos?.light ?? null}
              variant="light"
              onDone={() => void qc.invalidateQueries({ queryKey: ["logos"] })}
            />
            <LogoSlot
              field="logo_dark_url"
              label="Versione scura (verde e oro)"
              preview={logos?.dark ?? null}
              variant="dark"
              onDone={() => void qc.invalidateQueries({ queryKey: ["logos"] })}
            />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-1 font-serif text-2xl">QR code per i tavoli</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Inquadrandolo i clienti vedono il menu del giorno pubblicato.
          </p>
          {qr ? (
            <div className="flex flex-col items-center gap-3">
              <img src={qr} alt="QR code del menu" className="w-52 rounded-lg" />
              <p className="break-all text-center text-xs text-muted-foreground">
                {menuUrl}
              </p>
              <a href={qr} download="michi-qr-menu.png">
                <Button variant="outline">Scarica il QR code</Button>
              </a>
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}

function LogoSlot({
  field,
  label,
  preview,
  variant,
  onDone,
}: {
  field: "logo_light_url" | "logo_dark_url";
  label: string;
  preview: string | null;
  variant: "light" | "dark";
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    const path = `${field}-${Date.now()}.png`;
    const { error } = await supabase.storage
      .from("branding")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setBusy(false);
      toast.error("Caricamento non riuscito");
      return;
    }
    const patch = (field === "logo_light_url"
      ? { logo_light_url: path }
      : { logo_dark_url: path });
    await supabase.from("app_settings").update(patch).eq("id", 1);
    setBusy(false);
    toast.success("Logo aggiornato");
    onDone();
  };

  const clear = async () => {
    const patch = (field === "logo_light_url"
      ? { logo_light_url: null }
      : { logo_dark_url: null });
    await supabase.from("app_settings").update(patch).eq("id", 1);
    toast.success("Logo rimosso");
    onDone();
  };

  return (
    <div className="space-y-2">
      <p className="text-sm">{label}</p>
      <div
        className="flex items-center justify-center rounded-lg p-4"
        style={{ backgroundColor: variant === "light" ? "#527879" : "#F7F4EF" }}
      >
        <MichiLogo variant={variant} width={150} src={preview} />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          Carica PNG
        </Button>
        {preview ? (
          <Button variant="ghost" size="sm" onClick={() => void clear()}>
            Rimuovi
          </Button>
        ) : null}
      </div>
    </div>
  );
}
