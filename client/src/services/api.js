import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Don't redirect automatically, let the component handle it
      console.log("Token expired or invalid");
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  adminLogin: (credentials) => api.post("/auth/admin/login", credentials),
  occupantLogin: (credentials) => api.post("/auth/occupant/login", credentials),
  changePassword: (data) => api.post("/auth/change-password", data),
  verifyToken: () => api.get("/auth/verify"),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getPropertiesByType: (type, page = 1, limit = 10) =>
    api.get(`/admin/properties/${type}?page=${page}&limit=${limit}`),
  addProperty: (data) => api.post("/admin/properties", data),
  updateOccupant: (type, propertyId, data) =>
    api.put(`/admin/properties/${type}/${propertyId}/occupant`, data),
  resetPasswordToDefault: (type, propertyId) =>
    api.post(`/admin/properties/${type}/${propertyId}/reset-password`),
  getPropertyDetails: (type, propertyId) =>
    api.get(`/admin/properties/${type}/${propertyId}`),

  // Admin management
  createAdmin: (data) => api.post("/admin/admins", data),
  getAllAdmins: () => api.get("/admin/admins"),
  changeAdminPassword: (adminId, data) =>
    api.put(`/admin/admins/${adminId}/password`, data),
  updateAdminStatus: (adminId, data) =>
    api.patch(`/admin/admins/${adminId}/status`, data),
};

// Occupant API
export const occupantAPI = {
  getDashboard: () => api.get("/occupant/dashboard"),
  getPropertyInfo: () => api.get("/occupant/property"),
};

export default api;
