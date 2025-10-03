import { http, HttpResponse } from 'msw';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import type { Candidate, Job, TimelineEntry } from '../db/type';
const ERROR_RATE = 0.05;
const minLatency = 200;
const maxLatency = 900;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const randomDelay = () => delay(Math.floor(Math.random() * (maxLatency - minLatency)) + minLatency);

export const handlers = [
  http.get('/api/jobs', async ({ request }) => {
    await randomDelay();
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));
    const pageSize = Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '10', 10));
    const search = (url.searchParams.get('search') ?? '').trim();
    const status = (url.searchParams.get('status') ?? '').trim();
    const sort = (url.searchParams.get('sort') ?? '').trim();
    let jobs = await db.jobs.toArray();
    if (search) {
      const q = search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) || j.slug.toLowerCase().includes(q)
      );
    }
    if (status) {
      jobs = jobs.filter((j) => j.status === status);
    }
    if (sort) {
      const parts = sort.split(':');
      const field = parts[0];
      const dir = (parts[1] || 'asc').toLowerCase();

      jobs.sort((a, b) => {
        const va = (a as any)[field];
        const vb = (b as any)[field];

        if (va === undefined || vb === undefined) return 0;

        if (typeof va === 'string' && typeof vb === 'string') {
          return dir === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb);
        }

        if (typeof va === 'number' && typeof vb === 'number') {
          return dir === 'desc' ? vb - va : va - vb;
        }

        return 0;
      });
    } else {
      jobs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    const total = jobs.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = jobs.slice(start, end);

    return HttpResponse.json({ data: paged, total }, { status: 200 });
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await randomDelay();
    const id = String(params.id);
    const job = await db.jobs.get(id);
    if (!job) {
      return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
    }
    return HttpResponse.json({ data: job }, { status: 200 });
  }),

  http.post('/api/jobs', async ({ request }) => {
    await randomDelay();
    const body = (await request.json()) as Partial<Job>;
    const newJob: Job = {
      id: body.id ?? uuidv4(),
      title: body.title ?? 'Untitled',
      slug: body.slug ?? `job-${Date.now()}`,
      status: (body.status as Job['status']) ?? 'active',
      tags: body.tags ?? [],
      order: (await db.jobs.count()),
      description: body.description ?? '',
      createdAt: new Date().toISOString()
    };

    await db.jobs.add(newJob);
    return HttpResponse.json({ data: newJob }, { status: 201 });
  }),

http.patch('/api/jobs/reorder', async ({ request }) => {
    await randomDelay();

    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json(
        { message: 'Invalid JSON body' },
        { status: 400, statusText: 'Bad Request' }
      );
    }

    console.log("backend", body);
    const orderedIds: string[] = Array.isArray(body?.orderedIds) ? body.orderedIds : [];

    if (!orderedIds.length) {
      return HttpResponse.json(
        { message: 'Invalid orderedIds' },
        { status: 400, statusText: 'Bad Request' }
      );
    }

    if (Math.random() < ERROR_RATE) {
      return HttpResponse.json(
        { message: 'Simulated server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    }

    try {
      await db.transaction('rw', db.jobs, async () => {
        for (let i = 0; i < orderedIds.length; i++) {
          const id = String(orderedIds[i]); 
          await db.jobs.update(id, { order: i });
        }
      });

      return HttpResponse.json(
        { message: 'Reordered successfully' },
        { status: 200, statusText: 'OK' }
      );
    } catch (error) {
      console.error('Reorder error', error);
      return HttpResponse.json(
        { message: 'Failed to reorder' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    }
  }),
  
  
   http.patch('/api/jobs/:id', async ({ params, request }) => {
    await randomDelay();
    if (Math.random() < ERROR_RATE) {
      return HttpResponse.json(
        { message: 'Simulated server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    }

    const id = String(params.id);

    let body: any;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json(
        { message: 'Invalid JSON body' },
        { status: 400, statusText: 'Bad Request' }
      );
    }

    const job = await db.jobs.get(id);
    if (!job) {
      return HttpResponse.json(
        { message: 'Job not found' },
        { status: 404, statusText: 'Not Found' }
      );
    }

    const { id: _discardedId, ...updateFields } = body ?? {};

    await db.jobs.update(id, updateFields);
    const updatedJob = { ...job, ...updateFields };

    return HttpResponse.json(
      { job: updatedJob },
      { status: 200, statusText: 'OK' }
    );
  }),
 
  http.get('/api/candidates',async({request})=>{
    await randomDelay();
    const url = new URL(request.url);
    const search = url.searchParams.get('search') ?? '';
    const stage = url.searchParams.get('stage') ?? '';
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '50');
    const offset = (page - 1) * pageSize;
    const jobId=url.searchParams.get('jobId')??'';
    let coll= db.candidates.toCollection();
    console.log("server",jobId)

    if(stage)
    {
      coll=coll.filter((c)=>(c.stage===stage));
    }
    if(jobId)
    {
      coll= coll.filter((c)=>(c.jobId===jobId))
    }
    if(search)
    {
      const s =search.toLowerCase();
      coll = coll.filter((c)=>(c.name.toLowerCase().includes(s)||c.email.toLowerCase().includes(s)));

    }
    const total = await coll.count();
    const items= await coll.offset(offset).limit(pageSize).toArray();
    return HttpResponse.json({data:items,total,page,pageSize},{status:200});

  }),

  http.get('/api/candidates/:id',async({params})=>{
    await randomDelay();
    const{id}=params;
    const candidate = await db.candidates.get(String(id));
    if(!candidate)
    {
      HttpResponse.json({message:'Candidate not fount'},{status:404});
    }
    return HttpResponse.json({candidate},{status:200});
  }),

  http.get('/api/candidates/:id/timeline',async({params})=>{
    await randomDelay();
    const {id}=params;
    const timeline = await db.timelines
      .where('candidateId')
      .equals(id as string)
      .sortBy('date');
      if(!timeline)
    {
      HttpResponse.json({message:'Candidate not fount'},{status:404});
    }
    return HttpResponse.json(timeline);

  }),

   http.patch('/api/candidates/:id', async ({ params, request }) => {
    await randomDelay();
    if(Math.random()<ERROR_RATE)
    {
      return HttpResponse.json({message:'Simulated server error'},{status:500,statusText:'Internal Server Error'})
    }
    const  id  = params.id as string;
    const payload = await request.json() as Partial<Candidate>;
    const cand = await db.candidates.get(id);
    if(!cand)
    {
      return HttpResponse.json({message :'Candidate not found'},{status:404});
    } 
    const updated ={...cand,...payload,updatedAt:new Date().toISOString()};
    await db.candidates.put(updated);

    if(payload.stage && payload.stage!==cand.stage)
    {
      const entry:TimelineEntry={
        id:uuidv4(),
        candidateId:id,
        date:new Date().toISOString(),
        title:`Stage changed to ${payload.stage}`
      }
      await db.timelines.add(entry);
    }
    return HttpResponse.json({updated},{status:200});
  }),
  http.post('/api/candidates/:id/notes', async ({ params, request }) => {
    await randomDelay();
    if (Math.random() < ERROR_RATE) {
      return HttpResponse.json({ message: 'Simulated server error' }, { status: 500 });
    }

    const id = params.id as string;
    const cand = await db.candidates.get(id);
    if (!cand) return HttpResponse.json({ message: 'Not found' }, { status: 404 });

    const body = await request.json() as { text: string };
    const newNote: any = {
      id: uuidv4(),
      text: body.text,
      createdAt: new Date().toISOString(),
    };

    const updated: Candidate = { ...cand, notes: [...(cand.notes || []), newNote], updatedAt: new Date().toISOString() };
    await db.candidates.put(updated);

    return HttpResponse.json(newNote, { status: 201 });
  }),

  http.get('/api/assessments/:jobId',async({params})=>{
    await randomDelay();
    const {jobId}=params;
    const assesment = await db.assessments.get(jobId as string);
    const sections = (assesment?.sections as any[]) || [];
    
    return HttpResponse.json({ jobId, sections },{status:200});
  }),
  // http.get('/api/assessments',async()=>{
  //   await randomDelay();
  //   const assesment = await db.assessments.toArray();
  //   return HttpResponse.json({data: assesment },{status:200});
  // }),
  http.put('/api/assessments/:jobId', async ({ params, request }) => {
  await randomDelay();
  if (Math.random() < ERROR_RATE) {
    return HttpResponse.json({ message: 'Simulated error' }, { status: 500 });
  }
  const jobId = params.jobId as string;
  const body = await request.json() as { sections: any[] };
  await db.assessments.put({ jobId, sections: body.sections });
  return HttpResponse.json({ jobId, sections: body.sections });
}),

http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
  await randomDelay();
  if (Math.random() < ERROR_RATE) {
    return HttpResponse.json({ message: 'Simulated error' }, { status: 500 });
  }
  const jobId = params.jobId as string;
  const body = await request.json() as { candidateId: string; answers: Record<string, any> };
  const resp = {
    id: uuidv4(),
    jobId,
    candidateId: body.candidateId,
    answers: body.answers,
    submittedAt: new Date().toISOString(),
  };
  await db.responses.add(resp);
  return HttpResponse.json(resp, { status: 201 });
})


];
