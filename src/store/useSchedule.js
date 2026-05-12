import { useState, useCallback } from "react";
import { generateChapters } from "../data/chapters";
import { generateWeeks } from "../utils/weeks";
import scheduleData from "../data/schedule.json";

function loadState() {
  // Always load from the bundled schedule.json so deployed updates are
  // immediately visible — no localStorage override.
  if (scheduleData && Array.isArray(scheduleData.chapters)) {
    return { chapters: scheduleData.chapters, notes: scheduleData.notes || {} };
  }
  return { chapters: generateChapters(), notes: {} };
}

export function useSchedule() {
  const [state, setState] = useState(loadState);

  // Assign a chapter to Team Prep week; auto-populates check/finalize/tc.
  const assign = useCallback((chapterId, stageKey, weekId) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;

        if (stageKey === "prep") {
          const weeks = generateWeeks();
          const idx = weeks.findIndex((w) => w.id === weekId);
          const checkWeek   = idx >= 0 && weeks[idx + 1] ? weeks[idx + 1].id : null;
          const finalizeWeek = idx >= 0 && weeks[idx + 2] ? weeks[idx + 2].id : null;
          const tcWeek      = idx >= 0 && weeks[idx + 3] ? weeks[idx + 3].id : null;
          // GEN 1-26 → DP check; GEN 27-50 and EXO 1-40 → FB check
          const person = ch.book === "GEN" && ch.num <= 26 ? "DP" : "FB";
          return {
            ...ch,
            prep:     { ...ch.prep,     weekId },
            check:    { ...ch.check,    weekId: checkWeek,    person },
            finalize: { ...ch.finalize, weekId: finalizeWeek },
            tc:       { ...ch.tc,       weekId: tcWeek },
          };
        }
        return ch;
      }),
    }));
  }, []);

  // Remove a chapter from Team Prep → also clears all downstream auto-populated slots
  const unassign = useCallback((chapterId, stageKey) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const key = stageKey ?? "prep";
        if (key === "prep") {
          return {
            ...ch,
            prep:     { ...ch.prep,     weekId: null },
            check:    { ...ch.check,    weekId: null, person: null },
            finalize: { ...ch.finalize, weekId: null },
            tc:       { ...ch.tc,       weekId: null },
          };
        }
        return ch;
      }),
    }));
  }, []);

  // Move a single stage slot to a new weekId.
  // If all earlier stages are done, only this stage and undone later stages shift.
  // If ANY earlier stage is NOT done, behaves like assign (shifts this + all later).
  const moveStage = useCallback((chapterId, stageKey, weekId) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const weeks = generateWeeks();
        const idx = weeks.findIndex((w) => w.id === weekId);
        if (idx < 0) return ch;

        const ORDERED = ["prep", "check", "finalize", "tc"];
        const stageIdx = ORDERED.indexOf(stageKey === "check-DP" || stageKey === "check-FB" ? "check" : stageKey);
        const resolvedStageKey = stageKey === "check-DP" || stageKey === "check-FB" ? "check" : stageKey;

        // Are all stages before this one done?
        const earlierAllDone = ORDERED.slice(0, stageIdx).every((s) => ch[s]?.done);

        if (earlierAllDone) {
          // Independent move: shift this stage + any undone stages after it
          const updated = { ...ch };
          updated[resolvedStageKey] = { ...ch[resolvedStageKey], weekId };
          // Propagate to later undone stages while maintaining relative spacing
          const laterStages = ORDERED.slice(stageIdx + 1);
          let prevWeekIdx = idx;
          for (const s of laterStages) {
            if (!ch[s]?.done && ch[s]?.weekId) {
              prevWeekIdx = prevWeekIdx + 1;
              updated[s] = { ...updated[s], weekId: weeks[prevWeekIdx]?.id ?? null };
            }
          }
          return updated;
        } else {
          // Normal assign from this stage: shift this + all later with fixed offsets
          const updated = { ...ch };
          updated[resolvedStageKey] = { ...ch[resolvedStageKey], weekId };
          const laterStages = ORDERED.slice(stageIdx + 1);
          for (let i = 0; i < laterStages.length; i++) {
            const s = laterStages[i];
            updated[s] = { ...updated[s], weekId: weeks[idx + 1 + i]?.id ?? null };
          }
          return updated;
        }
      }),
    }));
  }, []);

  // Set a freeform note for a specific week (notes keyed by weekId)
  const setNote = useCallback((weekId, text) => {
    setState((prev) => ({
      ...prev,
      notes: { ...(prev.notes || {}), [weekId]: text },
    }));
  }, []);

  // Toggle the done flag on a specific stage slot (does NOT advance ch.stage)
  // Used by the per-cell checkbox to unlock independent movement
  const toggleStageDone = useCallback((chapterId, stageKey) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const resolvedKey = stageKey === "check-DP" || stageKey === "check-FB" ? "check" : stageKey;
        const slot = ch[resolvedKey];
        if (!slot) return ch;
        return { ...ch, [resolvedKey]: { ...slot, done: !slot.done } };
      }),
    }));
  }, []);

  // Mark the current stage of a chapter as done → advance to next stage
  const markDone = useCallback((chapterId) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        if (ch.stage === "prep") {
          return { ...ch, prep: { ...ch.prep, done: true }, stage: "check" };
        }
        if (ch.stage === "check") {
          return { ...ch, check: { ...ch.check, done: true }, stage: "finalize" };
        }
        if (ch.stage === "finalize") {
          return { ...ch, finalize: { ...ch.finalize, done: true }, stage: "tc" };
        }
        if (ch.stage === "tc") {
          return { ...ch, tc: { ...ch.tc, done: true }, stage: "completed" };
        }
        return ch;
      }),
    }));
  }, []);

  // Undo a "done" mark on a specific stage (go back one step)
  const undoDone = useCallback((chapterId) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        if (ch.stage === "check" && ch.prep.done) {
          return { ...ch, prep: { ...ch.prep, done: false }, stage: "prep" };
        }
        if (ch.stage === "finalize" && ch.check.done) {
          return { ...ch, check: { ...ch.check, done: false }, stage: "check" };
        }
        if (ch.stage === "tc" && ch.finalize.done) {
          return { ...ch, finalize: { ...ch.finalize, done: false }, stage: "finalize" };
        }
        if (ch.stage === "completed" && ch.tc.done) {
          return { ...ch, tc: { ...ch.tc, done: false }, stage: "tc" };
        }
        return ch;
      }),
    }));
  }, []);

  // Wipe all data and restart fresh
  const resetAll = useCallback(() => {
    setState({ chapters: generateChapters() });
  }, []);

  return {
    chapters: state.chapters,
    notes: state.notes || {},
    assign,
    unassign,
    moveStage,
    toggleStageDone,
    setNote,
    markDone,
    undoDone,
    resetAll,
  };
}
