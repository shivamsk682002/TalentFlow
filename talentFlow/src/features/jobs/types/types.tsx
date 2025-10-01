export type JobStatus ='active'|'archived';

export type job ={
    id: string;
  title: string;
  slug: string;
  status: JobStatus;
  tags: string[];
  order?: number;
  description?: string;
}