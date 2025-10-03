
import type { AssessmentSchema,AssessmentResponse,Section } from "../db/type";

export async function fetchAssessment(jobId: string): Promise<AssessmentSchema> {
  const r = await fetch(`/api/assessments/${jobId}`);
  if (!r.ok) throw new Error('Failed to fetch assessment');
  return await r.json();
}

// export async function fetchAllAssessment(): Promise<AssessmentSchema> {
//   const r = await fetch(`/api/assessments`);
//   if (!r.ok) throw new Error('Failed to fetch assessment');
//   return await r.json();
// }

export async function saveAssessment(jobId: string, sections: Section[]): Promise<AssessmentSchema> {
  const r = await fetch(`/api/assessments/${jobId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sections }),
  });
  if (!r.ok) throw new Error('Failed to save assessment');
  return await r.json();
}

export async function submitAssessment(jobId: string, payload: { candidateId: string; answers: Record<string, any> }): Promise<AssessmentResponse> {
  const r = await fetch(`/api/assessments/${jobId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error('Failed to submit assessment');
  return await r.json();
}
