import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set, get) => ({
      // Add 'get' here to access store state
      user: null,
      isLoading: true, // Initial state is true
      _hasHydrated: false, // New state to track hydration status

      setUser: (userData) => {
        set({ user: userData, isLoading: false, _hasHydrated: true }); // Set hydrated on user login/set
        if (userData) {
        }
      },
      clearUser: () =>
        set({ user: null, isLoading: false, _hasHydrated: true }), // Set hydrated on logout/clear
      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (state) => {
        // New method to set hydration status
        set({
          _hasHydrated: state,
          isLoading: !state && get().isLoading, // Keep isLoading true if not hydrated
        });
      },
    }),
    {
      name: "user-storage",
      getStorage: () => localStorage,
    }
  )
);

// Update the useNavigationStore to ensure it works correctly with route persistence
export const useNavigationStore = create(
  persist(
    (set) => ({
      currentRoute: "/",
      setRoute: (route) => set({ currentRoute: route }),
      clearRoute: () => set({ currentRoute: "/" }),
    }),
    {
      name: "navigation-storage", // Unique name for local storage
      getStorage: () => (typeof window !== "undefined" ? localStorage : null),
    }
  )
);
