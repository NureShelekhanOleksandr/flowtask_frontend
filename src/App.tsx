import { useState } from 'react';
import {
  Container,
  Toolbar,
  Typography,
  Button,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  Fab,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Logout } from '@mui/icons-material';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { AuthPage } from './components/AuthPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Task, TaskCreate, TaskStatus } from './types/task';
import { taskApi } from './api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileModal } from './components/ProfileModal';
import { stringToColor } from './utils/color';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#764ba2',
    },
    secondary: {
      main: '#f093fb',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '2.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function TaskManager() {
  const { user, logout } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const queryClient = useQueryClient();
  const [showMyTasks, setShowMyTasks] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskApi.getTasks(),
  });

  // Compute user stats
  const assignedCount = tasks.filter(t => t.assigned_user_id === user?.id).length;
  const createdCount = tasks.filter(t => t.created_by_id === user?.id).length;
  const completedCount = tasks.filter(t => t.assigned_user_id === user?.id && t.status === TaskStatus.DONE).length;

  const createTaskMutation = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsFormOpen(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, task }: { id: number; task: TaskCreate }) =>
      taskApi.updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsFormOpen(false);
      setSelectedTask(undefined);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleCreateTask = (task: TaskCreate) => {
    createTaskMutation.mutate(task);
  };

  const handleUpdateTask = (task: TaskCreate) => {
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, task });
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      updateTaskMutation.mutate({
        id: taskId,
        task: { ...task, status: newStatus },
      });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const filteredTasks = showMyTasks && user ? tasks.filter(t => t.assigned_user_id === user.id) : tasks;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 2 }}>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              FlowTask
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedTask(undefined);
                  setIsFormOpen(true);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                  },
                }}
              >
                New Task
              </Button>

              <IconButton
                size="large"
                onClick={handleMenuOpen}
                sx={{ color: '#667eea' }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: stringToColor(user?.email || '') }} onClick={() => setProfileOpen(true)}>
                  {user?.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="subtitle2">{user?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => setProfileOpen(true)}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white', 
              mb: 1, 
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Welcome back, {user?.name}!
          </Typography>
          <Typography 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              textAlign: 'center',
              fontSize: '1.1rem',
            }}
          >
            Manage your tasks efficiently and boost your productivity
          </Typography>
          <Button
            variant={showMyTasks ? 'contained' : 'outlined'}
            color="primary"
            sx={{ mt: 3, borderRadius: 8, fontWeight: 600, textTransform: 'none', background: showMyTasks ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined }}
            onClick={() => setShowMyTasks((v) => !v)}
          >
            {showMyTasks ? 'Show All Tasks' : 'Show My Tasks'}
          </Button>
        </Box>

        {isLoading ? (
          <Box sx={{ textAlign: 'center', color: 'white', py: 8 }}>
            <CircularProgress sx={{ color: 'white', mb: 2 }} />
            <Typography variant="h6">Loading your tasks...</Typography>
          </Box>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            currentUserId={user?.id}
          />
        )}
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="secondary"
        aria-label="add task"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #ec86f7 0%, #f04462 100%)',
          },
        }}
        onClick={() => {
          setSelectedTask(undefined);
          setIsFormOpen(true);
        }}
      >
        <AddIcon />
      </Fab>

      <TaskForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedTask(undefined);
        }}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        initialTask={selectedTask}
      />

      {/* Profile Modal */}
      {user && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
          stats={{ assigned: assignedCount, created: createdCount, completed: completedCount }}
        />
      )}
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} size={60} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <TaskManager />;
}

export default App; 