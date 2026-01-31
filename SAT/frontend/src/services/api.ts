import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120000, // 120 seconds
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const { token } = JSON.parse(user);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getHospitals = async () => {
    const response = await api.get('/hospitals');
    return response.data;
};


export const getAlerts = async (hospitalId?: string) => {
    const params = hospitalId ? { hospitalId } : {};
    const response = await api.get('/alerts', { params });
    return response.data;
};

export const login = async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
};



export const signupHospital = async (userData: any) => {
    const response = await api.post('/auth/signup/hospital', userData);
    return response.data;
};



export const getAiPrediction = async (role: string) => {
    const response = await api.post('/ai/predict', { role });
    return response.data;
};

export const getAiForecast = async (role: string, horizon: number = 14) => {
    const response = await api.get('/ai/forecast', {
        params: { role, horizon }
    });
    return response.data;
};

export default api;

