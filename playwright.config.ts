import { defineConfig, devices } from "@playwright/test";

// Pruebas de navegador. Levantan `next dev` con el acceso de prueba activado.
// Usan la base de DATABASE_URL de .env.local (rama dev). Nunca producción.
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { E2E_TEST_LOGIN: "1" },
  },
});
