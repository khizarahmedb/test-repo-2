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
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      const userStorage = localStorage.getItem("user-storage");
      if (userStorage) {
        try {
          const userData = JSON.parse(userStorage);
          const token = userData?.state?.user?.token;

          if (token) {
            config.headers["x-token"] = token;
          }
        } catch (error) {
          console.error("Error parsing user storage:", error);
        }
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

// Coupons pagination function
export const getCoupons = async (startsWith, endsWith, token) => {
  const config = {
    headers: {},
  };

  // Add token to headers if provided
  if (token) {
    config.headers["x-token"] = token;
  }

  const response = await api.get(
    `/coupon?startsWith=${startsWith}&endsWith=${endsWith}`,
    config
  );
  return response.data;
};

// Create a new coupon
export const createCoupon = async (couponData, token) => {
  const config = {
    headers: {},
  };

  // Add token to headers if provided
  if (token) {
    config.headers["x-token"] = token;
  }

  const response = await api.post("/coupon", couponData, config);
  return response.data;
};

// Update an existing coupon
export const updateCoupon = async (id, couponData, token) => {
  const config = {
    headers: {},
  };

  // Add token to headers if provided
  if (token) {
    config.headers["x-token"] = token;
  }

  const response = await api.put(`/coupon/${id}`, couponData, config);
  return response.data;
};

// Delete a coupon
export const deleteCoupon = async (id, token) => {
  const config = {
    headers: {},
  };

  // Add token to headers if provided
  if (token) {
    config.headers["x-token"] = token;
  }

  const response = await api.delete(`/coupon/${id}`, config);
  return response.data;
};

// Change password function
export const changePassword = async (passwordData, token) => {
  const config = {
    headers: {},
  };

  // Add token to headers if provided
  if (token) {
    config.headers["x-token"] = token;
  }

  const response = await api.put("/change-password", passwordData, config);
  return response.data;
};

export const getUsers = async (
  startsWith,
  endsWith,
  token,
  role,
  searchQuery
) => {
  const paths = {
    customers: "customers",
    managers: "managers",
    resellers: "resellers",
    stockers: "stockers",
    supports: "supports",
  };
  const config = {
    headers: {},
  };

  // Add token to headers if provided
  if (token) {
    config.headers["x-token"] = token;
  }

  const response = await api.get(
    `/${paths[role]}?startsWith=${startsWith}&endsWith=${endsWith}${
      searchQuery ? `&query=${searchQuery}` : ""
    }`,
    config
  );
  return response.data;
};

export const createUser = async (userData, token) => {
  const config = {
    headers: {},
  };

  // Add token to headers if provided
  if (token) {
    config.headers["x-token"] = token;
  }

  const response = await api.post("/create/user", userData, config);
  return response.data;
};

export const updateUser = async (data, token) => {
  const config = {
    headers: {},
  };

  // Add token to headers if provided
  if (token) {
    config.headers["x-token"] = token;
  }

  const response = await api.put(`/change-role`, data, config);
  return response.data;
};

export const getRoles = async (token) => {
  const config = {
    headers: {},
  };

  // Add token to headers if provided
  if (token) {
    config.headers["x-token"] = token;
  }

  const response = await api.get(`/get-roles`, config);
  return response.data;
};

export default api;
