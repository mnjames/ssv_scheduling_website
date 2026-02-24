import { useDraggable } from "@dnd-kit/core";
import { STAGE_LABELS } from "../data/chapters";

// Compact draggable chapter card used both in the sidebar and in schedule cells
export default function ChapterCard({
  chapter,
  stageKey,         // which stage slot this card lives in (drives colour)
  onMarkDone,
  onUndoDone,
  onUnassign,
  isDragOverlay = false,
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chapter.id,
    data: { chapterId: chapter.id, stageKey },
    disabled: isDragOverlay,
  });

  const stageColorMap = {
    prep: "border-blue-300 bg-blue-50",
    "check-DP": "border-purple-300 bg-purple-50",
    "check-FB": "border-orange-300 bg-orange-50",
    finalize: "border-teal-300 bg-teal-50",
    tc: "border-amber-300 bg-amber-50",
  };

  const baseColor = stageColorMap[stageKey] ?? "border-slate-200 bg-white";

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      {...(!isDragOverlay ? { ...listeners, ...attributes } : {})}
      className={`
        group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg border
        text-xs font-medium select-none cursor-grab active:cursor-grabbing
        transition-all duration-150
        ${isDragging && !isDragOverlay ? "opacity-30 scale-95" : ""}
        ${isDragOverlay ? "shadow-xl rotate-2 scale-105 cursor-grabbing opacity-95" : "hover:shadow-md"}
        ${baseColor}
      `}
    >
      {/* Drag handle visual */}
      <span className="text-slate-400 text-[10px] flex-shrink-0">⠿</span>

      {/* Book + chapter label */}
      <span className="flex-1 truncate">
        {chapter.book} {chapter.num}
      </span>

      {/* Action button: only unassign (visible on hover) */}
      {!isDragOverlay && onUnassign && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onUnassign?.(chapter.id); }}
          title="Remove from week"
          className="invisible group-hover:visible w-6 h-6 flex items-center justify-center rounded bg-red-100 hover:bg-red-200 text-red-500 text-[11px] transition-colors absolute right-1 top-1"
        >
          ✕
        </button>
      )}
    </div>
  );
}
