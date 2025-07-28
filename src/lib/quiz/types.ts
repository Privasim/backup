export interface QuizData {
  jobDescription: string;
  experience: string;
  industry: string;
  location: string;
  salaryRange: string;
  skillSet: string[];
}

export interface JobContext {
  jobDescription: string;
  experiences: string[];
  industries: string[];
  locations: string[];
  salaryRanges: string[];
  skillSets: string[];
}

export interface QuizContextData {
  [key: string]: JobContext;
}