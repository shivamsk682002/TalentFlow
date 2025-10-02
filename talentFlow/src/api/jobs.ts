import type { Job } from "../db/type";

type FetchJobsParams = { 
  page?: number; 
  pageSize?: number; 
  search?: string; 
  status?: string;
  sort?: string; 
};

export async function fetchJobs(params: FetchJobsParams = {}) {
  try {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.search) q.set('search', params.search);
    if (params.status) q.set('status', params.status);
    if (params.sort) q.set('sort', params.sort);

    const res = await fetch(`/api/jobs?${q.toString()}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch jobs: ${res.status}`);
    }

    const data: { data: Job[]; total: number } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
}

export async function getJobById(id: string) {
  try {
    const res = await fetch(`/api/jobs/${id}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch job: ${res.status}`);
    }

    const job = await res.json();
    return job.data;
  } catch (error) {
    console.error("Error fetching job by id:", error);
    throw error;
  }
}

export async function createJob(job: Partial<Job>) {
  try {
    const res = await fetch(`/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });

    if (!res.ok) {
      throw new Error(`Failed to create job: ${res.status}`);
    }

    const newJob: Job = await res.json();
    return newJob;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
}

export async function updateJob(id: string, job: Partial<Job>) {
  try {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });

    if (!res.ok) {
      throw new Error(`Failed to update job: ${res.status}`);
    }

    const data = await res.json();
    return data.job as Job;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
}
export async function reorderJobs(orderedIds:string[]){
    try{
        
        const res = await fetch('/api/jobs/reorder',{
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({orderedIds}),
        })
        if(!res.ok)
        {
            throw new Error(`Failed to reorder jobs:${res.status}`);
        }
        console.log(res)
    }
    catch(error)
    {
        console.error("Error updating job:", error);
        throw error;
    }
}


