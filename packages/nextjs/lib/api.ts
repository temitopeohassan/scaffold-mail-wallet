import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use(config => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("firebaseToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface WalletData {
  walletAddress: string;
  privateKey: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  emailVerified: boolean;
  walletAddress?: string;
  activated: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const api = {
  // Generate new wallet
  generateWallet: async (userId: string): Promise<ApiResponse<WalletData>> => {
    const response = await apiClient.post("/api/v1/wallet/generate", { userId });
    return response.data;
  },

  // Store wallet address
  storeWalletAddress: async (userId: string, walletAddress: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post("/api/v1/wallet/store-address", { userId, walletAddress });
    return response.data;
  },

  // Activate user
  activateUser: async (walletAddress: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post("/api/v1/user/activate", { walletAddress });
    return response.data;
  },

  // Get user profile (includes walletAddress if set)
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get("/api/v1/user/profile");
    return response.data;
  },

  // Verify email
  verifyEmail: async (email: string, verificationCode: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post("/api/v1/auth/verify-email", { email, verificationCode });
    return response.data;
  },
};

export default apiClient;
