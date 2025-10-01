import Dexie from 'dexie';
import type {Table} from 'dexie';
import type { Candidate,Job,Assessment,TimelineEntry,AssessmentResponse } from './type';

export class TalentflowDB extends Dexie {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  assessments!: Table<Assessment, string>;
  responses!: Table<AssessmentResponse, string>;
  timelines!: Table<TimelineEntry, string>; 

  constructor() {
    super('talentflowDB');
    this.version(1).stores({
      jobs: 'id,slug,order,status,description',
      candidates: 'id, name, email, jobId, stage',
      timelines: '++id, candidateId, date',
      assessments: 'jobId',
      responses: 'id,jobId,candidateId,submittedAt',
    });
     
  }
}


export const db = new TalentflowDB();
