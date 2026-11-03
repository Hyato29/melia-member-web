const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// Ambil data dengan pencarian nama, filter kesibukan, dan pagination
async function fetchKontak({ q = "", kes = "", page = 1 }) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = sb.from("kontak").select("*", { count: "exact" });
  if (q.trim()) query = query.ilike("nama", `%${q.trim()}%`);
  if (kes) query = query.eq("kesibukan", kes);
  const { data, count, error } = await query
    .order("nama", { ascending: true })
    .range(from, to);
  if (error) throw error;
  return { rows: data || [], total: count || 0 };
}

// Isi dropdown filter dengan daftar kesibukan unik
async function loadKesibukan(selectEl) {
  const { data } = await sb.from("kontak").select("kesibukan").not("kesibukan", "is", null);
  const list = [...new Set((data || []).map((d) => d.kesibukan.trim()).filter(Boolean))].sort();
  const current = selectEl.value;
  selectEl.innerHTML = '<option value="">Semua kesibukan</option>' +
    list.map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join("");
  selectEl.value = list.includes(current) ? current : "";
}

function renderPagination(el, page, total, onPage) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  el.innerHTML =
    `<button ${page <= 1 ? "disabled" : ""} data-p="${page - 1}">‹ Sebelumnya</button>` +
    nums.map((n) => n === "…" ? `<span class="dots">…</span>`
      : `<button class="${n === page ? "active" : ""}" data-p="${n}">${n}</button>`).join("") +
    `<button ${page >= pages ? "disabled" : ""} data-p="${page + 1}">Berikutnya ›</button>`;
  el.querySelectorAll("button[data-p]").forEach((b) =>
    b.addEventListener("click", () => onPage(Number(b.dataset.p))));
}

function debounce(fn, ms = 350) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
