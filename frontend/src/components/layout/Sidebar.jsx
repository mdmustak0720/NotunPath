// Purpose: Left navigation sidebar for the dashboard.

import { LayoutDashboard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function Sidebar() {

  // React Router
  const navigate = useNavigate();

  // Zustand logout function
  const { logout } = useAuthStore();

  // Logout user
  const handleLogout = () => {

    logout();
    navigate("/");

  };

  return (

    <aside className="flex h-screen w-64 flex-col justify-between border-r border-white/10 bg-[#0B1120] p-6">

      {/* Logo */}
      <div>

        <h1 className="mb-10 text-3xl font-black text-cyan-400">
          NotunPath
        </h1>

        {/* Navigation */}
        <nav className="space-y-3">

          <button className="flex w-full items-center gap-3 rounded-xl bg-cyan-500 px-4 py-3 font-medium text-white">

            <LayoutDashboard size={20} />

            Dashboard

          </button>

        </nav>

      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl border border-red-500 px-4 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
      >

        <LogOut size={20} />

        Logout

      </button>

    </aside>

  );

}

export default Sidebar;