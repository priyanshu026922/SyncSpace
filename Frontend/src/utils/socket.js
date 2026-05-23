/**
 * Socket.io Configuration and Management
 * Handles real-time communication with the backend
 */

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

/**
 * Socket instance - initialized lazily when token is available
 */
let socket = null;

/**
 * Get or create socket connection
 * Call this after user is authenticated to ensure token is available
 * @returns {Object} Socket instance
 */
export const getSocket = () => {
  if (socket && socket.connected) {
    console.log("🔗 Reusing existing socket connection");
    return socket;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("⚠️ No token available for socket connection!");
  } else {
    console.log("✅ Token found, creating socket with auth");
  }

  // Use auth option instead of extraHeaders - this is the standard socket.io way
  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
    timeout: 20000,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Connection event listeners for debugging
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("unauthorized", (msg) => {
    console.error("❌ Unauthorized socket:", msg);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });

  return socket;
};

/**
 * Disconnect socket and clear instance
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected");
  }
};

/**
 * Reconnect socket with new token (useful after login)
 */
export const reconnectSocket = () => {
  disconnectSocket();
  return getSocket();
};

/**
 * Emit event through socket
 * @param {string} event - Event name
 * @param {*} data - Event data
 */
export const emitSocketEvent = (event, data) => {
  const s = getSocket();
  if (s && s.connected) {
    s.emit(event, data);
  } else {
    console.warn(`⚠️ Socket not connected, event "${event}" not sent`);
  }
};

/**
 * Listen to socket event
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 * @returns {Function} Function to remove listener
 */
export const onSocketEvent = (event, callback) => {
  const s = getSocket();
  if (s) {
    s.on(event, callback);
    return () => s.off(event, callback);
  }
  return () => {};
};

// Default export for backward compatibility
export default socket;