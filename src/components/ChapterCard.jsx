import { useDraggable } from "@dnd-kit/core";
import { STAGE_LABELS } from "../data/chapters";

// Resolve the done flag for the stage slot this card represents
function stageDone(chapter, stageKey) {
  if (stageKey === "prep") return chapter.prep?.done ?? false;
  if (stageKey === "check-DP" || stageKey === "check-FB") return chapter.check?.done ?? false;
  if (stageKey === "finalize") return chapter.finalize?.done ?? false;
  if (stageKey === "tc") return chapter.tc?.done ?? false;
  return false;
}

// Compact draggable chapter card used both in the sidebar and in schedule cells
export default function ChapterCard({
  chapter,
  stageKey,         // which stage slot this card lives in (drives colour)
  onToggleDone,
  onUnassign,
  isDragOverlay = false,
  allowDrag = true,
}) {
  // Use "chapterId__stageKey" as the draggable id so drop handlers know which stage was grabbed
  const dragId = `${chapter.id}__${stageKey}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { chapterId: chapter.id, stageKey },
    disabled: isDragOverlay || !allowDrag,
  });

  const stageColorMap = {
    prep: "border-blue-300 bg-blue-50",
    "check-DP": "border-orange-300 bg-orange-50",
    "check-FB": "border-orange-300 bg-orange-50",
    finalize: "border-teal-300 bg-teal-50",
    tc: "border-amber-300 bg-amber-50",
  };

  const baseColor = stageColorMap[stageKey] ?? "border-slate-200 bg-white";
  const done = stageDone(chapter, stageKey);

  return (
    <div
      ref={!isDragOverlay && allowDrag ? setNodeRef : undefined}
      {...(!isDragOverlay && allowDrag ? { ...listeners, ...attributes } : {})}
      className={`
        group relative flex items-center gap-1.5 px-2 py-1.5 rounded-lg border
        text-xs font-medium select-none
        transition-all duration-150
        ${allowDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default"}
        ${isDragging && !isDragOverlay ? "opacity-30 scale-95" : ""}
        ${isDragOverlay ? "shadow-xl rotate-2 scale-105 cursor-grabbing opacity-95" : "hover:shadow-md"}
        ${done ? "border-slate-200 bg-slate-100 opacity-60" : baseColor}
      `}
    >
      {/* Drag handle visual */}
      <span className={`text-[10px] flex-shrink-0 ${done ? "text-slate-300" : "text-slate-400"}`}>⠿</span>

      {/* Book + chapter label */}
      <span className={`flex-1 truncate ${done ? "text-slate-400" : ""}`}>
        {chapter.book} {chapter.num}
      </span>

      {/* Done checkbox — interactive in edit mode, visual-only otherwise */}
      {!isDragOverlay && (
        onToggleDone ? (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleDone(chapter.id, stageKey);
            }}
            title={done ? "Unmark done" : "Mark done"}
            className={`
              flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors
              ${done
                ? "bg-green-500 border-green-500 text-white"
                : "border-slate-300 bg-white hover:border-green-400"}
            `}
          >
            {done && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        ) : (
          <div
            title={done ? "Done" : "Not done"}
            className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${done ? "bg-green-500 border-green-500 text-white" : "border-slate-100 bg-white"}`}
            aria-hidden="true"
          >
            {done && (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )
      )}

      {/* Unassign button (visible on hover for prep column) */}
      {!isDragOverlay && onUnassign && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onUnassign?.(chapter.id); }}
          title="Remove from week"
          className="invisible group-hover:visible w-5 h-5 flex items-center justify-center rounded bg-red-100 hover:bg-red-200 text-red-500 text-[10px] transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
