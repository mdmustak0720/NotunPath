// Purpose: Protect private routes.

import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

function ProtectedRoute({ children }) {

  // Authentication state
  const { isAuthenticated, isInitialized } = useAuthStore();

  // Wait until authentication has been restored
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712] text-white">
        Loading...
      </div>
    );
  }

  // Redirect if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Allow access
  return children;
}

export default ProtectedRoute;