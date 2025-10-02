// src/features/candidate/CandidateTimeline.tsx
import { useEffect, useState } from "react";
import type { TimelineEntry } from "../../../../public/db/type";
import { useCandidateViewModel } from "../../../hooks/useCandidateViewModel";

export function CandidateTimeline({ candidateId }: { candidateId: string }) {
  const { getTimeline } = useCandidateViewModel();
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    getTimeline(candidateId, setTimeline);
  }, [candidateId]);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Timeline</h3>
      <ul className="space-y-3">
        {timeline.length === 0 && <li>No timeline entries yet.</li>}
        {timeline.map(t => (
          <li key={t.id} className="border-l-2 pl-2">
            <div className="text-xs text-gray-500">{new Date(t.date).toLocaleString()}</div>
            <div className="font-medium">{t.title}</div>
            {t.note && <div>{t.note}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
