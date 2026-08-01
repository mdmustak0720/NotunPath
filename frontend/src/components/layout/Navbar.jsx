// Purpose: Top navigation bar of the dashboard.

import useAuthStore from "../../store/authStore";

function Navbar() {

  // Logged-in user
  const { user } = useAuthStore();

  return (

    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#111827] px-8">

      {/* Left */}
      <div>

        <h2 className="text-2xl font-bold text-white">
          Dashboard
        </h2>

        <p className="text-sm text-gray-400">
          Welcome back, {user?.name}
        </p>

      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <img
          src={user?.picture}
          alt={user?.name}
          className="h-12 w-12 rounded-full border-2 border-cyan-400"
        />

      </div>

    </header>

  );

}

export default Navbar;