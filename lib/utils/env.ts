/**
 * Environment helper utilities
 * Provides type-safe access to environment variables
 */

export function getEnvironment(): "development" | "production" {
  // Default to development if NODE_ENV is not set
  return (process.env.NODE_ENV === "production" ? "production" : "development");
}

export function isProduction(): boolean {
  return getEnvironment() === "production";
}

export function isDevelopment(): boolean {
  return getEnvironment() === "development";
}

/**
 * Get environment variable with validation
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
}

