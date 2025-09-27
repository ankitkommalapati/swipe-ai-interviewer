import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, Typography, Progress, message, Spin } from 'antd';
import { SendOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addInterviewMessage, updateTimeRemaining, nextQuestion } from '../store/slices/interviewSlice';
import { addAnswer, completeInterview } from '../store/slices/candidatesSlice';
import { AIService } from '../services/aiService';
import { ChatMessage } from '../types';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ChatInterface: React.FC = () => {
  const dispatch = useDispatch();
  const { currentSession, questions, currentQuestionIndex, timeRemaining, isInterviewActive } = useSelector((state: RootState) => state.interview);
  const { candidates } = useSelector((state: RootState) => state.candidates);
  
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentCandidate = candidates.find(c => c.id === currentSession?.candidateId);

  useEffect(() => {
    if (isInterviewActive && timeRemaining > 0 && !timerRef.current) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInterviewActive, timeRemaining]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      dispatch(updateTimeRemaining(timeRemaining - 1));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputValue,
      timestamp: new Date(),
    };

    dispatch(addInterviewMessage({ type: 'user', content: inputValue }));
    setInputValue('');
    setIsSubmitting(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];
      const timeSpent = currentQuestion.timeLimit - timeRemaining;
      
      // Evaluate answer
      setIsGenerating(true);
      const score = await AIService.evaluateAnswer(currentQuestion, inputValue);
      
      // Add answer to candidate
      dispatch(addAnswer({
        candidateId: currentSession!.candidateId,
        answer: {
          questionId: currentQuestion.id,
          question: currentQuestion.text,
          difficulty: currentQuestion.difficulty,
          answer: inputValue,
          score,
          timeSpent,
          timestamp: new Date(),
        }
      }));

      // Add AI feedback message
      const feedbackMessage = `Your answer scored ${score}/10. ${getScoreFeedback(score)}`;
      dispatch(addInterviewMessage({ type: 'assistant', content: feedbackMessage }));

      // Check if interview is complete
      if (currentQuestionIndex >= questions.length - 1) {
        await completeInterviewSession();
      } else {
        // Move to next question
        setTimeout(() => {
          dispatch(nextQuestion());
          const nextQ = questions[currentQuestionIndex + 1];
          dispatch(addInterviewMessage({
            type: 'assistant',
            content: `Next question (${nextQ.difficulty}): ${nextQ.text}`,
            isSystemMessage: true
          }));
        }, 2000);
      }
    } catch (error) {
      message.error('Error processing answer. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setIsGenerating(false);
    }
  };

  const completeInterviewSession = async () => {
    try {
      setIsGenerating(true);
      
      // Generate final summary
      const answers = currentCandidate?.answers.map(a => ({
        question: a.question,
        answer: a.answer,
        score: a.score
      })) || [];

      const summary = await AIService.generateFinalSummary(answers);
      const finalScore = Math.round(answers.reduce((sum, a) => sum + a.score, 0) / answers.length);

      dispatch(completeInterview({
        candidateId: currentSession!.candidateId,
        score: finalScore,
        summary
      }));

      dispatch(addInterviewMessage({
        type: 'assistant',
        content: `Interview completed! Your final score is ${finalScore}/10. ${summary}`,
        isSystemMessage: true
      }));

    } catch (error) {
      console.error('Error completing interview:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreFeedback = (score: number): string => {
    if (score >= 8) return "Excellent answer!";
    if (score >= 6) return "Good answer with room for improvement.";
    if (score >= 4) return "Fair answer. Consider providing more detail.";
    return "Answer needs significant improvement.";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = currentQuestionIndex / questions.length * 100;

  if (!isInterviewActive || !currentSession) {
    return (
      <Card>
        <Text>No active interview session. Please start an interview first.</Text>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>Interview Progress</Title>
        <Progress percent={progress} />
        <Text style={{ fontSize: 12, color: '#666' }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        
        {currentQuestion && (
          <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 6 }}>
            <Title level={5}>
              {currentQuestion.difficulty.toUpperCase()} Question
              <ClockCircleOutlined style={{ marginLeft: 8 }} />
              {formatTime(timeRemaining)}
            </Title>
            <Text>{currentQuestion.text}</Text>
          </div>
        )}
      </div>

      <div style={{ height: 400, overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: 6, padding: 16, marginBottom: 16 }}>
        <List
          dataSource={currentSession.messages}
          renderItem={(message: ChatMessage) => (
            <List.Item style={{ border: 'none', padding: '8px 0' }}>
              <div style={{
                width: '100%',
                textAlign: message.type === 'user' ? 'right' : 'left',
                padding: message.type === 'user' ? '8px 16px 8px 40px' : '8px 40px 8px 16px',
                background: message.type === 'user' ? '#1890ff' : message.isSystemMessage ? '#f6ffed' : '#f5f5f5',
                borderRadius: 8,
                color: message.type === 'user' ? 'white' : 'inherit'
              }}>
                <Text style={{ color: message.type === 'user' ? 'white' : 'inherit' }}>
                  {message.content}
                </Text>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </List.Item>
          )}
        />
        {isGenerating && (
          <List.Item style={{ border: 'none', padding: '8px 0' }}>
            <div style={{ padding: '8px 16px', background: '#f5f5f5', borderRadius: 8 }}>
              <Spin size="small" /> <Text style={{ marginLeft: 8 }}>AI is evaluating your answer...</Text>
            </div>
          </List.Item>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your answer here..."
          rows={3}
          disabled={isSubmitting || timeRemaining <= 0}
          onPressEnter={(e) => {
            if (e.shiftKey) return;
            e.preventDefault();
            handleSubmit();
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!inputValue.trim() || timeRemaining <= 0}
          style={{ height: 'auto', alignSelf: 'flex-end' }}
        >
          Send
        </Button>
      </div>
      
      {timeRemaining <= 0 && (
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <Text type="danger">Time's up! Moving to next question...</Text>
        </div>
      )}
    </Card>
  );
};

export default ChatInterface;
