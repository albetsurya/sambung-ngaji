// utils/check-env.ts
export function checkEnvironment() {
  console.log("=== 🌍 ENVIRONMENT CHECK ===");
  console.log("Mode:", import.meta.env.MODE);
  console.log("PROD:", import.meta.env.PROD);
  console.log("DEV:", import.meta.env.DEV);
  console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
  console.log("All env:", import.meta.env);

  // Check if URL is accessible
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log("✅ API_BASE_URL is set");
  } else {
    console.error("❌ API_BASE_URL is NOT set");
  }

  return import.meta.env;
}
