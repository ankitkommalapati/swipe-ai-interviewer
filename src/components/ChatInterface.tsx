import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Typography, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addInterviewMessage, updateTimeRemaining, nextQuestion } from '../store/slices/interviewSlice';
import { addAnswer, completeInterview } from '../store/slices/candidatesSlice';
import { AIService } from '../services/aiService';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ChatInterface: React.FC = () => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { questions, currentQuestionIndex, timeRemaining, isInterviewActive, currentSession } = useSelector((state: RootState) => state.interview);
  const { candidates } = useSelector((state: RootState) => state.candidates);
  const currentCandidate = candidates.find((c: any) => c.id === currentSession?.candidateId);


  const startTimer = useCallback(() => {
    if (timeRemaining > 0 && isInterviewActive && !isGenerating) {
      const timer = setTimeout(() => {
        dispatch(updateTimeRemaining(timeRemaining - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isInterviewActive, isGenerating, dispatch]);

  useEffect(() => {
    const cleanup = startTimer();
    return cleanup;
  }, [startTimer]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const answerText = inputValue.trim();
    setInputValue('');

    try {
      // Add user message
      dispatch(addInterviewMessage({ type: 'user', content: answerText }));

      // Get current question for evaluation
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) {
        throw new Error('No current question found');
      }

      // Calculate time spent
      const timeSpent = currentQuestion.timeLimit - timeRemaining;

      // Evaluate answer with AI
      setIsGenerating(true);
      const score = await AIService.evaluateAnswer(currentQuestion, answerText);

      // Store answer
      dispatch(addAnswer({
        candidateId: currentSession!.candidateId,
        answer: {
          questionId: currentQuestion.id,
          question: currentQuestion.text,
          difficulty: currentQuestion.difficulty,
          answer: answerText,
          score,
          timeSpent,
          timestamp: new Date().toISOString(),
        }
      }));

      // Add AI feedback message
      const feedbackMessage = `Your answer scored ${score}/10. ${getScoreFeedback(score)}`;
      dispatch(addInterviewMessage({ type: 'assistant', content: feedbackMessage }));

      // Move to next question or complete interview
      if (currentQuestionIndex < questions.length - 1) {
        dispatch(nextQuestion());
        message.success('Answer submitted! Moving to next question.');
      } else {
        await completeInterviewSession();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      message.error('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsGenerating(false);
    }
  };

  const completeInterviewSession = async () => {
    try {
      setIsGenerating(true);
      
      // Generate final summary
      const answers = currentCandidate?.answers.map((a: any) => ({
        question: a.question,
        answer: a.answer,
        score: a.score
      })) || [];

      const summary = await AIService.generateFinalSummary(answers);
      const finalScore = Math.round(answers.reduce((sum: any, a: any) => sum + a.score, 0) / answers.length);

      dispatch(completeInterview({
        candidateId: currentSession!.candidateId,
        score: finalScore,
        summary
      }));

      message.success('Interview completed! Great job!');
    } catch (error) {
      console.error('Error completing interview:', error);
      message.error('Failed to complete interview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreFeedback = (score: number): string => {
    if (score >= 8) return 'Excellent answer!';
    if (score >= 6) return 'Good answer with room for improvement.';
    if (score >= 4) return 'Fair answer, consider providing more detail.';
    return 'Try to be more specific and detailed in your response.';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isInterviewActive || !currentSession) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Title level={3} style={{ color: '#666' }}>
            No active interview session
          </Title>
          <Text style={{ fontSize: 16, color: '#999' }}>
            Please start an interview first.
          </Text>
        </div>
      </Card>
    );
  }

  // Show question directly from Redux state
  if (questions.length > 0) {
    const question = questions[currentQuestionIndex];
    
    if (question) {
      return (
        <div>
          <Card style={{ marginBottom: 16, border: '2px solid #1890ff' }}>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Title level={2} style={{ color: '#1890ff', marginBottom: 16 }}>
                🎯 Interview Question {currentQuestionIndex + 1} of {questions.length}
              </Title>
              
              <div style={{ 
                padding: 30, 
                background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)', 
                borderRadius: 12, 
                border: '3px solid #1890ff',
                marginBottom: 20,
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)'
              }}>
                <div style={{ marginBottom: 16 }}>
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: 'bold', 
                    background: '#1890ff',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 20,
                    display: 'inline-block'
                  }}>
                    {question.difficulty.toUpperCase()} • {question.timeLimit}s
                  </Text>
                </div>
                
                <Text style={{ 
                  fontSize: 20, 
                  lineHeight: 1.6,
                  color: '#333',
                  fontWeight: '500'
                }}>
                  {question.text}
                </Text>
                
                <div style={{ marginTop: 20, fontSize: 16, color: '#666' }}>
                  ⏰ Time Remaining: <strong style={{ color: '#1890ff' }}>{formatTime(timeRemaining)}</strong>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ padding: 20 }}>
              <Title level={4} style={{ marginBottom: 16 }}>Your Answer:</Title>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer here..."
                  autoSize={{ minRows: 6, maxRows: 10 }}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={isSubmitting || isGenerating}
                  disabled={!inputValue.trim()}
                  style={{ 
                    alignSelf: 'flex-start',
                    height: 'auto',
                    padding: '12px 24px',
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}
                >
                  {isGenerating ? 'Evaluating...' : 'Submit Answer'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }
  }

  // Fallback message if no questions are found
  return (
    <Card>
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Title level={3} style={{ color: '#fa8c16', marginBottom: 20 }}>
          ⚠️ No Questions Available
        </Title>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 20 }}>
          The interview questions are not loading properly.
        </Text>
      </div>
    </Card>
  );
};

export default ChatInterface;