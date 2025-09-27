import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { store, persistor } from './store';
import MainLayout from './components/MainLayout';
import IntervieweeTab from './components/IntervieweeTab';
import InterviewerTab from './components/InterviewerTab';
import WelcomeBackModal from './components/WelcomeBackModal';
import './App.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <ConfigProvider>
          <Router>
            <div className="App">
              <MainLayout>
                <Routes>
                  <Route path="/" element={<IntervieweeTab />} />
                  <Route path="/interviewee" element={<IntervieweeTab />} />
                  <Route path="/interviewer" element={<InterviewerTab />} />
                </Routes>
              </MainLayout>
              <WelcomeBackModal />
            </div>
          </Router>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;