/* ============================================================
   MUNDA PERFORMANCE — shared app logic
   Header, cart system (localStorage), search overlay, wishlist,
   toasts, reveal-on-scroll. Loaded on every page.
   ============================================================ */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const getParam = (n) => new URLSearchParams(location.search).get(n);

  /* ---------- image fallback guard ---------- */
  document.addEventListener(
    "error",
    (e) => {
      const t = e.target;
      if (t && t.tagName === "IMG" && !t.dataset.fbk) {
        t.dataset.fbk = "1";
        t.src = IMG_FALLBACK;
      }
    },
    true
  );

  /* ---------- header ---------- */
  const header = $(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  $$(".nav__link, .mobile-menu__link").forEach((a) => {
    const p = new URL(a.href, location.href);
    const here = new URL(location.href);
    if (p.pathname === here.pathname && a.classList.contains("nav__link")) a.classList.add("active");
    const cat = getParam("cat");
    if (cat && a.dataset.cat === cat) a.classList.add("active");
  });

  /* ---------- mobile menu ---------- */
  const mobileMenu = $("#mobileMenu");
  const burger = $(".hamburger");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
    mobileMenu.addEventListener("click", (e) => {
      if (e.target.closest("a") || e.target === mobileMenu) mobileMenu.classList.remove("open");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") mobileMenu.classList.remove("open");
    });
  }

  /* ============================================================
     CART — localStorage-backed, shared across pages
     ============================================================ */
  const CART_KEY = "munda_cart";
  const WISH_KEY = "munda_wish";
  let memCart = null; // in-memory fallback when storage is unavailable (e.g. sandboxed webviews)

  const loadCart = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      const clean = {};
      Object.entries(raw).forEach(([id, qty]) => {
        const p = getProduct(id);
        if (p && qty > 0) clean[id] = Math.min(qty, 20);
      });
      return clean;
    } catch {
      return memCart || {};
    }
  };
  const saveCart = (cart) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      memCart = cart;
    } catch {
      memCart = cart;
    }
  };
  const cartCount = () => Object.values(loadCart()).reduce((a, b) => a + b, 0);
  const cartSubtotal = () =>
    Object.entries(loadCart()).reduce((sum, [id, q]) => {
      const p = getProduct(id);
      return p ? sum + p.price * q : sum;
    }, 0);

  function addToCart(id, qty = 1, { silent = false } = {}) {
    const p = getProduct(id);
    if (!p) return;
    const cart = loadCart();
    cart[id] = (cart[id] || 0) + qty;
    saveCart(cart);
    updateCartUI();
    if (!silent) {
      showToast("Added to cart", `${p.name} · ${fmtEUR(p.price * qty)}`);
      openDrawer();
    }
  }

  function setQty(id, qty) {
    const cart = loadCart();
    if (qty <= 0) delete cart[id];
    else cart[id] = Math.min(qty, 20);
    saveCart(cart);
    updateCartUI();
  }

  const removeFromCart = (id) => setQty(id, 0);

  function updateCartUI() {
    const count = cartCount();
    const badge = $(".cart-badge");
    if (badge) {
      badge.textContent = count;
      if (count > 0) {
        badge.dataset.count = "1";
        badge.classList.remove("bump");
        void badge.offsetWidth; // restart pop animation
        badge.classList.add("bump");
      } else delete badge.dataset.count;
    }
    if (typeof renderCartItems === "function") renderCartItems();
  }

  /* ---------- drawer ---------- */
  const drawer = $("#cartDrawer");
  const backdrop = $("#drawerBackdrop");
  const openDrawer = () => {
    drawer && drawer.classList.add("open");
    backdrop && backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  const closeDrawer = () => {
    drawer && drawer.classList.remove("open");
    backdrop && backdrop.classList.remove("open");
    document.body.style.overflow = "";
  };
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) addToCart(addBtn.dataset.add, 1, { silent: addBtn.dataset.silent === "1" });
    const wishBtn = e.target.closest("[data-wish]");
    if (wishBtn) toggleWish(wishBtn.dataset.wish, wishBtn);
    if (e.target.closest("[data-close-drawer]") || e.target === backdrop) closeDrawer();
    const qtyBtn = e.target.closest("[data-qty]");
    if (qtyBtn && qtyBtn.dataset.qtyId) {
      const delta = +qtyBtn.dataset.qtyDelta;
      setQty(qtyBtn.dataset.qtyId, (loadCart()[qtyBtn.dataset.qtyId] || 0) + delta);
    }
    const rmBtn = e.target.closest("[data-remove]");
    if (rmBtn) removeFromCart(rmBtn.dataset.remove);
  });

  function renderCartItems() {
    const box = $("#drawerItems");
    if (!box) return;
    const cart = loadCart();
    const ids = Object.keys(cart);
    if (!ids.length) {
      box.innerHTML = `<div class="drawer__empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/></svg>
        <p>Your cart is empty.</p>
        <a href="shop.html" class="btn btn--ghost btn--sm" style="margin-top:14px">Browse parts</a>
      </div>`;
      const foot = $(".drawer__foot");
      if (foot) foot.style.display = "none";
      return;
    }
    const foot = $(".drawer__foot");
    if (foot) foot.style.display = "";
    box.innerHTML = ids
      .map((id) => {
        const p = getProduct(id);
        if (!p) return "";
        return `<div class="cart-item">
          <a class="cart-item__thumb" href="product.html?id=${p.id}"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
          <div>
            <a class="cart-item__name" href="product.html?id=${p.id}">${p.name}</a>
            <div class="cart-item__partno">${p.partNo}</div>
            <div class="cart-item__price">${fmtEUR(p.price)}</div>
          </div>
          <div class="cart-item__side">
            <span class="qty">
              <button data-qty data-qty-id="${p.id}" data-qty-delta="-1" aria-label="Decrease quantity">−</button>
              <output>${cart[id]}</output>
              <button data-qty data-qty-id="${p.id}" data-qty-delta="1" aria-label="Increase quantity">+</button>
            </span>
            <span class="cart-item__line">${fmtEUR(p.price * cart[id])}</span>
            <button class="cart-item__remove" data-remove="${p.id}">Remove</button>
          </div>
        </div>`;
      })
      .join("");

    const sub = cartSubtotal();
    const total = $("#drawerTotal");
    if (total) total.textContent = fmtEUR(sub);
    const cnt = $("#drawerCount");
    if (cnt) cnt.textContent = `(${cartCount()})`;

    /* free-shipping progress */
    const th = SITE.freeShipThreshold;
    const shipMsg = $("#shipMsg");
    const shipFill = $("#shipFill");
    if (shipMsg && shipFill) {
      if (sub >= th) {
        shipMsg.innerHTML = "<strong>Unlocked:</strong> free express shipping on this order";
        shipFill.style.width = "100%";
      } else {
        shipMsg.innerHTML = `Add <strong>${fmtEUR(th - sub)}</strong> more for free express shipping`;
        shipFill.style.width = `${Math.min(100, (sub / th) * 100)}%`;
      }
    }
  }

  /* ---------- wishlist ---------- */
  const loadWish = () => {
    try {
      return JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
    } catch {
      return [];
    }
  };
  function toggleWish(id, btn) {
    let wish = loadWish();
    const has = wish.includes(id);
    wish = has ? wish.filter((w) => w !== id) : [...wish, id];
    localStorage.setItem(WISH_KEY, JSON.stringify(wish));
    if (btn) btn.classList.toggle("on", !has);
    showToast(has ? "Removed from wishlist" : "Saved to wishlist", getProduct(id)?.name || "");
  }

  function syncWishButtons() {
    const wish = loadWish();
    $$("[data-wish]").forEach((b) => b.classList.toggle("on", wish.includes(b.dataset.wish)));
  }

  /* ---------- toasts ---------- */
  function showToast(title, sub = "") {
    const host = $("#toasts");
    if (!host) return;
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      <div class="toast__txt">${title}${sub ? `<small>${sub}</small>` : ""}</div>`;
    host.appendChild(t);
    setTimeout(() => {
      t.classList.add("out");
      setTimeout(() => t.remove(), 380);
    }, 3200);
  }

  /* ============================================================
     SEARCH OVERLAY
     ============================================================ */
  const overlay = $("#searchOverlay");
  const input = $("#searchInput");
  const resultsBox = $("#searchResults");

  const openSearch = () => {
    overlay && overlay.classList.add("open");
    overlay && overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => input && input.focus(), 60);
  };
  const closeSearch = () => {
    overlay && overlay.classList.remove("open");
    overlay && overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (input) input.value = "";
    if (resultsBox) resultsBox.innerHTML = "";
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-search-open]")) openSearch();
    if (e.target === overlay) closeSearch();
    const si = e.target.closest("[data-search-go]");
    if (si) location.href = si.dataset.searchGo;
  });
  document.addEventListener("keydown", (e) => {
    if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") {
      closeSearch();
      closeDrawer();
    }
  });

  function runSearch(q) {
    if (!resultsBox) return;
    q = q.trim().toLowerCase();
    if (q.length < 2) {
      resultsBox.innerHTML = "";
      return;
    }
    const hits = PRODUCTS.filter((p) =>
      [p.name, p.partNo, catName(p.category), ...p.compat].join(" ").toLowerCase().includes(q)
    ).slice(0, 6);
    if (!hits.length) {
      resultsBox.innerHTML = `<div class="search-none">No parts match “${q.trim()}”. Try a part number or model.</div>`;
      return;
    }
    resultsBox.innerHTML = hits
      .map(
        (p) => `<div class="search-item" data-search-go="product.html?id=${p.id}">
          <img src="${p.img}" alt="" loading="lazy">
          <div>
            <div class="search-item__name">${p.name}</div>
            <div class="search-item__meta">${p.partNo} · ${catName(p.category)}</div>
          </div>
          <div class="search-item__price">${fmtEUR(p.price)}</div>
        </div>`
      )
      .join("");
  }
  if (input) input.addEventListener("input", (e) => runSearch(e.target.value));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("revealed");
          io.unobserve(en.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" }
  );
  window.observeReveals = (root = document) => $$("[data-reveal]", root).forEach((el) => io.observe(el));
  window.observeReveals();
  window.syncWishButtons = syncWishButtons;

  /* ---------- misc ---------- */
  $$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));

  const promoForm = $("#newsletterForm");
  if (promoForm) {
    promoForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = promoForm.querySelector("input");
      if (!email.value.includes("@")) return;
      showToast("Welcome to MUNDA", "Your 5% welcome code is on its way");
      promoForm.reset();
    });
  }

  /* expose for page scripts */
  window.Munda = { addToCart, setQty, removeFromCart, cartCount, cartSubtotal, loadCart, saveCart, updateCartUI, showToast, openDrawer, closeDrawer, getParam, fmtEUR, syncWishButtons, renderCartItems };

  updateCartUI();
  syncWishButtons();
  renderCartItems();
})();
