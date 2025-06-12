import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Typography,
  Box,
  Divider,
  Stack,
} from '@mui/material';
import { User } from '../types/user';
import { stringToColor } from '../utils/color';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
  stats?: {
    assigned: number;
    created: number;
    completed: number;
  };
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose, user, stats }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 1,
            bgcolor: stringToColor(user.email),
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{user.name}</Typography>
        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
      </DialogTitle>
      <DialogContent>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">{stats?.assigned ?? '-'}</Typography>
            <Typography variant="caption" color="text.secondary">Assigned</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">{stats?.created ?? '-'}</Typography>
            <Typography variant="caption" color="text.secondary">Created</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">{stats?.completed ?? '-'}</Typography>
            <Typography variant="caption" color="text.secondary">Completed</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          Registered: {new Date(user.created_at).toLocaleDateString()}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} fullWidth variant="contained" sx={{ fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 