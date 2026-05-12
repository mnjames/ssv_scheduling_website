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
  const { chapters, notes, assign, unassign, moveStage, toggleStageDone, setNote, markDone, undoDone, resetAll } = useSchedule();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 2 } }));
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeStageKey, setActiveStageKey] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const stats = useMemo(() => {
    const total = chapters.length;
    const completed = chapters.filter((c) => c.tc?.done).length;
    const prep = chapters.filter((c) => c.prep?.done).length;
    const check = chapters.filter((c) => c.check?.done).length;
    const finalize = chapters.filter((c) => c.finalize?.done).length;
    return { total, completed, prep, check, finalize };
  }, [chapters]);

  function handleReset() {
    if (window.confirm("Reset ALL scheduling data? This cannot be undone.")) {
      resetAll();
    }
  }

  function handleLogin() {
    const pw = window.prompt("Enter admin password to edit schedule:");
    if (!pw) return;
    const secret = import.meta.env.VITE_ADMIN_PASSWORD || "admin";
    if (pw === secret) {
      setIsEditMode(true);
    } else {
      alert("Incorrect password");
    }
  }

  function handleSave() {
    const payload = {
      chapters,
      notes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }


  function handleDragStart({ active }) {
    // active.id is now "chapterId__stageKey"
    const dragStageKey = active.data?.current?.stageKey ?? null;
    const chapterId = active.data?.current?.chapterId ?? active.id.split("__")[0];
    const ch = chapters.find((c) => c.id === chapterId);
    setActiveChapter(ch ?? null);
    setActiveStageKey(dragStageKey);
  }

  function handleDragEnd({ active, over }) {
    setActiveChapter(null);
    setActiveStageKey(null);
    if (!over) return;

    // drop target id: "weekId__stageKey"
    const [targetWeekId, targetStageKey] = over.id.split("__");
    const dragStageKey = active.data?.current?.stageKey ?? null;
    const chapterId = active.data?.current?.chapterId ?? active.id.split("__")[0];

    if (!chapterId || !targetWeekId) return;

    // Only Team Prep accepts new assignments from the sidebar; elsewhere use moveStage
    if (dragStageKey === null || dragStageKey === "prep") {
      // Coming from the sidebar or prep column → original assign behaviour
      if (targetStageKey !== "prep") return;
      assign(chapterId, "prep", targetWeekId);
    } else {
      // Moving a card within its own column — only allow dropping into the same column
      if (targetStageKey !== dragStageKey) return;
      moveStage(chapterId, dragStageKey, targetWeekId);
    }
  }

  if (!isEditMode) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header onReset={handleReset} onSave={handleSave} onLogin={handleLogin} isEditMode={false} stats={stats} />

        <div className="flex flex-1 overflow-hidden">
          {/* chapters sidebar removed in read-only view */}

          <ScheduleBoard
            chapters={chapters}
            notes={notes}
            setNote={setNote}
            activeChapter={null}
            activeStageKey={null}
            unassign={unassign}
            toggleStageDone={toggleStageDone}
            markDone={markDone}
            undoDone={undoDone}
            isEditMode={false}
          />
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen overflow-hidden">
        <Header onReset={handleReset} onSave={handleSave} onLogin={handleLogin} isEditMode={true} stats={stats} />

        <div className="flex flex-1 overflow-hidden">
            <Sidebar chapters={chapters} />

            <ScheduleBoard
              chapters={chapters}
              notes={notes}
              setNote={setNote}
              activeChapter={activeChapter}
              activeStageKey={activeStageKey}
              unassign={unassign}
              toggleStageDone={toggleStageDone}
              markDone={markDone}
              undoDone={undoDone}
              isEditMode={true}
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
