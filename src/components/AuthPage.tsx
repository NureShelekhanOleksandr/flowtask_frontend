import React, { useState } from 'react';
import { Box, Container, Tabs, Tab } from '@mui/material';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthPageProps {
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 1,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{
              mb: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minWidth: 120,
              },
              '& .Mui-selected': {
                color: '#667eea',
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          <Box sx={{ px: 3, pb: 3 }}>
            {activeTab === 0 ? (
              <LoginForm
                onSuccess={onSuccess}
                onSwitchToRegister={() => setActiveTab(1)}
              />
            ) : (
              <RegisterForm
                onSuccess={onSuccess}
                onSwitchToLogin={() => setActiveTab(0)}
              />
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}; 