import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import { cx } from "@/lib/utils";

const verticalOnly = ({ transform }) => ({ ...transform, x: 0 });

/** Drag-to-reorder list. `onMove(from, to)` gets the old and new index. */
export function SortableList({ ids, onMove, children }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }) {
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

export function useSortableItem(id) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  return {
    ref: setNodeRef,
    style: {
      transform: CSS.Translate.toString(transform),
      transition,
      position: "relative",
      zIndex: isDragging ? 20 : undefined,
    },
    isDragging,
    handle: { ref: setActivatorNodeRef, ...attributes, ...listeners },
  };
}

export function DragHandle({ handle, label = "Drag to reorder", className }) {
  const { ref, ...rest } = handle;
  return (
    <button ref={ref} type="button" aria-label={label} className={cx("drag-handle", className)} {...rest}>
      <DotsSixVerticalIcon weight="bold" />
    </button>
  );
}
