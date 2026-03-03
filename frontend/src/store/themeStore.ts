import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeState = {
  isDark: boolean;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false, // Default Light Mode for Admin Panel
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: "agro-theme-storage",
    },
  ),
);
