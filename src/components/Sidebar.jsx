import ChapterCard from "./ChapterCard";

// Left sidebar: chapters not yet placed in Team Prep
export default function Sidebar({ chapters }) {
  const unscheduled = chapters.filter((c) => !c.prep.weekId);
  const total = unscheduled.length;

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="px-3 py-3 border-b border-slate-100">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Chapters
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {total} chapter{total !== 1 ? "s" : ""} to schedule
        </p>
        <p className="text-[10px] text-blue-500 mt-1">
          Drag to Team Prep →
        </p>
      </div>

      <div className="flex-1 overflow-y-auto schedule-scroll p-2 flex flex-col gap-1">
        {unscheduled.length === 0 ? (
          <div className="text-center py-8 text-slate-300 text-xs">
            <div className="text-2xl mb-2">🎉</div>
            All chapters scheduled!
          </div>
        ) : (
          unscheduled.map((ch) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              stageKey="prep"
            />
          ))
        )}
      </div>
    </aside>
  );
}
