
import axios from "axios";

// Get environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "10000");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Canvas Operations ────────────────────────────────────────────────────────

export const createCanvas = async (name = "Untitled Canvas") => {
  const response = await apiClient.post("/canvas/create", { name });
  return response.data;
};

export const updateCanvas = async (canvasId, elements, thumbnail) => {
  if (!canvasId) throw new Error("Canvas ID is required");
  const response = await apiClient.put("/canvas/update", {
    canvasId,
    elements,
    ...(thumbnail !== undefined && { thumbnail }),
  });
  return response.data;
};

export const renameCanvas = async (canvasId, name) => {
  if (!canvasId || !name) throw new Error("Canvas ID and name required");
  const response = await apiClient.patch(`/canvas/rename/${canvasId}`, { name });
  return response.data;
};

export const fetchInitialCanvasElements = async (canvasId) => {
  if (!canvasId) throw new Error("Canvas ID is required");
  const response = await apiClient.get(`/canvas/load/${canvasId}`);
  return response.data?.elements ?? [];
};

export const loadCanvas = async (canvasId) => {
  if (!canvasId) throw new Error("Canvas ID is required");
  const response = await apiClient.get(`/canvas/load/${canvasId}`);
  return response.data;
};

export const shareCanvas = async (canvasId, email) => {
  if (!canvasId || !email) throw new Error("Canvas ID and email are required");
  const response = await apiClient.put(`/canvas/share/${canvasId}`, { email });
  return response.data;
};

export const unshareCanvas = async (canvasId, userIdToRemove) => {
  const response = await apiClient.put(`/canvas/unshare/${canvasId}`, { userIdToRemove });
  return response.data;
};

export const getUserCanvases = async () => {
  const response = await apiClient.get("/canvas/list");
  return response.data;
};

export const getSharedCanvases = async () => {
  try {
    const response = await apiClient.get("/canvas/shared");
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      const response = await apiClient.get("/canvas/list");
      return response.data.filter(c => c.shared && c.shared.length > 0);
    }
    return [];
  }
};

export const deleteCanvas = async (canvasId) => {
  if (!canvasId) throw new Error("Canvas ID is required");
  const response = await apiClient.delete(`/canvas/delete/${canvasId}`);
  return response.data;
};

export default apiClient;
