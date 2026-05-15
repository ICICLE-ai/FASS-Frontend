import axios from 'axios'

if (!import.meta.env.VITE_API_BASE_URL) {
    console.error('VITE_API_BASE_URL is not set. Check that the correct .env file exists for this Vite mode.');
}

export const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});