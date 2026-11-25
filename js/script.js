// index
const state = { q: "", kes: "", page: 1 };
const $ = (id) => document.getElementById(id);

function whatsappUrl(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  const number = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return /^\d{8,15}$/.test(number) ? `https://wa.me/${number}` : "";
}

async function load() {
  try {
    const { rows, total } = await fetchKontak(state);
    $("tbody").innerHTML = rows.length
      ? rows
          .map(
            (r) => `<tr class="hover:bg-white/[0.02] transition-colors">
              <td class="px-6 py-4 font-semibold text-yellow-400">${esc(r.nama)}</td>
              <td class="px-6 py-4">${esc(r.keterangan)}</td>
              <td class="px-6 py-4 text-slate-400 truncate max-w-xs">${esc(r.kesibukan)}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <span>${esc(r.no_hp)}</span>
                  ${whatsappUrl(r.no_hp) ? `<a href="${whatsappUrl(r.no_hp)}" target="_blank" rel="noopener noreferrer" class="text-green-400 hover:text-green-300 font-semibold transition-colors">WhatsApp</a>` : ""}
                </div>
              </td>
              <td class="px-6 py-4 hidden md:table-cell text-slate-400">${esc(r.alamat)}</td></tr>`,
          )
          .join("")
      : `<tr><td colspan="5" class="px-6 py-12 text-center text-slate-500">Data tidak ditemukan</td></tr>`;
    const start = total ? (state.page - 1) * PAGE_SIZE + 1 : 0;
    $("info").textContent =
      `Menampilkan ${start}–${start + rows.length - (total ? 1 : 0)} dari ${total} data`;
    renderPagination($("pagination"), state.page, total, (p) => {
      state.page = p;
      load();
    });
  } catch (e) {
    $("tbody").innerHTML =
      `<tr><td colspan="5" class="px-6 py-12 text-center text-red-400">Gagal memuat: ${esc(e.message)}</td></tr>`;
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

loadKesibukan($("filter"));
load();
