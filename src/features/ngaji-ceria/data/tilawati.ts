// Data jilid untuk Ngaji Ceria
// Disusun mengikuti pokok bahasan umum Metode Tilawati (fathah, kasrah, sukun, tajwid, ghorib)
// BUKAN salinan isi buku Tilawati. Teks latihan dibuat mandiri; ayat Al-Qur'an diambil dari sumber domain publik.
// "Tilawati" adalah merk milik Pesantren Al-Qur'an Nurul Falah Surabaya.

export interface TilawatiLesson {
  id: string;
  nomor: number;
  tema: string;
  target: string;
  audio?: string;
}

export interface TilawatiJilid {
  id: string;
  nama: string;
  deskripsi: string;
  jumlahHalaman: number;
  pelajaran: TilawatiLesson[];
}

export const TILAWATI_DATA: TilawatiJilid[] = [
  {
    id: "jilid-1",
    nama: "Jilid 1",
    deskripsi: "Mengenal huruf hijaiyah dengan harakat fathah",
    jumlahHalaman: 40,
    pelajaran: [
      { id: "t1-h1", nomor: 1, tema: "Pengenalan Ba dan Alif", target: "Ba, Alif" },
      { id: "t1-h2", nomor: 2, tema: "Pengenalan Ta dan Tsa", target: "Ta, Tsa" },
    ],
  },
  {
    id: "jilid-2",
    nama: "Jilid 2",
    deskripsi: "Latihan harakat kasrah dan dhommah",
    jumlahHalaman: 40,
    pelajaran: [],
  },
  {
    id: "jilid-3",
    nama: "Jilid 3",
    deskripsi: "Mengenal huruf sambung dan sukun",
    jumlahHalaman: 40,
    pelajaran: [],
  },
  {
    id: "jilid-4",
    nama: "Jilid 4",
    deskripsi: "Tajwid dasar dan nun mati",
    jumlahHalaman: 40,
    pelajaran: [],
  },
  {
    id: "jilid-5",
    nama: "Jilid 5",
    deskripsi: "Pemantapan tajwid dan surat pendek",
    jumlahHalaman: 40,
    pelajaran: [],
  },
  {
    id: "jilid-6",
    nama: "Jilid 6",
    deskripsi: "Ghorib dan musykilat",
    jumlahHalaman: 40,
    pelajaran: [],
  },
];

// Alias netral untuk konsumsi baru — TILAWATI_DATA dipertahankan untuk kompatibilitas
export const JILID_DATA = TILAWATI_DATA;
