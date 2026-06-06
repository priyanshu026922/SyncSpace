

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;

/**
 * Get or create socket connection
 * Call this after user is authenticated to ensure token is available
 * @returns {Object} Socket instance
 */
export const getSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem("token");

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


  socket.on("unauthorized", (msg) => {
    console.error(" Unauthorized socket:", msg);
  });

  return socket;
};


export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

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

export default socket;