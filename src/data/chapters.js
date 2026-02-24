// All chapters: GEN 1-50 and EXO 1-40
export const BOOKS = [
  { id: "GEN", chapters: 50 },
  { id: "EXO", chapters: 40 },
];

// The four droppable stage keys used throughout the UI
// "check" is split into "check-DP" and "check-FB"
export const STAGE_KEYS = ["prep", "check-DP", "check-FB", "finalize", "tc"];

export const STAGE_LABELS = {
  prep: "Team Prep",
  "check-DP": "DP Check",
  "check-FB": "FB Check",
  finalize: "Team Finalize",
};

export const STAGE_COLORS = {
  prep: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    header: "bg-blue-100 text-blue-800",
    ring: "ring-blue-300",
    drop: "bg-blue-50 ring-2 ring-blue-400",
  },
  "check-DP": {
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    header: "bg-purple-100 text-purple-800",
    ring: "ring-purple-300",
    drop: "bg-purple-50 ring-2 ring-purple-400",
  },
  "check-FB": {
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    header: "bg-orange-100 text-orange-800",
    ring: "ring-orange-300",
    drop: "bg-orange-50 ring-2 ring-orange-400",
  },
  finalize: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    header: "bg-teal-100 text-teal-800",
    ring: "ring-teal-300",
    drop: "bg-teal-50 ring-2 ring-teal-400",
  },
  tc: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    header: "bg-amber-100 text-amber-800",
    ring: "ring-amber-300",
    drop: "bg-amber-50 ring-2 ring-amber-400",
  },
};

export function generateChapters() {
  const chapters = [];
  for (const book of BOOKS) {
    for (let n = 1; n <= book.chapters; n++) {
      chapters.push({
        id: `${book.id}-${n}`,
        book: book.id,
        num: n,
        // Current workflow stage: prep | check | finalize | completed
        stage: "prep",
        prep: { weekId: null, done: false },
        check: { weekId: null, person: null, done: false }, // person: "DP" | "FB"
        finalize: { weekId: null, done: false },
        tc: { weekId: null, done: false },
      });
    }
  }
  return chapters;
}

// Given a chapter object, return the stageKey for where it currently lives in the grid
// Returns null if it belongs in the sidebar (unassigned for its current stage)
export function getActiveStageKey(ch) {
  if (ch.stage === "prep") {
    if (ch.prep.weekId) return "prep";
    return null;
  }
  if (ch.stage === "check") {
    if (ch.check.weekId) return ch.check.person === "DP" ? "check-DP" : "check-FB";
    return null;
  }
  if (ch.stage === "finalize") {
    if (ch.finalize.weekId) return "finalize";
    return null;
  }
  if (ch.stage === "tc") {
    if (ch.tc.weekId) return "tc";
    return null;
  }
  return null; // completed — shown in grid as done
}

// Return the weekId for a chapter's currently active stage
export function getActiveWeekId(ch) {
  if (ch.stage === "prep") return ch.prep.weekId;
  if (ch.stage === "check") return ch.check.weekId;
  if (ch.stage === "finalize") return ch.finalize.weekId;
  if (ch.stage === "tc") return ch.tc.weekId;
  return null;
}
