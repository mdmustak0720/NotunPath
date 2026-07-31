// Purpose: Welcome page after successful Google login.

import { useNavigate } from "react-router-dom";

function Welcome() {
  // Get saved user information
  const user = JSON.parse(localStorage.getItem("user"));

  // React Router navigation
  const navigate = useNavigate();

  // Logout function
  const handleLogout = () => {
    // Remove saved data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Go back to login page
    navigate("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030712] px-6">

      {/* Welcome Card */}
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">

        {/* Profile Picture */}
        <img
          src={user?.picture}
          alt="Profile"
          className="mx-auto mb-6 h-28 w-28 rounded-full border-4 border-cyan-400 object-cover"
        />

        {/* Welcome */}
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
          ✅ Successfully logged in
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