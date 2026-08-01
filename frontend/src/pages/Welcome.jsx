// Purpose: Welcome page after successful login.

import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

function Welcome() {

  // Get user and logout function from Zustand
  const { user, logout } = useAuthStore();

  // React Router navigation
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {

    // Clear authentication
    logout();

    // Go back to login page
    navigate("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030712] px-6">

      {/* Welcome Card */}
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">

        {/* Profile Picture */}
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-cyan-400">

          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl font-bold text-white">
              {user?.name?.charAt(0)}
            </span>
          )}

        </div>

        {/* Welcome Text */}
        <h1 className="text-4xl font-bold text-white">
          Welcome,
        </h1>

        <h2 className="mt-2 text-2xl font-semibold text-cyan-300">
          {user?.name}
        </h2>

        {/* Email */}
        <p className="mt-4 text-gray-400">
          {user?.email}
        </p>

        {/* Status */}
        <p className="mt-8 text-green-400">
          ✅ Successfully Logged In
        </p>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-8 w-full rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600"
        >
          Logout
        </button>

      </section>

    </main>
  );
}

export default Welcome;