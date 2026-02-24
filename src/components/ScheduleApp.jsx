import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useSchedule } from "../store/useSchedule";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ScheduleBoard from "./ScheduleBoard";
import ChapterCard from "./ChapterCard";

export default function ScheduleApp() {
  const { chapters, notes, assign, unassign, setNote, markDone, undoDone, resetAll } = useSchedule();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 2 } }));
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeStageKey, setActiveStageKey] = useState(null);

  const stats = useMemo(() => {
    const total = chapters.length;
    const completed = chapters.filter((c) => c.stage === "completed").length;
    const prep = chapters.filter((c) => c.stage === "prep").length;
    const check = chapters.filter((c) => c.stage === "check").length;
    const finalize = chapters.filter((c) => c.stage === "finalize").length;
    return { total, completed, prep, check, finalize };
  }, [chapters]);

  function handleReset() {
    if (window.confirm("Reset ALL scheduling data? This cannot be undone.")) {
      resetAll();
    }
  }

  function handleSave() {
    const payload = {
      exportedAt: new Date().toISOString(),
      chapters,
      notes,
    };

    // Try to POST to server endpoint first (shared server will write data/schedule.json)
    try {
      // Respect Vite base when hosted under a subpath
      // During dev, use the proxied `/api` path so vite's proxy works.
      const apiUrl = import.meta.env.DEV
        ? "/api/save-schedule"
        : new URL("api/save-schedule", (import.meta.env.BASE_URL || "/")).toString();

      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => {
        if (!res.ok) throw new Error("Server responded " + res.status);
        return res.json();
      }).then((data) => {
        console.log("Saved to server:", data);
        alert("Schedule saved to server");
      }).catch((err) => {
        console.warn("Server save failed, falling back to download:", err);
        // fallback: trigger download
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const fn = `ssv_schedule_${new Date().toISOString().slice(0,10)}.json`;
        a.href = url;
        a.download = fn;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save file: " + (err?.message ?? err));
    }
  }


  function handleDragStart({ active }) {
    const ch = chapters.find((c) => c.id === active.id);
    setActiveChapter(ch ?? null);
    setActiveStageKey(active.data?.current?.stageKey ?? null);
  }

  function handleDragEnd({ active, over }) {
    setActiveChapter(null);
    setActiveStageKey(null);
    if (!over) return;
    const [weekId, targetStageKey] = over.id.split("__");
    // Only allow dropping onto Team Prep; other columns are auto-populated
    if (targetStageKey !== "prep") return;
    const ch = chapters.find((c) => c.id === active.id);
    if (!ch) return;
    assign(ch.id, targetStageKey, weekId);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen overflow-hidden">
        <Header onReset={handleReset} onSave={handleSave} stats={stats} />

        <div className="flex flex-1 overflow-hidden">
            <Sidebar chapters={chapters} />

            <ScheduleBoard
              chapters={chapters}
              notes={notes}
              setNote={setNote}
              activeChapter={activeChapter}
              unassign={unassign}
              markDone={markDone}
              undoDone={undoDone}
            />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeChapter && (
          <ChapterCard
            chapter={activeChapter}
            stageKey={activeStageKey ?? "prep"}
            isDragOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
