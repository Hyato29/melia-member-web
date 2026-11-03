# Website Data Warga (Supabase)

Halaman publik (lihat data, cari nama, filter kesibukan, pagination) + dashboard admin (login, tambah, edit, hapus).

## File
- `index.html` – halaman publik (read-only)
- `admin.html` – login admin + dashboard CRUD
- `config.js` – URL & anon key Supabase
- `common.js`, `style.css` – kode & gaya bersama
- `supabase.sql` – tabel + aturan keamanan (RLS)

## Cara pasang
1. Buat project di https://supabase.com
2. Buka **SQL Editor**, tempel isi `supabase.sql`, lalu **Run**.
3. Buat akun admin: **Authentication → Users → Add user** (isi email & password, centang *Auto Confirm User*).
4. Matikan pendaftaran bebas: **Authentication → Sign In / Providers → Email → matikan "Allow new users to sign up"**.
   Ini penting, karena semua user yang login dianggap admin.
5. Buka **Project Settings → API**, salin *Project URL* dan *anon public key* ke `config.js`.
6. Jalankan lokal (mis. `npx serve .` atau ekstensi Live Server), atau upload semua file ke Netlify / Vercel / GitHub Pages.

## Keamanan
- Anon key memang boleh tampil di browser; yang melindungi data adalah RLS di `supabase.sql`.
- Guest hanya bisa `select`. Insert/update/delete hanya untuk user yang sudah login.
- Jangan pernah memakai `service_role` key di file ini.
