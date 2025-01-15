import axios from 'axios'
export const client = axios.create({
    baseURL: 'https://fassback.pods.icicleai.tapis.io/api'
    // timeout: 1000,
});
