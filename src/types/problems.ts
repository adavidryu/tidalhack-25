export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  weekNumber: number;
  hints: string[];
  sampleSolution?: string;
  testCases?: {
    input: string;
    output: string;
  }[];
}

export interface WeekContent {
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
  problems: PracticeProblem[];
}

export interface KnowledgeBaseQuery {
  weekNumber: number;
  topics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
} 