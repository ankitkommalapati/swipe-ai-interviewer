import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Steps, Button, message } from 'antd';
import { RootState } from '../store';
import { addCandidate } from '../store/slices/candidatesSlice';
import { startInterview, setQuestions } from '../store/slices/interviewSlice';
import { Candidate } from '../types';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import { AIService } from '../services/aiService';

const { Step } = Steps;

const IntervieweeTab: React.FC = () => {
  const dispatch = useDispatch();
  const { candidates } = useSelector((state: RootState) => state.candidates);
  const { isInterviewActive, currentSession } = useSelector((state: RootState) => state.interview);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const currentCandidate = candidates.find(c => c.id === currentSession?.candidateId);

  useEffect(() => {
    if (currentCandidate) {
      if (currentCandidate.interviewStatus === 'completed') {
        setCurrentStep(2);
      } else if (currentCandidate.interviewStatus === 'in_progress') {
        setCurrentStep(1);
      } else {
        setCurrentStep(0);
      }
    }
  }, [currentCandidate]);

  const handleCandidateCreated = async (candidate: Candidate) => {
    dispatch(addCandidate(candidate));
    
    // Generate questions and start interview
    setGeneratingQuestions(true);
    try {
      const questions = await AIService.generateQuestions();
      dispatch(setQuestions(questions));
      dispatch(startInterview(candidate.id));
      
      // Update candidate status
      dispatch(addCandidate({
        ...candidate,
        interviewStatus: 'in_progress',
        startTime: new Date(),
      }));
      
      setCurrentStep(1);
      message.success('Interview started! Good luck!');
    } catch (error) {
      message.error('Failed to start interview. Please try again.');
      console.error(error);
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
                onClick={() => {
                  setCurrentStep(0);
                  window.location.reload();
                }}
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
