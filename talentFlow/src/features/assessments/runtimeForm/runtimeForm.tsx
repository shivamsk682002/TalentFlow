// src/features/assessments/RuntimeForm.tsx
import React, { useMemo, useState } from 'react';
import type { AssessmentSchema,Question,Section } from '../../../../public/db/type';
import { useAssessmentViewModel } from '../../../hooks/useAssessmentViewModel';

type Props = { schema: AssessmentSchema; candidateId?: string };

const shouldShow = (q: Question, values: Record<string, any>) => {
  if (!q.conditional) return true;
  const { questionId, equals } = q.conditional;
  return values[questionId] === equals;
};

export function RuntimeForm({ schema, candidateId = 'demo-candidate' }: Props) {
  const { submit, loading } = useAssessmentViewModel();
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>('');

  const flatQuestions = useMemo(
    () => schema.sections.flatMap(s => s.questions),
    [schema.sections]
  );

  const validate = (): boolean => {
    const next: Record<string,string> = {};
    for (const q of flatQuestions) {
      if (!shouldShow(q, values)) continue;
      const v = values[q.id];

      if (q.required && (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length===0))) {
        next[q.id] = 'This field is required';
        continue;
      }
      if (q.type === 'numeric' && v !== undefined && v !== '' && isNaN(Number(v))) {
        next[q.id] = 'Enter a number';
        continue;
      }
      if (q.type === 'numeric') {
        if (q.validation?.min !== undefined && Number(v) < q.validation.min) next[q.id] = `Min ${q.validation.min}`;
        if (q.validation?.max !== undefined && Number(v) > q.validation.max) next[q.id] = `Max ${q.validation.max}`;
      }
      if ((q.type === 'short' || q.type === 'long') && q.validation?.maxLength && typeof v === 'string' && v.length > q.validation.maxLength) {
        next[q.id] = `Max length ${q.validation.maxLength}`;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!validate()) return;
    try {
      await submit(schema.jobId, candidateId, values, ()=> setMessage('Submitted!'));
      setValues({});
    } catch (e:any) {
      setMessage(e?.message ?? 'Failed to submit');
    }
  };

  const setValue = (id: string, v: any) => setValues(prev => ({ ...prev, [id]: v }));

  const renderQ = (q: Question) => {
    if (!shouldShow(q, values)) return null;

    const help = errors[q.id];

    switch (q.type) {
      case 'single':
        return (
          <div className="space-y-1">
            {(q.options ?? []).map(opt => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={q.id}
                  checked={values[q.id] === opt}
                  onChange={()=>setValue(q.id, opt)}
                />
                {opt}
              </label>
            ))}
            {help && <div className="text-xs text-red-600">{help}</div>}
          </div>
        );
      case 'multi':
        return (
          <div className="space-y-1">
            {(q.options ?? []).map(opt => {
              const arr: string[] = values[q.id] ?? [];
              const checked = arr.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e)=>{
                      const next = new Set(arr);
                      if (e.target.checked) next.add(opt); else next.delete(opt);
                      setValue(q.id, Array.from(next));
                    }}
                  />
                  {opt}
                </label>
              );
            })}
            {help && <div className="text-xs text-red-600">{help}</div>}
          </div>
        );
      case 'short':
        return (
          <div>
            <input
              value={values[q.id] ?? ''}
              onChange={e=>setValue(q.id, e.target.value)}
              className="w-full border border-blue-500/20 rounded px-2 py-1 text-sm"
            />
            {help && <div className="text-xs text-red-600 mt-1">{help}</div>}
          </div>
        );
      case 'long':
        return (
          <div>
            <textarea
              rows={4}
              value={values[q.id] ?? ''}
              onChange={e=>setValue(q.id, e.target.value)}
              className="w-full border border-blue-500/20 rounded px-2 py-1 text-sm"
            />
            {help && <div className="text-xs text-red-600 mt-1">{help}</div>}
          </div>
        );
      case 'numeric':
        return (
          <div>
            <input
              type="number"
              value={values[q.id] ?? ''}
              onChange={e=>setValue(q.id, e.target.value)}
              className="w-full border border-blue-500/20 rounded px-2 py-1 text-sm"
            />
            {help && <div className="text-xs text-red-600 mt-1">{help}</div>}
          </div>
        );
      case 'file':
        return (
          <div>
            <input
              type="file"
              onChange={e=>{
                const file = e.target.files?.[0];
                if (file) {
                  // store metadata only (name/size/type)
                  setValue(q.id, { name: file.name, size: file.size, type: file.type });
                } else {
                  setValue(q.id, undefined);
                }
              }}
              className="text-sm"
            />
            {values[q.id]?.name && (
              <div className="text-xs text-slate-600 mt-1">
                Selected: {values[q.id].name} ({values[q.id].size} bytes)
              </div>
            )}
            {help && <div className="text-xs text-red-600 mt-1">{help}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {schema.sections.map((s: Section)=>(
        <div key={s.id} className="bg-white border border-blue-500/20 rounded p-4 shadow-sm space-y-3">
          <h3 className="font-semibold text-blue-950">{s.title}</h3>
          {s.questions.map(q=>(
            <div key={q.id} className="space-y-1">
              <div className="text-sm font-medium">{q.text}{q.required && <span className="text-red-600"> *</span>}</div>
              {renderQ(q)}
            </div>
          ))}
        </div>
      ))}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Submitting…' : 'Submit (Demo)'}
        </button>
        {message && <span className="text-sm">{message}</span>}
      </div>
    </form>
  );
}
