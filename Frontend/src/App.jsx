import React from "react";
import { BrowserRouter as Router, Route, Routes, useParams, Navigate } from "react-router-dom";

import Board from "./components/Board/index.jsx";
import Toolbar from "./components/Toolbar/index.jsx";
import Toolbox from "./components/Toolbox/index.jsx";
import Sidebar from "./components/Sidebar/index.jsx";

import BoardProvider from "./store/BoardProvider.jsx";
import ToolboxProvider from "./store/ToolboxProvider.jsx";

import Login from "./components/Login/index.jsx";
import Register from "./components/Register/index.jsx";
import LandingPage from "./components/LandingPage/index.jsx";
import Dashboard from "./components/Dashboard/index.jsx";
import About from "./components/About/index.jsx";
import Help from "./components/Help/index.jsx";

function WhiteboardApp() {
  const { id } = useParams();
  return (
    <ToolboxProvider>
      <div className="app-container">
        <Toolbar />
        <Board id={id} />
        <Toolbox />
        <Sidebar />
      </div>
    </ToolboxProvider>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <BoardProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard – main post-login hub */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Whiteboard with required canvas ID */}
          <Route
            path="/whiteboard/:id"
            element={
              <PrivateRoute>
                <WhiteboardApp />
              </PrivateRoute>
            }
          />

          {/* /whiteboard (no id) → redirect to dashboard */}
          <Route
            path="/whiteboard"
            element={
              <PrivateRoute>
                <Navigate to="/dashboard" replace />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BoardProvider>
    </Router>
  );
}

export default App;