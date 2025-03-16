import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface City {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    weatherCode?: number;
    temperature?: number;
}

interface WeatherState {
    cities: City[];
    loading: boolean;
    error: string | null;
    lastUpdate: number;
}

const initialState: WeatherState = {
    cities: [
        { id: '1', name: 'Москва', latitude: 55.7558, longitude: 37.6173 },
        { id: '2', name: 'Санкт-Петербург', latitude: 59.9343, longitude: 30.3351 },
        { id: '3', name: 'Новосибирск', latitude: 55.0084, longitude: 82.9357 }
    ],
    loading: false,
    error: null,
    lastUpdate: 0
};

export const fetchWeather = createAsyncThunk(
    'weather/fetchWeather',
    async (_, { getState }) => {
        const state = getState() as { weather: WeatherState };
        const now = Date.now();

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];

        try {
            const results = await Promise.all(
                state.weather.cities.map(async (city, index) => {
                    await new Promise(resolve => setTimeout(resolve, index * 1000));
                    
                    const response = await axios.get(
                        `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&daily=weathercode,temperature_2m_max&timezone=auto&start_date=${formattedDate}&end_date=${formattedDate}`,
                        { timeout: 5000 }
                    );

                    return {
                        cityId: city.id,
                        weather: {
                            temperature: response.data.daily.temperature_2m_max[0],
                            weatherCode: response.data.daily.weathercode[0],
                            time: formattedDate
                        }
                    };
                })
            );

            return { results, timestamp: now };
        } catch (error) {
            throw error;
        }
    }
);

const weatherSlice = createSlice({
    name: "weather",
    initialState,
    reducers: {
        addCity: (state, action: PayloadAction<City>) => {
            state.cities.push(action.payload);
        },
        removeCity: (state, action: PayloadAction<string>) => {
            state.cities = state.cities.filter(city => city.id !== action.payload);
        },
        updateCity: (state, action: PayloadAction<City>) => {
            const index = state.cities.findIndex(city => city.id === action.payload.id);
            if (index !== -1) {
                state.cities[index] = action.payload;
            }
        },
        resetState: () => initialState
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWeather.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWeather.fulfilled, (state, action) => {
                state.loading = false;
                state.lastUpdate = action.payload.timestamp;
                action.payload.results.forEach(result => {
                    const cityIndex = state.cities.findIndex(
                        city => city.id === result.cityId
                    );
                    if (cityIndex !== -1) {
                        state.cities[cityIndex].temperature = result.weather.temperature;
                        state.cities[cityIndex].weatherCode = result.weather.weatherCode;
                    }
                });
            })
            .addCase(fetchWeather.rejected, (state) => {
                state.loading = false;
                state.error = 'Произошла ошибка при загрузке данных';
            });
    },
});

export const { addCity, removeCity, updateCity, resetState } = weatherSlice.actions;
export default weatherSlice.reducer;
