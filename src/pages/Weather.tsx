import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchWeather, resetState } from '../store/weatherSlice';
import { 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  WbSunny,
  Cloud,
  Grain,
  AcUnit,
  Thunderstorm,
  WaterDrop,
  Refresh,
} from '@mui/icons-material';
import moment from 'moment';

const AUTO_REFRESH_INTERVAL = 10000; // 10 секунд

// Styled компоненты
const PageContainer = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  width: '100%',
  padding: theme.spacing(0, 2),
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const RefreshButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  minWidth: '180px',
  position: 'relative',
  transition: 'all 0.3s ease',
  '& .MuiButton-startIcon': {
    transition: 'transform 0.3s ease',
  },
  '&:disabled .MuiButton-startIcon': {
    animation: 'spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

const WeatherCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const WeatherIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  margin: `${theme.spacing(2)} 0`,
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2)
}));

const getWeatherIcon = (code: number) => {
  if (code <= 1) return <WbSunny />;
  if (code <= 3) return <Cloud />;
  if (code <= 49) return <Grain />;
  if (code <= 69) return <WaterDrop />;
  if (code <= 79) return <AcUnit />;
  return <Thunderstorm />;
};

const Weather: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { cities, loading, error } = useSelector((state: RootState) => state.weather);

  const updateWeather = useCallback(() => {
    dispatch(fetchWeather());
  }, [dispatch]);

  useEffect(() => {
    const encryptedData = localStorage.getItem('userData');
    if (!encryptedData) {
      navigate('/auth');
      return;
    }

    updateWeather();
    const interval = setInterval(updateWeather, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [updateWeather, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    dispatch(resetState());
    navigate('/auth');
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
      <PageContainer>
        <Header>
          <Typography variant="h4" component="h1">
            Прогноз погоды на {moment().add(1, 'day').format('DD.MM.YYYY')}
          </Typography>
          <ButtonGroup>
            <Button
              variant="contained"
              onClick={() => navigate('/cities')}
            >
              Управление городами
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
            >
              Выйти
            </Button>
          </ButtonGroup>
        </Header>

        <RefreshButton
          variant="contained"
          startIcon={<Refresh />}
          onClick={updateWeather}
          disabled={loading}
        >
          {loading ? 'Обновление...' : 'Обновить сейчас'}
        </RefreshButton>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {cities.map((city) => (
            <Grid item xs={12} sm={6} md={4} key={city.id}>
              <WeatherCard elevation={2}>
                <Typography variant="h6" gutterBottom>
                  {city.name}
                </Typography>
                <WeatherIcon>
                  {getWeatherIcon(city.weatherCode || 0)}
                </WeatherIcon>
                <Typography variant="h4">
                  {city.temperature !== undefined ? `${city.temperature}°C` : '—'}
                </Typography>
              </WeatherCard>
            </Grid>
          ))}
        </Grid>
      </PageContainer>
    </Box>
  );
};

export default Weather; 