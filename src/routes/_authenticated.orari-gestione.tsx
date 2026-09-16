import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  deleteOpeningHour,
  fetchOpeningHours,
  upsertOpeningHour,
} from "@/lib/data";
import type { OpeningHour } from "@/lib/menu";

export const Route = createFileRoute("/_authenticated/orari-gestione")({
  component: HoursManagePage,
});

function HoursManagePage() {
  const queryClient = useQueryClient();
  const { data: hours, isLoading } = useQuery({
    queryKey: ["opening-hours"],
    queryFn: fetchOpeningHours,
  });

  const [newLabel, setNewLabel] = useState("");
  const [newOpen, setNewOpen] = useState("");
  const [newClose, setNewClose] = useState("");

  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: ["opening-hours"] });

  const add = async () => {
    const label = newLabel.trim();
    const open = newOpen.trim();
    const close = newClose.trim();
    if (!label || !open || !close) {
      toast.error("Completa nome fascia, apertura e chiusura.");
      return;
    }
    const position = (hours ?? []).length;
    try {
      await upsertOpeningHour({ label, open_time: open, close_time: close, position });
      setNewLabel("");
      setNewOpen("");
      setNewClose("");
      refresh();
      toast.success("Fascia aggiunta.");
    } catch (e) {
      toast.error("Errore durante il salvataggio.");
      console.error(e);
    }
  };

  return (
    <AppShell title="Orari">
      {isLoading ? (
        <p className="text-muted-foreground">Caricamento…</p>
      ) : (
        <div className="space-y-4">
          {(hours ?? []).map((h) => (
            <HourRow key={h.id} hour={h} onChange={refresh} />
          ))}

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 font-serif text-lg">Aggiungi fascia</h2>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <Label htmlFor="new-label">Nome fascia</Label>
                <Input
                  id="new-label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="es. Brunch"
                />
              </div>
              <div>
                <Label htmlFor="new-open">Apertura</Label>
                <Input
                  id="new-open"
                  type="time"
                  value={newOpen}
                  onChange={(e) => setNewOpen(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="new-close">Chiusura</Label>
                <Input
                  id="new-close"
                  type="time"
                  value={newClose}
                  onChange={(e) => setNewClose(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={() => void add()} className="mt-4 w-full" variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> Aggiungi
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function HourRow({ hour, onChange }: { hour: OpeningHour; onChange: () => void }) {
  const [label, setLabel] = useState(hour.label);
  const [open, setOpen] = useState(hour.open_time);
  const [close, setClose] = useState(hour.close_time);
  const [enabled, setEnabled] = useState(hour.enabled);

  const save = async () => {
    try {
      await upsertOpeningHour({
        id: hour.id,
        label: label.trim(),
        open_time: open,
        close_time: close,
        enabled,
        position: hour.position,
      });
      onChange();
      toast.success("Orario aggiornato.");
    } catch (e) {
      toast.error("Errore durante il salvataggio.");
      console.error(e);
    }
  };

  const remove = async () => {
    try {
      await deleteOpeningHour(hour.id);
      onChange();
      toast.success("Fascia rimossa.");
    } catch (e) {
      toast.error("Errore durante la rimozione.");
      console.error(e);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label htmlFor={`label-${hour.id}`}>Nome fascia</Label>
          <Input
            id={`label-${hour.id}`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`open-${hour.id}`}>Apertura</Label>
          <Input
            id={`open-${hour.id}`}
            type="time"
            value={open}
            onChange={(e) => setOpen(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`close-${hour.id}`}>Chiusura</Label>
          <Input
            id={`close-${hour.id}`}
            type="time"
            value={close}
            onChange={(e) => setClose(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch
            id={`enabled-${hour.id}`}
            checked={enabled}
            onCheckedChange={(v) => {
              setEnabled(v);
            }}
          />
          <Label htmlFor={`enabled-${hour.id}`} className="text-sm">
            Attiva
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => void save()} size="sm">
            Salva
          </Button>
          <Button onClick={() => void remove()} size="sm" variant="ghost" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
