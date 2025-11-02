import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Configure base URL - adjust this to match your backend
// For Android emulator: http://10.0.2.2:5000
// For iOS simulator: http://localhost:5000
// For physical devices: Use your computer's local IP (e.g., http://192.168.1.X:5000)
// For web/production: Use environment variable EXPO_PUBLIC_API_URL
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  // Use environment variable if set (for production)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  if (__DEV__) {
    // Development mode - use appropriate URL based on platform
    if (Platform.OS === "web") {
      return "http://localhost:5000";
    }
    // Android emulator
    return "http://10.0.2.2:5000";
  }
  
  // Production mode - this should never be reached if EXPO_PUBLIC_API_URL is set
  // But fallback to localhost for web
  if (Platform.OS === "web") {
    return "http://localhost:5000";
  }
  
  return "http://localhost:5000";
};

const API_BASE_URL = getApiBaseUrl();

console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 second timeout for AI generation (can take longer)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token and user ID
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // TODO: Replace with actual userId from auth token
    // For now, using a default userId that matches backend
    const userId =
      (await SecureStore.getItemAsync("userId")) || "default-user-id";
    config.headers["x-user-id"] = userId;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and user ID
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userId");
    }

    // Enhanced error logging for network issues
    if (error.code === "NETWORK_ERROR" || error.message === "Network Error") {
      console.error("Network Error:", {
        message: "Cannot connect to backend server",
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        hint: "Make sure the backend server is running on port 5000",
      });
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; name: string , age: number, educationLevel: string }) => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },
  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/api/auth/login", data);
    if (response.data.token) {
      await SecureStore.setItemAsync("authToken", response.data.token);
    }
    return response.data;
  },
  logout: async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("userId");
    return api.post("/api/auth/logout");
  },
  getProfile: async () => {
    const response = await api.get("/api/auth/profile");
    return response.data;
  },
};

// Flashcard API
export const flashcardAPI = {
  getAll: async () => {
    const response = await api.get("/api/flashcards");
    return response.data.flashcards || [];
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/flashcards/${id}`);
    return response.data.flashcard;
  },
  create: async (data: {
    question: string;
    answer: string;
    subject?: string;
    difficultyLevel?: string;
    educationLevel?: string;
  }) => {
    const response = await api.post("/api/flashcards", data);
    return response.data.flashcard;
  },
  update: async (
    id: string,
    data: {
      question?: string;
      answer?: string;
      subject?: string;
      difficultyLevel?: string;
      educationLevel?: string;
    }
  ) => {
    const response = await api.put(`/api/flashcards/${id}`, data);
    return response.data.flashcard;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/flashcards/${id}`);
    return response.data;
  },
};

// Study API
export const studyAPI = {
  startSession: async (sessionType: string = "review", moduleId?: string) => {
    const response = await api.post("/api/study/session", { sessionType, moduleId });
    return {
      session: response.data.session,
      flashcards: response.data.flashcards || [],
      startIndex: response.data.startIndex || 0,
      progress: response.data.progress || null,
    };
  },
  updateCardPerformance: async (
    cardId: string,
    performance: {
      correct: boolean;
      responseTime?: number;
    }
  ) => {
    const response = await api.post(
      `/api/study/performance/${cardId}`,
      performance
    );
    return response.data.performance;
  },
  endSession: async (
    sessionId: string,
    stats: {
      cardsStudied: number;
      correctAnswers: number;
      sessionDuration: number;
      moduleId?: string;
      currentCardIndex?: number;
    }
  ) => {
    const response = await api.put(`/api/study/session/${sessionId}`, stats);
    return {
      session: response.data.session,
      progress: response.data.progress || null,
    };
  },
  getHistory: async () => {
    const response = await api.get("/api/study/history");
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get("/api/user/profile");
    return response.data.user;
  },
  updateProfile: async (data: {
    name?: string;
    age?: number;
    educationLevel?: string;
  }) => {
    const response = await api.put("/api/user/profile", data);
    return response.data.user;
  },
  getStats: async () => {
    const response = await api.get("/api/user/stats");
    return response.data;
  },
};

// Study Module API
export const studyModuleAPI = {
  getAll: async () => {
    const response = await api.get("/api/study-modules");
    return response.data.modules || [];
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/study-modules/${id}`);
    return {
      module: response.data.module,
      flashcards: response.data.flashcards || [],
    };
  },
  generate: async (data: {
    topic: string;
    subject?: string;
    educationLevel?: string;
    difficultyLevel?: string;
    numberOfCards?: number;
    estimatedHours?: number;
  }) => {
    const response = await api.post("/api/study-modules/ai/generate", data);
    return {
      module: response.data.module,
      flashcards: response.data.flashcards || [],
      stats: response.data.stats,
    };
  },
  preview: async (data: {
    topic: string;
    subject?: string;
    educationLevel?: string;
    difficultyLevel?: string;
    numberOfCards?: number;
    estimatedHours?: number;
  }) => {
    const response = await api.post("/api/study-modules/ai/preview", data);
    return {
      module: response.data.module,
      flashcards: response.data.flashcards || [],
      stats: response.data.stats,
    };
  },
  delete: async (id: string) => {
    const response = await api.delete(`/api/study-modules/${id}`);
    return response.data;
  },
};

export default api;
