import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

// Create an axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // In a real implementation, this would call the token refresh endpoint
        const refreshToken = localStorage.getItem("refreshToken");
        
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        
        // Call refresh token endpoint
        // const response = await axios.post("/auth/refresh", { refreshToken });
        // const newAccessToken = response.data.accessToken;
        
        // For development, just simulate a successful refresh
        const newAccessToken = "new-mock-access-token";
        
        // Update token in storage
        localStorage.setItem("accessToken", newAccessToken);
        
        // Update the header and retry the request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        
        // In a client component, we would use router.push here
        // For a service, we'll need to rely on the auth context to handle this
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

export { api };