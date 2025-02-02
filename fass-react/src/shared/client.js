import axios from 'axios'
export const client = axios.create({
    baseURL: 'http://127.0.0.1:8000/api'
    //baseURL: 'https://fassback.pods.icicleai.tapis.io/api'
    //
    // timeout: 1000,
});
