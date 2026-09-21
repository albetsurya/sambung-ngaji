import { call } from "../services/api";

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
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
  nama: string;
  role: Role;
  member_id?: string;
  jenis_kelamin?: string;
  status_aktif?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface Member {
  member_id: string;
  nama_lengkap: string;
  nama_panggilan?: string;
  jenis_kelamin?: "L" | "P" | "";
  tempat_lahir?: string;
  tanggal_lahir?: string;
  kelompok?: string;
  desa?: string;
  daerah?: string;
  alamat_rumah?: string;
  no_wa?: string;
  is_muballigh?: boolean;
  is_kerja?: boolean;
  is_nikah?: boolean;
  tinggi_badan?: string | number;
  berat_badan?: string | number;
  hobi?: string;
  pekerjaan?: string;
  foto_url?: string;
  status_pembinaan?: MonitoringStatus;
  status_aktif?: boolean;
  tanggal_masuk?: string;
  tanggal_keluar?: string;
  kategori?: MemberCategory;
  usia?: number | null;
  jenjang_pendidikan?: string;
  sekolah?: string;
  jurusan?: string;
  tahun_mulai_pendidikan?: string | number;
  tahun_selesai_pendidikan?: string | number;
  updated_at?: string;
  pendidikan?: Education[];
}

export interface Education {
  education_id: string;
  member_id: string;
  jenjang: string;
  sekolah?: string;
  jurusan?: string;
  kelas?: string | number;
  tahun_mulai?: string | number;
  tahun_selesai?: string | number;
  status?: string;
}

export interface Group {
  group_id: string;
  group_code: string;
  group_name: string;
  pembina?: string;
  penandatangan?: string;
  jadwal?: string;
  status_aktif?: boolean;
}

export interface Meeting {
  meeting_id: string;
  tanggal: string;
  hari: string;
  jam: string;
  group_id: string;
  acara: string;
  materi?: string;
  status: string;
  catatan?: string;
  kategori_target?: MemberCategory[];
  gender_target?: "" | "L" | "P";
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  attendance_id: string;
  meeting_id: string;
  member_id: string;
  status: AttendanceStatus;
  catatan?: string;
}

export interface MyAttendanceEntry {
  attendance_id: string;
  meeting_id: string;
  status: AttendanceStatus;
  status_meeting?: string;
  catatan?: string;
  tanggal: string;
  hari: string;
  acara: string;
  jam: string;
  created_at?: string;
}

export interface MonitoringEntry {
  monitoring_id: string;
  member_id: string;
  tanggal: string;
  jenis?: string;
  status: MonitoringStatus;
  catatan?: string;
  tindak_lanjut?: string;
  created_at?: string;
}

export interface AnnouncementTemplate {
  template_id: string;
  nama_template: string;
  kode: string;
  isi_template: string;
  status_aktif?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Announcement {
  announcement_id: string;
  template_id: string;
  group_id: string;
  tanggal: string;
  hari: string;
  jam?: string;
  acara?: string;
  materi?: string;
  catatan?: string;
  generated_text: string;
  status: AnnouncementStatus;
}

export interface AttentionItem {
  member_id: string;
  nama_lengkap: string;
  foto_url?: string;
  reasons: string[];
}

export interface DashboardGeneral {
  total_jamaah: number;
  total_jamaah_aktif: number;
  per_kategori: Record<MemberCategory, number>;
  rata_rata_kehadiran: number;
  pengajian_terdekat: {
    meeting_id: string;
    tanggal: string;
    hari: string;
    acara?: string;
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
    tanggal: string;
    jam: string;
    acara: string;
    group_id: string;
    kategori_target: MemberCategory[];
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
  is_nikah: boolean;
  jenjang_pendidikan?: string;
  sekolah?: string;
  jurusan?: string;
  tahun_mulai_pendidikan?: string;
  tahun_selesai_pendidikan?: string;
  foto_url?: string;
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
  user_nama: string;
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
