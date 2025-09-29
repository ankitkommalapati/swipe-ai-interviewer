import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Steps, Button, message } from 'antd';
import { RootState } from '../store';
import { addCandidate, updateCandidate, resetCandidates } from '../store/slices/candidatesSlice';
import { startInterview, setQuestions, resetInterview } from '../store/slices/interviewSlice';
import { Candidate } from '../types';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import { AIService } from '../services/aiService';

const { Step } = Steps;

const IntervieweeTab: React.FC = () => {
  const dispatch = useDispatch();
  const { candidates } = useSelector((state: RootState) => state.candidates);
  const { currentSession } = useSelector((state: RootState) => state.interview);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const currentCandidate = candidates.find((c: Candidate) => c.id === currentSession?.candidateId);

  useEffect(() => {
    // Always start at step 0 if no active session
    if (!currentSession || !currentSession.isActive) {
      setCurrentStep(0);
      return;
    }

    if (currentCandidate) {
      if (currentCandidate.interviewStatus === 'completed') {
        setCurrentStep(2);
      } else if (currentCandidate.interviewStatus === 'in_progress') {
        setCurrentStep(1);
      } else {
        setCurrentStep(0);
      }
    } else {
      // No current candidate - start fresh
      setCurrentStep(0);
    }
  }, [currentCandidate, currentSession]);

  const handleStartNewInterview = () => {
    // Reset all state
    dispatch(resetCandidates());
    dispatch(resetInterview());
    setCurrentStep(0);
    message.success('Starting fresh interview session!');
  };

  const handleCandidateCreated = async (candidate: Candidate) => {
    dispatch(addCandidate(candidate));
    
    // Generate questions and start interview
    setGeneratingQuestions(true);
    try {
      const questions = await AIService.generateQuestions();
      
      if (!questions || questions.length === 0) {
        throw new Error('No questions generated');
      }
      
      dispatch(setQuestions(questions));
      dispatch(startInterview(candidate.id));
      
      // Update candidate status
      dispatch(updateCandidate({
        id: candidate.id,
        updates: {
          interviewStatus: 'in_progress',
          startTime: new Date().toISOString(),
        }
      }));
      
      message.success('Interview started! Good luck!');
    } catch (error) {
      console.error('Error starting interview:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please check your OpenAI API key and try again.';
      message.error(`Failed to start interview: ${errorMessage}`);
      
      // Reset to step 0 if interview fails to start
      setCurrentStep(0);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const getCurrentStep = () => {
    if (!currentCandidate) return 0;
    
    switch (currentCandidate.interviewStatus) {
      case 'completed':
        return 2;
      case 'in_progress':
        return 1;
      default:
        return 0;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ResumeUpload onCandidateCreated={handleCandidateCreated} />
        );
      case 1:
        return (
          <ChatInterface />
        );
      case 2:
        return (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <h2>Interview Completed!</h2>
              {currentCandidate && (
                <div>
                  <p>Your final score: <strong>{currentCandidate.finalScore}/10</strong></p>
                  <div style={{ marginTop: 20, padding: 20, background: '#f5f5f5', borderRadius: 6 }}>
                    <h4>AI Summary:</h4>
                    <p>{currentCandidate.finalSummary}</p>
                  </div>
                </div>
              )}
              <Button 
                type="primary" 
                size="large" 
                onClick={handleStartNewInterview}
                style={{ marginTop: 20 }}
              >
                Start New Interview
              </Button>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }}>
        <Steps current={getCurrentStep()}>
          <Step title="Upload Resume" description="Upload your resume and complete profile" />
          <Step title="Interview" description="Answer AI-generated questions" />
          <Step title="Complete" description="Review your results" />
        </Steps>
      </Card>

      {generatingQuestions && (
        <Card style={{ marginBottom: 24, textAlign: 'center' }}>
          <p>Generating interview questions...</p>
        </Card>
      )}

      {renderStepContent()}
    </div>
  );
};

export default IntervieweeTab;
