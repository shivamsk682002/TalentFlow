export type Job ={
    id:string,
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description? :string;
  createdAt?:string;
}

export type Stage = 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';

export interface TimelineEntry {
  id: string;
  candidateId: string;
  date: string;   
  title: string;
  note?: string;
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  jobId?: string | null;
  stage: Stage;
  createdAt: string;
  updatedAt?: string;
  notes?: Note[];
}


export type Assessment = {
  jobId: string;
  sections?: any[];
};

export type QType = 'single' | 'multi' | 'short' | 'long' | 'numeric' | 'file';

export type ConditionalRule = {
  questionId: string; 
  equals: any;       
};

export type Question = {
  id: string;
  type: QType;
  text: string;
  required?: boolean;
  options?: string[]; 
  validation?: {
    min?: number;
    max?: number;
    maxLength?: number;
  };
  conditional?: ConditionalRule | null;
};

export type Section = {
  id: string;
  title: string;
  questions: Question[];
};

export type AssessmentSchema = {
  jobId: string;
  sections: Section[];
};

export type AssessmentResponse = {
  id: string;
  jobId: string;
  candidateId: string;
  submittedAt: string;
  answers: Record<string, any>; 
};
