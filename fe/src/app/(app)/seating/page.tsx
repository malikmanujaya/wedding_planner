"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Armchair,
  Circle,
  Download,
  RotateCw,
  Save,
  Square,
  Trash2,
  UserPlus,
} from "lucide-react";
import type { SeatingCanvasHandle } from "@/components/seating/SeatingCanvas";
import {
  api,
  getActiveWedding,
  getActiveWeddingId,
  type Guest,
} from "@/lib/api";
import {
  applyTableGeometry,
  assignedGuestIds,
  emptyPlan,
  expandPlanToFitTables,
  findNewTablePosition,
  nextSeatId,
  nextTableId,
  normalizePlan,
  normalizeRotation,
  overCapacityTables,
  type SeatingPlanData,
  type SeatingTable,
  type TableShape,
} from "@/lib/seating";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SeatingCanvas = dynamic(
  () =>
    import("@/components/seating/SeatingCanvas").then((m) => m.SeatingCanvas),
  { ssr: false, loading: () => <p className="p-6 text-sm text-muted-foreground">Loading canvas…</p> }
);

export default function SeatingPage() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [weddingTitle, setWeddingTitle] = useState("");
  const [plan, setPlan] = useState<SeatingPlanData>(emptyPlan());
  const [version, setVersion] = useState(0);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorId, setEditorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guestQuery, setGuestQuery] = useState("");
  const viewCenterRef = useRef({ x: 600, y: 400 });
  const canvasRef = useRef<SeatingCanvasHandle>(null);

  const load = useCallback(async (id: number) => {
    const [seating, guestList] = await Promise.all([
      api.getSeating(id),
      api.listGuests(id),
    ]);
    setPlan(normalizePlan(seating.plan));
    setVersion(seating.version);
    setGuests(guestList);
    const active = getActiveWedding();
    setWeddingTitle(active?.id === id ? active.title : `Wedding #${id}`);
  }, []);

  useEffect(() => {
    const id = getActiveWeddingId();
    if (!id) {
      setLoading(false);
      return;
    }
    setWeddingId(id);
    load(id)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Failed to load";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [load]);

  const editing = plan.tables.find((t) => t.id === editorId) ?? null;
  const assigned = useMemo(() => assignedGuestIds(plan), [plan]);
  const guestNames = useMemo(() => {
    const map: Record<number, string> = {};
    for (const g of guests) map[g.id] = g.fullName;
    return map;
  }, [guests]);

  const unassigned = useMemo(() => {
    const q = guestQuery.trim().toLowerCase();
    return guests.filter((g) => {
      if (assigned.has(g.id)) return false;
      if (!q) return true;
      return (
        g.fullName.toLowerCase().includes(q) ||
        (g.household ?? "").toLowerCase().includes(q)
      );
    });
  }, [guests, assigned, guestQuery]);

  const overCaps = overCapacityTables(plan);

  function exportPng() {
    const uri = canvasRef.current?.exportPng();
    if (!uri) {
      toast.error("Canvas not ready to export");
      return;
    }
    const a = document.createElement("a");
    a.href = uri;
    a.download = `seating-${weddingTitle.replace(/\s+/g, "-").toLowerCase() || "plan"}.png`;
    a.click();
    toast.success("Seating plan exported");
  }

  function updateTable(id: string, patch: Partial<SeatingTable>) {
    setPlan((prev) => applyTableGeometry(prev, id, patch));
  }

  function addTable(shape: TableShape) {
    const n = plan.tables.length + 1;
    const size = {
      width: shape === "ROUND" ? 140 : 160,
      height: shape === "ROUND" ? 140 : 100,
    };
    const pos = findNewTablePosition(plan, size, viewCenterRef.current);
    const table: SeatingTable = {
      id: nextTableId(plan.tables),
      shape,
      label: `Table ${n}`,
      x: pos.x,
      y: pos.y,
      width: size.width,
      height: size.height,
      rotation: 0,
      capacity: 8,
      seats: [],
    };
    setPlan((prev) => expandPlanToFitTables({ ...prev, tables: [...prev.tables, table] }));
    setSelectedId(table.id);
  }

  function deleteSelected() {
    if (!selectedId) return;
    setPlan((prev) => ({
      ...prev,
      tables: prev.tables.filter((t) => t.id !== selectedId),
    }));
    setSelectedId(null);
  }

  function rotateSelected(degrees = 90) {
    if (!selectedId) return;
    const table = plan.tables.find((t) => t.id === selectedId);
    if (!table) return;
    updateTable(selectedId, {
      rotation: normalizeRotation((table.rotation ?? 0) + degrees),
    });
  }

  function openEditor(id: string) {
    setSelectedId(id);
    setGuestQuery("");
    setEditorId(id);
  }

  function assignGuest(guestId: number) {
    if (!editing) return;
    if (editing.seats.length >= editing.capacity) {
      const msg = `${editing.label} is at capacity (${editing.capacity}).`;
      setError(msg);
      toast.error(msg);
      return;
    }
    setError(null);
    updateTable(editing.id, {
      seats: [...editing.seats, { id: nextSeatId(), guestId }],
    });
    toast.success("Guest seated");
  }

  function unassignGuest(guestId: number) {
    setPlan((prev) => ({
      ...prev,
      tables: prev.tables.map((t) => ({
        ...t,
        seats: t.seats.filter((s) => s.guestId !== guestId),
      })),
    }));
  }

  async function onSave() {
    if (!weddingId) return;
    if (overCaps.length) {
      const msg = `Over capacity: ${overCaps.join(", ")}. Free seats before saving.`;
      setError(msg);
      toast.error(msg);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await api.saveSeating(weddingId, { plan, version });
      setPlan(normalizePlan(res.plan));
      setVersion(res.version);
      const guestList = await api.listGuests(weddingId);
      setGuests(guestList);
      toast.success("Seating plan saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl text-sm text-muted-foreground">Loading seating…</div>
    );
  }

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Seating</h1>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Select a wedding first</CardTitle>
            <CardDescription>Activate a wedding to edit the floor plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/weddings">Go to weddings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Seating</h1>
          <p className="mt-1 text-muted-foreground">
            Floor plan for{" "}
            <span className="font-medium text-foreground">{weddingTitle}</span>
            <span className="ml-2 text-xs">v{version}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => addTable("ROUND")}>
            <Circle className="h-4 w-4" />
            Round table
          </Button>
          <Button variant="secondary" onClick={() => addTable("RECT")}>
            <Square className="h-4 w-4" />
            Rect table
          </Button>
          <Button
            variant="outline"
            disabled={!selectedId}
            onClick={() => rotateSelected(90)}
            title="Rotate selected table 90°"
          >
            <RotateCw className="h-4 w-4" />
            Rotate 90°
          </Button>
          <Button variant="outline" disabled={!selectedId} onClick={deleteSelected}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline" onClick={exportPng}>
            <Download className="h-4 w-4" />
            Export PNG
          </Button>
          <Button onClick={onSave} loading={saving}>
            {!saving && <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {overCaps.length > 0 && (
        <p className="text-sm text-destructive">
          Over capacity: {overCaps.join(", ")}. Remove guests or raise capacity.
        </p>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Armchair className="h-5 w-5" />
            Floor plan
          </CardTitle>
          <CardDescription>
            Drag empty floor to pan, scroll to zoom. Drag tables to move — the floor grows if
            you go past the edge. Right-click (or double-click) a table to seat guests.{" "}
            {unassigned.length} guest{unassigned.length === 1 ? "" : "s"} unassigned.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeatingCanvas
            ref={canvasRef}
            plan={plan}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChangeTable={updateTable}
            onOpenEditor={openEditor}
            guestNames={guestNames}
            onViewCenterChange={(c) => {
              viewCenterRef.current = c;
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={editorId !== null} onOpenChange={(open) => !open && setEditorId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.label ?? "Table"}</DialogTitle>
            <DialogDescription>
              Rename the table, set capacity, and seat guests. Changes apply after you Save
              the floor plan.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Label</label>
                  <Input
                    value={editing.label}
                    onChange={(e) => updateTable(editing.id, { label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Capacity</label>
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    value={editing.capacity}
                    onChange={(e) =>
                      updateTable(editing.id, {
                        capacity: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  Rotation ({editing.rotation ?? 0}°)
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateTable(editing.id, {
                        rotation: normalizeRotation((editing.rotation ?? 0) - 15),
                      })
                    }
                  >
                    −15°
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateTable(editing.id, {
                        rotation: normalizeRotation((editing.rotation ?? 0) + 15),
                      })
                    }
                  >
                    +15°
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateTable(editing.id, {
                        rotation: normalizeRotation((editing.rotation ?? 0) + 90),
                      })
                    }
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    90°
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => updateTable(editing.id, { rotation: 0 })}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  Seated ({editing.seats.length}/{editing.capacity})
                </p>
                <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
                  {editing.seats.map((seat) => (
                    <li
                      key={seat.id}
                      className="flex items-center justify-between gap-2 rounded-md border px-2 py-1"
                    >
                      <span className="truncate">
                        {seat.guestId != null
                          ? guestNames[seat.guestId] ?? `Guest #${seat.guestId}`
                          : "Empty"}
                      </span>
                      {seat.guestId != null && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => unassignGuest(seat.guestId!)}
                        >
                          Remove
                        </Button>
                      )}
                    </li>
                  ))}
                  {!editing.seats.length && (
                    <li className="text-muted-foreground">No guests seated yet.</li>
                  )}
                </ul>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                  <UserPlus className="h-4 w-4" />
                  Add guests ({unassigned.length} unassigned)
                </p>
                <Input
                  placeholder="Search guests…"
                  value={guestQuery}
                  onChange={(e) => setGuestQuery(e.target.value)}
                  className="mb-2"
                />
                <ul className="max-h-48 space-y-1 overflow-y-auto">
                  {unassigned.map((g) => (
                    <li key={g.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left text-sm hover:bg-muted/60 disabled:opacity-50"
                        disabled={editing.seats.length >= editing.capacity}
                        onClick={() => assignGuest(g.id)}
                      >
                        <span className="truncate font-medium">{g.fullName}</span>
                        <Badge variant="outline">{g.rsvpStatus}</Badge>
                      </button>
                    </li>
                  ))}
                  {!unassigned.length && (
                    <li className="text-sm text-muted-foreground">
                      {guests.length ? "All guests are seated." : "No guests yet."}
                    </li>
                  )}
                </ul>
                {editing.seats.length >= editing.capacity && (
                  <p className="mt-1 text-xs text-destructive">
                    Table is at capacity. Raise capacity or remove a guest first.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorId(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
