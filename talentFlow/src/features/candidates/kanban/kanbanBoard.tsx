// src/features/kanban/KanbanBoard.tsx
import { useEffect, useMemo, useState } from "react";
import { useCandidateViewModel } from "../../../hooks/useCandidateViewModel";
import type { Candidate, Stage } from "../../../db/type";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

const STAGES: Stage[] = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
];

/* ---------------- CandidateCard ---------------- */
function CandidateCard({ candidate }: { candidate: Candidate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: candidate.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: "none", // 🚀 remove lag to make drag instant
    willChange: "transform", // 🚀 GPU optimize
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`p-3 mb-3 rounded-lg bg-white border border-blue-200 shadow-sm 
        cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-70 shadow-md" : "hover:shadow"}`}
    >
      <div className="font-medium text-blue-950">{candidate.name}</div>
      <div className="text-xs text-blue-900/70">{candidate.email}</div>
    </div>
  );
}

/* ---------------- Column ---------------- */
function Column({ id, children }: { id: Stage; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[240px] p-4 rounded-lg border
        ${isOver ? "border-blue-500 bg-blue-50" : "border-blue-200 bg-white/50"}`}
    >
      <h3 className="font-semibold text-blue-900 mb-3 tracking-wide">
        {id.toUpperCase()}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* ---------------- KanbanBoard ---------------- */
export default function KanbanBoard({ jobId }: { jobId: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const { getCandidates, updateCandidate } = useCandidateViewModel();

  // initial load (filtered by jobId)
  useEffect(() => {
    getCandidates({ jobId, setCandidates, setTotal, page: 1, pageSize: 500 });
  }, [jobId]);

  const sensors = useSensors(useSensor(PointerSensor));

  // group candidates by stage
  const grouped = useMemo(() => {
    const by: Record<Stage, Candidate[]> = {
      applied: [],
      screen: [],
      tech: [],
      offer: [],
      hired: [],
      rejected: [],
    };
    for (const c of candidates) if (c.jobId === jobId) by[c.stage].push(c);
    return by;
  }, [candidates, jobId]);

  const handleDragEnd = async (e: any) => {
    const { active, over } = e;
    if (!over) return;
    const id = String(active.id);
    const toStage = over.id as Stage;

    const prev = candidates.find((c) => c.id === id);
    if (!prev || prev.stage === toStage) return;

    // optimistic move
    setCandidates((cs) =>
      cs.map((c) => (c.id === id ? { ...c, stage: toStage } : c))
    );

    try {
      await updateCandidate(id, { stage: toStage });
    } catch {
      // rollback
      setCandidates((cs) =>
        cs.map((c) => (c.id === id ? { ...c, stage: prev.stage } : c))
      );
      alert("Stage update failed — rolled back.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-300/10 text-blue-950 px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        Candidate Pipeline
      </h2>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-5 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <Column id={stage} key={stage}>
              {grouped[stage].map((c) => (
                <CandidateCard key={c.id} candidate={c} />
              ))}
            </Column>
          ))}
        </div>
      </DndContext>

      <div className="mt-4 text-sm text-blue-900 text-center">
        Total candidates: {total}
      </div>
    </div>
  );
}
