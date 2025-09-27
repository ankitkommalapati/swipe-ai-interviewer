import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Candidate, Answer } from '../../types';

interface CandidatesState {
  candidates: Candidate[];
  selectedCandidateId: string | null;
}

const initialState: CandidatesState = {
  candidates: [],
  selectedCandidateId: null,
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action: PayloadAction<{ id: string; updates: Partial<Candidate> }>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = { ...state.candidates[index], ...action.payload.updates };
      }
    },
    addAnswer: (state, action: PayloadAction<{ candidateId: string; answer: Answer }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.candidateId);
      if (candidate) {
        candidate.answers.push(action.payload.answer);
        candidate.currentQuestionIndex += 1;
      }
    },
    completeInterview: (state, action: PayloadAction<{ candidateId: string; score: number; summary: string }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.candidateId);
      if (candidate) {
        candidate.interviewStatus = 'completed';
        candidate.finalScore = action.payload.score;
        candidate.finalSummary = action.payload.summary;
        candidate.endTime = new Date().toISOString();
      }
    },
    selectCandidate: (state, action: PayloadAction<string>) => {
      state.selectedCandidateId = action.payload;
    },
    resetCandidates: (state) => {
      state.candidates = [];
      state.selectedCandidateId = null;
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  addAnswer,
  completeInterview,
  selectCandidate,
  resetCandidates,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;
