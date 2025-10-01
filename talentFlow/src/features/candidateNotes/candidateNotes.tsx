// src/features/candidate/CandidateNotes.tsx
import { useState } from "react";
import type { Note } from "../../db/type";
import { useCandidateViewModel } from "../../hooks/useCandidateViewModel";

export function CandidateNotes({ candidateId, initialNotes = [] }: { candidateId: string; initialNotes: Note[] }) {
  const { addCandidateNote} = useCandidateViewModel();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [text, setText] = useState("");

  const handleAdd = async () => {
    if (!text.trim()) return;
    const optimistic: Note = { id: "temp-" + Date.now(), text, createdAt: new Date().toISOString() };
    setNotes(prev => [...prev, optimistic]);

    try {
      const saved = await addCandidateNote(candidateId, text);
      setNotes(prev => prev.map(n => (n.id === optimistic.id ? saved : n)));
      setText("");
    } catch {
      setNotes(prev => prev.filter(n => n.id !== optimistic.id));
      alert("Failed to add note");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Notes</h3>
      <ul className="space-y-2 mb-3">
        {notes.map(n => (
          <li key={n.id} className="border rounded p-2">
            <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
            <div>{n.text}</div>
          </li>
        ))}
      </ul>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className="w-full border rounded p-2"
        rows={3}
        placeholder="Write a note..."
      />
      <button onClick={handleAdd} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">
        Add Note
      </button>
    </div>
  );
}
