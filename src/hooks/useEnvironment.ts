export type AppEnv = "production" | "development";

export function getAppEnv(): AppEnv {
  if (typeof window === "undefined") return "production";

  const host = window.location.hostname;

  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return "development";
  }
  if (host.includes("-dev")) {
    return "development";
  }

  return "production";
}

export function useEnvironment() {
  const env = getAppEnv();

  return {
    env,
    isProduction: env === "production",
    isDevelopment: env === "development",
  };
}
