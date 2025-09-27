import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Card, Button, Input, Select, Tag, Modal, Typography, Descriptions, Rate, Progress } from 'antd';
import { SearchOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { RootState } from '../store';
import { Candidate, Answer } from '../types';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const InterviewerTab: React.FC = () => {
  const { candidates } = useSelector((state: RootState) => state.candidates);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'all' || candidate.interviewStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (a.interviewStatus === 'completed' && b.interviewStatus !== 'completed') return -1;
    if (b.interviewStatus === 'completed' && a.interviewStatus !== 'completed') return 1;
    if (a.interviewStatus === 'completed' && b.interviewStatus === 'completed') {
      return (b.finalScore || 0) - (a.finalScore || 0);
    }
    return 0;
  });

  const getStatusTag = (status: string) => {
    const statusConfig = {
      'not_started': { color: 'default', text: 'Not Started' },
      'in_progress': { color: 'processing', text: 'In Progress' },
      'completed': { color: 'success', text: 'Completed' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#52c41a';
    if (score >= 6) return '#faad14';
    return '#ff4d4f';
  };

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Candidate',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Candidate) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'interviewStatus',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Score',
      dataIndex: 'finalScore',
      key: 'score',
      render: (score: number) => score ? (
        <div>
          <Text strong style={{ color: getScoreColor(score) }}>
            {score}/10
          </Text>
          <br />
          <Rate disabled value={score / 2} style={{ fontSize: 12 }} />
        </div>
      ) : '-',
      sorter: (a: Candidate, b: Candidate) => (a.finalScore || 0) - (b.finalScore || 0),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record: Candidate) => {
        const totalQuestions = 6;
        const answeredQuestions = record.answers.length;
        const progress = (answeredQuestions / totalQuestions) * 100;
        
        return (
          <div style={{ width: 100 }}>
            <Progress 
              percent={progress} 
              size="small" 
              format={() => `${answeredQuestions}/${totalQuestions}`}
            />
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Candidate) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>
          <UserOutlined /> Interview Dashboard
        </Title>
        
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Search
            placeholder="Search candidates..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 150 }}
          >
            <Option value="all">All Status</Option>
            <Option value="not_started">Not Started</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={sortedCandidates}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No candidates found' }}
        />
      </Card>

      <Modal
        title={`Interview Details - ${selectedCandidate?.name}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCandidate && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Name" span={2}>
                {selectedCandidate.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedCandidate.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedCandidate.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedCandidate.interviewStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Final Score">
                {selectedCandidate.finalScore ? (
                  <Text strong style={{ color: getScoreColor(selectedCandidate.finalScore), fontSize: 16 }}>
                    {selectedCandidate.finalScore}/10
                  </Text>
                ) : '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedCandidate.answers.length > 0 && (
              <div>
                <Title level={4}>Interview Responses</Title>
                {selectedCandidate.answers.map((answer: Answer, index: number) => (
                  <Card key={answer.questionId} style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 12 }}>
                      <Tag color={answer.difficulty === 'easy' ? 'green' : answer.difficulty === 'medium' ? 'orange' : 'red'}>
                        {answer.difficulty.toUpperCase()}
                      </Tag>
                      <Text strong>Question {index + 1}</Text>
                    </div>
                    
                    <Text strong>Q: {answer.question}</Text>
                    <br /><br />
                    
                    <Text>A: {answer.answer}</Text>
                    <br /><br />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Text strong>Score: </Text>
                        <Text style={{ color: getScoreColor(answer.score) }}>
                          {answer.score}/10
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          Time: {answer.timeSpent}s | {answer.timestamp.toLocaleString()}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {selectedCandidate.finalSummary && (
              <div>
                <Title level={4}>AI Summary</Title>
                <Card>
                  <Text>{selectedCandidate.finalSummary}</Text>
                </Card>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InterviewerTab;
