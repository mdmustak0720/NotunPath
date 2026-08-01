// Purpose: Global authentication state using Zustand.

import { create } from "zustand";

// Create global auth store
const useAuthStore = create((set) => ({

  // Logged-in user information
  user: null,

  // JWT token
  token: null,

  // Login status
  isAuthenticated: false,
  isInitialized: false,

  // Save user after successful login
  login: (user, token) => {

    // Save in browser
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    // Update global state
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  // Logout user
  logout: () => {

    // Remove browser storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Reset global state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Restore session after refresh
  loadUser: () => {

    // Read browser storage
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    // Restore if available
    if (user && token) {
      set({
        user,
        token,
        isAuthenticated: true,
        isInitialized:true,
      });
    }else{
        set({
            isInitialized:true,
        });
    }
  },

}));

export default useAuthStore;