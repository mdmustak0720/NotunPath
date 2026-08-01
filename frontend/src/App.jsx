// Purpose: Defines all application routes.

import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Welcome from "./pages/Welcome";

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

      {/* Protected Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;