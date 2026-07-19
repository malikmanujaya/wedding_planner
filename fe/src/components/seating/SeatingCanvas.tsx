"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Ellipse, Group, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";
import type { SeatingPlanData, SeatingTable } from "@/lib/seating";

type ViewState = { x: number; y: number; scale: number };

type Props = {
  plan: SeatingPlanData;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeTable: (id: string, patch: Partial<SeatingTable>) => void;
  onOpenEditor: (id: string) => void;
  guestNames: Record<number, string>;
  onViewCenterChange?: (center: { x: number; y: number }) => void;
};

export type SeatingCanvasHandle = {
  exportPng: () => string | null;
};

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;
const VIEWPORT_HEIGHT = 560;

function clampScale(s: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
}

export const SeatingCanvas = forwardRef<SeatingCanvasHandle, Props>(function SeatingCanvas(
  {
    plan,
    selectedId,
    onSelect,
    onChangeTable,
    onOpenEditor,
    guestNames,
    onViewCenterChange,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const panningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const spaceHeldRef = useRef(false);

  const [size, setSize] = useState({ width: 800, height: VIEWPORT_HEIGHT });
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1 });
  const [cursor, setCursor] = useState<"default" | "grab" | "grabbing">("default");
  const didFitRef = useRef(false);

  useImperativeHandle(ref, () => ({
    exportPng: () => {
      const stage = stageRef.current;
      if (!stage) return null;
      const tr = transformerRef.current;
      const prevNodes = tr?.nodes() ?? [];
      tr?.nodes([]);
      const prev = {
        x: stage.x(),
        y: stage.y(),
        scaleX: stage.scaleX(),
        scaleY: stage.scaleY(),
        width: stage.width(),
        height: stage.height(),
      };
      stage.position({ x: 0, y: 0 });
      stage.scale({ x: 1, y: 1 });
      stage.size({ width: plan.width, height: plan.height });
      stage.batchDraw();
      const uri = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
      stage.position({ x: prev.x, y: prev.y });
      stage.scale({ x: prev.scaleX, y: prev.scaleY });
      stage.size({ width: prev.width, height: prev.height });
      if (tr) tr.nodes(prevNodes);
      stage.batchDraw();
      return uri;
    },
  }));

  const reportCenter = useCallback(
    (next: ViewState, viewport: { width: number; height: number }) => {
      if (!onViewCenterChange) return;
      onViewCenterChange({
        x: (-next.x + viewport.width / 2) / next.scale,
        y: (-next.y + viewport.height / 2) / next.scale,
      });
    },
    [onViewCenterChange]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setSize({ width, height: VIEWPORT_HEIGHT });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fit once when the viewport is ready (not on every floor expand)
  useEffect(() => {
    if (size.width <= 0 || didFitRef.current) return;
    didFitRef.current = true;
    const fit = Math.min(size.width / plan.width, size.height / plan.height, 1);
    const scale = clampScale(fit * 0.95);
    const next = {
      scale,
      x: (size.width - plan.width * scale) / 2,
      y: (size.height - plan.height * scale) / 2,
    };
    setView(next);
    reportCenter(next, size);
  }, [size, plan.width, plan.height, reportCenter]);

  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    if (!selectedId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const node = stage.findOne(`.table-${selectedId}`);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId, plan.tables, view]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeldRef.current = true;
        setCursor((c) => (c === "grabbing" ? c : "grab"));
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceHeldRef.current = false;
        if (!panningRef.current) setCursor("default");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  function isFloorTarget(target: Konva.Node | null, stage: Konva.Stage) {
    if (!target) return false;
    if (target === stage) return true;
    const name = target.name();
    return name === "floor" || name === "grid";
  }

  function zoomAt(pointer: { x: number; y: number }, newScale: number) {
    setView((prev) => {
      const scale = clampScale(newScale);
      const mousePointTo = {
        x: (pointer.x - prev.x) / prev.scale,
        y: (pointer.y - prev.y) / prev.scale,
      };
      const next = {
        scale,
        x: pointer.x - mousePointTo.x * scale,
        y: pointer.y - mousePointTo.y * scale,
      };
      reportCenter(next, size);
      return next;
    });
  }

  function resetView() {
    const fit = Math.min(size.width / plan.width, size.height / plan.height, 1);
    const scale = clampScale(fit * 0.95);
    const next = {
      scale,
      x: (size.width - plan.width * scale) / 2,
      y: (size.height - plan.height * scale) / 2,
    };
    setView(next);
    reportCenter(next, size);
  }

  // Grid lines for the floor
  const gridLines: number[][] = [];
  const step = 80;
  for (let x = 0; x <= plan.width; x += step) {
    gridLines.push([x, 0, x, plan.height]);
  }
  for (let y = 0; y <= plan.height; y += step) {
    gridLines.push([0, y, plan.width, y]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Drag empty space to pan · Scroll to zoom · Space+drag also pans</span>
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            title="Zoom in"
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded border text-base font-semibold hover:bg-muted"
            onClick={() => {
              const stage = stageRef.current;
              const ptr = stage?.getPointerPosition() ?? {
                x: size.width / 2,
                y: size.height / 2,
              };
              zoomAt(ptr, view.scale * 1.15);
            }}
          >
            +
          </button>
          <button
            type="button"
            title="Zoom out"
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded border text-base font-semibold hover:bg-muted"
            onClick={() => {
              const ptr = { x: size.width / 2, y: size.height / 2 };
              zoomAt(ptr, view.scale / 1.15);
            }}
          >
            −
          </button>
          <button
            type="button"
            title="Fit to view"
            aria-label="Fit to view"
            className="flex h-8 w-8 items-center justify-center rounded border text-sm font-semibold hover:bg-muted"
            onClick={resetView}
          >
            ⛶
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-md border bg-[hsl(40_25%_92%)]"
        style={{ height: VIEWPORT_HEIGHT, cursor }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          x={view.x}
          y={view.y}
          scaleX={view.scale}
          scaleY={view.scale}
          onWheel={(e) => {
            e.evt.preventDefault();
            const stage = e.target.getStage();
            if (!stage) return;
            const pointer = stage.getPointerPosition();
            if (!pointer) return;
            const direction = e.evt.deltaY > 0 ? -1 : 1;
            zoomAt(pointer, view.scale * (direction > 0 ? 1.08 : 1 / 1.08));
          }}
          onMouseDown={(e) => {
            const stage = e.target.getStage();
            if (!stage) return;
            const floor = isFloorTarget(e.target, stage);
            const middle = e.evt.button === 1;
            if (floor || spaceHeldRef.current || middle) {
              e.evt.preventDefault();
              panningRef.current = true;
              lastPointerRef.current = { x: e.evt.clientX, y: e.evt.clientY };
              setCursor("grabbing");
              if (floor) onSelect(null);
            }
          }}
          onMouseMove={(e) => {
            if (!panningRef.current) return;
            const dx = e.evt.clientX - lastPointerRef.current.x;
            const dy = e.evt.clientY - lastPointerRef.current.y;
            lastPointerRef.current = { x: e.evt.clientX, y: e.evt.clientY };
            setView((prev) => {
              const next = { ...prev, x: prev.x + dx, y: prev.y + dy };
              reportCenter(next, size);
              return next;
            });
          }}
          onMouseUp={() => {
            panningRef.current = false;
            setCursor(spaceHeldRef.current ? "grab" : "default");
          }}
          onMouseLeave={() => {
            panningRef.current = false;
            setCursor(spaceHeldRef.current ? "grab" : "default");
          }}
          onTouchStart={(e) => {
            const stage = e.target.getStage();
            if (!stage || !isFloorTarget(e.target, stage)) return;
            const touch = e.evt.touches[0];
            if (!touch) return;
            panningRef.current = true;
            lastPointerRef.current = { x: touch.clientX, y: touch.clientY };
            onSelect(null);
          }}
          onTouchMove={(e) => {
            if (!panningRef.current) return;
            const touch = e.evt.touches[0];
            if (!touch) return;
            const dx = touch.clientX - lastPointerRef.current.x;
            const dy = touch.clientY - lastPointerRef.current.y;
            lastPointerRef.current = { x: touch.clientX, y: touch.clientY };
            setView((prev) => {
              const next = { ...prev, x: prev.x + dx, y: prev.y + dy };
              reportCenter(next, size);
              return next;
            });
          }}
          onTouchEnd={() => {
            panningRef.current = false;
          }}
        >
          <Layer>
            <Rect
              name="floor"
              x={0}
              y={0}
              width={plan.width}
              height={plan.height}
              fill="hsl(40 20% 96%)"
              stroke="hsl(162 15% 70%)"
              strokeWidth={2}
            />
            {gridLines.map((pts, i) => (
              <Line
                key={i}
                name="grid"
                points={pts}
                stroke="hsl(162 12% 88%)"
                strokeWidth={1}
                listening={false}
              />
            ))}

            {plan.tables.map((table) => {
              const selected = table.id === selectedId;
              const over = table.seats.length > table.capacity;
              const fill = over ? "hsl(0 55% 92%)" : "hsl(162 30% 92%)";
              const stroke = selected
                ? "hsl(162 42% 28%)"
                : over
                  ? "hsl(0 55% 45%)"
                  : "hsl(162 25% 40%)";
              const seated = table.seats.filter((s) => s.guestId != null);
              const names = seated
                .slice(0, 3)
                .map((s) => guestNames[s.guestId!] ?? "")
                .filter(Boolean)
                .join(", ");
              const more = seated.length > 3 ? ` +${seated.length - 3}` : "";

              return (
                <Group
                  key={table.id}
                  name={`table-${table.id}`}
                  x={table.x + table.width / 2}
                  y={table.y + table.height / 2}
                  offsetX={table.width / 2}
                  offsetY={table.height / 2}
                  rotation={table.rotation ?? 0}
                  draggable
                  onClick={(e) => {
                    e.cancelBubble = true;
                    if (e.evt.button === 2) return;
                    onSelect(table.id);
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true;
                    onSelect(table.id);
                  }}
                  onDblClick={(e) => {
                    e.cancelBubble = true;
                    onOpenEditor(table.id);
                  }}
                  onDblTap={(e) => {
                    e.cancelBubble = true;
                    onOpenEditor(table.id);
                  }}
                  onContextMenu={(e) => {
                    e.evt.preventDefault();
                    e.cancelBubble = true;
                    onOpenEditor(table.id);
                  }}
                  onDragStart={(e) => {
                    e.cancelBubble = true;
                    panningRef.current = false;
                  }}
                  onDragEnd={(e) => {
                    onChangeTable(table.id, {
                      x: Math.round(e.target.x() - table.width / 2),
                      y: Math.round(e.target.y() - table.height / 2),
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    const rotation = node.rotation();
                    node.scaleX(1);
                    node.scaleY(1);
                    const newWidth = Math.max(60, Math.round(table.width * Math.abs(scaleX)));
                    const newHeight = Math.max(60, Math.round(table.height * Math.abs(scaleY)));
                    onChangeTable(table.id, {
                      x: Math.round(node.x() - newWidth / 2),
                      y: Math.round(node.y() - newHeight / 2),
                      width: newWidth,
                      height: newHeight,
                      rotation: Math.round(rotation),
                    });
                  }}
                >
                  {table.shape === "ROUND" ? (
                    <Ellipse
                      x={table.width / 2}
                      y={table.height / 2}
                      radiusX={table.width / 2}
                      radiusY={table.height / 2}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={selected ? 2.5 : 1.5}
                    />
                  ) : (
                    <Rect
                      width={table.width}
                      height={table.height}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={selected ? 2.5 : 1.5}
                      cornerRadius={8}
                    />
                  )}
                  {/* Counter-rotate labels so text stays upright when the table rotates */}
                  <Group
                    x={table.width / 2}
                    y={table.height / 2}
                    rotation={-(table.rotation ?? 0)}
                    listening={false}
                  >
                    <Text
                      text={table.label}
                      width={Math.max(table.width, table.height)}
                      offsetX={Math.max(table.width, table.height) / 2}
                      y={-18}
                      align="center"
                      fontSize={14}
                      fontStyle="bold"
                      fill="hsl(162 30% 18%)"
                      listening={false}
                    />
                    <Text
                      text={`${table.seats.length}/${table.capacity}`}
                      width={Math.max(table.width, table.height)}
                      offsetX={Math.max(table.width, table.height) / 2}
                      y={0}
                      align="center"
                      fontSize={12}
                      fill="hsl(162 15% 35%)"
                      listening={false}
                    />
                    {names ? (
                      <Text
                        text={`${names}${more}`}
                        width={Math.max(table.width, table.height) - 8}
                        offsetX={(Math.max(table.width, table.height) - 8) / 2}
                        y={16}
                        align="center"
                        fontSize={10}
                        fill="hsl(162 10% 40%)"
                        wrap="none"
                        ellipsis
                        listening={false}
                      />
                    ) : null}
                  </Group>
                </Group>
              );
            })}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              rotationSnaps={[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345]}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 60 || newBox.height < 60) return oldBox;
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
      <p className="text-xs text-muted-foreground">
        Floor {Math.round(plan.width)} × {Math.round(plan.height)} · zoom {Math.round(view.scale * 100)}%
      </p>
    </div>
  );
});
