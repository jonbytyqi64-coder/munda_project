/* ============================================================
   MUNDA — Audi Interior Ambient Lighting
   Factory-direct manufacturer. All catalog content lives here:
   edit products, categories, prices and copy in one place.
   ============================================================ */

const SITE = {
  name: "MUNDA",
  tagline: "Audi Interior Ambient Lighting",
  currency: "EUR",
  freeShipThreshold: 150,   // free express shipping above this subtotal
  shippingFee: 9.9,
  promoCode: "MUNDA10",     // 10% off — demo promo
  promoPct: 0.10,
};

const CATEGORIES = [
  { slug: "kits",        name: "Ambient Light Kits",      blurb: "Complete interior conversions",        img: "assets/img/audiii.webp" },
  { slug: "interior",    name: "Interior Lighting",        blurb: "Bars, strips and footwell light",      img: "assets/img/audi_interior_photoreal.jpg" },
  { slug: "exterior",    name: "Logo & Exterior Light",    blurb: "Puddle beams and grille accents",      img: "assets/img/audi_dashboard_night.jpg" },
  { slug: "controllers", name: "Controllers & Modules",    blurb: "App, gesture and voice control",       img: "assets/img/audi_door_textile_light.jpg" },
  { slug: "custom",      name: "Factory & OEM Services",   blurb: "Custom calibration, B2B supply",       img: "assets/img/audiii.webp" },
];

const MODELS = [
  { value: "A3",  label: "A3 / S3 / RS3 (8V)" },
  { value: "A4",  label: "A4 / S4 / RS4 (B9)" },
  { value: "A5",  label: "A5 / S5 / RS5 (F5)" },
  { value: "A6",  label: "A6 / S6 / RS6 (C8)" },
  { value: "A7",  label: "A7 / S7 (4K)" },
  { value: "A8",  label: "A8 / S8 (D5)" },
  { value: "Q3",  label: "Q3 (F3)" },
  { value: "Q5",  label: "Q5 / SQ5 (FY)" },
  { value: "Q7",  label: "Q7 (4M)" },
  { value: "Q8",  label: "Q8 / RS Q8" },
  { value: "TT",  label: "TT / TTS / TTRS (8S)" },
  { value: "R8",  label: "R8 (4S)" },
  { value: "etron", label: "e-tron GT / RS e-tron" },
];

const MARQUEE_MODELS = ["A3","S3","RS3","A4","S4","RS4","A5","S5","RS5","A6","S6","RS6","A7","S7","RS7","A8","Q3","Q5","SQ5","Q7","Q8","RS Q8","TT","TTS","R8","e-tron GT"];

const PRODUCTS = [
  {
    id: "amb-001", category: "kits", name: "Full Interior Ambient Kit — 64 Colors",
    partNo: "MND-AMB64", price: 649, oldPrice: 749, rating: 4.9, reviews: 231,
    badge: "Bestseller", img: "assets/img/audi_interior_photoreal.jpg",
    compat: ["A4 (B9)", "A5 (F5)", "A6 (C8)", "A7 (4K)", "Q5 (FY)"],
    desc: "Our flagship 64-color conversion: dashboard light bar, four door strips, footwells and cupholders — 26 light zones on OEM-grade fiber optics. Colors are calibrated on the bench to match the MMI palette exactly.",
    specs: { "Colors": "64, factory color-calibrated", "Light zones": "26 (bar + doors + footwells + cupholders)", "Technology": "Side-glow fiber optics, CNC-milled guides", "Control": "App, MMI-integrated or gesture", "Install": "Plug & play — OEM harness, no splicing", "Warranty": "2 years / unlimited km" }
  },
  {
    id: "amb-002", category: "kits", name: "Pro Series Kit — 32 Light Zones",
    partNo: "MND-PRO32", price: 899, rating: 5.0, reviews: 118,
    badge: "New", img: "assets/img/audi_dashboard_night.jpg",
    compat: ["A6 (C8)", "A7 (4K)", "A8 (D5)", "Q7 (4M)", "Q8 (4M)"],
    desc: "The full 32-zone Pro conversion for the C8 / 4K / 4M platforms — every surface, including the speaker rings and dashboard contour, lit with true RGB and per-zone animation. Our most installed kit in workshops.",
    specs: { "Colors": "16.7M RGB (true color)", "Light zones": "32 individually addressable", "Extras": "Speaker rings, contour lines", "Control": "Pro app with per-zone scenes", "Install": "OEM harness, CAN-integrated dimming", "Warranty": "3 years (Pro program)" }
  },
  {
    id: "amb-003", category: "kits", name: "e-tron Style Light Package",
    partNo: "MND-ETRN", price: 549, rating: 4.8, reviews: 87,
    badge: "", img: "assets/img/audi_door_textile_light.jpg",
    compat: ["e-tron GT", "Q8 e-tron"],
    desc: "The e-tron GT signature look — layered light with soft color transitions and a pulsing welcome sequence. Designed for the electric platforms and their digital cockpit layouts.",
    specs: { "Colors": "64, e-tron signature presets", "Light zones": "18", "Sequence": "Pulsing welcome animation", "Control": "App + cockpit display sync", "Install": "Plug & play, e-tron harness", "Warranty": "2 years" }
  },
  {
    id: "int-001", category: "interior", name: "Dashboard Light Bar — Fiber Optic",
    partNo: "MND-DLB01", price: 199, rating: 4.8, reviews: 302,
    badge: "", img: "assets/img/audiii.webp",
    compat: ["A4 (B9)", "A5 (F5)", "A6 (C8)", "A7 (4K)"],
    desc: "The signature MUNDA dashboard bar: a single CNC-milled fiber-optic guide running the full width of the dash. Edge-lit, hotspot-free and invisible when off.",
    specs: { "Length": "Custom-cut per model (up to 1,600 mm)", "Light source": "RGB LED, 120 lm", "Guide": "3 mm side-glow fiber, polished ends", "Diffusion": "Uniform, no hotspots", "Control": "App or dimmer wheel", "Warranty": "2 years" }
  },
  {
    id: "int-002", category: "interior", name: "Door Panel Light Strips (Set of 4)",
    partNo: "MND-DSL04", price: 149, rating: 4.7, reviews: 268,
    badge: "", img: "assets/img/audi_interior_photoreal.jpg",
    compat: ["A3 (8V)", "A4 (B9)", "A5 (F5)", "Q3 (F3)", "Q5 (FY)", "TT (8S)"],
    desc: "Pre-formed aluminum-channel strips for all four doors, with the OEM contour copied to 0.1 mm. Adhesive-backed with a factory-style connector — fitted in about an hour.",
    specs: { "Set": "4 doors", "Profile": "Brushed aluminum channel", "Fit": "OEM contour, 0.1 mm tolerance", "Connector": "Factory-style, polarity-safe", "Control": "Syncs with kit controller", "Warranty": "2 years" }
  },
  {
    id: "int-003", category: "interior", name: "RGB Footwell Light Set",
    partNo: "MND-FWL03", price: 89, rating: 4.6, reviews: 411,
    badge: "", img: "assets/img/audi_dashboard_night.jpg",
    compat: ["A3 (8V)", "A4 (B9)", "A6 (C8)", "Q5 (FY)", "TT (8S)"],
    desc: "Four under-dash RGB modules with diffused lenses. The fastest interior upgrade we make — ten minutes, no trim removal, factory dimming behavior.",
    specs: { "Modules": "4 (driver, passenger, rear x2)", "Brightness": "Dimmable, CAN-synced", "Mount": "Magnetic + adhesive", "Power": "From light switch circuit", "Control": "App or existing dimmer", "Warranty": "2 years" }
  },
  {
    id: "int-004", category: "interior", name: "Starlight Headliner Kit",
    partNo: "MND-STL01", price: 499, rating: 4.9, reviews: 64,
    badge: "New", img: "assets/img/audi_door_textile_light.jpg",
    compat: ["A4 (B9)", "A5 (F5)", "A6 (C8)", "A8 (D5)", "Q7 (4M)"],
    desc: "400 hand-placed optical fibers in the headliner with a dedicated twinkle module. Built in our upholstery shop on your exchanged headliner — a true factory-grade conversion.",
    specs: { "Fibers": "400 optical points", "Module": "Twinkle + static modes", "Work": "On exchanged headliner (send-in)", "Turnaround": "5 working days", "Finish": "Original fabric retained", "Warranty": "2 years" }
  },
  {
    id: "ext-001", category: "exterior", name: "Logo Beam Puddle Lights (Set of 4)",
    partNo: "MND-LGB04", price: 129, rating: 4.8, reviews: 354,
    badge: "Bestseller", img: "assets/img/audiii.webp",
    compat: ["A3 (8V)", "A4 (B9)", "A5 (F5)", "A6 (C8)", "Q3 (F3)", "Q5 (FY)", "Q7 (4M)", "TT (8S)"],
    desc: "Crisp LED logo beams for all four doors, projecting the MUNDA hex mark in 6,500 K white. Factory-fitted housings with an anti-flicker driver — no error codes, ever.",
    specs: { "Set": "4 doors", "Projection": "MUNDA hex mark, 6,500 K", "Housing": "OEM-fit, sealed IP67", "Driver": "Anti-flicker, CAN-safe", "Install": "Direct swap of door lights", "Warranty": "2 years" }
  },
  {
    id: "ext-002", category: "exterior", name: "Front Grille Illumination Strip",
    partNo: "MND-GRL01", price: 179, rating: 4.7, reviews: 142,
    badge: "", img: "assets/img/audi_interior_photoreal.jpg",
    compat: ["A4 (B9)", "A5 (F5)", "A6 (C8)", "Q5 (FY)"],
    desc: "A subtle light line following the grille contour — white in motion, dimmed at standstill. CNC-formed acrylic lens, IP67, tapped into the DRL circuit.",
    specs: { "Lens": "CNC-formed acrylic, UV-stable", "Color": "6,500 K white (dimmed at standstill)", "Rating": "IP67", "Wiring": "DRL circuit, relay included", "Install": "Adhesive + bracket, ~40 min", "Warranty": "2 years" }
  },
  {
    id: "ext-003", category: "exterior", name: "Dynamic Welcome Light Sequence",
    partNo: "MND-WLC01", price: 99, rating: 4.6, reviews: 97,
    badge: "", img: "assets/img/audi_dashboard_night.jpg",
    compat: ["A3 (8V)", "A4 (B9)", "A5 (F5)", "Q3 (F3)"],
    desc: "A sweep animation across the dash bar and door strips when you unlock — configurable direction and speed. Works with any MUNDA kit controller.",
    specs: { "Animation": "Sweep left / right / both", "Speed": "3 steps", "Trigger": "Unlock + door open", "Compatibility": "All MUNDA controllers", "Update": "Via app firmware", "Warranty": "2 years" }
  },
  {
    id: "ctl-001", category: "controllers", name: "Smart RGB Controller — App & Voice",
    partNo: "MND-CTL64", price: 149, rating: 4.9, reviews: 198,
    badge: "Bestseller", img: "assets/img/audi_door_textile_light.jpg",
    compat: ["A3 (8V)", "A4 (B9)", "A5 (F5)", "A6 (C8)", "Q5 (FY)", "TT (8S)"],
    desc: "The brain of every MUNDA kit: 64-color control, 26-zone mapping, scenes and schedules in the app — plus Alexa and Google Home voice commands from the driver's seat.",
    specs: { "Zones": "Up to 32", "Wireless": "Bluetooth 5.3 + Wi-Fi", "Voice": "Alexa / Google Assistant", "Power": "CAN-safe, fused", "Size": "Fits behind glovebox", "Warranty": "2 years" }
  },
  {
    id: "ctl-002", category: "controllers", name: "Gesture Control Module",
    partNo: "MND-GST01", price: 89, rating: 4.7, reviews: 76,
    badge: "New", img: "assets/img/audiii.webp",
    compat: ["A4 (B9)", "A5 (F5)", "A6 (C8)", "A7 (4K)"],
    desc: "Wave to switch scenes, swipe to dim. An infrared sensor mounted under the dash reads hand gestures with zero distraction — no reaching, no menus.",
    specs: { "Sensor": "IR proximity, 30 cm range", "Gestures": "Wave, swipe, hold", "Mount": "Under-dash, adhesive", "Integration": "Any MUNDA controller", "Power": "5 V from controller", "Warranty": "2 years" }
  },
  {
    id: "ctl-003", category: "controllers", name: "OEM Plug & Play Harness",
    partNo: "MND-HRN01", price: 59, rating: 4.8, reviews: 512,
    badge: "", img: "assets/img/audi_interior_photoreal.jpg",
    compat: ["A3 (8V)", "A4 (B9)", "A5 (F5)", "A6 (C8)", "Q3 (F3)", "Q5 (FY)", "TT (8S)"],
    desc: "Model-specific looms with factory connectors and CAN taps — the reason our kits install without a single splice. Sold separately or bundled with every kit.",
    specs: { "Type": "Model-specific, pre-terminated", "Connectors": "Factory-grade, polarity-safe", "CAN": "T-tap included", "Length": "Custom per model", "Coverage": "All MUNDA kits", "Warranty": "2 years" }
  },
  {
    id: "oem-001", category: "custom", name: "Custom Color Calibration",
    partNo: "MND-CAL01", price: 149, rating: 5.0, reviews: 43,
    badge: "New", img: "assets/img/audi_dashboard_night.jpg",
    compat: ["A3 (8V)", "A4 (B9)", "A5 (F5)", "A6 (C8)", "Q5 (FY)", "TT (8S)"],
    desc: "Send us a paint code or a hex value and our light lab matches it on the bench — 3 working days, delivered as a firmware profile for your MUNDA controller. Factory service, done properly.",
    specs: { "Service": "Bench-matched color profile", "Turnaround": "3 working days", "Delivery": "Firmware profile + app preset", "Scope": "Any RGB value / paint code", "Re-runs": "Free within 12 months", "Warranty": "n/a — service" }
  },
  {
    id: "oem-002", category: "custom", name: "OEM Supply Program — Sample Kit",
    partNo: "MND-OEM01", price: 2499, rating: 4.9, reviews: 21,
    badge: "B2B", img: "assets/img/audi_door_textile_light.jpg",
    compat: ["A4 (B9)", "A5 (F5)", "A6 (C8)", "Q5 (FY)"],
    desc: "For workshops and distributors: a full evaluation kit with trade pricing, white-label packaging options and direct factory support. Volume pricing from 10 kits, drop-shipping available.",
    specs: { "Includes": "1× Pro kit + demo controller", "Trade pricing": "From 10 units", "Packaging": "White-label option", "Support": "Direct factory line", "Shipping": "Pallet or drop-ship", "Payment": "Net 30 for accounts" }
  },
];

const TESTIMONIALS = [
  { name: "Luka M.", car: "A6 (C8)", stars: 5, quote: "The 64-color kit transformed the cabin. The colors match the MMI perfectly and the app is genuinely useful — not a gimmick." },
  { name: "Sofia K.", car: "Q5 (FY)", stars: 5, quote: "Factory-direct quality. The fiber-optic bar looks factory-fitted because the harness is OEM — no splicing, no errors." },
  { name: "Tomislav B.", car: "Workshop owner", stars: 5, quote: "We fit MUNDA kits on customer cars every week — zero returns in a year. The B2B supply program is a no-brainer." },
];

/* Fallback image (dark surface + mark) used if a photo fails to load */
const IMG_FALLBACK =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>" +
    "<rect width='800' height='600' fill='#101013'/>" +
    "<path d='M400 140 640 270v160L400 560 160 430V270L400 140Z' fill='none' stroke='#e4002b' stroke-width='10' opacity='.5'/>" +
    "<text x='400' y='345' fill='#7a7a83' font-family='Arial' font-size='32' letter-spacing='8' text-anchor='middle'>MUNDA</text>" +
    "</svg>"
  );

/* ---------- helpers ---------- */
const fmtEUR = (n) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
const catName = (slug) => (CATEGORIES.find((c) => c.slug === slug) || {}).name || slug;

const starsHTML = (n) => {
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<svg class="${i <= Math.round(n) ? "" : "off"}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5 15 9l7 .8-5.2 4.6 1.5 6.9L12 17.7 5.7 21.3l1.5-6.9L2 9.8 9 9l3-6.5Z"/></svg>`;
  }
  return `<span class="stars" aria-label="${n} out of 5 stars">${out}</span>`;
};

const HEART_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.3a5 5 0 1 1 7.5 6.3Z"/></svg>`;

/* Shared product-card markup (used by index, shop, related) */
const productCardHTML = (p) => `
<article class="pcard" data-reveal>
  <div class="pcard__media">
    ${p.badge ? `<div class="pcard__badges"><span class="tag">${p.badge}</span></div>` : ""}
    <button class="pcard__wish" data-wish="${p.id}" aria-label="Save to wishlist">${HEART_SVG}</button>
    <a href="product.html?id=${p.id}" aria-label="${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy" width="800" height="600"></a>
    <div class="pcard__quick"><button class="btn btn--red btn--block btn--sm" data-add="${p.id}">Add to cart</button></div>
  </div>
  <div class="pcard__body">
    <span class="pcard__cat">${catName(p.category)}</span>
    <h3 class="pcard__name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
    <span class="pcard__partno">Part no. ${p.partNo}</span>
    <div class="pcard__rating">${starsHTML(p.rating)} <strong>${p.rating}</strong> <span>(${p.reviews})</span></div>
    <div class="pcard__foot">
      <div class="price-row">
        <span class="price">${fmtEUR(p.price)}</span>
        ${p.oldPrice ? `<span class="price--old">${fmtEUR(p.oldPrice)}</span>` : ""}
      </div>
    </div>
  </div>
</article>`;
