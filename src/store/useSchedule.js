import { useState, useEffect, useCallback } from "react";
import { generateChapters } from "../data/chapters";
import { generateWeeks } from "../utils/weeks";
import scheduleData from "../data/schedule.json";

const STORAGE_KEY = "ssv_schedule_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // If there's a bundled schedule export, use it as the initial state
  if (scheduleData && Array.isArray(scheduleData.chapters)) {
    return { chapters: scheduleData.chapters, notes: scheduleData.notes || {} };
  }
  return { chapters: generateChapters(), notes: {} };
}

export function useSchedule() {
  const [state, setState] = useState(loadState);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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

  // Import a saved schedule payload (either { chapters, notes } or raw chapters array)
  

  // Set a freeform note for a specific week (notes keyed by weekId)
  const setNote = useCallback((weekId, text) => {
    setState((prev) => ({
      ...prev,
      notes: { ...(prev.notes || {}), [weekId]: text },
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
    setNote,
    markDone,
    undoDone,
    resetAll,
  };
}
