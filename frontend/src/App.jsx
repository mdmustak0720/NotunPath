// Purpose: Defines all application routes.

import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Profile from "./pages/Profile";

// Custom hook to restore authentication
import useAuthLoader from "./hooks/useAuthLoader";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

function App() {

  // Restore authentication when app starts
  useAuthLoader();

  return (
    <Routes>

      {/* Public Route */}
      <Route
        path="/"
        element={<Login />}
      />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;