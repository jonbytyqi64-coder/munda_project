/* ============================================================
   MUNDA PERFORMANCE — product detail page
   ============================================================ */
(() => {
  "use strict";

  const id = new URLSearchParams(location.search).get("id");
  const p = getProduct(id);
  const root = document.getElementById("productRoot");

  if (!p) {
    root.innerHTML = `<div class="empty" style="margin:80px 0">
      <h3>Part not found</h3>
      <p>The product you're looking for doesn't exist or has been removed.</p>
      <a class="btn btn--red" href="shop.html">Back to the shop</a></div>`;
    return;
  }

  document.title = `${p.name} — MUNDA Performance`;

  /* gallery variants: same photo, different crops */
  const variant = (crop) =>
    (p.img.includes("&crop=") ? p.img.replace(/&crop=[a-z]+/, "") : p.img) + "&crop=" + crop;
  const crops = ["center", "top", "left", "right"];
  const lowStock = p.badge === "New";

  root.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span class="sep">/</span>
      <a href="shop.html">Shop</a><span class="sep">/</span>
      <a href="shop.html?cat=${p.category}">${catName(p.category)}</a><span class="sep">/</span>
      <span class="here">${p.name}</span>
    </nav>

    <div class="pdetail">
      <div class="gallery">
        <div class="gallery__main">
          ${p.badge ? `<span class="tag">${p.badge}</span>` : ""}
          <img id="mainImg" src="${variant("center")}" alt="${p.name}" fetchpriority="high" width="900" height="765">
        </div>
        <div class="gallery__thumbs" id="galleryThumbs">
          ${crops.map((c, i) => `<button class="${i === 0 ? "on" : ""}" data-crop="${c}" aria-label="View ${c} angle"><img src="${variant(c)}" alt="" loading="lazy"></button>`).join("")}
        </div>
      </div>

      <div class="pinfo">
        <div class="pinfo__cat"><span class="eyebrow">${catName(p.category)}</span></div>
        <h1 class="pinfo__title">${p.name}</h1>
        <div class="pinfo__partno">Part no. ${p.partNo}</div>
        <div class="pinfo__rating">${starsHTML(p.rating)} <strong>${p.rating}</strong> · ${p.reviews} verified reviews</div>
        <div class="pinfo__price">
          <span class="price">${fmtEUR(p.price)}</span>
          ${p.oldPrice ? `<span class="price--old">${fmtEUR(p.oldPrice)}</span><span class="tag">Save ${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ""}
        </div>
        <p class="pinfo__desc">${p.desc}</p>
        <div class="pinfo__stock ${lowStock ? "pinfo__stock--low" : ""}"><span class="pulse"></span>${lowStock ? "Low stock — order soon" : "In stock — ships within 24 h"}</div>
        <div class="pinfo__buy">
          <span class="qty">
            <button id="qtyMinus" aria-label="Decrease quantity">−</button>
            <output id="pQty">1</output>
            <button id="qtyPlus" aria-label="Increase quantity">+</button>
          </span>
          <button class="btn btn--red" id="addBtn" style="flex:1">Add to cart</button>
          <button class="btn btn--ghost" id="wishBtn" data-wish="${p.id}" aria-label="Save to wishlist">${HEART_SVG}</button>
        </div>
        <ul class="pinfo__meta">
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z"/></svg>Dispatched within 24 h — order before 16:00 CET</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h13v9H2zM15 10h4l3 3v3h-7z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="18" cy="17.5" r="1.8"/></svg>Free express shipping over €150 · insured &amp; trackable</li>
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 3 6.5v5.2c0 5 3.8 8.6 9 10.3 5.2-1.7 9-5.3 9-10.3V6.5L12 2Z"/><path d="m8.5 12 2.5 2.5 4.5-4.5"/></svg>2-year warranty · 30-day free returns</li>
        </ul>
        <div style="margin-top:24px">
          <h4 style="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-3);margin-bottom:10px">Verified fitment</h4>
          <div class="compat-chips">${p.compat.map((c) => `<span>${c}</span>`).join("")}</div>
        </div>
      </div>
    </div>

    <section class="spec-section">
      <h3>Specifications</h3>
      <table class="spec-table">
        ${Object.entries(p.specs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
      </table>
    </section>

    <section class="spec-section" style="margin-top:72px">
      <div class="section__head">
        <div>
          <span class="eyebrow">Pairs well with</span>
          <h2 class="section__title">Related parts</h2>
        </div>
      </div>
      <div class="prod-grid" id="relatedGrid"></div>
    </section>`;

  /* ---------- interactions ---------- */
  let qty = 1;
  const qtyOut = document.getElementById("pQty");
  const setQtyUI = () => (qtyOut.textContent = qty);
  document.getElementById("qtyMinus").addEventListener("click", () => { qty = Math.max(1, qty - 1); setQtyUI(); });
  document.getElementById("qtyPlus").addEventListener("click", () => { qty = Math.min(20, qty + 1); setQtyUI(); });
  document.getElementById("addBtn").addEventListener("click", () => Munda.addToCart(p.id, qty));

  const mainImg = document.getElementById("mainImg");
  document.getElementById("galleryThumbs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-crop]");
    if (!b) return;
    mainImg.src = variant(b.dataset.crop);
    document.querySelectorAll("#galleryThumbs button").forEach((x) => x.classList.toggle("on", x === b));
  });

  /* related: same category first, pad with top-rated */
  const related = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category)
    .concat(PRODUCTS.filter((x) => x.id !== p.id && x.category !== p.category).sort((a, b) => b.rating - a.rating))
    .slice(0, 4);
  document.getElementById("relatedGrid").innerHTML = related.map(productCardHTML).join("");
  observeReveals();
  syncWishButtons();
})();
