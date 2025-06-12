import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import { Person, Assignment } from '@mui/icons-material';
import { Task, TaskCreate, TaskStatus } from '../types/task';
import { User } from '../types/user';
import { userApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: TaskCreate) => void;
  initialTask?: Task;
}

export const TaskForm = ({ open, onClose, onSubmit, initialTask }: TaskFormProps) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<TaskCreate>({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    deadline: '',
    assigned_user_id: undefined,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers(),
    enabled: open,
  });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title,
        description: initialTask.description || '',
        status: initialTask.status,
        deadline: initialTask.deadline ? initialTask.deadline.slice(0, 16) : '',
        assigned_user_id: initialTask.assigned_user_id,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        deadline: '',
        assigned_user_id: undefined,
      });
    }
  }, [initialTask, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      deadline: formData.deadline || undefined,
      created_by_id: currentUser?.id,
    };
    onSubmit(submitData);
  };

  const getSelectedUser = () => {
    return users.find(user => user.id === formData.assigned_user_id);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment sx={{ color: '#667eea' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {initialTask ? 'Edit Task' : 'Create New Task'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              >
                {Object.values(TaskStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Assign to</InputLabel>
              <Select
                value={formData.assigned_user_id || ''}
                label="Assign to"
                onChange={(e) => setFormData({ 
                  ...formData, 
                  assigned_user_id: e.target.value ? Number(e.target.value) : undefined 
                })}
                disabled={usersLoading}
                renderValue={(selected) => {
                  if (!selected) {
                    return <span style={{ color: '#9e9e9e' }}>Unassigned</span>;
                  }
                  const selectedUser = getSelectedUser();
                  return selectedUser ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#667eea', fontSize: '0.75rem' }}>
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </Avatar>
                      {selectedUser.name}
                    </Box>
                  ) : selected;
                }}
              >
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#e0e0e0', color: '#757575' }}>
                      <Person sx={{ fontSize: 16 }} />
                    </Avatar>
                    <span style={{ color: '#9e9e9e' }}>Unassigned</span>
                  </Box>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#667eea', fontSize: '0.75rem' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <TextField
            margin="dense"
            label="Deadline"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={onClose}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              },
            }}
          >
            {initialTask ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 