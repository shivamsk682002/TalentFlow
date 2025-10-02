// src/hooks/useAssessmentViewModel.ts
import { useState } from 'react';
import type { AssessmentSchema,Section } from '../db/type';
import { fetchAssessment,saveAssessment,submitAssessment } from '../api/assesment';

export const useAssessmentViewModel = () => {
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);

  const get = async (jobId: string, setSchema: (s: AssessmentSchema)=>void) => {
    setLoading(true); setError(null);
    try {
      const schema = await fetchAssessment(jobId);
      setSchema(schema);
      return schema;
    } catch (e:any) {
      setError(e?.message ?? 'Failed to fetch assessment'); throw e;
    } finally { setLoading(false); }
  };
  // const getAll = async ( setAllAssesment: (s: any)=>void) => {
  //   setLoading(true); setError(null);
  //   try {
  //     const assesments = await fetchAllAssessment();
  //     console.log(assesments)
  //     setAllAssesment(assesments);
  //     return assesments;
  //   } catch (e:any) {
  //     setError(e?.message ?? 'Failed to fetch assessment'); throw e;
  //   } finally { setLoading(false); }
  // };

  const save = async (jobId: string, sections: Section[], onSuccess?: (s: AssessmentSchema)=>void) => {
    setLoading(true); setError(null);
    try {
      const updated = await saveAssessment(jobId, sections);
      onSuccess?.(updated);
      return updated;
    } catch (e:any) {
      setError(e?.message ?? 'Failed to save assessment'); throw e;
    } finally { setLoading(false); }
  };

  const submit = async (jobId: string, candidateId: string, answers: Record<string, any>, onSuccess?: ()=>void) => {
    setLoading(true); setError(null);
    try {
      await submitAssessment(jobId, { candidateId, answers });
      onSuccess?.();
    } catch (e:any) {
      setError(e?.message ?? 'Failed to submit assessment'); throw e;
    } finally { setLoading(false); }
  };

  return { loading, error, get, save, submit };
};
