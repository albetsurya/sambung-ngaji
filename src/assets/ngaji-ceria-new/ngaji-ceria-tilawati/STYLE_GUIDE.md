# Ngaji Ceria (Metode Tilawati) - Style Guide Aset

200 aset SVG, bergaya mengikuti aplikasi referensi tetapi disesuaikan untuk metode Tilawati (Jilid 1-6, Ghorib, Tajwid).

## Struktur folder (svg/)
01-hud, 02-peta, 03-ikon, 04-kartu, 05-huruf (28 huruf), 06-harakat (12), 07-game, 08-ui, 09-buku (Tilawati Jilid 1-6, Ghorib, Tajwid, Juz Amma), 10-lencana, 11-karakter, 12-ornamen, 13-hero-panel-bg.
Daftar lengkap ada di manifest.json. Buka preview.html untuk melihat semuanya.

## Gaya visual
- Objek ala tombol 3D datar: lapisan rim gelap digeser 8-12px ke bawah, cincin putih tebal 4-6px, gradasi vertikal halus, highlight elips putih di kiri atas.
- Sudut sangat membulat (rx 16-40). Kartu tebal dengan bingkai dalam tipis.
- Palet hangat: emas/oranye (progres dan aksi), coklat tua (kartu belakang, hero), hijau hutan (VIP, Juz Amma), pastel (pink, biru, ungu) untuk game.
- Huruf hijaiyah besar, coklat tua, di tengah kartu. Tanpa emoji, seluruh ikon murni SVG.

## Token warna (terang / gelap / rim)
Emas #FFCB45 / #F29A12 / #B8590C; Oranye #F58A3A / #E2561A / #A63C0E; Biru #6CC3E6 / #2F93C4 / #1E6D96;
Ungu #A98BD6 / #7A55B3 / #573A86; Pink #F58AAE / #D14E7C / #9E2E55; Hijau #7FB08C / #3F6B52 / #2C4D3A;
Coklat #8A5A44 / #5A3A2A / #3E2518; Abu terkunci #D3DAE5 / #9AA6B8 / #6F7C92. Latar krem #FFF8EE, teks utama #5A3A2A.

## Catatan teknis
- Huruf Arab memakai elemen text dengan font Amiri / Noto Naskh Arabic. Muat font tersebut di aplikasi, atau konversi ke path (Inkscape/Figma) agar identik di semua perangkat. Harakat (fathah, kasrah, dst.) sangat bergantung pada font ini.
- nodeAktif dan tombolMulaiNgaji memiliki animasi denyut SMIL.
- Id gradient unik per file, aman dipakai inline di React.
- Warna sampul buku Tilawati di sini adalah warna desain sendiri, bukan replika sampul asli buku Tilawati.
- Pemetaan umum: nodeSelesai (halaman selesai), nodeAktif (halaman berjalan), nodeHalaman01-10 (nomor halaman), petiHarta (evaluasi/checkpoint), piala (akhir jilid), nodeTerkunci, hatiNyawa / koinHijaiyah / apiStreak (HUD atas), dockLatar + iconGames / iconKuis / iconPrestasi (dock bawah), pillJudulLevel (judul level).
