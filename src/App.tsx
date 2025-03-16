import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Weather from './pages/Weather';
import Cities from './pages/Cities';

const App = () => {
    const basename = import.meta.env.DEV ? '/' : '/weather-app';
    
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/cities" element={<Cities />} />
        </Routes>
    );
};

export default App;
