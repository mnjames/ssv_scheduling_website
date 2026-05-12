import { useMemo, useRef, useEffect } from "react";
import { generateWeeks, getCurrentWeekId } from "../utils/weeks";
import { STAGE_KEYS } from "../data/chapters";
import StageCell from "./StageCell";
import ChapterCard from "./ChapterCard";

const WEEKS = generateWeeks();
const CURRENT_WEEK_ID = getCurrentWeekId();

const COLUMN_LABELS = {
  prep: "Team Prep",
  "check-DP": "DP Check",
  "check-FB": "FB Check",
  finalize: "Team Finalize",
  tc: "TC Sign-off",
};

const COLUMN_HEADER_COLOR = {
  prep: "bg-blue-100 text-blue-800",
  "check-DP": "bg-orange-100 text-orange-800",
  "check-FB": "bg-orange-100 text-orange-800",
  finalize: "bg-teal-100 text-teal-800",
  tc: "bg-amber-100 text-amber-800",
};

export default function ScheduleBoard({ chapters, notes = {}, setNote, activeChapter, activeStageKey, unassign, toggleStageDone, markDone, undoDone, isEditMode = true }) {
  const currentWeekRef = useRef(null);

  useEffect(() => {
    if (currentWeekRef.current) {
      // Scroll the board container so the week row is fully visible below the
      // sticky column headers. Calculate an offset using the header height.
      const container = currentWeekRef.current.closest(".schedule-scroll") || document.querySelector(".schedule-scroll");
      if (container) {
        const header = container.querySelector(".sticky");
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const containerRect = container.getBoundingClientRect();
        const targetRect = currentWeekRef.current.getBoundingClientRect();
        const offset = targetRect.top - containerRect.top - headerHeight - 6; // small gap
        container.scrollBy({ top: offset, behavior: "smooth" });
      } else {
        currentWeekRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  // Build lookup: weekId → stageKey → [chapters]
  const grid = useMemo(() => {
    const map = {};
    for (const w of WEEKS) {
      map[w.id] = { prep: [], "check-DP": [], "check-FB": [], finalize: [] };
      map[w.id].tc = []; // Added tc to the mapping
    }
    for (const ch of chapters) {
      if (ch.prep.weekId && map[ch.prep.weekId]) {
        map[ch.prep.weekId].prep.push(ch);
      }
      if (ch.check.weekId && map[ch.check.weekId]) {
        const key = ch.check.person === "DP" ? "check-DP" : "check-FB";
        map[ch.check.weekId][key].push(ch);
      }
      if (ch.finalize.weekId && map[ch.finalize.weekId]) {
        map[ch.finalize.weekId].finalize.push(ch);
      }
      if (ch.tc?.weekId && map[ch.tc.weekId]) {
        map[ch.tc.weekId].tc.push(ch);
      }
    }
    return map;
  }, [chapters]);

  function canDropHere(stageKey) {
    if (!activeChapter) return false;
    // Sidebar / prep card → can only drop on prep
    if (!activeStageKey || activeStageKey === "prep") return stageKey === "prep";
    // A card being moved within its own column
    return stageKey === activeStageKey;
  }

  return (
      <div className="flex-1 overflow-auto schedule-scroll">
        {/* Sticky column headers */}
        <div className="sticky top-0 z-30 bg-slate-100 border-b border-slate-200 flex">
          {/* Week label column */}
          <div className="w-32 flex-shrink-0 px-3 py-2 text-xs font-semibold text-slate-500 border-r border-slate-200">
            Week
          </div>
          {STAGE_KEYS.map((sk) => (
            <div
              key={sk}
              className={`flex-1 min-w-[150px] px-2 py-2 text-xs font-semibold text-center border-r border-slate-200 last:border-r-0 ${COLUMN_HEADER_COLOR[sk]}`}
            >
              {COLUMN_LABELS[sk]}
            </div>
          ))}
          {/* Notes column header */}
          <div className={`w-52 px-2 py-2 text-xs font-semibold text-center border-r border-slate-200 last:border-r-0 bg-slate-50 text-slate-700`}>
            Notes
          </div>
        </div>

        {/* Week rows */}
        {WEEKS.map((week) => {
          const isCurrentWeek = week.id === CURRENT_WEEK_ID;
          const isPast = week.id < CURRENT_WEEK_ID;
          return (
            <div
              key={week.id}
              ref={isCurrentWeek ? currentWeekRef : null}
              className={`flex border-b border-slate-200 ${
                isCurrentWeek
                  ? "bg-yellow-50 ring-1 ring-inset ring-yellow-300"
                  : isPast
                  ? "bg-slate-50/60 opacity-75"
                  : "bg-white"
              }`}
            >
              {/* Week label */}
              <div className="w-32 flex-shrink-0 px-3 py-2 border-r border-slate-200 flex flex-col justify-start items-start gap-0.5">
                <span className={`text-[11px] font-semibold leading-tight ${isCurrentWeek ? "text-yellow-700" : "text-slate-600"}`}>
                  {week.label}
                </span>
                {isCurrentWeek && (
                  <span className="text-[9px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full font-bold">
                    THIS WEEK
                  </span>
                )}
                {isPast && (
                  <span className="text-[9px] text-slate-400 italic">past</span>
                )}
              </div>

                    {/* Stage cells */}
                    {isEditMode
                      ? STAGE_KEYS.map((sk) => {
                          const isFocusCol = sk === "prep" || sk === "finalize";
                          const colBg = isFocusCol
                            ? isCurrentWeek
                              ? "bg-yellow-100"
                              : isPast
                              ? "bg-slate-200"
                              : "bg-slate-50"
                            : "";
                          return (
                            <div key={sk} className={`flex-1 min-w-[150px] p-1.5 border-r border-slate-200 last:border-r-0 ${colBg}`}>
                              <StageCell
                                weekId={week.id}
                                stageKey={sk}
                                chapters={grid[week.id]?.[sk] ?? []}
                                canDrop={canDropHere(sk)}
                                onToggleDone={toggleStageDone}
                                onUnassign={unassign}
                              />
                            </div>
                          );
                        })
                      : STAGE_KEYS.map((sk) => {
                          const isFocusCol = sk === "prep" || sk === "finalize";
                          const colBg = isFocusCol
                            ? isCurrentWeek
                              ? "bg-yellow-100"
                              : isPast
                              ? "bg-slate-200"
                              : "bg-slate-50"
                            : "";
                          return (
                            <div key={sk} className={`flex-1 min-w-[150px] p-1.5 border-r border-slate-200 last:border-r-0 ${colBg}`}>
                              <div className="min-h-[52px] rounded-lg p-1.5 flex flex-col gap-1">
                                {(grid[week.id]?.[sk] ?? []).map((ch) => (
                                  <div key={ch.id} className="mb-1">
                                    <ChapterCard chapter={ch} stageKey={sk} allowDrag={false} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}

              {/* Notes cell */}
              <div className="w-52 px-2 py-2 border-r border-slate-200 last:border-r-0">
                <textarea
                  value={notes[week.id] ?? ""}
                  onChange={(e) => setNote?.(week.id, e.target.value)}
                  placeholder="Notes..."
                  className="w-full h-24 resize-none text-sm p-2 rounded border border-slate-200 bg-white text-slate-700"
                />
              </div>
            </div>
          );
        })}
      </div>

  );
}
