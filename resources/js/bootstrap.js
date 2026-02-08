import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// 毎リクエストで CSRF トークンをヘッダに付与（Laravel の VerifyCsrfToken 用）
window.axios.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        config.headers['X-XSRF-TOKEN'] = token;
    }
    return config;
});
