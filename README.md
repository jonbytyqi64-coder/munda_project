# MUNDA — Audi Interior Ambient Lighting

A modern, premium e-commerce front-end for **MUNDA**, a manufacturer of
Audi interior ambient lighting. Factory-direct positioning: kits are designed,
built and bench-tested in-house.
Dark automotive design system: black / white / dark gray with Audi-inspired
red accents and a signature red→white "spectrum" accent.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Hero (lit interior), model fitment widget, category tiles, bestsellers, **the factory** (manufacturing process), trust strip, model marquee, new arrivals, reviews, newsletter CTA |
| `shop.html` | Full catalogue with category / price / compatibility filters, sorting, URL state |
| `product.html` | Product detail: gallery, specs, fitment chips, related products, add to cart |
| `cart.html` | Cart review, promo codes, order summary, demo checkout (steps + confirmation) |

## Features

- **Working cart** — persisted in `localStorage`, slide-in drawer, quantity steppers, free-shipping progress bar
- **Search overlay** — press `/` or `Ctrl+K`, live results across names, part numbers and models
- **Wishlist** — heart buttons, persisted in `localStorage`
- **Fitment filtering** — every product carries an Audi model compatibility list; shop filters by model
- **Promo code** — `MUNDA10` gives 10% off at checkout (demo)
- **Factory story** — 5-step manufacturing section (calibration → CNC → assembly → bench test → dispatch)
- **Subtle motion** — scroll-reveal, hover lift/zoom, marquee ticker, toast feedback; all disabled under `prefers-reduced-motion`
- **Responsive** — mobile menu, fluid grids, touch-friendly hit targets

## Run locally

Open any `index.html` directly, or serve the folder:

```bash
cd munda_project
python -m http.server 8000
# → http://localhost:8000
```

## Customize

Everything content-related lives in `assets/js/data.js`:

- `SITE` — brand name, currency, free-shipping threshold, promo code
- `PRODUCTS` — catalog: kits, strips, controllers, services — names, part numbers, prices, specs, compatibility
- `CATEGORIES`, `MODELS`, `TESTIMONIALS`, `MARQUEE_MODELS`

Design tokens (colors, type, radii, motion) are CSS variables at the top of `assets/css/style.css`.

## Notes

- Product photography uses stock car/interior images as placeholders — swap the `img` field of each product
  (or the `CATEGORIES` images) for real product shots; an automatic dark fallback shows if an image fails to load.
- The checkout is a **demo** — no payment is processed and card details never leave the browser.
- Original brand mark (SVG) — deliberately not an Audi badge.
