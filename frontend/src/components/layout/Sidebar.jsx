/**
 * Sidebar
 *
 * Purpose:
 * Responsive main navigation for the authenticated
 * NotunPath workspace.
 */

import {
  LayoutDashboard,
  UserRound,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import useAuthStore from "../../store/authStore";

function Sidebar() {
  const navigate = useNavigate();

  const { logout } = useAuthStore();

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // -------------------------------------------------------
  // Close mobile drawer after route changes
  // -------------------------------------------------------

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  // -------------------------------------------------------
  // Logout
  // -------------------------------------------------------

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/");
  };

  // -------------------------------------------------------
  // Escape key
  // -------------------------------------------------------

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    if (isMobileOpen) {
      document.addEventListener(
        "keydown",
        handleEscape,
      );
    }

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [isMobileOpen]);

  // -------------------------------------------------------
  // Lock page scroll while mobile drawer is open
  // -------------------------------------------------------

  useEffect(() => {
    document.body.style.overflow =
      isMobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // -------------------------------------------------------
  // Navigation item
  // -------------------------------------------------------

  const navigationItemClass = ({ isActive }) => `
    flex
    w-full
    items-center
    gap-3
    rounded-xl
    px-4
    py-3
    text-sm
    font-medium
    transition-all
    duration-200
    outline-none
    focus-visible:ring-2
    focus-visible:ring-cyan-400
    focus-visible:ring-offset-2
    focus-visible:ring-offset-[#0B1120]

    ${
      isActive
        ? `
          bg-cyan-500
          text-white
          shadow-lg
          shadow-cyan-500/20
        `
        : `
          text-slate-400
          hover:bg-white/[0.06]
          hover:text-white
        `
    }
  `;

  // -------------------------------------------------------
  // Navigation
  // -------------------------------------------------------

  const Navigation = () => (
    <nav
      aria-label="Primary navigation"
      className="space-y-2"
    >

      <NavLink
        to="/dashboard"
        onClick={closeMobileMenu}
        className={navigationItemClass}
      >
        <LayoutDashboard
          size={19}
          strokeWidth={2}
          className="shrink-0"
        />

        <span>
          Dashboard
        </span>
      </NavLink>


      <NavLink
        to="/profile"
        onClick={closeMobileMenu}
        className={navigationItemClass}
      >
        <UserRound
          size={19}
          strokeWidth={2}
          className="shrink-0"
        />

        <span>
          My Profile
        </span>
      </NavLink>

    </nav>
  );

  // -------------------------------------------------------
  // Logo
  // -------------------------------------------------------

  const Logo = ({ mobile = false }) => (
    <div
      className="
        flex
        items-center
        justify-between
      "
    >

      <button
        type="button"
        onClick={() => {
          navigate("/dashboard");
          closeMobileMenu();
        }}
        className="
          text-left
          text-2xl
          font-black
          tracking-tight
          text-cyan-400
          transition-colors
          hover:text-cyan-300
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-cyan-400
          focus-visible:ring-offset-4
          focus-visible:ring-offset-[#0B1120]
        "
      >
        NotunPath
      </button>

      {mobile && (
        <button
          type="button"
          onClick={closeMobileMenu}
          aria-label="Close navigation"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-white/5
            hover:text-white
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-cyan-400
          "
        >
          <X size={20} />
        </button>
      )}

    </div>
  );

  // -------------------------------------------------------
  // Logout button
  // -------------------------------------------------------

  const LogoutButton = () => (
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
        text-left
        text-sm
        font-medium
        text-red-400
        transition-all
        duration-200
        hover:border-red-500/60
        hover:bg-red-500
        hover:text-white
        hover:shadow-lg
        hover:shadow-red-500/20
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-red-400
        focus-visible:ring-offset-2
        focus-visible:ring-offset-[#0B1120]
      "
    >
      <LogOut
        size={19}
        strokeWidth={2}
        className="shrink-0"
      />

      <span>
        Logout
      </span>
    </button>
  );

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className="
          hidden
          h-screen
          w-64
          shrink-0
          flex-col
          justify-between
          border-r
          border-white/10
          bg-[#0B1120]
          px-5
          py-6
          lg:flex
        "
      >

        <div>

          <Logo />

          <div className="mt-10">
            <Navigation />
          </div>

        </div>

        <LogoutButton />

      </aside>


      {/* =====================================================
          MOBILE MENU BUTTON
      ====================================================== */}

      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation"
          aria-expanded={false}
          className="
            fixed
            left-3
            top-3
            z-[60]
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-[#0B1120]/95
            text-slate-300
            shadow-lg
            backdrop-blur-xl
            transition-all
            duration-200
            hover:border-cyan-400/40
            hover:text-cyan-400
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-cyan-400
            lg:hidden
          "
        >
          <Menu size={20} />
        </button>
      )}


      {/* =====================================================
          MOBILE BACKDROP
      ====================================================== */}

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
          className="
            fixed
            inset-0
            z-40
            cursor-default
            bg-black/65
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}


      {/* =====================================================
          MOBILE DRAWER
      ====================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[280px]
          max-w-[82vw]
          flex-col
          justify-between
          border-r
          border-white/10
          bg-[#0B1120]
          px-5
          py-6
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          lg:hidden

          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
        aria-label="Mobile navigation"
      >

        <div>

          <Logo mobile />

          <div className="mt-10">
            <Navigation />
          </div>

        </div>

        <LogoutButton />

      </aside>
    </>
  );
}

export default Sidebar;