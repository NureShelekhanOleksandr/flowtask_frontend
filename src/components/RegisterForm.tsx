import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { UserRegister } from '../types/user';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

const validatePasswordStrength = (password: string) => {
  const requirements: PasswordRequirement[] = [
    { text: 'At least 8 characters long', met: password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { text: 'Contains number', met: /\d/.test(password) },
    { text: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const metCount = requirements.filter(req => req.met).length;
  const strength = (metCount / requirements.length) * 100;
  
  let strengthLabel = 'Very Weak';
  let strengthColor = '#f44336';
  
  if (strength >= 80) {
    strengthLabel = 'Strong';
    strengthColor = '#4caf50';
  } else if (strength >= 60) {
    strengthLabel = 'Good';
    strengthColor = '#ff9800';
  } else if (strength >= 40) {
    strengthLabel = 'Fair';
    strengthColor = '#ffeb3b';
  } else if (strength >= 20) {
    strengthLabel = 'Weak';
    strengthColor = '#ff5722';
  }

  return {
    requirements,
    strength,
    strengthLabel,
    strengthColor,
    isStrong: metCount === requirements.length
  };
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<UserRegister>({
    email: '',
    name: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordValidation = useMemo(() => 
    validatePasswordStrength(formData.password), 
    [formData.password]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!passwordValidation.isStrong) {
      setError('Password does not meet all security requirements');
      setIsLoading(false);
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register(formData);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 450,
        mx: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        borderRadius: 3,
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 700,
            }}
          >
            Join FlowTask
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your account to get started
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            required
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {formData.password && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Password Strength:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: passwordValidation.strengthColor,
                    fontWeight: 600 
                  }}
                >
                  {passwordValidation.strengthLabel}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordValidation.strength}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  mb: 1,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: passwordValidation.strengthColor,
                    borderRadius: 3,
                  },
                }}
              />
              <List dense sx={{ py: 0 }}>
                {passwordValidation.requirements.map((req, index) => (
                  <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {req.met ? (
                        <CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} />
                      ) : (
                        <Cancel sx={{ fontSize: 16, color: '#f44336' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={req.text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        sx: { 
                          color: req.met ? '#4caf50' : 'text.secondary',
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <TextField
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={handleInputChange}
            required
            sx={{ mb: 3 }}
            error={!!(confirmPassword && formData.password !== confirmPassword)}
            helperText={
              confirmPassword && formData.password !== confirmPassword 
                ? 'Passwords do not match' 
                : ''
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || !passwordValidation.isStrong || formData.password !== confirmPassword}
            sx={{
              py: 1.5,
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              },
              '&:disabled': {
                background: '#e0e0e0',
                color: '#9e9e9e',
              },
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {onSwitchToLogin && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Button
                  variant="text"
                  onClick={onSwitchToLogin}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#667eea',
                  }}
                >
                  Sign In
                </Button>
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}; 