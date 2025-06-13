import { render, screen, fireEvent } from '@testing-library/react';
import { TaskForm } from '../TaskForm';
import { TaskStatus } from '../../types/task';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the auth context
const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the user API
jest.mock('../../api/client', () => ({
  userApi: {
    getUsers: jest.fn().mockResolvedValue([
      { id: 1, name: 'Test User', email: 'test@example.com' },
      { id: 2, name: 'Another User', email: 'another@example.com' },
    ]),
  },
}));

describe('TaskForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderTaskForm = (initialTask?: any) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TaskForm
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialTask={initialTask}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create task form with basic elements', async () => {
    renderTaskForm();

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/deadline/i)).toBeInTheDocument();
  });

  it('renders edit task form with title', () => {
    const initialTask = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.IN_PROGRESS,
      deadline: '2024-03-20T10:00',
      assigned_user_id: 2,
    };

    renderTaskForm(initialTask);

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Task');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
    expect(screen.getByLabelText(/deadline/i)).toHaveValue('2024-03-20T10:00');
  });

  it('calls onClose when cancel button is clicked', () => {
    renderTaskForm();
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    renderTaskForm();
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Create Task'));
    
    const titleInput = screen.getByLabelText(/title/i);
    expect(titleInput).toBeRequired();
  });
}); 