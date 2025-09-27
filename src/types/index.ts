export interface ResumeInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string; // Changed from Date to string for serialization
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resume?: ResumeInfo;
  interviewStatus: 'not_started' | 'in_progress' | 'completed';
  currentQuestionIndex: number;
  answers: Answer[];
  finalScore?: number;
  finalSummary?: string;
  startTime?: string; // Changed from Date to string for serialization
  endTime?: string; // Changed from Date to string for serialization
}

export interface Answer {
  questionId: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answer: string;
  score: number;
  timeSpent: number; // in seconds
  timestamp: string; // Changed from Date to string for serialization
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
  timestamp: string; // Changed from Date to string for serialization
  isSystemMessage?: boolean;
}

export interface InterviewSession {
  candidateId: string;
  isActive: boolean;
  currentQuestion?: Question;
  messages: ChatMessage[];
  startTime?: string; // Changed from Date to string for serialization
  pausedTime?: string; // Changed from Date to string for serialization
}
