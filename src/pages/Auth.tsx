import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import CryptoJS from 'crypto-js';

const Auth: React.FC = () => {
  const [login, setLogin] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const encryptedData = localStorage.getItem('userData');
    if (encryptedData) {
      navigate('/weather');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = { login, username };
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(userData),
      'weather-app-secret'
    ).toString();
    
    localStorage.setItem('userData', encryptedData);
    navigate('/weather');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: (theme) => theme.palette.grey[50],
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Вход в приложение
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Логин"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Войти
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Auth; 