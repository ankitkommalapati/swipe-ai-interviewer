import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InterviewSession, Question } from '../../types';

interface InterviewState {
  currentSession: InterviewSession | null;
  isInterviewActive: boolean;
  questions: Question[];
  currentQuestionIndex: number;
  timeRemaining: number;
  isPaused: boolean;
}

const initialState: InterviewState = {
  currentSession: null,
  isInterviewActive: false,
  questions: [],
  currentQuestionIndex: 0,
  timeRemaining: 0,
  isPaused: false,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<string>) => {
      state.currentSession = {
        candidateId: action.payload,
        isActive: true,
        messages: [],
        startTime: new Date(),
      };
      state.isInterviewActive = true;
      state.currentQuestionIndex = 0;
      state.isPaused = false;
    },
    pauseInterview: (state) => {
      state.isPaused = true;
      if (state.currentSession) {
        state.currentSession.pausedTime = new Date();
      }
    },
    resumeInterview: (state) => {
      state.isPaused = false;
      if (state.currentSession) {
        state.currentSession.pausedTime = undefined;
      }
    },
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
      if (state.questions[action.payload]) {
        state.currentSession!.currentQuestion = state.questions[action.payload];
        state.timeRemaining = state.questions[action.payload].timeLimit;
      }
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
      if (state.questions[state.currentQuestionIndex]) {
        state.currentSession!.currentQuestion = state.questions[state.currentQuestionIndex];
        state.timeRemaining = state.questions[state.currentQuestionIndex].timeLimit;
      }
    },
    endInterview: (state) => {
      state.isInterviewActive = false;
      state.currentSession = null;
      state.currentQuestionIndex = 0;
      state.timeRemaining = 0;
      state.isPaused = false;
    },
    addInterviewMessage: (state, action: PayloadAction<{ type: 'user' | 'assistant'; content: string; isSystemMessage?: boolean }>) => {
      if (state.currentSession) {
        const message = {
          id: Date.now().toString(),
          type: action.payload.type,
          content: action.payload.content,
          timestamp: new Date(),
          isSystemMessage: action.payload.isSystemMessage,
        };
        state.currentSession.messages.push(message);
      }
    },
  },
});

export const {
  startInterview,
  pauseInterview,
  resumeInterview,
  setQuestions,
  setCurrentQuestion,
  updateTimeRemaining,
  nextQuestion,
  endInterview,
  addInterviewMessage,
} = interviewSlice.actions;

export default interviewSlice.reducer;
