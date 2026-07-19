export type TableShape = "ROUND" | "RECT";

export type SeatingSeat = {
  id: string;
  guestId: number | null;
};

export type SeatingTable = {
  id: string;
  shape: TableShape;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrees clockwise; useful for RECT banquet tables. */
  rotation: number;
  capacity: number;
  seats: SeatingSeat[];
};

export type SeatingPlanData = {
  width: number;
  height: number;
  tables: SeatingTable[];
};

export type SeatingResponse = {
  weddingId: number;
  plan: SeatingPlanData;
  version: number;
};

export const PLAN_PAD = 48;
export const MIN_PLAN_WIDTH = 1200;
export const MIN_PLAN_HEIGHT = 800;

export function emptyPlan(): SeatingPlanData {
  return { width: MIN_PLAN_WIDTH, height: MIN_PLAN_HEIGHT, tables: [] };
}

export function normalizePlan(raw: unknown): SeatingPlanData {
  const p = (raw ?? {}) as Partial<SeatingPlanData>;
  const tables = Array.isArray(p.tables)
    ? p.tables.map((t, i) => ({
        id: t.id || `t${i + 1}`,
        shape: (t.shape === "RECT" ? "RECT" : "ROUND") as TableShape,
        label: t.label || `Table ${i + 1}`,
        x: Number(t.x) || 40,
        y: Number(t.y) || 40,
        width: Number(t.width) || 120,
        height: Number(t.height) || 120,
        rotation: normalizeRotation(Number((t as SeatingTable).rotation) || 0),
        capacity: Number(t.capacity) || 8,
        seats: Array.isArray(t.seats)
          ? t.seats.map((s, si) => ({
              id: s.id || `s${i}-${si}`,
              guestId: s.guestId ?? null,
            }))
          : [],
      }))
    : [];
  return expandPlanToFitTables({
    width: typeof p.width === "number" ? p.width : MIN_PLAN_WIDTH,
    height: typeof p.height === "number" ? p.height : MIN_PLAN_HEIGHT,
    tables,
  });
}

/** Axis-aligned bounds of a possibly rotated table (x/y are top-left). */
export function tableBounds(t: SeatingTable) {
  const cx = t.x + t.width / 2;
  const cy = t.y + t.height / 2;
  const rad = ((t.rotation || 0) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const bw = t.width * cos + t.height * sin;
  const bh = t.width * sin + t.height * cos;
  return {
    minX: cx - bw / 2,
    minY: cy - bh / 2,
    maxX: cx + bw / 2,
    maxY: cy + bh / 2,
  };
}

export function normalizeRotation(deg: number) {
  const n = ((Math.round(deg) % 360) + 360) % 360;
  return n;
}

/** Grow the floor so every table fits with padding; shift if tables go past left/top. */
export function expandPlanToFitTables(plan: SeatingPlanData): SeatingPlanData {
  if (!plan.tables.length) {
    return {
      ...plan,
      width: Math.max(plan.width, MIN_PLAN_WIDTH),
      height: Math.max(plan.height, MIN_PLAN_HEIGHT),
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const t of plan.tables) {
    const b = tableBounds(t);
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }

  let shiftX = 0;
  let shiftY = 0;
  if (minX < PLAN_PAD) shiftX = PLAN_PAD - minX;
  if (minY < PLAN_PAD) shiftY = PLAN_PAD - minY;

  const tables =
    shiftX || shiftY
      ? plan.tables.map((t) => ({
          ...t,
          x: Math.round(t.x + shiftX),
          y: Math.round(t.y + shiftY),
        }))
      : plan.tables;

  const right = maxX + shiftX + PLAN_PAD;
  const bottom = maxY + shiftY + PLAN_PAD;

  return {
    width: Math.max(plan.width + shiftX, right, MIN_PLAN_WIDTH),
    height: Math.max(plan.height + shiftY, bottom, MIN_PLAN_HEIGHT),
    tables,
  };
}

export function applyTableGeometry(
  plan: SeatingPlanData,
  tableId: string,
  patch: Partial<SeatingTable>
): SeatingPlanData {
  const tables = plan.tables.map((t) => {
    if (t.id !== tableId) return t;
    const next = { ...t, ...patch };
    if (patch.rotation != null) next.rotation = normalizeRotation(patch.rotation);
    return next;
  });
  return expandPlanToFitTables({ ...plan, tables });
}

export function nextTableId(tables: SeatingTable[]) {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function nextSeatId() {
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function assignedGuestIds(plan: SeatingPlanData): Set<number> {
  const ids = new Set<number>();
  for (const table of plan.tables) {
    for (const seat of table.seats) {
      if (seat.guestId != null) ids.add(seat.guestId);
    }
  }
  return ids;
}

export function overCapacityTables(plan: SeatingPlanData): string[] {
  return plan.tables
    .filter((t) => t.seats.length > t.capacity)
    .map((t) => t.label);
}

/** Spot for a new table inside the current view (world coords). */
export function findNewTablePosition(
  plan: SeatingPlanData,
  size: { width: number; height: number },
  viewCenter?: { x: number; y: number }
): { x: number; y: number } {
  const cx = viewCenter?.x ?? plan.width / 2;
  const cy = viewCenter?.y ?? plan.height / 2;
  let x = Math.round(cx - size.width / 2);
  let y = Math.round(cy - size.height / 2);
  const overlaps = (ox: number, oy: number) =>
    plan.tables.some(
      (t) =>
        ox < t.x + t.width + 16 &&
        ox + size.width + 16 > t.x &&
        oy < t.y + t.height + 16 &&
        oy + size.height + 16 > t.y
    );
  for (let i = 0; i < 24; i++) {
    const tx = x + (i % 6) * 36;
    const ty = y + Math.floor(i / 6) * 36;
    if (!overlaps(tx, ty)) return { x: Math.max(PLAN_PAD, tx), y: Math.max(PLAN_PAD, ty) };
  }
  return { x: Math.max(PLAN_PAD, x), y: Math.max(PLAN_PAD, y) };
}
