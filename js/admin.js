// admin
const $ = (id) => document.getElementById(id);
const state = { q: "", kes: "", page: 1 };
let rowsCache = [];

async function checkSession() {
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (session) {
    $("loginView").classList.add("hidden");
    $("dashView").classList.remove("hidden");
    $("whoami").textContent = session.user.email;
    loadKesibukan($("filter"));
    load();
  } else {
    $("dashView").classList.add("hidden");
    $("loginView").classList.remove("hidden");
  }
}

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("loginError").textContent = "";
  const { error } = await sb.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("password").value,
  });
  if (error) {
    $("loginError").textContent = "Login gagal: " + error.message;
    return;
  }
  $("password").value = "";
  checkSession();
});

$("logoutBtn").addEventListener("click", async () => {
  await sb.auth.signOut();
  checkSession();
});

async function load() {
  try {
    const { rows, total } = await fetchKontak(state);
    if (!rows.length && total > 0 && state.page > 1) {
      state.page--;
      return load();
    }
    rowsCache = rows;
    $("tbody").innerHTML = rows.length
      ? rows
          .map(
            (r) => `<tr class="hover:bg-white/[0.02] transition-colors">
              <td class="px-6 py-4 font-semibold text-yellow-400">${esc(r.nama)}</td>
              <td class="px-6 py-4">${esc(r.kesibukan)}</td>
              <td class="px-6 py-4 truncate max-w-[200px] text-slate-400">${esc(r.alamat)}</td>
              <td class="px-6 py-4">${esc(r.no_hp)}</td>
              <td class="px-6 py-4 truncate max-w-[150px] text-slate-400">${esc(r.keterangan)}</td>
              <td class="px-6 py-4 text-right flex justify-end gap-2">
                <button class="px-3 py-1.5 text-xs rounded border border-white/10 hover:bg-white/10 transition-colors" data-edit="${r.id}">Edit</button>
                <button class="px-3 py-1.5 text-xs rounded border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors" data-del="${r.id}">Hapus</button>
              </td></tr>`,
          )
          .join("")
      : `<tr><td colspan="6" class="px-6 py-12 text-center text-slate-500">Data tidak ditemukan</td></tr>`;
    const start = total ? (state.page - 1) * PAGE_SIZE + 1 : 0;
    $("info").textContent =
      `Menampilkan ${start}–${start + rows.length - (total ? 1 : 0)} dari ${total} data`;
    renderPagination($("pagination"), state.page, total, (p) => {
      state.page = p;
      load();
    });
  } catch (e) {
    $("tbody").innerHTML =
      `<tr><td colspan="6" class="px-6 py-12 text-center text-red-400">Gagal memuat: ${esc(e.message)}</td></tr>`;
  }
}

$("search").addEventListener(
  "input",
  debounce((e) => {
    state.q = e.target.value;
    state.page = 1;
    load();
  }),
);
$("filter").addEventListener("change", (e) => {
  state.kes = e.target.value;
  state.page = 1;
  load();
});

$("tbody").addEventListener("click", async (e) => {
  const editId = e.target.dataset.edit,
    delId = e.target.dataset.del;
  if (editId) openForm(rowsCache.find((r) => String(r.id) === editId));
  if (delId) {
    const r = rowsCache.find((x) => String(x.id) === delId);
    if (!confirm(`Hapus data "${r.nama}"?`)) return;
    const { error } = await sb.from("kontak").delete().eq("id", delId);
    if (error) return alert("Gagal menghapus: " + error.message);
    loadKesibukan($("filter"));
    load();
  }
});

const fields = ["nama", "kesibukan", "alamat", "no_hp", "keterangan"];

function openForm(row) {
  $("dlgTitle").textContent = row ? "Edit Data" : "Tambah Data";
  $("f_id").value = row?.id ?? "";
  fields.forEach((f) => ($("f_" + f).value = row?.[f] ?? ""));
  $("formError").textContent = "";
  $("formDlg").showModal();
}
$("addBtn").addEventListener("click", () => openForm(null));
$("cancelBtn").addEventListener("click", () => $("formDlg").close());

$("dataForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {};
  fields.forEach((f) => (payload[f] = $("f_" + f).value.trim() || null));
  if (!payload.nama) {
    $("formError").textContent = "Nama wajib diisi";
    return;
  }
  $("saveBtn").disabled = true;
  const id = $("f_id").value;
  const { error } = id
    ? await sb.from("kontak").update(payload).eq("id", id)
    : await sb.from("kontak").insert(payload);
  $("saveBtn").disabled = false;
  if (error) {
    $("formError").textContent = "Gagal menyimpan: " + error.message;
    return;
  }
  $("formDlg").close();
  loadKesibukan($("filter"));
  load();
});

sb.auth.onAuthStateChange(() => {});
checkSession();
