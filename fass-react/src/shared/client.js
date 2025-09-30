import axios from 'axios'
export const client = axios.create({
    // baseURL: 'http://127.0.0.1:8000/api' //staging
    baseURL: 'https://fassback.pods.icicleai.tapis.io/api' //prod
    // baseURL: 'http://127.0.0.1:8000/api' //local
    // baseURL: 'https://fassback.pods.icicleai.tapis.io/api' //prod
    // baseURL: 'https://fassbackstage.pods.icicleai.tapis.io/api' // staging
    // timeout: 1000,
});
