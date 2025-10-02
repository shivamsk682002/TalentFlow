import type { Candidate,Note,TimelineEntry } from "../db/type";

export async function fetchCandidates(params: { jobId ?:string,search?: string; stage?: string; page?: number; pageSize?: number }) {
  const qs = new URLSearchParams();
  console.log("server",params.jobId)
  if (params.search) qs.set('search', params.search);
  if (params.stage) qs.set('stage', params.stage);
  if(params.jobId)
    { qs.set('jobId',params.jobId);
        
    }
  qs.set('page', String(params.page ?? 1));
  qs.set('pageSize', String(params.pageSize ?? 50));
  const res = await fetch(`/api/candidates?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return await res.json() as { items: Candidate[]; total: number; page: number; pageSize:number; };
}

export async function fetchCandidate(id:string){
    const res = await fetch(`/api/candidates/${id}`);
    if(!res.ok)
    {
        throw new Error('Failed to fetch candidate');
    }
    return (await res.json()) as {candidate:Candidate};
}

export async function fetchTimeline(id: string) {
  const res = await fetch(`/api/candidates/${id}/timeline`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return (await res.json()) as TimelineEntry[];
}

export async function patchCandidate(id:string,patch:Partial<Candidate>)
{
    const res = await fetch(`/api/candidates/${id}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(patch)
    });
    if(!res.ok)
    {
        throw new Error('Failed to update candidate');
    }
    return (await res.json()) as {candidate:Candidate};
}

export async function addNote(id: string, text: string) {
  const res = await fetch(`/api/candidates/${id}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to add note");
  return (await res.json()) as { note: Note[] };
}