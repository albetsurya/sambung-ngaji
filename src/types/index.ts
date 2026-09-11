export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TIM_PNKB' | 'TIM_ABSENSI';

export type MemberCategory =
  | 'CABERAWIT'
  | 'PRA_REMAJA'
  | 'REMAJA'
  | 'PRA_NIKAH'
  | 'DEWASA'
  | 'MANULA';

export type AttendanceStatus = 'HADIR' | 'IJIN' | 'SAKIT' | 'TANPA_KETERANGAN';

export type MonitoringStatus = 'AKTIF' | 'PERLU_PERHATIAN' | 'KURANG_AKTIF' | 'TIDAK_AKTIF';

export type AnnouncementStatus = 'DRAFT' | 'READY' | 'SHARED' | 'CANCELLED';

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
}

export interface Member {
  member_id: string;
  nama_lengkap: string;
  nama_panggilan?: string;
  jenis_kelamin?: 'L' | 'P' | '';
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
  tanggal_masuk?: string;
  tanggal_keluar?: string;
  status_aktif?: boolean;
  kategori?: MemberCategory;
  usia?: number | null;
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
  jam?: string;
  group_id?: string;
  acara?: string;
  materi?: string;
  status?: string;
  catatan?: string;
}

export interface AttendanceRecord {
  attendance_id: string;
  meeting_id: string;
  member_id: string;
  status: AttendanceStatus;
  catatan?: string;
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
  pengajian_terdekat: { meeting_id: string; tanggal: string; hari: string; acara?: string } | null;
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

export interface DashboardAbsensi {
  pengajian_hari_ini: { meeting_id: string; jam?: string; acara?: string; group_id?: string }[];
  jumlah_jamaah: number;
  hadir: number;
  ijin: number;
  sakit: number;
  tanpa_keterangan: number;
}
