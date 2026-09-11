// debug.ts
import { API_BASE_URL } from "../constants";

export async function debugApi() {
  console.log("=== DEBUG API ===");
  console.log("API_BASE_URL:", API_BASE_URL);

  // Test 1: Direct fetch with form data
  console.log("\n📌 Test 1: Direct fetch with form data");
  try {
    const formData = new URLSearchParams();
    formData.append("action", "login");
    formData.append("username", "superadmin");
    formData.append("password", "ganti123");

    const response = await fetch(API_BASE_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: formData.toString(),
    });

    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log("Response:", text.substring(0, 500));

    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON:", json);
      return json;
    } catch {
      console.error("Not valid JSON");
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Jalankan di console: debugApi()
