import { restGet, restPost } from "../../../services/apiClient";

export interface SubmitRegistrationPayload {
  group_id?: string;
  full_name: string;
  nickname?: string;
  gender: "L" | "P";
  birth_place?: string;
  birth_date?: string;
  whatsapp_number: string;
  home_address?: string;
  village?: string;
  region?: string;
  occupation?: string;
  hobby?: string;
  is_married?: boolean;
  education_level?: string;
  school?: string;
  major?: string;
  education_start_year?: string;
  education_end_year?: string;
  photo_url?: string;
  username: string;
  password: string;
  _client_ip?: string;
}

export interface SubmitRegistrationResponse {
  submission_id: string;
  full_name: string;
  submitted_at: string;
}

export interface CheckUsernameResult {
  available: boolean;
  reason?: "invalid" | "taken" | "pending";
}

async function getClientIp(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    if (!res.ok) return "unknown";
    const data = await res.json();
    return String(data.ip || "unknown");
  } catch {
    return "unknown";
  }
}

export const publicApi = {
  listGroups: () =>
    restGet<{ group_id: string; group_name: string }[]>(
      "/api/v1/public/groups",
      {},
    ),  submitRegistration: async (
    payload: SubmitRegistrationPayload,
  ): Promise<SubmitRegistrationResponse> => {
    const clientIp = await getClientIp();
    return restPost<SubmitRegistrationResponse>("/api/v1/public/register", {
      ...payload,
      _client_ip: clientIp,
    });
  },

  checkUsername: (username: string) =>
    restGet<CheckUsernameResult>("/api/v1/public/check-username", { username }),
};
