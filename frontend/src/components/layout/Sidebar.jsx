/**
 * Sidebar
 *
 * Purpose:
 * Main navigation for the authenticated NotunPath workspace.
 */

import {
  LayoutDashboard,
  UserRound,
  LogOut,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

import useAuthStore from "../../store/authStore";


function Sidebar() {

  // React Router
  const navigate = useNavigate();
  const location = useLocation();

  // Zustand logout
  const { logout } = useAuthStore();


  // -------------------------------------------------------
  // Logout
  // -------------------------------------------------------

  const handleLogout = () => {

    logout();

    navigate("/");
  };


  // -------------------------------------------------------
  // Navigation helper
  // -------------------------------------------------------

  const handleNavigation = (path) => {

    navigate(path);
  };


  // -------------------------------------------------------
  // Active route
  // -------------------------------------------------------

  const isDashboardActive =
    location.pathname === "/dashboard";

  const isProfileActive =
    location.pathname === "/profile";


  return (

    <aside
      className="
        flex
        h-screen
        w-64
        shrink-0
        flex-col
        justify-between
        border-r
        border-white/10
        bg-[#0B1120]
        p-6
      "
    >

      {/* -------------------------------------------------
          Logo
      -------------------------------------------------- */}

      <div>

        <h1
          className="
            mb-10
            text-3xl
            font-black
            tracking-tight
            text-cyan-400
          "
        >
          NotunPath
        </h1>


        {/* -------------------------------------------------
            Navigation
        -------------------------------------------------- */}

        <nav className="space-y-2">

          {/* Dashboard */}

          <button
            type="button"
            onClick={() =>
              handleNavigation("/dashboard")
            }
            className={`
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              font-medium
              transition-all
              duration-200
              ${
                isDashboardActive
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }
            `}
          >

            <LayoutDashboard size={20} />

            <span>
              Dashboard
            </span>

          </button>


          {/* My Profile */}

          <button
            type="button"
            onClick={() =>
              handleNavigation("/profile")
            }
            className={`
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              font-medium
              transition-all
              duration-200
              ${
                isProfileActive
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }
            `}
          >

            <UserRound size={20} />

            <span>
              My Profile
            </span>

          </button>

        </nav>

      </div>


      {/* -------------------------------------------------
          Logout
      -------------------------------------------------- */}

      <button
        type="button"
        onClick={handleLogout}
        className="
          flex
          w-full
          items-center
          gap-3
          rounded-xl
          border
          border-red-500/30
          px-4
          py-3
          font-medium
          text-red-400
          transition-all
          duration-200
          hover:bg-red-500
          hover:text-white
          hover:shadow-lg
          hover:shadow-red-500/20
        "
      >

        <LogOut size={20} />

        <span>
          Logout
        </span>

      </button>

    </aside>
  );
}

export default Sidebar;