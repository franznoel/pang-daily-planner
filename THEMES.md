# Theme Selection Feature

The Pang Daily Planner now includes a comprehensive theme selection feature that allows users to personalize their experience with themes representing different generations and identities.

## How to Use

1. **Access the Theme Selector**: Click on your profile avatar in the top-right corner of the app
2. **Select "Select Theme"**: Choose the "Select Theme" option from the dropdown menu
3. **Browse Themes**: A dialog will open showing all available themes organized by category
4. **Pick Your Theme**: Click on any theme to apply it immediately
5. **Enjoy**: Your theme preference is automatically saved in your browser's local storage

## Available Themes

### Generation Themes

These themes are inspired by different generational characteristics and aesthetics:

#### **Groovy Vibes** (Baby Boomers)
- **Description**: Warm and nostalgic
- **Colors**: Earthy tones with chocolate and burnt orange
- **Font**: Classic Georgia serif
- **Vibe**: Peaceful, retro, and comforting

#### **Neon Dreams** (Generation X)
- **Description**: Bold and electric
- **Colors**: Neon pink, turquoise, and electric greens on dark backgrounds
- **Font**: Monospace Courier New
- **Vibe**: 80s/90s cyberpunk aesthetic

#### **Digital Dawn** (Millennials)
- **Description**: Modern and tech-savvy
- **Colors**: Clean blues and cyans
- **Font**: Contemporary Roboto
- **Vibe**: Professional, digital-first, minimalist
- **Note**: This is the default theme

#### **Viral Energy** (Generation Z)
- **Description**: Vibrant and social
- **Colors**: Hot pink and purple with soft backgrounds
- **Font**: Modern Inter
- **Vibe**: Social media aesthetic, energetic, friendly

#### **Future Fusion** (Generation Alpha)
- **Description**: Futuristic and bold
- **Colors**: Cyan and magenta on dark backgrounds
- **Font**: Space-age fonts
- **Vibe**: Cutting-edge, tech-forward, immersive

### Identity Themes

These themes celebrate different identities and communities:

#### **Rainbow Pride** (LGBT/Transgender)
- **Description**: Colorful and expressive
- **Colors**: Pride pink and purple with light backgrounds
- **Font**: Friendly Poppins
- **Vibe**: Inclusive, vibrant, celebratory

#### **Bold Classic** (Masculine)
- **Description**: Traditional and strong
- **Colors**: Navy blue and dark gray
- **Font**: Elegant Merriweather serif
- **Vibe**: Timeless, confident, professional

#### **Sister Circle** (Sorority)
- **Description**: Elegant and warm
- **Colors**: Deep pink and gold
- **Font**: Sophisticated Playfair Display
- **Vibe**: Sisterhood, elegance, community

#### **Brotherhood** (Fraternity)
- **Description**: Bold and united
- **Colors**: Dark teal and amber
- **Font**: Strong Oswald
- **Vibe**: Unity, strength, tradition

## Technical Implementation

### Files Added/Modified

1. **`src/lib/themes.ts`**: Defines all theme configurations with MUI theme objects
2. **`src/lib/ThemeContext.tsx`**: React context for managing theme state with localStorage persistence
3. **`src/lib/ThemeRegistry.tsx`**: Updated to use dynamic theme from context
4. **`src/components/ThemeDialog.tsx`**: Dialog component for theme selection UI
5. **`src/components/AppBar.tsx`**: Updated to include theme selection menu item

### Architecture

- **Theme Persistence**: User theme preferences are saved to browser localStorage
- **Context API**: Uses React Context for global theme state management
- **MUI Integration**: Fully integrated with Material-UI theming system
- **Type Safety**: Complete TypeScript support for all theme operations

### Adding New Themes

To add a new theme:

1. Create a new theme using `createTheme()` in `src/lib/themes.ts`
2. Add a new `ThemeId` to the type union
3. Create a `ThemeConfig` object with id, name, category, description, and theme
4. Add the theme to the `themes` array

Example:
```typescript
const myNewTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#YOUR_COLOR" },
    secondary: { main: "#YOUR_COLOR" },
  },
});

// Add to themes array
{
  id: "my-new-theme",
  name: "My New Theme",
  category: "Generation" or "Identity",
  description: "A description",
  theme: myNewTheme,
}
```

## Browser Compatibility

The theme system works in all modern browsers that support:
- localStorage API
- CSS custom properties
- MUI v7 requirements

## Future Enhancements

Potential improvements for the theme system:
- Custom theme creation by users
- Theme preview before applying
- Dark/light mode toggle per theme
- Theme export/import functionality
- Seasonal or event-based themes
