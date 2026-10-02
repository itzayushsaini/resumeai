import type { CSSProperties, ReactNode } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

export function SortableList({
  ids,
  onMove,
  children,
}: {
  ids: string[];
  onMove: (from: number, to: number) => void;
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from >= 0 && to >= 0) onMove(from, to);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[verticalOnly]} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export function useSortableItem(id: string) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 20 : undefined,
  };
  return {
    ref: setNodeRef,
    style,
    isDragging,
    handle: { ref: setActivatorNodeRef, ...attributes, ...listeners },
  };
}

export function DragHandle({
  handle,
  label = "Drag to reorder",
  className,
}: {
  handle: ReturnType<typeof useSortableItem>["handle"];
  label?: string;
  className?: string;
}) {
  const { ref, ...rest } = handle;
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "grid h-7 w-5 shrink-0 cursor-grab touch-none place-items-center rounded text-ink-4 hover:bg-ink/5 hover:text-ink-2 active:cursor-grabbing",
        className,
      )}
      {...rest}
    >
      <DotsSixVerticalIcon weight="bold" className="size-4" />
    </button>
  );
}
