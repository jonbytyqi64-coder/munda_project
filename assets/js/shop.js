/* ============================================================
   MUNDA PERFORMANCE — shop page: filters, sort, URL state
   ============================================================ */
(() => {
  "use strict";

  const state = { cats: new Set(), price: "", compat: "", q: "" };
  const params = new URLSearchParams(location.search);
  if (params.get("cat")) state.cats.add(params.get("cat"));
  if (params.get("compat")) state.compat = params.get("compat");
  if (params.get("q")) state.q = params.get("q").trim().toLowerCase();

  /* ---------- build filter UI ---------- */
  const catBox = document.getElementById("catFilters");
  CATEGORIES.forEach((c) => {
    const n = PRODUCTS.filter((p) => p.category === c.slug).length;
    catBox.insertAdjacentHTML(
      "beforeend",
      `<label class="filter-opt"><input type="checkbox" value="${c.slug}" ${state.cats.has(c.slug) ? "checked" : ""}><span>${c.name}</span><span class="cnt">${n}</span></label>`
    );
  });

  const compatSel = document.getElementById("compatFilter");
  MODELS.forEach((m) => {
    const o = document.createElement("option");
    o.value = m.value;
    o.textContent = m.label;
    compatSel.appendChild(o);
  });
  compatSel.value = state.compat;

  const buckets = [
    ["0-100", (p) => p.price < 100],
    ["100-500", (p) => p.price >= 100 && p.price < 500],
    ["500-1500", (p) => p.price >= 500 && p.price < 1500],
    ["1500-", (p) => p.price >= 1500],
  ];
  buckets.forEach(([key, fn]) => {
    const el = document.getElementById("cnt-" + key);
    if (el) el.textContent = PRODUCTS.filter(fn).length;
  });

  /* ---------- page title ---------- */
  const title = document.getElementById("shopTitle");
  if (state.cats.size === 1) title.textContent = catName([...state.cats][0]);
  else if (state.compat) {
    const m = MODELS.find((x) => x.value === state.compat);
    title.textContent = "Parts for " + (m ? m.label : state.compat);
  } else title.textContent = "All parts";

  /* ---------- filtering & sorting ---------- */
  const matches = (p) => {
    if (state.cats.size && !state.cats.has(p.category)) return false;
    if (state.price) {
      const [min, max] = state.price.split("-").map((v) => (v === "" ? null : +v));
      if (min !== null && p.price < min) return false;
      if (max !== null && p.price > max) return false;
    }
    if (state.compat && !p.compat.some((c) => c.startsWith(state.compat))) return false;
    if (state.q && ![p.name, p.partNo, catName(p.category)].join(" ").toLowerCase().includes(state.q)) return false;
    return true;
  };
  const sorters = {
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    reviews: (a, b) => b.reviews - a.reviews,
    featured: (a, b) => (b.badge === "Bestseller") - (a.badge === "Bestseller") || b.rating - a.rating,
  };

  function render() {
    const list = PRODUCTS.filter(matches).sort(sorters[document.getElementById("sortSelect").value]);
    const grid = document.getElementById("shopGrid");
    grid.innerHTML = list.map(productCardHTML).join("");
    grid.hidden = list.length === 0;
    document.getElementById("resultCount").textContent = list.length;
    document.getElementById("emptyState").hidden = list.length > 0;
    syncURL();
    observeReveals();
    syncWishButtons();
  }

  function syncURL() {
    const u = new URL(location.href);
    if (state.cats.size) u.searchParams.set("cat", [...state.cats][0]);
    else u.searchParams.delete("cat");
    if (state.compat) u.searchParams.set("compat", state.compat);
    else u.searchParams.delete("compat");
    history.replaceState(null, "", u.pathname + u.search);
  }

  /* ---------- events ---------- */
  catBox.addEventListener("change", (e) => {
    e.target.checked ? state.cats.add(e.target.value) : state.cats.delete(e.target.value);
    render();
  });
  document.querySelectorAll('input[name="price"]').forEach((r) =>
    r.addEventListener("change", () => {
      state.price = document.querySelector('input[name="price"]:checked').value;
      render();
    })
  );
  compatSel.addEventListener("change", () => {
    state.compat = compatSel.value;
    render();
  });
  document.getElementById("sortSelect").addEventListener("change", render);

  const doClear = () => {
    state.cats.clear();
    state.price = "";
    state.compat = "";
    state.q = "";
    catBox.querySelectorAll("input").forEach((i) => (i.checked = false));
    document.querySelector('input[name="price"][value=""]').checked = true;
    compatSel.value = "";
    document.getElementById("sortSelect").value = "featured";
    render();
  };
  document.getElementById("clearFilters").addEventListener("click", doClear);
  document.getElementById("emptyClear").addEventListener("click", doClear);

  render();
})();
