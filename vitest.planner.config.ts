import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  optimizeDeps: {
    include: ['react', 'react-dom/client', '@emotion/react', '@emotion/styled', '@mui/material', '@mui/x-date-pickers/DatePicker', '@mui/x-date-pickers/PickersDay', '@mui/x-date-pickers/TimePicker', '@mui/x-date-pickers/LocalizationProvider', '@mui/x-date-pickers/AdapterDayjs'],
  },
  test: {
    include: ['tests/**/*.test.tsx'],
    browser: {
      enabled: true,
      headless: true,
      viewport: { width: 390, height: 844 },
      provider: playwright({ launchOptions: process.env.TEST_BROWSER_PATH ? { executablePath: process.env.TEST_BROWSER_PATH } : {} }),
      instances: [{ browser: 'chromium' }],
    },
  },
});
