import { API_BASE_URL } from "../constants";

export async function debugApi() {

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


    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return json;
    } catch {
      return null;
    }
  } catch (error) {
    return null;
  }
}

