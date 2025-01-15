import axios from 'axios'
export const client = axios.create({
    baseURL: 'https://fassback.pods.icicleai.tapis.io'
    // timeout: 1000,
});
