/* =========================================================
   Product detail page.
   Reads ?id= from the URL, renders gallery, buy box, tabs and
   related products. A missing or invalid id falls back to the
   "product not found" state rather than an empty page.
   ========================================================= */

(function () {
  "use strict";

  var USV = window.USV;
  var Cart = window.USVCart;

  var root = document.getElementById("pdp");
  if (!root) return;

  var galleryWrap = document.getElementById("pdp-gallery");
  var infoWrap = document.getElementById("pdp-info");
  var missing = document.getElementById("pdp-missing");
  var tabsWrap = document.getElementById("pdp-tabs");
  var related = document.getElementById("related");
  var relatedGrid = document.getElementById("related-grid");

  var image = document.getElementById("pdp-image");
  var flag = document.getElementById("pdp-flag");
  var thumbs = document.getElementById("pdp-thumbs");
  var brandOut = document.getElementById("pdp-brand");
  var titleOut = document.getElementById("pdp-title");
  var ratingOut = document.getElementById("pdp-rating");
  var skuOut = document.getElementById("pdp-sku");
  var catLink = document.getElementById("pdp-cat-link");
  var priceOut = document.getElementById("pdp-price");
  var wasOut = document.getElementById("pdp-was");
  var offOut = document.getElementById("pdp-off");
  var shortOut = document.getElementById("pdp-short");
  var stockOut = document.getElementById("pdp-stock");
  var stockText = document.getElementById("pdp-stock-text");
  var qtyInput = document.getElementById("pdp-qty");
  var addBtn = document.querySelector("[data-pdp-add]");
  var wishBtn = document.querySelector("[data-pdp-wish]");
  var descriptionOut = document.getElementById("pdp-description");
  var specsOut = document.getElementById("pdp-specs");
  var reviewsOut = document.getElementById("pdp-reviews");
  var crumbOut = document.getElementById("pdp-crumb");

  var product = null;
  var gallery = [];
  var activeImage = 0;

  /* ---------- gallery ---------- */

  function showImage(index) {
    if (!gallery.length) return;
    activeImage = (index + gallery.length) % gallery.length;
    image.src = gallery[activeImage];
    image.alt = product.name;
    thumbs.querySelectorAll("[data-thumb]").forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === activeImage);
      btn.setAttribute("aria-current", i === activeImage ? "true" : "false");
    });
  }

  function renderThumbs() {
    if (gallery.length < 2) {
      thumbs.hidden = true;
      return;
    }
    thumbs.hidden = false;
    thumbs.innerHTML = gallery
      .map(function (src, i) {
        return (
          '<button class="gallery__thumb" type="button" data-thumb="' + i + '" aria-label="View image ' + (i + 1) + ' of ' + gallery.length + '">' +
          '<img src="' + USV.escapeHtml(src) + '" alt="" loading="lazy" width="140" height="140" /></button>'
        );
      })
      .join("");
  }

  /* ---------- buy box ---------- */

  function clampQty(value) {
    var n = parseInt(value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (product && n > product.stock) n = product.stock;
    return n;
  }

  function renderStock() {
    var low = product.stock <= 15;
    stockOut.classList.toggle("is-low", low);
    stockText.textContent = low
      ? "Only " + product.stock + " left in stock"
      : product.stock + " in stock, ready to ship";
  }

  function renderWish() {
    var on = Cart.isWished(product.id);
    wishBtn.classList.toggle("is-on", on);
    wishBtn.setAttribute("aria-pressed", on ? "true" : "false");
    wishBtn.setAttribute("aria-label", on ? "Remove from wishlist" : "Save to wishlist");
    wishBtn.innerHTML = USV.icons.heart;
  }

  /* ---------- tabs ---------- */

  function reviewBucket() {
    var items = USV.testimonials.filter(function (t) {
      return t.product === product.name;
    });
    if (!items.length) {
      items = USV.testimonials.slice(0, 2);
    }
    return items;
  }

  function renderReviews() {
    var items = reviewBucket();
    var average = product.rating;

    var score = document.getElementById("pdp-score");
    var note = document.getElementById("pdp-score-note");
    var bars = document.getElementById("pdp-bars");
    if (score) score.textContent = average.toFixed(1);
    if (note) note.textContent = "out of 5 · " + product.reviews.toLocaleString(USV.config.locale) + " reviews";

    if (bars) {
      var fivePct = Math.min(100, Math.round(((average - 3) / 2) * 100));
      bars.innerHTML =
        '<div class="rating-bar"><span>5 star</span><span class="rating-bar__track"><span class="rating-bar__fill" style="width:' + fivePct + '%"></span></span><span>' + Math.round((product.reviews * fivePct) / 100).toLocaleString(USV.config.locale) + "</span></div>" +
        '<div class="rating-bar"><span>4 star</span><span class="rating-bar__track"><span class="rating-bar__fill" style="width:8%"></span></span><span>' + Math.round(product.reviews * 0.08).toLocaleString(USV.config.locale) + "</span></div>" +
        '<div class="rating-bar"><span>3 and below</span><span class="rating-bar__track"><span class="rating-bar__fill" style="width:3%"></span></span><span>' + Math.round(product.reviews * 0.03).toLocaleString(USV.config.locale) + "</span></div>";
    }

    reviewsOut.innerHTML = items
      .map(function (item) {
        return (
          '<article class="review-item">' +
          '<div class="review-item__head">' +
          '<span class="review__stars">' + USV.starsHtml(item.rating) + "</span>" +
          '<span class="review-item__name">' + USV.escapeHtml(item.name) + "</span>" +
          '<span class="review-item__date">' + USV.escapeHtml(item.date) + " · " + USV.escapeHtml(item.location) + "</span>" +
          "</div>" +
          "<p>" + USV.escapeHtml(item.body) + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderTabs() {
    tabsWrap.hidden = false;

    descriptionOut.innerHTML = "<p>" + USV.escapeHtml(product.description) + "</p>";

    specsOut.innerHTML = product.specs
      .map(function (row) {
        return "<tr><th scope=\"row\">" + USV.escapeHtml(row[0]) + "</th><td>" + USV.escapeHtml(row[1]) + "</td></tr>";
      })
      .join("");

    renderReviews();
  }

  /* ---------- perks ---------- */

  function renderPerks() {
    var warranty = (product.specs.filter(function (row) {
      return /warranty/i.test(row[0]);
    })[0] || [])[1];

    document.getElementById("perk-1").innerHTML =
      USV.icons.shield + "<span><strong>Verified before dispatch</strong><span>Opened, powered and spec-checked by our team.</span></span>";
    document.getElementById("perk-2").innerHTML =
      USV.icons.shield + "<span><strong>Manufacturer warranty</strong><span>" + USV.escapeHtml(warranty || "12 months cover") + ", claimable online.</span></span>";
    document.getElementById("perk-3").innerHTML =
      USV.icons.truck + "<span><strong>Free 30-day returns</strong><span>We cover the return pickup, no questions asked.</span></span>";
  }

  /* ---------- related ---------- */

  function renderRelated() {
    var list = USV.related(product, 4);
    if (!list.length) return;
    relatedGrid.innerHTML = USV.productGrid(list);
    related.hidden = false;
    if (window.USVReveal) window.USVReveal.refresh(relatedGrid);
  }

  /* ---------- render ---------- */

  function render() {
    brandOut.textContent = product.brand;
    titleOut.textContent = product.name;
    crumbOut.textContent = product.name;
    document.title = product.name + " | " + USV.config.storeName;
    document.querySelector('meta[name="description"]').setAttribute("content", product.short);

    ratingOut.innerHTML = USV.starsHtml(product.rating) + "<span>" + product.rating.toFixed(1) + " (" + product.reviews.toLocaleString(USV.config.locale) + ")</span>";
    skuOut.textContent = product.sku;
    catLink.textContent = USV.categoryName(product.category);
    catLink.href = "shop.html?category=" + encodeURIComponent(product.category);

    priceOut.textContent = USV.money(product.price);
    var off = USV.discount(product);
    if (product.oldPrice && off > 0) {
      wasOut.hidden = false;
      wasOut.textContent = USV.money(product.oldPrice);
      offOut.hidden = false;
      offOut.textContent = "Save " + off + "%";
    } else {
      wasOut.hidden = true;
      offOut.hidden = true;
    }

    var label = USV.badgeLabel(product.badge);
    if (label) {
      flag.hidden = false;
      flag.textContent = off > 0 ? label + " · -" + off + "%" : label;
    } else {
      flag.hidden = true;
    }

    shortOut.textContent = product.short;
    renderStock();
    renderWish();
    renderPerks();

    gallery = (product.gallery && product.gallery.length ? product.gallery : [product.image]).slice();
    renderThumbs();
    showImage(0);

    qtyInput.max = String(product.stock);
    qtyInput.value = "1";

    if (galleryWrap) galleryWrap.hidden = false;
    if (infoWrap) infoWrap.hidden = false;
    missing.hidden = true;
    renderTabs();
    renderRelated();

    document.querySelectorAll("[data-free-shipping]").forEach(function (node) {
      node.textContent = USV.money(USV.config.freeShippingOver);
    });
  }

  function fail() {
    missing.hidden = false;
    if (galleryWrap) galleryWrap.hidden = true;
    if (infoWrap) infoWrap.hidden = true;
    tabsWrap.hidden = true;
    related.hidden = true;
    document.title = "Product not found | " + USV.config.storeName;
    crumbOut.textContent = "Not found";
  }

  /* ---------- events ---------- */

  thumbs.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-thumb]");
    if (btn) showImage(parseInt(btn.getAttribute("data-thumb"), 10));
  });

  root.addEventListener("click", function (event) {
    var step = event.target.closest("[data-pdp-step]");
    if (!step) return;
    var delta = parseInt(step.getAttribute("data-pdp-step"), 10);
    qtyInput.value = String(clampQty(Number(qtyInput.value) + delta));
  });

  qtyInput.addEventListener("change", function () {
    qtyInput.value = String(clampQty(qtyInput.value));
  });

  addBtn.addEventListener("click", function () {
    if (!product) return;
    Cart.add(product.id, clampQty(qtyInput.value));
    window.USVToast.show(product.name + " added to your cart");
  });

  wishBtn.addEventListener("click", function () {
    if (!product) return;
    var added = Cart.toggleWish(product.id);
    renderWish();
    window.USVToast.show(added ? "Saved to your wishlist" : "Removed from your wishlist");
  });

  document.querySelectorAll("[data-tab]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-tab");
      document.querySelectorAll("[data-tab]").forEach(function (other) {
        var on = other === btn;
        other.classList.toggle("is-active", on);
        other.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll("[data-panel]").forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-panel") !== name;
      });
    });
  });

  /* ---------- boot ---------- */

  var id = new URLSearchParams(window.location.search).get("id");
  product = USV.getById(id);

  if (product) {
    render();
    Cart.markViewed(product.id);
  } else {
    fail();
  }
})();
