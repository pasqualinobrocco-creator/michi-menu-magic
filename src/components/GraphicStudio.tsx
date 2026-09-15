import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  FORMATS,
  MenuCanvas,
  type CanvasData,
  type FormatKey,
} from "@/components/MenuCanvas";
import { groupsToPlainText } from "@/lib/menu";

type Props = CanvasData & { fileBase: string };

export function GraphicStudio({ fileBase, ...data }: Props) {
  const [format, setFormat] = useState<FormatKey>("story");
  const [busy, setBusy] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const download = async (key: FormatKey) => {
    setBusy(true);
    setFormat(key);
    // let the canvas re-render + refit before capturing
    await new Promise((r) => setTimeout(r, 350));
    try {
      const node = nodeRef.current;
      if (!node) throw new Error("Anteprima non pronta");
      const url = await toPng(node, {
        pixelRatio: 1,
        width: FORMATS[key].w,
        height: FORMATS[key].h,
        cacheBust: true,
        backgroundColor: "#527879",
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileBase}-${FORMATS[key].w}x${FORMATS[key].h}.png`;
      a.click();
      toast.success("Grafica scaricata");
    } catch {
      toast.error("Non è stato possibile creare l'immagine. Riprova.");
    } finally {
      setBusy(false);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(
        groupsToPlainText({
          title: data.title,
          dateLabel: data.dateLabel,
          groups: data.groups,
          bread: data.bread,
          closing: data.closing,
        }),
      );
      toast.success("Testo copiato, pronto da incollare");
    } catch {
      toast.error("Copia non riuscita");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FORMATS) as FormatKey[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setFormat(k)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              format === k
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {FORMATS[k].label} · {FORMATS[k].w}×{FORMATS[k].h}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="overflow-hidden rounded-xl shadow-lg">
          <MenuCanvas {...data} format={format} displayWidth={320} nodeRef={nodeRef} />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(Object.keys(FORMATS) as FormatKey[]).map((k) => (
          <Button
            key={k}
            variant="outline"
            disabled={busy}
            onClick={() => void download(k)}
            className="justify-center"
          >
            <Download className="mr-2 h-4 w-4" />
            {FORMATS[k].w}×{FORMATS[k].h}
          </Button>
        ))}
      </div>

      <Button className="w-full" variant="secondary" onClick={() => void copyText()}>
        <Copy className="mr-2 h-4 w-4" /> Copia testo
      </Button>
    </div>
  );
}
