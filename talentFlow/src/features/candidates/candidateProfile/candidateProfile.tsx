
import  { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useCandidateViewModel } from "../../../hooks/useCandidateViewModel";
import useJobViewModel from "../../../hooks/useJobViewModel";
import { type Candidate, type TimelineEntry, type Note, type Job } from "../../../../public/db/type";
import PageLoader from "../../../components/loader";

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const vm = useCandidateViewModel();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [job,setJob]= useState<Job |null>(null);
  const {getJob}=useJobViewModel();

  useEffect(() => {
    if (!id) return;
    vm.getCandidate(id, (c) => {
      setCandidate(c);
      setNotes(c?.notes ?? []);
    }).catch(() => {});
    vm.getTimeline(id, setTimeline).catch(() => {});
  }, [id]);
  
  useEffect(()=>{
    
    if(candidate?.jobId)
    {
      getJob(candidate.jobId,setJob)
    }
    
  },[candidate])
console.log("job",job)

  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale]
  );
  const formatDate = (date: string | Date) => formatter.format(new Date(date));

  const handleAddNote = async () => {
    if (!id || !noteText.trim()) return;
    const optimistic: Note = {
      id: "temp-" + Date.now(),
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, optimistic]);
    setNoteText("");

    try {
      const saved = await vm.addCandidateNote(id, optimistic.text);
      setNotes((prev) => prev.map((n) => (n.id === optimistic.id ? saved : n)));
      setCandidate((prev) => (prev ? { ...prev, notes: [...(prev.notes ?? []).filter(n => n.id !== optimistic.id), saved] } : prev));
    } catch {
      setNotes((prev) => prev.filter((n) => n.id !== optimistic.id));
      alert("Failed to add note");
    }
  };

  const renderNoteText = (t: string) => {
    const parts = t.split(/(@[\w-]+)/g);
    return parts.map((p, i) =>
      p.startsWith("@") ? (
        <span key={i} className="bg-blue-100 text-blue-800 rounded px-1">
          {p}
        </span>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  };

  if (vm.loading && !candidate) {
    return  <PageLoader label="Loading Candidate"></PageLoader>;
  }
  if (!candidate) {
    return <div className="p-6 text-sm text-red-600">Candidate not found</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link
        to="/candidates"
        className="text-sm text-blue-600 hover:underline inline-block"
      >
        ← Back to candidates
      </Link>
      <div className="bg-white border border-blue-500/30 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-blue-900 font-semibold text-xl">
            {candidate.name ? candidate.name.charAt(0).toUpperCase() : "?"}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-950">{candidate.name}</h1>
            <div className="text-sm text-gray-500">{candidate.email}</div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-slate-600">Applied for:</span>
              <span className="text-sm text-slate-600">{job?.title}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-slate-600">Stage</span>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  candidate.stage === "hired"
                    ? "bg-green-100 text-green-700"
                    : candidate.stage === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {candidate.stage}
              </span>
            </div>
            
          </div>
        </div>
      </div>
      <section>
        <h2 className="text-lg font-semibold mb-2">Timeline</h2>
        <div className="space-y-3">
          {vm.loading &&  <PageLoader></PageLoader>}
          {!vm.loading && (!timeline || timeline.length === 0) && (
            <div className="p-4 bg-white border border-blue-500/30 rounded text-sm text-gray-500">
              No timeline entries
            </div>
          )}

          {timeline.map((entry, idx) => (
            <div
              key={(entry as any).id ?? idx}
              className="p-3 bg-white border border-blue-500/20 rounded hover:bg-gray-50"
            >
              <div className="text-xs text-gray-500">
                {formatDate(entry.date)}
              </div>
              <div className="font-medium text-blue-950 mt-1">{entry.title}</div>
              {entry.note && (
                <div className="text-sm text-gray-700 mt-1">{entry.note}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Notes</h2>

        {notes.length ? (
          <div className="space-y-2">
            {notes.map((n) => (
              <div
                key={n.id}
                className="text-sm border border-blue-500/20 p-3 rounded bg-white hover:bg-gray-50"
              >
                <div className="text-[11px] text-gray-500 mb-1">
                  {formatDate(n.createdAt)}
                </div>
                <div>{renderNoteText(n.text)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-white border border-blue-500/30 rounded text-sm text-gray-500">
            No notes
          </div>
        )}

        <div className="bg-white border border-blue-500/30 rounded p-4 shadow-sm">
          <label className="block text-sm font-medium text-blue-950 mb-2">
            Add a note
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
            placeholder="Write a note… use @ to mention someone"
            className="w-full border border-blue-500/20 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleAddNote}
              className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
              disabled={vm.loading || !noteText.trim()}
            >
              Add note
            </button>
            {vm.loading && <span className="text-xs text-gray-500">Saving…</span>}
          </div>
        </div>
      </section>
    </div>
  );
}
