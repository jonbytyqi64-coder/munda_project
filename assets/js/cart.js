/* ============================================================
   MUNDA PERFORMANCE — cart page: review, promo, demo checkout
   ============================================================ */
(() => {
  "use strict";

  const M = window.Munda;
  let promoPct = 0;

  const totals = () => {
    const sub = M.cartSubtotal();
    const ship = sub === 0 || sub >= SITE.freeShipThreshold ? 0 : SITE.shippingFee;
    const disc = sub * promoPct;
    return { sub, ship, disc, total: sub - disc + ship };
  };

  /* ---------- render ---------- */
  function renderRows() {
    const table = document.getElementById("cartTable");
    const cart = M.loadCart();
    const ids = Object.keys(cart);
    if (!ids.length) {
      table.innerHTML = `<div class="cart-empty-state">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin:0 auto;opacity:.5"><path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>
        <h3>Your cart is empty</h3>
        <p style="color:var(--ink-3);font-size:14px;margin-bottom:22px">Fitment-checked parts, dispatched within 24 hours.</p>
        <a class="btn btn--red" href="shop.html">Browse the catalogue</a>
      </div>`;
      document.getElementById("orderSummary").hidden = true;
      document.getElementById("checkoutPanel").hidden = true;
      return;
    }
    document.getElementById("orderSummary").hidden = false;
    table.innerHTML = ids
      .map((id) => {
        const p = getProduct(id);
        if (!p) return "";
        return `<div class="cart-row">
          <a class="cart-row__thumb" href="product.html?id=${p.id}"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
          <div>
            <a class="cart-row__name" href="product.html?id=${p.id}">${p.name}</a>
            <div class="cart-row__partno">Part no. ${p.partNo}</div>
            <div class="cart-row__unit">${fmtEUR(p.price)} each</div>
          </div>
          <div class="cart-row__side">
            <span class="qty">
              <button data-qty data-qty-id="${p.id}" data-qty-delta="-1" aria-label="Decrease quantity">−</button>
              <output>${cart[id]}</output>
              <button data-qty data-qty-id="${p.id}" data-qty-delta="1" aria-label="Increase quantity">+</button>
            </span>
            <span class="cart-row__line">${fmtEUR(p.price * cart[id])}</span>
            <button class="cart-item__remove" data-remove="${p.id}" aria-label="Remove ${p.name}">Remove</button>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderSummary() {
    const t = totals();
    document.getElementById("sumSubtotal").textContent = fmtEUR(t.sub);
    document.getElementById("sumShipping").textContent =
      t.sub === 0 ? "—" : t.ship === 0 ? '<span class="free">Free</span>' : fmtEUR(t.ship);
    document.getElementById("sumShipping").innerHTML =
      t.sub === 0 ? "—" : t.ship === 0 ? '<span class="free">Free</span>' : fmtEUR(t.ship);
    document.getElementById("sumDiscountRow").hidden = t.disc === 0;
    document.getElementById("sumDiscount").textContent = "−" + fmtEUR(t.disc);
    document.getElementById("sumTotal").textContent = fmtEUR(t.total);
    document.getElementById("payAmount").textContent = fmtEUR(t.total);
  }

  function renderAll() {
    renderRows();
    renderSummary();
  }

  /* re-render whenever the shared cart changes (qty/remove handled by main.js) */
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-qty],[data-remove],[data-add]")) renderAll();
  });

  /* ---------- promo ---------- */
  const promoInput = document.getElementById("promoInput");
  const promoMsg = document.getElementById("promoMsg");
  document.getElementById("promoApply").addEventListener("click", () => {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) return;
    if (code === SITE.promoCode) {
      promoPct = SITE.promoPct;
      promoMsg.textContent = "Promo applied — 10% off your order";
      promoMsg.className = "promo-msg ok";
      promoInput.disabled = true;
      renderSummary();
      M.showToast("Promo applied", "MUNDA10 · −10%");
    } else {
      promoMsg.textContent = "That code isn't valid. Try MUNDA10.";
      promoMsg.className = "promo-msg err";
    }
  });

  /* ---------- checkout flow ---------- */
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    const panel = document.getElementById("checkoutPanel");
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const payForm = document.getElementById("payForm");
  payForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("payName").value.trim();
    const email = document.getElementById("payEmail").value.trim();
    const card = document.getElementById("payCard").value.replace(/\s/g, "");
    const exp = document.getElementById("payExp").value.trim();
    const cvc = document.getElementById("payCvc").value.trim();

    const fail = (el, msg) => {
      M.showToast("Check your details", msg);
      el.focus();
    };
    if (!name) return fail(document.getElementById("payName"), "Name is required");
    if (!/.+@.+\..+/.test(email)) return fail(document.getElementById("payEmail"), "Enter a valid email");
    if (!/^\d{13,19}$/.test(card)) return fail(document.getElementById("payCard"), "Card number looks incomplete");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) return fail(document.getElementById("payExp"), "Use MM/YY format");
    if (!/^\d{3,4}$/.test(cvc)) return fail(document.getElementById("payCvc"), "CVC is 3–4 digits");

    /* success */
    const orderNo = `MU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    M.saveCart({});
    M.updateCartUI();
    M.renderCartItems();

    document.querySelector(".cartpage").hidden = true;
    const panel = document.getElementById("checkoutPanel");
    panel.innerHTML = `
      <div class="success">
        <div class="success__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <h3>Order confirmed</h3>
        <p>Thanks, ${name.split(" ")[0]}. Your order <span class="order-no">${orderNo}</span> is being prepared and will ship within 24 hours.</p>
        <p>A confirmation has been sent to <strong style="color:var(--ink)">${email}</strong>.</p>
        <div style="display:flex;gap:12px;justify-content:center;margin-top:26px">
          <a class="btn btn--red" href="shop.html">Continue shopping</a>
          <a class="btn btn--ghost" href="index.html">Back to home</a>
        </div>
      </div>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* card number formatting: 4242 4242 4242 4242 */
  document.getElementById("payCard").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  });
  document.getElementById("payExp").addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    e.target.value = v;
  });
  document.getElementById("payCvc").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  });

  renderAll();
})();
