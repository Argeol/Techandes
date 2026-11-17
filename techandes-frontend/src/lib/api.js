import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true, // OBLIGATORIO: Permite el envío automático de cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para capturar errores de sesión (401 / 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Si la sesión expiró o es inválida, redirigir al login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);