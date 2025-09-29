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
        startTime: new Date().toISOString(),
      };
      state.isInterviewActive = true;
      state.currentQuestionIndex = 0;
      state.isPaused = false;
      
      // Set the first question if available
      if (state.questions.length > 0 && state.currentSession) {
        state.currentSession.currentQuestion = state.questions[0];
        state.timeRemaining = state.questions[0].timeLimit;
      }
    },
    pauseInterview: (state) => {
      state.isPaused = true;
      if (state.currentSession) {
        state.currentSession.pausedTime = new Date().toISOString();
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
          timestamp: new Date().toISOString(),
          isSystemMessage: action.payload.isSystemMessage,
        };
        state.currentSession.messages.push(message);
      }
    },
    resetInterview: (state) => {
      state.currentSession = null;
      state.isInterviewActive = false;
      state.questions = [];
      state.currentQuestionIndex = 0;
      state.timeRemaining = 0;
      state.isPaused = false;
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
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
