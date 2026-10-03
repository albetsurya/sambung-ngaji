import { call } from "../services/api";

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TIM_KU"
  | "TIM_PNKB"
  | "TIM_ABSENSI"
  | "PENGAWAS"
  | "MEMBER";

export type MemberCategory =
  | "BALITA"
  | "CABERAWIT"
  | "PRA_REMAJA"
  | "REMAJA"
  | "PRA_NIKAH"
  | "DEWASA"
  | "ISTIMEWA";

export type AttendanceStatus =
  | "HADIR"
  | "IZIN"
  | "SAKIT"
  | "ALPA";

export type MonitoringStatus =
  | "AKTIF"
  | "PERLU_PERHATIAN"
  | "KURANG_AKTIF"
  | "TIDAK_AKTIF";

export type AnnouncementStatus = "DRAFT" | "READY" | "SHARED" | "CANCELLED";

export type PendingStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface User {
  user_id: string;
  username: string;
  name: string;
  role: Role;
  group_id?: string;
  member_id?: string;
  gender?: string;
  photo_url?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface Member {
  member_id: string;
  group_id?: string;
  group_name?: string;
  full_name: string;
  nickname?: string;
  gender?: "L" | "P" | "";
  birth_place?: string;
  birth_date?: string;
  group_label?: string;
  village?: string;
  region?: string;
  home_address?: string;
  whatsapp_number?: string;
  is_preacher?: boolean;
  is_employed?: boolean;
  is_married?: boolean;
  height?: string | number;
  weight?: string | number;
  hobby?: string;
  occupation?: string;
  photo_url?: string;
  has_user?: boolean;
  mentoring_status?: MonitoringStatus;
  is_active?: boolean;
  joined_date?: string;
  left_date?: string;
  kategori?: MemberCategory;
  usia?: number | null;
  education_level?: string;
  school?: string;
  major?: string;
  education_start_year?: string | number;
  education_end_year?: string | number;
  updated_at?: string;
  pendidikan?: Education[];
}

export interface Education {
  education_id: string;
  member_id: string;
  level: string;
  school?: string;
  major?: string;
  grade?: string | number;
  start_year?: string | number;
  end_year?: string | number;
  status?: string;
}

export interface Group {
  group_id: string;
  group_code: string;
  group_name: string;
  mentor?: string;
  signatory?: string;
  schedule?: string;
  is_active?: boolean;
}

export interface Meeting {
  meeting_id: string;
  date: string;
  day: string;
  time: string;
  group_id: string;
  event: string;
  topic?: string;
  status: string;
  notes?: string;
  target_categories?: MemberCategory[];
  /* "" = semua (UI saja); null = semua (format database, lolos CHECK) */
  gender_target?: "" | "L" | "P" | null;
  send_reminder?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  attendance_id: string;
  meeting_id: string;
  member_id: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface MyAttendanceEntry {
  attendance_id: string;
  meeting_id: string;
  status: AttendanceStatus;
  status_meeting?: string;
  notes?: string;
  date: string;
  day: string;
  event: string;
  time: string;
  created_at?: string;
}

export interface MonitoringEntry {
  monitoring_id: string;
  member_id: string;
  date: string;
  type?: string;
  status: MonitoringStatus;
  notes?: string;
  follow_up?: string;
  created_at?: string;
}

export interface AnnouncementTemplate {
  template_id: string;
  template_name: string;
  kode: string;
  template_body: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Announcement {
  announcement_id: string;
  template_id: string;
  group_id: string;
  date: string;
  day: string;
  time?: string;
  event?: string;
  topic?: string;
  notes?: string;
  generated_text: string;
  status: AnnouncementStatus;
}

export interface AttentionItem {
  member_id: string;
  full_name: string;
  photo_url?: string;
  reasons: string[];
}

export interface DashboardGeneral {
  total_jamaah: number;
  total_jamaah_aktif: number;
  per_kategori: Record<MemberCategory, number>;
  rata_rata_kehadiran: number;
  pengajian_terdekat: {
    meeting_id: string;
    date: string;
    day: string;
    event?: string;
  } | null;
  jamaah_perlu_perhatian: AttentionItem[];
  data_belum_lengkap: number;
  user_aktif?: number;
}

export interface DashboardPNKB {
  total: number;
  aktif: number;
  perlu_perhatian: number;
  kehadiran: number;
  data_belum_lengkap: number;
}

export interface DashboardAbsensiCategory {
  kategori: MemberCategory[];
  is_semua: boolean;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  total_absen: number;
  total_target: number;
  meeting_count: number;
  persentase: number;
}

export interface DashboardAbsensi {
  pengajian_hari_ini: {
    meeting_id: string;
    date: string;
    time: string;
    event: string;
    group_id: string;
    target_categories: MemberCategory[];
  }[];
  jumlah_jamaah: number;
  total_target: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  by_category: DashboardAbsensiCategory[];
}

export interface PendingMember {
  submission_id: string;
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
  is_married: boolean;
  education_level?: string;
  school?: string;
  major?: string;
  education_start_year?: string;
  education_end_year?: string;
  photo_url?: string;
  username?: string;
  status: PendingStatus;
  submitted_at: string;
  submitted_ip?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_member_id?: string;
}

export interface AiUsageEntry {
  usage_id: string;
  user_id: string;
  user_name: string;
  role: Role;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  timestamp: string;
}

export interface MemberUserStatus {
  has_user: boolean;
  user: User | null;
}

export interface Streaks {
  sholat: number;
  dzikir: number;
  tahfidz: number;
  quran: number;
}

export interface FridaySchedule {
  friday_id: string;
  date: string;
  day: string;
  sermon_leader: string;
  muadzin: string;
  advisor: string;
  parking_attendant: string;
  footwear_attendant: string;
  notes: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  reminder_sent_at?: string;
}
