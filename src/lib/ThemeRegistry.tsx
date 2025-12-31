"use client";

import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeContextProvider, useTheme } from "./ThemeContext";
import { getThemeById } from "./themes";

function ThemeProviderWithContext({ children }: { children: React.ReactNode }) {
  const { themeId } = useTheme();
  const theme = getThemeById(themeId).theme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContextProvider>
      <ThemeProviderWithContext>{children}</ThemeProviderWithContext>
    </ThemeContextProvider>
  );
}
