export type AppEnv = "production" | "development";

export function getAppEnv(): AppEnv {
  const envFromVar = import.meta.env.VITE_APP_ENV as string | undefined;

  if (envFromVar === "production") return "production";
  if (envFromVar === "development") return "development";

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      return "development";
    }
    if (host.includes("-git-develop") || host.includes("-git-dev")) {
      return "development";
    }
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
