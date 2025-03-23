export interface TestCase {
  input: string;
  output: string;
}

export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'week' | 'exam' | 'introduction';
  weekNumber: number;
  hints: string[];
  testCases: TestCase[];
}

export interface Problem extends PracticeProblem {
  correctAnswer: string;
  explanation?: string;
}

export interface WeekContent {
  weekNumber: number;
  title: string;
  description: string;
  topics: string[];
  problems: PracticeProblem[];
}

export interface KnowledgeBaseQuery {
  text: string;
  metadata: {
    contentType: string;
    contentNumber: string | number;
    difficulty: string;
    problemType: 'MCQ' | 'FRQ';
  };
} 