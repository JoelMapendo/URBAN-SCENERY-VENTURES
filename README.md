# URBAN-SCENERY-VENTURES

E-commerce storefront for phones, laptops and electronics. This repository currently holds the
**frontend**: a static, multi-page site with no build step and no dependencies.

## Structure

```
index.html      # home: hero, categories, featured, new arrivals, reviews, articles
shop.html       # catalogue: category / brand / price / rating filters, sorting, pagination
product.html    # product detail: gallery, buy box, spec tabs, reviews, related products
cart.html       # cart lines, order summary, recently viewed
about.html      # how the store operates
contact.html    # contact form, details, FAQ
css/style.css   # design tokens + every component style
js/products.js  # categories, products, testimonials, articles, helpers (window.USV)
js/cart.js      # cart / wishlist / recently viewed store (window.USVCart)
js/main.js      # shared behaviour loaded on every page
js/shop.js      # shop page only — URL-driven filters, sorting, pagination
js/product.js   # product page only — gallery, buy box, tabs
images/         # original SVG artwork, ready to be replaced with photography
```

`js/main.js`, `js/products.js` and `js/cart.js` load on every page. `js/shop.js` and
`js/product.js` only load on the pages that need them, and both exit early when their page
elements are absent, so they are safe to keep in the same bundle.

## Run locally

Opening `index.html` directly from disk works, but a local server is better because the shop
page reads its filters from the query string.

```bash
# pick whichever you have installed
python -m http.server 8000
npx serve .
php -S localhost:8000
```

Then open <http://localhost:8000>.

## Conventions

- **Theming** — every colour, radius, shadow and transition lives in `:root` in `css/style.css`.
  Change the theme there, not in component rules. The brand orange is `--brand`.
- **Data** — `js/products.js` is mock data shaped so it can be replaced by `fetch()` calls that
  return the same objects. Nothing else in the codebase reads the raw arrays; everything goes
  through the exported helpers on `window.USV`.
- **State** — the cart, wishlist and recently-viewed list live in `localStorage` under
  `usv.cart.v1`, `usv.wishlist.v1` and `usv.recent.v1`. All three are read and written through
  `window.USVCart`, so a real backend only has to replace that one module.
- **Shop filters** — `shop.html` keeps its entire state in the URL (`?category=laptops&sort=price-asc&page=2`),
  which means any filtered view can be bookmarked or shared and the back button works.
- **Images** — the SVGs in `images/` are original placeholders. Swap in real photography without
  touching markup; only the paths in `js/products.js` need to change.
- **Accessibility** — every page has a skip link, labelled controls, visible focus states, and
  `prefers-reduced-motion` is respected by the scroll reveals.
- **Currency** — set in `USV.config` (`currency`, `symbol`, `locale`). It currently defaults to
  USD / `$` and every price on the site is rendered through `USV.money()`.

## Not wired up yet

- Checkout. `data-checkout` shows a confirmation toast and stops there — there is no payment
  provider or order endpoint.
- The contact and newsletter forms validate and confirm, but do not submit anywhere.
- Accounts. The account icon in the header is a placeholder link.
- `js/products.js` and the header search select are static data; there is no live inventory feed.

## Roadmap

- [x] Home page with dynamic catalogue sections
- [x] Catalogue page with filters, sorting and pagination
- [x] Product detail page with gallery, specs and related products
- [x] Cart with totals, delivery and tax
- [x] About and contact pages with form validation
- [ ] Checkout and payment integration
- [ ] Backend API for products, stock and orders
- [ ] Real product photography
