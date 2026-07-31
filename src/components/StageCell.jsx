import { useDroppable } from "@dnd-kit/core";
import ChapterCard from "./ChapterCard";

const COLORS = {
  prep: {
    header: "bg-blue-50 text-blue-700 border-blue-100",
    body: "bg-blue-50/40",
    over: "ring-2 ring-blue-400 bg-blue-100/50",
  },
  "check-DP": {
    header: "bg-orange-50 text-orange-700 border-orange-100",
    body: "bg-orange-50/40",
    over: "ring-2 ring-orange-400 bg-orange-100/50",
  },
  "check-FB": {
    header: "bg-orange-50 text-orange-700 border-orange-100",
    body: "bg-orange-50/40",
    over: "ring-2 ring-orange-400 bg-orange-100/50",
  },
  finalize: {
    header: "bg-teal-50 text-teal-700 border-teal-100",
    body: "bg-teal-50/40",
    over: "ring-2 ring-teal-400 bg-teal-100/50",
  },
  tc: {
    header: "bg-amber-50 text-amber-700 border-amber-100",
    body: "bg-amber-50/40",
    over: "ring-2 ring-amber-400 bg-amber-100/50",
  },
};

// A single droppable cell in the schedule grid (one week × one stage)
export default function StageCell({
  weekId,
  stageKey,
  chapters,       // chapters assigned to this cell
  canDrop,        // whether the currently dragged item can land here
  onToggleDone,
  onUnassign,
}) {
  const dropId = `${weekId}__${stageKey}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId });

  const c = COLORS[stageKey] ?? COLORS.prep;
  const active = isOver && canDrop;

  return (
    <div
      ref={setNodeRef}
      className={`
        relative min-h-[52px] rounded-lg border border-slate-200 p-1.5 flex flex-col gap-1
        transition-all duration-150
        ${active ? c.over : c.body}
        ${isOver && !canDrop ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {/* Drop hint when empty */}
      {chapters.length === 0 && !active && canDrop && (
        <div className="flex items-center justify-center h-full min-h-[36px]">
          <span className="text-[12px] text-slate-300 italic select-none">Drop here</span>
        </div>
      )}

      {active && chapters.length === 0 && (
        <div className="flex items-center justify-center h-full min-h-[36px]">
          <span className="text-[12px] text-slate-500 italic select-none">Release to assign</span>
        </div>
      )}

      {chapters.map((ch) => (
        <ChapterCard
          key={ch.id}
          chapter={ch}
          stageKey={stageKey}
          onToggleDone={onToggleDone}
          onUnassign={onUnassign}
        />
      ))}
    </div>
  );
}
