/**
 * Navbar
 *
 * Purpose:
 * Top navigation/header for the authenticated
 * NotunPath workspace.
 *
 * Responsive behavior:
 * - Mobile: compact header with reserved space for menu button
 * - Desktop: full dashboard header
 */

import { UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useAuthStore from "../../store/authStore";

function Navbar() {
  // -------------------------------------------------------
  // Authentication
  // -------------------------------------------------------

  const { user } = useAuthStore();

  // -------------------------------------------------------
  // Navigation
  // -------------------------------------------------------

  const navigate = useNavigate();

  // -------------------------------------------------------
  // User information
  // -------------------------------------------------------

  const userName = user?.name || "User";

  const userInitial =
    userName
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        min-h-[68px]
        w-full
        items-center
        justify-between
        border-b
        border-white/10
        bg-[#111827]/95
        px-4
        pl-16
        backdrop-blur-xl

        sm:px-6
        sm:pl-16

        lg:min-h-[72px]
        lg:px-8
        lg:pl-8
      "
    >
      {/* =================================================
          LEFT — PAGE CONTEXT
      ================================================== */}

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <h1
          className="
            truncate
            text-lg
            font-semibold
            tracking-tight
            text-white

            sm:text-xl

            lg:text-2xl
          "
        >
          Dashboard
        </h1>

        <p
          className="
            mt-0.5
            truncate
            text-xs
            text-slate-400

            sm:text-sm
          "
        >
          Welcome back,{" "}
          <span className="text-slate-300">
            {userName}
          </span>
        </p>
      </div>


      {/* =================================================
          RIGHT — USER PROFILE
      ================================================== */}

      <button
        type="button"
        onClick={() => navigate("/profile")}
        aria-label="Open my profile"
        className="
          ml-4
          flex
          shrink-0
          items-center
          justify-center
          rounded-full
          outline-none
          transition-transform
          duration-200
          hover:scale-105
          focus-visible:ring-2
          focus-visible:ring-cyan-400
          focus-visible:ring-offset-2
          focus-visible:ring-offset-[#111827]
        "
      >

        {user?.picture ? (
          <img
            src={user.picture}
            alt={userName}
            className="
              h-10
              w-10
              rounded-full
              border-2
              border-cyan-400
              object-cover
              shadow-lg
              shadow-cyan-500/10

              sm:h-11
              sm:w-11

              lg:h-12
              lg:w-12
            "
          />
        ) : (
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border-2
              border-cyan-400
              bg-gradient-to-br
              from-cyan-500/20
              to-purple-500/30
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-cyan-500/10

              sm:h-11
              sm:w-11

              lg:h-12
              lg:w-12
            "
          >
            {userInitial}
          </div>
        )}

      </button>

    </header>
  );
}

export default Navbar;