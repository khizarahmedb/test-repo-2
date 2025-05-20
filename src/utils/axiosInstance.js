import axios from "axios";

const API_BASE_URL = "https://back.invader.shop/api";
// const API_BASE_URL = "http://localhost:9003/api";
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJasdasdasdasd1c2VyX2lkIjo1LCJpYaksndkawnXQiOjE3NDQ2MTUyNDcsImV4cCI6MTc0NDc4ODA0N30.gz8gvQjXBKMqYZ9ewjz9a5XffXpt8L8VYrrJ6_PAvsI"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // "x-token": token
  },
});

export const adminLogin = async (username, password) => {
  try {
    const response = await api.post("/admin/login", { username, password });

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllProducts = async (token) => {
  try {
    const response = await api.get("/product", {
      headers: {
        "x-token": token,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllInvoices = async (token) => {
  try {
    const response = await api.get("/invoice", {
      headers: {
        "x-token": token,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllCoupons = async (token) => {
  try {
    const response = await api.get("/coupon", {
      headers: {
        "x-token": token,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllInventories = async (token) => {
  try {
    const response = await api.get("/inventory", {
      headers: {
        "x-token": token,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllTickets = async (token) => {
  try {
    const response = await api.get("/ticket", {
      headers: {
        "x-token": token,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

export const addProduct = async (token, body) => {
  try {
    const response = await api.post("/product/add", body, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Add Product Error:", error.response?.data || error.message);
    throw error;
  }
};

export const editProduct = async (token, id, body) => {
  try {
    const response = await api.put(`/product/${id}`, body, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Edit Product Error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteProduct = async (token, id) => {
  try {
    const response = await api.delete(`/product/${id}`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const replaceTicket = async (token, id, body) => {
  try {
    const response = await api.post(`/ticket/replace/${id}`, body, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Replace Ticket Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addInventory = async (token, body) => {
  try {
    const response = await api.post("/inventory/add", body, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Add Inventory Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const editInventory = async (token, id, body) => {
  try {
    const response = await api.put(`/inventory/${id}`, body, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Edit Coupon Error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteInventory = async (token, id) => {
  try {
    const response = await api.delete(`/inventory/${id}`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Delete Coupon Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addCoupon = async (token, body) => {
  try {
    const response = await api.post("/coupon/add", body, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Add Coupon Error:", error.response?.data || error.message);
    throw error;
  }
};

export const editCoupon = async (token, id, body) => {
  try {
    const response = await api.put(`/coupon/${id}`, body, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Edit Coupon Error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteCoupon = async (token, id) => {
  try {
    const response = await api.delete(`/coupon/${id}`, {
      headers: {
        "x-token": token,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Delete Coupon Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export async function uploadFile(file) {
  // API endpoint URL
  const uploadUrl = "https://files.tfgsolutions.pk/api/file-directory/upload";
  // Directory value for the form data
  const uploadDirectory = "uploads/invaderProducts";

  // Create a FormData object to hold the file and directory data
  const formData = new FormData();
  formData.append("file", file); // Append the file with the key 'file'
  formData.append("directory", uploadDirectory); // Append the directory path with the key 'directory'

  console.log("Uploading file:", file.name, "to directory:", uploadDirectory);

  try {
    // Perform the POST request using the Fetch API
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      // Add any necessary headers here if required by the API
      // headers: {
      //   'Authorization': 'Bearer YOUR_TOKEN',
      // },
    });

    // Check if the response status code indicates success (e.g., 2xx)
    if (!response.ok) {
      // Try to get error details from the response body, otherwise use status text
      let errorDetails = `HTTP error! status: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || JSON.stringify(errorData);
      } catch (jsonError) {
        // Ignore error if response is not JSON
        console.warn("Could not parse error response as JSON.", jsonError);
      }
      throw new Error(`Upload failed: ${errorDetails}`);
    }

    // Parse the JSON response from the server
    const result = await response.json();
    console.log("Upload successful:", result);
    return result; // Return the successful response data
  } catch (error) {
    console.error("Upload error:", error);
    // Re-throw the error to be caught by the caller
    throw error;
  }
}

export default api;
