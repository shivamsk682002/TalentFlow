// src/db/seed.ts
import { db } from './db';
import type {
  Candidate,
  Job,
  TimelineEntry,
  Assessment,
  Section,
  Question,
} from './type';

const sampleJobTitles = [
  'Frontend Engineer',
  'Backend Engineer',
  'Fullstack Developer',
  'Product Designer',
  'QA Engineer',
  'Engineering Manager',
  'Data Analyst',
  'DevOps Engineer',
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function q(opts: {
  id: string;
  type: 'single' | 'multi' | 'short' | 'long' | 'numeric' | 'file';
  text: string;
  required?: boolean;
  options?: string[];
  validation?: { min?: number; max?: number; maxLength?: number };
  conditional?: { questionId: string; equals: any } | null;
}): Question {
  return {
    id: opts.id,
    type: opts.type,
    text: opts.text,
    required: opts.required,
    options: opts.options,
    validation: opts.validation,
    conditional: opts.conditional ?? null,
  } as Question;
}

export async function seedIfEmpty() {
  const jobsCount = await db.jobs.count();
  if (jobsCount > 0) return;

  const jobs: Job[] = Array.from({ length: 25 }).map((_, i) => {
    const title = `${sampleJobTitles[i % sampleJobTitles.length]} ${i + 1}`;
    const id = `job-${i + 1}`; 
    return {
      id,
      title,
      slug: `${slugify(title)}-${i + 1}`,
      status: Math.random() > 0.5 ? 'active' : 'archived',
      tags: ['remote', 'full-time'].slice(0, (i % 2) + 1),
      order: i,
      description: `This is a sample description for ${title}. Include role expectations and responsibilities here.`,
      createdAt: new Date().toISOString(),
    };
  });

  await db.jobs.bulkAdd(jobs);

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

  const timelines: TimelineEntry[] = candidates.map((cand, i) => ({
    id: `timeline-${i + 1}`,
    candidateId: cand.id,
    date: cand.createdAt,
    title: 'Applied',
    note: 'Seeded candidate',
  }));

  await db.timelines.bulkAdd(timelines);

  function makeAssessmentForJob(jobId: string, idx: number): Assessment {
    const general: Section = {
      id: `s-${jobId}-general`,
      title: 'General & Background',
      questions: [
        q({ id: `${jobId}-g-1`, type: 'short', text: 'Briefly introduce yourself and highlight relevant experience.', required: true, validation: { maxLength: 400 } }),
        q({ id: `${jobId}-g-2`, type: 'single', text: 'Are you available to start within 2 weeks?', options: ['Yes', 'No'], required: true }),
        q({ id: `${jobId}-g-3`, type: 'numeric', text: 'How many years of experience do you have in this domain?', required: true, validation: { min: 0, max: 50 } }),
        q({ id: `${jobId}-g-4`, type: 'multi', text: 'Which of the following technologies are you comfortable with?', options: idx === 0 ? ['React', 'TypeScript', 'Redux', 'Next.js', 'CSS'] : idx === 1 ? ['Node.js', 'Express', 'Postgres', 'Redis', 'Docker'] : ['React', 'Node.js', 'TypeScript', 'SQL', 'Docker'] }),
      ],
    };

    const technical: Section = {
      id: `s-${jobId}-technical`,
      title: 'Technical Questions',
      questions: [
        q({ id: `${jobId}-t-1`, type: 'short', text: 'Describe an algorithm you implemented to optimize performance in a past project. Mention complexity.', required: true, validation: { maxLength: 500 } }),
        q({ id: `${jobId}-t-2`, type: 'long', text: 'Given a large dataset, how would you design an efficient approach to find duplicates? Explain steps, trade-offs and complexity.', required: true }),
        q({ id: `${jobId}-t-3`, type: 'long', text: 'Design a simple, scalable service for processing user uploads and generating thumbnails. Describe components, storage, and failure handling.', required: true }),
        q({ id: `${jobId}-t-4`, type: 'short', text: 'How do you approach debugging a production issue with intermittent failures?', required: true, validation: { maxLength: 300 } }),
        q({ id: `${jobId}-t-5`, type: 'numeric', text: 'Estimate the monthly storage needed for 100k images of average 300KB. (Provide a number in GB)', required: true }),
        q({ id: `${jobId}-t-6`, type: 'single', text: 'Which database would you choose for storing session data requiring low-latency reads?', options: ['Postgres', 'Redis', 'MongoDB', 'MySQL'], required: true }),
        q({ id: `${jobId}-t-7`, type: 'short', text: 'Explain why you chose that database.', required: false, conditional: { questionId: `${jobId}-t-6`, equals: 'Redis' } }),
        q({ id: `${jobId}-t-8`, type: 'file', text: 'Upload a short code sample or link to a repository (zip/pdf accepted).', required: false }),
        q({ id: `${jobId}-t-9`, type: 'short', text: 'How would you design a rate limiter for an API endpoint?', required: true }),
        q({ id: `${jobId}-t-10`, type: 'short', text: 'How would you secure file uploads to prevent malicious content?', required: true }),
      ],
    };

    const roleSpecific: Section = {
      id: `s-${jobId}-role`,
      title: 'Role Specific Practical',
      questions: [
        q({ id: `${jobId}-r-1`, type: 'short', text: 'What testing strategy do you follow for critical modules?', required: true }),
        q({ id: `${jobId}-r-2`, type: 'short', text: 'How do you ensure backward compatibility when releasing API changes?', required: true }),
        q({ id: `${jobId}-r-3`, type: 'long', text: 'Describe a performance optimization you implemented end-to-end (identify bottleneck, measure, fix, validate).', required: true }),
        q({ id: `${jobId}-r-4`, type: 'multi', text: 'Choose the deployment strategies you have used:', options: ['Blue/Green', 'Canary', 'Rolling', 'Recreate'], required: false }),
      ],
    };
    if (idx === 2) {
      technical.questions.push(q({ id: `${jobId}-t-11`, type: 'short', text: 'Write a SQL approach to find duplicate rows based on (email, name) ignoring case.', required: true }));
      roleSpecific.questions.push(q({ id: `${jobId}-r-5`, type: 'short', text: 'What metrics would you monitor for this service in production?', required: true }));
    }

    return { jobId, sections: [general, technical, roleSpecific] };
  }

  const targetIds = ['job-1', 'job-2', 'job-3'];
  for (let i = 0; i < targetIds.length; i++) {
    const jobId = targetIds[i];
    const assessment = makeAssessmentForJob(jobId, i);
    await db.assessments.put(assessment as any);
  }

  console.log(
    'Seeded DB: jobs=',
    jobs.length,
    'candidates=',
    candidates.length,
    'timelines=',
    timelines.length,
    'assessments seeded for',
    targetIds.join(', ')
  );
}
