// Purpose: Restore authentication state when the app starts.

import { useEffect } from "react";
import useAuthStore from "../store/authStore";

function useAuthLoader() {

  // Zustand function
  const { loadUser } = useAuthStore();

  // Run once when app loads
  useEffect(() => {
    loadUser();
  }, [loadUser]);

}

export default useAuthLoader;