// api.js
import axios from "axios";
import { encryptData, decryptData } from "./crypto"; // Adjust path as needed

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for encryption
api.interceptors.request.use(
  async (config) => {
    // Only encrypt POST/PUT/PATCH requests with data
    if (
      config.data &&
      (config.method === "post" ||
        config.method === "put" ||
        config.method === "patch")
    ) {
      // Don't encrypt if the data is already in the encrypted format (e.g., if it's already been processed by another interceptor)
      if (
        typeof config.data === "object" &&
        config.data.iv &&
        config.data.tag &&
        config.data.encryptedData
      ) {
        return config; // Already encrypted, skip
      }
      try {
        const encryptedPayload = await encryptData(config.data);
        config.data = encryptedPayload;
      } catch (error) {
        console.error("Axios Request Encryption Error:", error);
        // Throw a user-friendly error or redirect
        return Promise.reject(
          new Error("Failed to encrypt request data. Please try again.")
        );
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for decryption
api.interceptors.response.use(
  async (response) => {
    // Assuming encrypted responses will have a specific structure (e.g., iv, tag, encryptedData)
    const { iv, tag, encryptedData } = response.data || {};

    if (iv && tag && encryptedData) {
      // Check if it's an encrypted payload
      try {
        const decryptedData = await decryptData(response.data);
        response.data = decryptedData; // Replace with decrypted data
      } catch (error) {
        console.error("Axios Response Decryption Error:", error);
        // This is crucial: if decryption fails, the data is likely invalid or tampered with.
        // You should not proceed with potentially malicious or corrupted data.
        throw new Error(
          "Failed to decrypt response data. Data might be invalid or tampered."
        );
      }
    }
    return response;
  },
  (error) => {
    // If the error response itself is encrypted, you might need to decrypt it too.
    // However, usually error responses are sent unencrypted for easier debugging.
    if (
      error.response &&
      error.response.data &&
      error.response.data.iv &&
      error.response.data.tag &&
      error.response.data.encryptedData
    ) {
      try {
        // Attempt to decrypt error data
        const decryptedErrorData = decryptData(error.response.data);
        error.response.data = decryptedErrorData;
      } catch (decryptionError) {
        console.error(
          "Failed to decrypt error response data:",
          decryptionError
        );
        // If error response decryption also fails, it's a serious issue.
        error.message =
          "Received an encrypted error response that could not be decrypted.";
      }
    }
    console.error(
      `API Response Error (${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }):`,
      error.response?.data || error.message
    );
    throw error;
  }
);

// Existing functions (use `api.post`, `api.get` etc. directly)
export const login = async (body) => {
  const response = await api.post("/login/user", body);
  return response.data;
};

export const getUserProfile = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get("/user/profile", config);
  return response.data;
};

export default api;
