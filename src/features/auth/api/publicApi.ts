import { restGet, restPost } from "../../../services/apiClient";

export interface SubmitRegistrationPayload {
  group_id?: string;
  nama_lengkap: string;
  nama_panggilan?: string;
  jenis_kelamin: "L" | "P";
  tempat_lahir?: string;
  tanggal_lahir?: string;
  no_wa: string;
  alamat_rumah?: string;
  desa?: string;
  daerah?: string;
  pekerjaan?: string;
  hobi?: string;
  is_nikah?: boolean;
  jenjang_pendidikan?: string;
  sekolah?: string;
  jurusan?: string;
  tahun_mulai_pendidikan?: string;
  tahun_selesai_pendidikan?: string;
  foto_url?: string;
  username: string;
  password: string;
  _client_ip?: string;
}

export interface SubmitRegistrationResponse {
  submission_id: string;
  nama_lengkap: string;
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
