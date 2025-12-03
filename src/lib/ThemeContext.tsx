"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ThemeId, defaultThemeId } from "./themes";

interface ThemeContextType {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "pang-planner-theme";

// Valid theme IDs for validation
const validThemes: ThemeId[] = [
  "default-mui",
  "matrix",
  "groovy-vibes",
  "neon-dreams",
  "digital-dawn",
  "viral-energy",
  "future-fusion",
  "rainbow-pride",
  "bold-classic",
  "sister-circle",
  "brotherhood",
];

// Helper function to get initial theme from localStorage
function getInitialTheme(): ThemeId {
  if (typeof window === "undefined") {
    return defaultThemeId;
  }
  
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme && validThemes.includes(savedTheme as ThemeId)) {
    return savedTheme as ThemeId;
  }
  
  return defaultThemeId;
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(getInitialTheme);

  // Save theme to localStorage when it changes
  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    }
  };

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
}
