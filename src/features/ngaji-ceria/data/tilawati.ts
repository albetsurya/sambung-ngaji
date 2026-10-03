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
    nama: "Tilawati Jilid 1",
    deskripsi: "Mengenal huruf hijaiyah dengan harakat fathah",
    jumlahHalaman: 40,
    pelajaran: [
      { id: "t1-h1", nomor: 1, tema: "Pengenalan Ba dan Alif", target: "Ba, Alif" },
      { id: "t1-h2", nomor: 2, tema: "Pengenalan Ta dan Tsa", target: "Ta, Tsa" },
    ],
  },
  {
    id: "jilid-2",
    nama: "Tilawati Jilid 2",
    deskripsi: "Latihan harakat kasrah dan dhommah",
    jumlahHalaman: 40,
    pelajaran: [],
  },
  {
    id: "jilid-3",
    nama: "Tilawati Jilid 3",
    deskripsi: "Mengenal huruf sambung dan sukun",
    jumlahHalaman: 40,
    pelajaran: [],
  },
  {
    id: "jilid-4",
    nama: "Tilawati Jilid 4",
    deskripsi: "Tajwid dasar dan nun mati",
    jumlahHalaman: 40,
    pelajaran: [],
  },
  {
    id: "jilid-5",
    nama: "Tilawati Jilid 5",
    deskripsi: "Pemantapan tajwid dan surat pendek",
    jumlahHalaman: 40,
    pelajaran: [],
  },
  {
    id: "jilid-6",
    nama: "Tilawati Jilid 6",
    deskripsi: "Ghorib dan musykilat",
    jumlahHalaman: 40,
    pelajaran: [],
  },
];
