import React, { useState } from 'react';
import { Upload, Button, Form, Input, Card, message, Spin } from 'antd';
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import { ResumeParser, ResumeData } from '../services/resumeParser';
import { Candidate } from '../types';

const { Dragger } = Upload;

interface ResumeUploadProps {
  onCandidateCreated: (candidate: Candidate) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onCandidateCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [, setResumeData] = useState<ResumeData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const parsedData = await ResumeParser.parseFile(file);
      setResumeData(parsedData);
      setUploadedFile(file);
      
      // Pre-fill form with extracted data
      const formData: any = {};
      
      if (parsedData.name && parsedData.name.trim()) {
        formData.name = parsedData.name.trim();
      }
      
      if (parsedData.email && parsedData.email.trim()) {
        formData.email = parsedData.email.trim();
      }
      
      if (parsedData.phone && parsedData.phone.trim()) {
        formData.phone = parsedData.phone.trim();
      }
      
      // Set form values
      form.setFieldsValue(formData);

      // Debug: Log extracted data

      // Show success message with details
      const extractedCount = Object.keys(formData).filter(key => formData[key]).length;
      if (extractedCount > 0) {
        message.success(`Resume parsed successfully! Extracted ${extractedCount} field(s). Please review and complete any missing information.`);
      } else {
        message.success('Resume uploaded successfully! Please fill in your information below.');
      }
    } catch (error) {
      message.error('Failed to parse resume. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!uploadedFile) {
      message.error('Please upload a resume first');
      return;
    }

    const candidate: Candidate = {
      id: Date.now().toString(),
      name: values.name,
      email: values.email,
      phone: values.phone,
      resume: {
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        fileType: uploadedFile.type,
        uploadDate: new Date().toISOString(),
      },
      interviewStatus: 'not_started',
      currentQuestionIndex: 0,
      answers: [],
    };

    onCandidateCreated(candidate);
    message.success('Profile created successfully!');
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.docx',
    beforeUpload: (file: File) => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      if (!isValidType) {
        message.error('Please upload a PDF or DOCX file');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB');
        return false;
      }

      handleFileUpload(file);
      return false; // Prevent auto upload
    },
  };

  return (
    <Card title="Upload Resume & Complete Profile" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Spin spinning={loading}>
        <Dragger {...uploadProps} style={{ marginBottom: 24 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag resume file to this area to upload</p>
          <p className="ant-upload-hint">
            Support for PDF and DOCX files. We'll automatically extract your information.
          </p>
        </Dragger>

        {uploadedFile?.type === 'application/pdf' && (
          <div style={{ marginBottom: 24, padding: 16, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 6 }}>
            <h4 style={{ color: '#fa8c16', marginBottom: 8 }}>
              <FileTextOutlined /> File Uploaded
            </h4>
            <p style={{ color: '#fa8c16' }}>PDF file uploaded successfully. Please fill in your information below.</p>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter your email address" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input placeholder="Enter your phone number" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Start Interview
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default ResumeUpload;
