import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';

// Mock the auth context
const mockLogin = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LoginForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLoginForm = () => {
    return render(
      <LoginForm
        onSuccess={mockOnSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );
  };

  it('renders login form with all required elements', () => {
    renderLoginForm();

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles form submission with valid credentials', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({});
    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByTestId('password-input').querySelector('input');

    await act(async () => {
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput!, 'password123');
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce({ response: { data: { detail: errorMessage } } });
    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByTestId('password-input').querySelector('input');

    await act(async () => {
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput!, 'wrongpassword');
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /sign in/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('toggles password visibility when clicking the visibility icon', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    
    const passwordInput = screen.getByTestId('password-input').querySelector('input');
    const visibilityButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await act(async () => {
      await user.click(visibilityButton);
    });
    expect(passwordInput).toHaveAttribute('type', 'text');

    // The button text changes after click, so we need to find it again
    const hideButton = screen.getByRole('button', { name: /hide password/i });
    await act(async () => {
      await user.click(hideButton);
    });
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('calls onSwitchToRegister when clicking the sign up button', async () => {
    const user = userEvent.setup();
    renderLoginForm();
    
    await act(async () => {
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      await user.click(signUpButton);
    });

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderLoginForm();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByTestId('password-input').querySelector('input');

    await act(async () => {
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput!, 'password123');
    });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await act(async () => {
      await user.click(submitButton);
    });

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Signing In...')).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
}); 