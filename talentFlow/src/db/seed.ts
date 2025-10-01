// src/db/seed.ts
import { db } from './db';
import type { Candidate, Job, TimelineEntry, Assessment } from './type';

const sampleJobTitles = [
  'Frontend Engineer',
  'Backend Engineer',
  'Fullstack Developer',
  'Product Designer',
  'QA Engineer',
  'Engineering Manager',
  'Data Analyst',
  'DevOps Engineer'
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function seedIfEmpty() {
  const jobsCount = await db.jobs.count();
  if (jobsCount > 0) return;

  // ---------- Jobs ----------
  const jobs: Job[] = Array.from({ length: 25 }).map((_, i) => {
    const title = `${sampleJobTitles[i % sampleJobTitles.length]} ${i + 1}`;
    return {
      id: `job-${i + 1}`,
      title,
      slug: `${slugify(title)}-${i + 1}`,
      status: 'active',
      tags: ['remote', 'full-time'].slice(0, (i % 2) + 1),
      order: i,
      description: `This is a sample description for ${title}. Include role expectations and responsibilities here.`,
      createdAt: new Date().toISOString(),
    };
  });

  await db.jobs.bulkAdd(jobs);

  // ---------- Candidates ----------
  const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  const now = Date.now();

  const candidates: Candidate[] = Array.from({ length: 1000 }).map((_, i) => {
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const createdAt = new Date(now - i * 60_000).toISOString(); 
    return {
      id: `cand-${i + 1}`,
      name: `candidate${i + 1}`,
      email: `candidate${i + 1}@example.com`,
      jobId: job.id,
      stage: stages[Math.floor(Math.random() * stages.length)],
      createdAt,
      updatedAt: createdAt,
      notes: [],
    };
  });

  await db.candidates.bulkAdd(candidates);

  // ---------- Timelines ----------
  const timelines: TimelineEntry[] = candidates.map((cand, i) => ({
    id: `timeline-${i + 1}`,
    candidateId: cand.id,
    date: cand.createdAt,
    title: 'Applied',
    note: 'Seeded candidate',
  }));

  await db.timelines.bulkAdd(timelines);

  // ---------- Assessments ----------
  const assessment: Assessment = {
    jobId: jobs[0].id,
    sections: [],
  };
  await db.assessments.put(assessment);

  console.log('Seeded DB: jobs=', jobs.length, 'candidates=', candidates.length, 'timelines=', timelines.length);
}
