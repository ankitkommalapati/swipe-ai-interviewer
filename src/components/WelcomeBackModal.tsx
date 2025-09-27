import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { resumeInterview } from '../store/slices/interviewSlice';
import { updateCandidate } from '../store/slices/candidatesSlice';

const { Title, Text } = Typography;

const WelcomeBackModal: React.FC = () => {
  const dispatch = useDispatch();
  const { candidates } = useSelector((state: RootState) => state.candidates);
  const { isPaused, currentSession } = useSelector((state: RootState) => state.interview);

  // Find candidate with incomplete interview
  const incompleteCandidate = candidates.find(c => c.interviewStatus === 'in_progress');

  const handleResume = () => {
    if (incompleteCandidate && currentSession) {
      dispatch(resumeInterview());
      dispatch(updateCandidate({
        id: incompleteCandidate.id,
        updates: { interviewStatus: 'in_progress' }
      }));
    }
  };

  const handleStartNew = () => {
    // Clear current session and start fresh
    window.location.reload();
  };

  return (
    <Modal
      title="Welcome Back!"
      open={isPaused || (incompleteCandidate && !currentSession)}
      footer={null}
      closable={false}
      centered
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Title level={4}>You have an incomplete interview session</Title>
        <Text type="secondary">
          {incompleteCandidate?.name} - {incompleteCandidate?.answers.length}/6 questions completed
        </Text>
        
        <div style={{ marginTop: 32 }}>
          <Space size="large">
            <Button type="primary" size="large" onClick={handleResume}>
              Resume Interview
            </Button>
            <Button size="large" onClick={handleStartNew}>
              Start New Interview
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeBackModal;
