-- Jalankan di Supabase Dashboard > SQL Editor

create table if not exists public.kontak (
  id          bigint generated always as identity primary key,
  nama        text not null,
  kesibukan   text,
  alamat      text,
  no_hp       text,
  keterangan  text,
  created_at  timestamptz not null default now()
);

create index if not exists kontak_nama_idx on public.kontak (nama);

alter table public.kontak enable row level security;

-- Semua orang (guest) boleh MELIHAT data
create policy "Publik boleh membaca"
  on public.kontak for select
  to anon, authenticated
  using (true);

-- Hanya admin (user yang sudah login) boleh tambah / ubah / hapus
create policy "Admin boleh menambah"
  on public.kontak for insert
  to authenticated
  with check (true);

create policy "Admin boleh mengubah"
  on public.kontak for update
  to authenticated
  using (true) with check (true);

create policy "Admin boleh menghapus"
  on public.kontak for delete
  to authenticated
  using (true);

-- (Opsional) data contoh
insert into public.kontak (nama, kesibukan, alamat, no_hp, keterangan) values
  ('Budi Santoso', 'Petani', 'Praya, Lombok Tengah', '081234567890', 'Ketua kelompok tani'),
  ('Siti Aminah', 'Guru', 'Mataram', '081298765432', 'Mengajar di SD Negeri 1'),
  ('Ahmad Fauzi', 'Pedagang', 'Selong, Lombok Timur', '082111222333', 'Jual hasil bumi');
