export interface StoryStats { akhlak: number; ilmu: number; sosial: number }
export interface StoryChoice { id: string; text: string; delta: Partial<StoryStats>; next: string }
export interface StoryNode { id: string; chapter: string; prompt: string; choices: StoryChoice[] }

// TODO: review oleh ustadz/ustadzah. Cerita ini adalah kerangka edukasi, bukan fatwa.
export const STORY_NODES: StoryNode[] = [
  { id: "start", chapter: "Pagi di pesantren", prompt: "Kamu menemukan sapu di depan masjid sebelum kelas dimulai. Apa yang kamu lakukan?", choices: [{ id: "a", text: "Menyapu area masjid tanpa menunggu diminta.", delta: { akhlak: 2 }, next: "class" }, { id: "b", text: "Mencari orang lain untuk mengerjakannya.", delta: { sosial: 1, akhlak: -1 }, next: "class" }] },
  { id: "class", chapter: "Kelas pertama", prompt: "Ustadz menjelaskan materi baru, tapi kamu belum memahami satu bagian.", choices: [{ id: "a", text: "Bertanya dengan sopan agar semua ikut memahami.", delta: { ilmu: 2, sosial: 1 }, next: "friend" }, { id: "b", text: "Diam dan berharap nanti mengerti sendiri.", delta: { ilmu: -1 }, next: "friend" }] },
  { id: "friend", chapter: "Teman yang kesulitan", prompt: "Temanmu lupa membawa catatan pelajaran hari ini.", choices: [{ id: "a", text: "Meminjamkan catatan dan menjelaskan bagian penting.", delta: { sosial: 2, ilmu: 1 }, next: "honesty" }, { id: "b", text: "Menyimpan catatan karena kamu juga membutuhkannya.", delta: { sosial: -1 }, next: "honesty" }] },
  { id: "honesty", chapter: "Ujian kecil", prompt: "Kamu melihat jawaban teman saat kuis dan jawabanmu belum selesai.", choices: [{ id: "a", text: "Tetap mengerjakan sendiri dengan jujur.", delta: { akhlak: 2, ilmu: 1 }, next: "guest" }, { id: "b", text: "Menyalin sedikit agar nilainya aman.", delta: { akhlak: -2, ilmu: 1 }, next: "guest" }] },
  { id: "guest", chapter: "Tamu datang", prompt: "Ada tamu baru di pesantren yang terlihat bingung mencari ruang makan.", choices: [{ id: "a", text: "Mengantar sampai tujuan dan menyapa dengan ramah.", delta: { sosial: 2, akhlak: 1 }, next: "library" }, { id: "b", text: "Menunjuk arah dari jauh lalu kembali bermain.", delta: { sosial: -1 }, next: "library" }] },
  { id: "library", chapter: "Di perpustakaan", prompt: "Buku yang ingin kamu baca sedang dipakai adik kelas.", choices: [{ id: "a", text: "Menunggu giliran sambil memilih buku lain.", delta: { akhlak: 1, ilmu: 1 }, next: "mistake" }, { id: "b", text: "Mengambilnya karena merasa lebih dulu melihat.", delta: { akhlak: -1 }, next: "mistake" }] },
  { id: "mistake", chapter: "Mengakui kesalahan", prompt: "Kamu tidak sengaja memecahkan gelas inventaris pesantren.", choices: [{ id: "a", text: "Mengaku dan membantu mengganti atau membersihkannya.", delta: { akhlak: 2, sosial: 1 }, next: "night" }, { id: "b", text: "Meninggalkannya agar tidak dimarahi.", delta: { akhlak: -2 }, next: "night" }] },
  { id: "night", chapter: "Malam refleksi", prompt: "Sebelum tidur, kamu mengingat semua kejadian hari ini.", choices: [{ id: "a", text: "Mencatat pelajaran dan merencanakan perbaikan.", delta: { ilmu: 2, akhlak: 1 }, next: "finish" }, { id: "b", text: "Melupakannya dan langsung tidur.", delta: { ilmu: -1 }, next: "finish" }] },
  { id: "finish", chapter: "Pilihan terakhir", prompt: "Besok kamu ingin dikenal sebagai santri yang seperti apa?", choices: [{ id: "a", text: "Bermanfaat, mau belajar, dan menjaga adab.", delta: { akhlak: 2, ilmu: 2, sosial: 2 }, next: "ending" }, { id: "b", text: "Cukup melakukan yang penting untuk diri sendiri.", delta: { sosial: -1, ilmu: 1 }, next: "ending" }] },
];
export const ENDINGS = {
  bijak: { title: "Akhir Bijak", text: "Kamu tumbuh menjadi santri yang berilmu, beradab, dan membawa manfaat untuk sekitar." },
  baik: { title: "Akhir Baik", text: "Kebiasaan baikmu mulai terlihat. Perjalanan belajar masih panjang, tapi arahnya sudah tepat." },
  netral: { title: "Akhir Netral", text: "Kamu menyelesaikan hari dengan banyak pelajaran. Besok masih ada kesempatan untuk memperbaiki pilihan." },
  buruk: { title: "Akhir yang Perlu Diperbaiki", text: "Beberapa pilihanmu membuat orang lain terdampak. Jadikan pengalaman ini sebagai bahan refleksi." },
} as const;
