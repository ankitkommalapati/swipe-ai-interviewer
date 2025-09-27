export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resume?: File;
  interviewStatus: 'not_started' | 'in_progress' | 'completed';
  currentQuestionIndex: number;
  answers: Answer[];
  finalScore?: number;
  finalSummary?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface Answer {
  questionId: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answer: string;
  score: number;
  timeSpent: number; // in seconds
  timestamp: Date;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
  category: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isSystemMessage?: boolean;
}

export interface InterviewSession {
  candidateId: string;
  isActive: boolean;
  currentQuestion?: Question;
  messages: ChatMessage[];
  startTime?: Date;
  pausedTime?: Date;
}
