import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as TodoIcon,
  Schedule as ProgressIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Task, TaskStatus } from '../types/task';
import { userApi } from '../api/client';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { stringToColor } from '../utils/color';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  currentUserId?: number;
}

const statusConfig = {
  [TaskStatus.TODO]: {
    color: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.1)',
    icon: TodoIcon,
    label: 'To Do',
  },
  [TaskStatus.IN_PROGRESS]: {
    color: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.1)',
    icon: ProgressIcon,
    label: 'In Progress',
  },
  [TaskStatus.DONE]: {
    color: '#10b981',
    background: 'rgba(16, 185, 129, 0.1)',
    icon: CheckIcon,
    label: 'Done',
  },
} as const;

export const TaskList = ({ tasks, onEdit, onDelete, onStatusChange, currentUserId }: TaskListProps) => {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers(),
  });

  const getUserById = (userId: number | null) => {
    if (!userId) return null;
    return users.find(user => user.id === userId) || null;
  };

  if (tasks.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 4,
        }}
      >
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 6,
            maxWidth: 400,
            mx: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: '#64748b' }}>
            No tasks yet
          </Typography>
          <Typography sx={{ color: '#94a3b8' }}>
            Create your first task to get started!
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {tasks.map((task) => {
        const statusInfo = statusConfig[task.status];
        const StatusIcon = statusInfo.icon;
        const assignedUser = getUserById(task.assigned_user_id ?? null);
        const createdBy = getUserById(task.created_by_id ?? null);
        const isMine = currentUserId && task.assigned_user_id === currentUserId;
        
        return (
          <Grid item xs={12} sm={6} lg={4} key={task.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible',
                border: isMine ? '3px solid #4f8cff' : '1.5px solid #e0e7ef',
                boxShadow: isMine ? '0 8px 32px rgba(79, 140, 255, 0.18)' : '0 2px 8px rgba(0,0,0,0.04)',
                background: isMine ? 'linear-gradient(135deg, #eaf1ff 0%, #f7faff 100%)' : 'rgba(255,255,255,0.92)',
                transition: 'all 0.2s',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: isMine ? 'linear-gradient(90deg, #4f8cff, #667eea)' : `linear-gradient(90deg, ${statusInfo.color}, ${statusInfo.color}99)` ,
                  borderRadius: '16px 16px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 3, flex: 1, position: 'relative' }}>
                {/* Assignee avatar in top-right */}
                {assignedUser && (
                  <Avatar
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 32,
                      height: 32,
                      bgcolor: stringToColor(assignedUser.email),
                      fontWeight: 700,
                      fontSize: 18,
                      border: isMine ? '2px solid #4f8cff' : '2px solid #e0e7ef',
                      zIndex: 2,
                    }}
                  >
                    {assignedUser.name.charAt(0).toUpperCase()}
                  </Avatar>
                )}
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 1,
                        lineHeight: 1.3,
                        color: isMine ? '#1e293b' : '#64748b',
                        fontWeight: 700,
                      }}
                    >
                      {task.title}
                    </Typography>
                    {isMine && (
                      <Chip label="My Task" color="primary" size="small" sx={{ ml: 1, fontWeight: 600, bgcolor: '#4f8cff', color: 'white' }} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => onEdit(task)}
                      sx={{
                        color: '#64748b',
                        '&:hover': {
                          background: 'rgba(100, 116, 139, 0.1)',
                          color: '#475569',
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => onDelete(task.id)}
                      sx={{
                        color: '#ef4444',
                        '&:hover': {
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#dc2626',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Description */}
                {task.description && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#64748b', 
                      mb: 3,
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {task.description}
                  </Typography>
                )}

                {/* Assignment Info */}
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    {assignedUser ? (
                      <Chip
                        avatar={
                          <Avatar sx={{ width: 20, height: 20, bgcolor: '#667eea', fontSize: '0.7rem' }}>
                            {assignedUser.name.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        label={`Assigned to ${assignedUser.name}`}
                        size="small"
                        sx={{
                          color: '#667eea',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          fontWeight: 500,
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<PersonIcon />}
                        label="Unassigned"
                        size="small"
                        variant="outlined"
                        sx={{
                          color: '#9e9e9e',
                          borderColor: '#e0e0e0',
                          '& .MuiChip-icon': {
                            color: '#9e9e9e',
                          },
                        }}
                      />
                    )}
                  </Stack>

                  {/* Status and Deadline */}
                  <Stack direction="row" spacing={1}>
                    <Chip
                      icon={<StatusIcon />}
                      label={statusInfo.label}
                      sx={{
                        color: statusInfo.color,
                        backgroundColor: statusInfo.background,
                        border: `1px solid ${statusInfo.color}33`,
                        fontWeight: 500,
                        '& .MuiChip-icon': {
                          color: statusInfo.color,
                        },
                      }}
                      size="small"
                    />
                    {task.deadline && (
                      <Chip
                        icon={<TimeIcon />}
                        label={format(new Date(task.deadline), 'MMM d')}
                        variant="outlined"
                        size="small"
                        sx={{
                          color: '#64748b',
                          borderColor: '#e2e8f0',
                          '& .MuiChip-icon': {
                            color: '#64748b',
                          },
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Status Change */}
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: '#64748b' }}>Change Status</InputLabel>
                  <Select
                    value={task.status}
                    label="Change Status"
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: statusInfo.color,
                      },
                    }}
                  >
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <MenuItem key={status} value={status}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <config.icon sx={{ fontSize: '1.2rem', color: config.color }} />
                          {config.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Created by info */}
                {createdBy && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Typography variant="caption" color="text.secondary">
                      Created by {createdBy.name}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}; 