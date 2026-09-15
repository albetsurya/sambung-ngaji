# PWA DEV

## Vercel

Branch `develop` dibuild dengan mode development melalui `npm run build:dev`.
Branch selain `develop` menggunakan build production melalui `npm run build`.

## Local Android

Untuk pengujian PWA di Android melalui jaringan LAN, gunakan HTTPS. `http://localhost` aman untuk development di perangkat yang sama, tetapi `http://IP-LAN:5173` bukan secure context untuk service worker.

Build DEV:

```bash
npm run build:dev
npm run preview -- --host 0.0.0.0
```

Untuk install PWA di Android dari perangkat lain melalui LAN, gunakan HTTPS pada host development.

## Setelah deployment

Jika PWA pernah terpasang dari versi lama, hapus instalasi aplikasi lama dan clear site data untuk domain DEV sebelum pengujian ulang. Kemudian buka domain DEV di Chrome Android dan cek menu browser untuk `Install app` / `Tambahkan ke layar utama`.
