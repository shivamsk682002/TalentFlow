// src/features/assessments/Builder.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { AssessmentSchema, Section, Question, QType } from'../../../db/type';
import { useAssessmentViewModel } from '../../../hooks/useAssessmentViewModel';
import { v4 as uuidv4 } from 'uuid';
import { RuntimeForm } from '../runtimeForm/runtimeForm';

const Q_TYPES: { label: string; value: QType }[] = [
  { label: 'Single choice', value: 'single' },
  { label: 'Multi choice', value: 'multi' },
  { label: 'Short text', value: 'short' },
  { label: 'Long text', value: 'long' },
  { label: 'Numeric', value: 'numeric' },
  { label: 'File', value: 'file' },
];

export default function Builder() {
  const { jobId } = useParams<{ jobId: string }>();
  const vm = useAssessmentViewModel();

  const [schema, setSchema] = useState<AssessmentSchema>({ jobId: jobId!, sections: [] });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    vm.get(jobId, setSchema).catch(()=>{});
  }, [jobId]);

  const addSection = () => {
    const s: Section = { id: uuidv4(), title: `Section ${schema.sections.length + 1}`, questions: [] };
    setSchema(prev => ({ ...prev, sections: [...prev.sections, s] }));
    setDirty(true);
  };

  const removeSection = (sid: string) => {
    setSchema(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sid) }));
    setDirty(true);
  };

  const addQuestion = (sid: string, type: QType) => {
    const q: Question = {
      id: uuidv4(),
      type,
      text: 'Untitled question',
      required: false,
      options: (type === 'single' || type === 'multi') ? ['Option 1'] : undefined,
      conditional: null,
    };
    setSchema(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sid ? { ...s, questions: [...s.questions, q] } : s)
    }));
    setDirty(true);
  };

  const updateQuestion = (sid: string, qid: string, patch: Partial<Question>) => {
    setSchema(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sid ? {
        ...s,
        questions: s.questions.map(q => q.id === qid ? { ...q, ...patch } : q)
      } : s)
    }));
    setDirty(true);
  };

  const removeQuestion = (sid: string, qid: string) => {
    setSchema(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sid ? {
        ...s,
        questions: s.questions.filter(q => q.id !== qid)
      } : s)
    }));
    setDirty(true);
  };

  const save = async () => {
    if (!jobId) return;
    await vm.save(jobId, schema.sections, (s)=> setSchema(s));
    setDirty(false);
  };

  // Right pane: the live preview is memoized so it re-renders on schema change
  const preview = useMemo(() => schema, [schema]);

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      {/* Left: Builder */}
      <div className="space-y-4">
        <div className="bg-white border border-blue-500/30 rounded p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Assessment Builder</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={addSection}
                className="px-3 py-1.5 rounded border border-blue-500/30 text-sm bg-white hover:bg-gray-50"
              >
                + Add Section
              </button>
              <button
                onClick={save}
                className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
                disabled={!dirty || vm.loading}
              >
                {vm.loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Sections */}
        {schema.sections.map((s) => (
          <div key={s.id} className="bg-white border border-blue-500/30 rounded p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={s.title}
                onChange={(e)=>{ 
                  const title = e.target.value;
                  setSchema(prev=> ({
                    ...prev, sections: prev.sections.map(x=> x.id===s.id ? {...x, title} : x)
                  })); setDirty(true);
                }}
                className="flex-1 border border-blue-500/20 rounded px-2 py-1 text-sm"
              />
              <button onClick={()=>removeSection(s.id)} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">
                Remove
              </button>
            </div>

            {/* Add question row */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Add question:</span>
              {Q_TYPES.map(t=>(
                <button
                  key={t.value}
                  onClick={()=>addQuestion(s.id, t.value)}
                  className="px-2 py-1 text-xs border border-blue-500/20 rounded hover:bg-gray-50"
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {s.questions.map(q=>(
                <div key={q.id} className="border border-blue-500/20 rounded p-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={q.text}
                      onChange={(e)=>updateQuestion(s.id, q.id, { text: e.target.value })}
                      className="flex-1 border border-blue-500/20 rounded px-2 py-1 text-sm"
                    />
                    <label className="text-xs flex items-center gap-1">
                      <input type="checkbox" checked={!!q.required} onChange={e=>updateQuestion(s.id,q.id,{required:e.target.checked})}/>
                      Required
                    </label>
                    <button onClick={()=>removeQuestion(s.id, q.id)} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Remove</button>
                  </div>

                  {/* Options for choice types */}
                  {(q.type==='single' || q.type==='multi') && (
                    <div className="mt-2">
                      <div className="text-xs text-slate-600 mb-1">Options</div>
                      {(q.options ?? []).map((opt, idx)=>(
                        <div key={idx} className="flex items-center gap-2 mb-1">
                          <input
                            value={opt}
                            onChange={e=>{
                              const copy = [...(q.options ?? [])];
                              copy[idx] = e.target.value;
                              updateQuestion(s.id, q.id, { options: copy });
                            }}
                            className="flex-1 border border-blue-500/20 rounded px-2 py-1 text-sm"
                          />
                          <button
                            className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
                            onClick={()=>{
                              const copy = (q.options ?? []).filter((_,i)=>i!==idx);
                              updateQuestion(s.id, q.id, { options: copy });
                            }}
                          >Del</button>
                        </div>
                      ))}
                      <button
                        className="mt-1 px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        onClick={()=>{
                          const copy = [...(q.options ?? []), `Option ${(q.options?.length ?? 0)+1}`];
                          updateQuestion(s.id, q.id, { options: copy });
                        }}
                      >+ Add option</button>
                    </div>
                  )}

                  {/* Validation for numeric / text */}
                  {q.type==='numeric' && (
                    <div className="mt-2 flex gap-2">
                      <input type="number" placeholder="min"
                        defaultValue={q.validation?.min}
                        onChange={e=>updateQuestion(s.id,q.id,{validation:{...q.validation, min: e.target.value? Number(e.target.value): undefined}})}
                        className="w-24 border border-blue-500/20 rounded px-2 py-1 text-sm"
                      />
                      <input type="number" placeholder="max"
                        defaultValue={q.validation?.max}
                        onChange={e=>updateQuestion(s.id,q.id,{validation:{...q.validation, max: e.target.value? Number(e.target.value): undefined}})}
                        className="w-24 border border-blue-500/20 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                  {(q.type==='short'||q.type==='long') && (
                    <div className="mt-2">
                      <input type="number" placeholder="max length"
                        defaultValue={q.validation?.maxLength}
                        onChange={e=>updateQuestion(s.id,q.id,{validation:{...q.validation, maxLength: e.target.value? Number(e.target.value): undefined}})}
                        className="w-32 border border-blue-500/20 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  )}

                  {/* Conditional */}
                  <div className="mt-2">
                    <div className="text-xs text-slate-600 mb-1">Show this question only if…</div>
                    <div className="flex items-center gap-2">
                      <select
                        value={q.conditional?.questionId ?? ''}
                        onChange={e=>updateQuestion(s.id,q.id,{conditional: e.target.value? { ...(q.conditional||{equals:''}), questionId: e.target.value } : null })}
                        className="border border-blue-500/20 rounded px-2 py-1 text-sm"
                      >
                        <option value="">(no condition)</option>
                        {s.questions.filter(x=>x.id!==q.id).map(x=>(
                          <option key={x.id} value={x.id}>{x.text.slice(0,40)}</option>
                        ))}
                      </select>
                      <input
                        placeholder="equals…"
                        value={q.conditional?.equals ?? ''}
                        onChange={e=>updateQuestion(s.id,q.id,{conditional: q.conditional? {...q.conditional, equals: e.target.value} : {questionId:'', equals: e.target.value}})}
                        className="border border-blue-500/20 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right: Live preview */}
      <div className="space-y-4">
        <div className="bg-white border border-blue-500/30 rounded p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Live Preview</h2>
          <p className="text-sm text-gray-600">Fill the form like a candidate would. Validations & conditionals run live.</p>
        </div>
        <RuntimeForm schema={preview} />
      </div>
    </div>
  );
}
