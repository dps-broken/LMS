import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: "https://lms-kcpr.onrender.com", 
    // For Development
    // baseURL: import.meta.env.VITE_API_URL || '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add the auth token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        // --- ADD THESE LOGS TO THE FRONTEND ---
        // console.log('--- Axios Interceptor Triggered ---');
        try {
            const userInfoString = localStorage.getItem('userInfo');
            // console.log('1. Raw userInfo from localStorage:', userInfoString);

            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                // console.log('2. Parsed userInfo object:', userInfo);

                if (userInfo && userInfo.token) {
                    // console.log('3. Token FOUND. Attaching to header:', userInfo.token);
                    config.headers.Authorization = `Bearer ${userInfo.token}`;
                } else {
                    // console.error('3. ERROR: Token NOT found in userInfo object.');
                }
            } else {
                // console.error('1. ERROR: No userInfo found in localStorage.');
            }
        } catch (error) {
            // console.error('--- CRITICAL ERROR in Axios Interceptor ---');
            // console.error('Failed to parse userInfo from localStorage:', error);
        }
        // ----------------------------------------
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;