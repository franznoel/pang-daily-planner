"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ThemeId, defaultThemeId } from "./themes";

interface ThemeContextType {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "pang-planner-theme";

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(defaultThemeId);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      setThemeIdState(savedTheme as ThemeId);
    }
  }, []);

  // Save theme to localStorage when it changes
  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    if (mounted) {
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
