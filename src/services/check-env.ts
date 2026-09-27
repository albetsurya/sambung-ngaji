export function checkEnvironment() {

  if (import.meta.env.VITE_API_BASE_URL) {
  } else {
  }

  return import.meta.env;
}
