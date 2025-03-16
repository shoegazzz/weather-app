import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addCity, removeCity, updateCity } from '../store/weatherSlice';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Delete, Edit } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

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

const StyledListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  '&:focus': {
    outline: 'none',
  },
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FormContainer = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SearchField = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'flex-start',
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2)
}));

interface CityFormData {
  name: string;
  latitude: string;
  longitude: string;
}

const Cities: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cities = useSelector((state: RootState) => state.weather.cities);

  const [open, setOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<string | null>(null);
  const [formData, setFormData] = useState<CityFormData>({
    name: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = (city?: typeof cities[0]) => {
    if (city) {
      setEditingCity(city.id);
      setFormData({
        name: city.name,
        latitude: city.latitude.toString(),
        longitude: city.longitude.toString(),
      });
    } else {
      setEditingCity(null);
      setFormData({ name: '', latitude: '', longitude: '' });
    }
    setError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCity(null);
    setFormData({ name: '', latitude: '', longitude: '' });
    setError(null);
  };

  const searchCity = async (cityName: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon, display_name } = response.data[0];
        setFormData({
          name: display_name.split(',')[0],
          latitude: lat,
          longitude: lon,
        });
      } else {
        setError('Город не найден. Попробуйте уточнить название.');
      }
    } catch (err) {
      setError('Ошибка при поиске города. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cityData = {
      id: editingCity || uuidv4(),
      name: formData.name,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    if (editingCity) {
      dispatch(updateCity(cityData));
    } else {
      dispatch(addCity(cityData));
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    dispatch(removeCity(id));
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
            Управление городами
          </Typography>
          <ButtonGroup>
            <Button
              variant="contained"
              onClick={() => navigate('/weather')}
            >
              К прогнозу погоды
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpen()}
            >
              Добавить город
            </Button>
          </ButtonGroup>
        </Header>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <List>
          {cities.map((city) => (
            <StyledListItem key={city.id}>
              <ListItemText
                primary={city.name}
                secondary={`${city.latitude}, ${city.longitude}`}
              />
              <ListItemSecondaryAction>
                <ActionButton
                  edge="end"
                  onClick={() => handleOpen(city)}
                >
                  <Edit />
                </ActionButton>
                <ActionButton
                  edge="end"
                  onClick={() => handleDelete(city.id)}
                >
                  <Delete />
                </ActionButton>
              </ListItemSecondaryAction>
            </StyledListItem>
          ))}
        </List>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            {editingCity ? 'Редактировать город' : 'Добавить новый город'}
          </DialogTitle>
          <DialogContent sx={{ 
            pt: '20px !important',
            pb: 2,
            px: 3 
          }}>
            <FormContainer onSubmit={handleSubmit}>
              <SearchField>
                <TextField
                  fullWidth
                  label="Название города"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (formData.name && !loading) {
                        searchCity(formData.name);
                      }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => searchCity(formData.name)}
                  disabled={loading || !formData.name}
                  sx={{ height: 56 }}
                >
                  Найти
                </Button>
              </SearchField>
              
              <TextField
                fullWidth
                label="Широта"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
              <TextField
                fullWidth
                label="Долгота"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </FormContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Отмена</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.name || !formData.latitude || !formData.longitude}
            >
              {editingCity ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>
      </PageContainer>
    </Box>
  );
};

export default Cities; 