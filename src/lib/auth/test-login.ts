// Acceso de prueba para pruebas automáticas. Solo existe en desarrollo local.
// Nunca se habilita en producción ni en un deploy de Vercel.

export function testLoginEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === "development" && env.E2E_TEST_LOGIN === "1" && !env.VERCEL && !env.VERCEL_ENV;
}
