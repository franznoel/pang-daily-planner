"use client";

import { createTheme, Theme } from "@mui/material/styles";

export type ThemeId = 
  | "default-mui"
  | "groovy-vibes"
  | "neon-dreams"
  | "digital-dawn"
  | "viral-energy"
  | "future-fusion"
  | "rainbow-pride"
  | "bold-classic"
  | "sister-circle"
  | "brotherhood"
  | "matrix";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: "Generation" | "Identity" | "Classic";
  description: string;
  theme: Theme;
}

// Baby Boomers - Groovy Vibes (warm, earthy tones)
const groovyVibesTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#D2691E", // Chocolate/burnt orange
    },
    secondary: {
      main: "#8B4513", // Saddle brown
    },
    background: {
      default: "#FFF8DC", // Cornsilk
      paper: "#FAEBD7", // Antique white
    },
  },
  typography: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
});

// Generation X - Neon Dreams (bold 80s/90s colors)
const neonDreamsTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FF1493", // Deep pink
    },
    secondary: {
      main: "#00CED1", // Dark turquoise
    },
    background: {
      default: "#000000", // Black
      paper: "#1a1a1a", // Dark gray
    },
    text: {
      primary: "#00FF00", // Neon green
      secondary: "#FF00FF", // Neon magenta
    },
  },
  typography: {
    fontFamily: "'Courier New', 'Courier', monospace",
  },
});

// Millennials - Digital Dawn (modern tech colors)
const digitalDawnTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // Blue
    },
    secondary: {
      main: "#00bcd4", // Cyan
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

// Generation Z - Viral Energy (vibrant social media colors)
const viralEnergyTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FF6B9D", // Hot pink
    },
    secondary: {
      main: "#C724B1", // Purple
    },
    background: {
      default: "#FFF0F5", // Lavender blush
      paper: "#FFE4E1", // Misty rose
    },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
  },
});

// Generation Alpha - Future Fusion (futuristic colors)
const futureFusionTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00ffff", // Cyan
    },
    secondary: {
      main: "#ff00ff", // Magenta
    },
    background: {
      default: "#0a0a0a",
      paper: "#1a1a2e",
    },
  },
  typography: {
    fontFamily: "'Space Grotesk', 'Orbitron', sans-serif",
  },
});

// LGBT/Transgender - Rainbow Pride (rainbow colors)
const rainbowPrideTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#FF0080", // Pride pink
    },
    secondary: {
      main: "#7B68EE", // Medium slate blue
    },
    background: {
      default: "#FFF5FF", // Light lavender
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Helvetica', 'Arial', sans-serif",
  },
});

// Man - Bold Classic (traditional masculine colors)
const boldClassicTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1a237e", // Navy blue
    },
    secondary: {
      main: "#424242", // Dark gray
    },
    background: {
      default: "#eceff1", // Blue gray
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Merriweather', 'Georgia', serif",
  },
});

// Sorority - Sister Circle (elegant and warm)
const sisterCircleTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#AD1457", // Deep pink
    },
    secondary: {
      main: "#FFD700", // Gold
    },
    background: {
      default: "#FFF0F5", // Lavender blush
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
  },
});

// Fraternity - Brotherhood (bold and strong)
const brotherhoodTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#004D40", // Dark teal
    },
    secondary: {
      main: "#FFA000", // Amber
    },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "'Oswald', 'Arial Black', sans-serif",
  },
});

// Default MUI - Original Material UI theme
const defaultMuiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#9c27b0",
    },
  },
  typography: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
});

// Matrix - Green-on-black hacker aesthetic
const matrixTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00FF00", // Matrix green
    },
    secondary: {
      main: "#00CC00", // Darker green
    },
    background: {
      default: "#000000", // Black
      paper: "#0D0D0D", // Near black
    },
    text: {
      primary: "#00FF00", // Matrix green
      secondary: "#00CC00", // Darker green
    },
  },
  typography: {
    fontFamily: "'Courier New', 'Courier', monospace",
  },
});

export const themes: ThemeConfig[] = [
  {
    id: "default-mui",
    name: "Default MUI",
    category: "Classic",
    description: "Original Material UI theme",
    theme: defaultMuiTheme,
  },
  {
    id: "matrix",
    name: "Matrix",
    category: "Classic",
    description: "Green-on-black hacker aesthetic",
    theme: matrixTheme,
  },
  {
    id: "groovy-vibes",
    name: "Groovy Vibes",
    category: "Generation",
    description: "Baby Boomers - Warm and nostalgic",
    theme: groovyVibesTheme,
  },
  {
    id: "neon-dreams",
    name: "Neon Dreams",
    category: "Generation",
    description: "Generation X - Bold and electric",
    theme: neonDreamsTheme,
  },
  {
    id: "digital-dawn",
    name: "Digital Dawn",
    category: "Generation",
    description: "Millennials - Modern and tech-savvy",
    theme: digitalDawnTheme,
  },
  {
    id: "viral-energy",
    name: "Viral Energy",
    category: "Generation",
    description: "Generation Z - Vibrant and social",
    theme: viralEnergyTheme,
  },
  {
    id: "future-fusion",
    name: "Future Fusion",
    category: "Generation",
    description: "Generation Alpha - Futuristic and bold",
    theme: futureFusionTheme,
  },
  {
    id: "rainbow-pride",
    name: "Rainbow Pride",
    category: "Identity",
    description: "LGBT/Transgender - Colorful and expressive",
    theme: rainbowPrideTheme,
  },
  {
    id: "bold-classic",
    name: "Bold Classic",
    category: "Identity",
    description: "Masculine - Traditional and strong",
    theme: boldClassicTheme,
  },
  {
    id: "sister-circle",
    name: "Sister Circle",
    category: "Identity",
    description: "Sorority - Elegant and warm",
    theme: sisterCircleTheme,
  },
  {
    id: "brotherhood",
    name: "Brotherhood",
    category: "Identity",
    description: "Fraternity - Bold and united",
    theme: brotherhoodTheme,
  },
];

export const getThemeById = (id: ThemeId): ThemeConfig => {
  const theme = themes.find((t) => t.id === id);
  return theme || themes[0]; // Default to Default MUI
};

export const defaultThemeId: ThemeId = "default-mui";
