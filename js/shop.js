/* =========================================================
   Shop page: URL-driven filters, sorting and pagination.
   State lives in the query string so any filtered view can be
   bookmarked or shared. Changing a filter never reloads.
   ========================================================= */

(function () {
  "use strict";

  var USV = window.USV;
  var PER_PAGE = 9;

  var grid = document.getElementById("shop-grid");
  if (!grid) return;

  var emptyState = document.getElementById("shop-empty");
  var pager = document.getElementById("shop-pager");
  var countOut = document.getElementById("shop-count");
  var titleOut = document.getElementById("shop-title");
  var leadOut = document.getElementById("shop-lead");
  var crumbOut = document.getElementById("crumb-current");
  var crumbShop = document.getElementById("crumb-shop");
  var chipsOut = document.querySelector("[data-filter-chips]");
  var sortSelect = document.querySelector("[data-filter-sort]");
  var minInput = document.querySelector("[data-filter-min]");
  var maxInput = document.querySelector("[data-filter-max]");
  var slider = document.querySelector("[data-filter-slider]");
  var priceHint = document.querySelector("[data-filter-price-hint]");
  var inStock = document.querySelector("[data-filter-instock]");
  var ratingBox = document.querySelector("[data-filter-rating]");
  var dealsBox = document.querySelector("[data-filter-deals]");
  var catBox = document.querySelector("[data-filter-categories]");
  var brandBox = document.querySelector("[data-filter-brands]");
  var filterPanel = document.getElementById("shop-filters");
  var filterToggle = document.querySelector("[data-filter-toggle]");

  var bounds = USV.priceBounds();
  var brands = USV.brands;

  var state = { q: "", category: "", brand: [], min: "", max: "", inStock: false, rating: false, deals: false, sort: "featured", page: 1 };

  /* ---------- url <-> state ---------- */

  function readUrl() {
    var params = new URLSearchParams(window.location.search);
    state.q = params.get("q") || "";
    state.category = params.get("category") || "";
    state.brand = (params.get("brand") || "").split(",").filter(Boolean);
    state.min = params.get("min") || "";
    state.max = params.get("max") || "";
    state.inStock = params.get("stock") === "1";
    state.rating = params.get("rating") === "1";
    state.deals = params.get("deals") === "1";
    state.sort = params.get("sort") || "featured";
    state.page = parseInt(params.get("page"), 10) || 1;
  }

  function writeUrl(push) {
    var params = new URLSearchParams();
    if (state.q) params.set("q", state.q);
    if (state.category) params.set("category", state.category);
    if (state.brand.length) params.set("brand", state.brand.join(","));
    if (state.min) params.set("min", state.min);
    if (state.max) params.set("max", state.max);
    if (state.inStock) params.set("stock", "1");
    if (state.rating) params.set("rating", "1");
    if (state.deals) params.set("deals", "1");
    if (state.sort && state.sort !== "featured") params.set("sort", state.sort);
    if (state.page > 1) params.set("page", String(state.page));

    var qs = params.toString();
    var url = qs ? "?" + qs : window.location.pathname;
    try {
      if (push) window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    } catch (error) {
      /* file:// origins reject history writes — filters still apply in memory */
    }
  }

  /* ---------- filtering ---------- */

  function apply(list) {
    var out = list;
    if (state.q) out = USV.search(state.q);
    out = USV.filterByCategory(out, state.category);
    if (state.brand.length) {
      out = out.filter(function (p) {
        return state.brand.indexOf(p.brand) !== -1;
      });
    }
    out = USV.filterByPrice(out, state.min, state.max);
    if (state.inStock) out = USV.inStockOnly(out);
    if (state.rating) {
      out = out.filter(function (p) {
        return p.rating >= 4;
      });
    }
    if (state.deals) {
      out = out.filter(function (p) {
        return USV.discount(p) > 0;
      });
    }
    return USV.sort(out, state.sort === "featured" ? "newest" : state.sort);
  }

  /* ---------- rendering ---------- */

  function heading() {
    if (state.q) {
      return { title: 'Results for "' + state.q + '"', crumb: "Search: " + state.q };
    }
    if (state.category) {
      var cat = USV.getCategory(state.category);
      var name = cat ? cat.name : state.category;
      return { title: name, crumb: name };
    }
    return { title: "All products", crumb: "All products" };
  }

  function renderHead(total) {
    var head = heading();
    titleOut.textContent = head.title;
    crumbOut.textContent = head.crumb;
    document.title = head.title + " | " + USV.config.storeName;

    if (state.q) {
      leadOut.textContent =
        total + " product" + (total === 1 ? "" : "s") + " matched your search. Refine it with the filters if the list is too broad.";
    } else if (state.category) {
      var cat = USV.getCategory(state.category);
      leadOut.textContent = cat ? cat.blurb + ". Every item below is in stock and warranty-backed." : "Products in this category.";
    } else {
      leadOut.textContent =
        "Every product we sell, in one place. Filter by category, brand, price or rating to narrow it down, and sort by what matters to you.";
    }

    if (crumbShop) crumbShop.textContent = state.q ? "Search" : "Shop";
  }

  function renderCount(shown, total, pages) {
    if (!total) {
      countOut.textContent = "No products found";
      return;
    }
    var from = (state.page - 1) * PER_PAGE + 1;
    var to = Math.min(state.page * PER_PAGE, total);
    countOut.innerHTML =
      "Showing <b>" + from + "–" + to + "</b> of <b>" + total + "</b> product" + (total === 1 ? "" : "s") +
      (pages > 1 ? " &middot; page " + state.page + " of " + pages : "");
  }

  function renderChips() {
    var chips = [];

    function chip(label, key, value) {
      chips.push(
        '<span class="chip">' + USV.escapeHtml(label) +
        '<button type="button" data-chip-key="' + key + '" data-chip-value="' + USV.escapeHtml(value) + '" aria-label="Remove filter ' + USV.escapeHtml(label) + '">' +
        USV.icons.close + "</button></span>"
      );
    }

    if (state.q) chip("Search: " + state.q, "q", "");
    if (state.category) chip(USV.categoryName(state.category), "category", "");
    state.brand.forEach(function (b) {
      chip(b, "brand", b);
    });
    if (state.min) chip("From " + USV.money(state.min), "min", "");
    if (state.max) chip("Up to " + USV.money(state.max), "max", "");
    if (state.inStock) chip("In stock", "inStock", "");
    if (state.rating) chip("4 stars and up", "rating", "");
    if (state.deals) chip("On sale", "deals", "");

    chipsOut.hidden = chips.length === 0;
    chipsOut.innerHTML = chips.join("");
  }

  function renderPager(pages) {
    if (pages <= 1) {
      pager.innerHTML = "";
      return;
    }

    function arrow(dir, label, disabled) {
      return (
        '<button type="button" data-page="' + (state.page + dir) + '"' + (disabled ? " disabled" : "") + ' aria-label="' + label + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' +
        (dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7") + '"/></svg></button>'
      );
    }

    var html = arrow(-1, "Previous page", state.page === 1);
    for (var i = 1; i <= pages; i += 1) {
      html +=
        '<button type="button" data-page="' + i + '"' + (i === state.page ? ' class="is-active" aria-current="page"' : "") + ">" + i + "</button>";
    }
    html += arrow(1, "Next page", state.page === pages);
    pager.innerHTML = html;
  }

  function render(push) {
    var list = apply(USV.products);
    var total = list.length;
    var pages = Math.max(1, Math.ceil(total / PER_PAGE));

    if (state.page > pages) state.page = pages;

    var slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);

    grid.innerHTML = USV.productGrid(slice, { showBadge: true });
    grid.hidden = slice.length === 0;
    emptyState.hidden = slice.length !== 0;

    renderHead(total);
    renderCount(slice.length, total, pages);
    renderChips();
    renderPager(pages);
    writeUrl(push);

    if (window.USVReveal) window.USVReveal.refresh(grid);
  }

  /* ---------- controls ---------- */

  function renderCategoryList() {
    var markup =
      '<label class="check"><input type="radio" name="shop-cat" value=""' +
      (state.category ? "" : " checked") +
      ' /><span>All categories</span><span>' + USV.products.length + "</span></label>";

    USV.categories.forEach(function (cat) {
      var count = USV.filterByCategory(USV.products, cat.id).length;
      markup +=
        '<label class="check"><input type="radio" name="shop-cat" value="' + USV.escapeHtml(cat.id) + '"' +
        (state.category === cat.id ? " checked" : "") +
        ' /><span>' + USV.escapeHtml(cat.name) + "</span><span>" + count + "</span></label>";
    });

    catBox.innerHTML = markup;
    catBox.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("change", function () {
        state.category = input.value;
        state.page = 1;
        render(true);
      });
    });
  }

  function renderBrandList() {
    var markup = brands
      .map(function (brand) {
        var count = USV.products.filter(function (p) {
          return p.brand === brand;
        }).length;
        return (
          '<label class="check"><input type="checkbox" value="' + USV.escapeHtml(brand) + '"' +
          (state.brand.indexOf(brand) !== -1 ? " checked" : "") +
          ' /><span>' + USV.escapeHtml(brand) + "</span><span>" + count + "</span></label>"
        );
      })
      .join("");

    brandBox.innerHTML = markup;
    brandBox.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("change", function () {
        var brand = input.value;
        var at = state.brand.indexOf(brand);
        if (input.checked && at === -1) state.brand.push(brand);
        if (!input.checked && at !== -1) state.brand.splice(at, 1);
        state.page = 1;
        render(true);
      });
    });
  }

  function syncControls() {
    sortSelect.value = state.sort;
    minInput.value = state.min;
    maxInput.value = state.max;
    slider.max = String(Math.ceil(bounds.max / 10) * 10);
    slider.value = state.max || slider.max;
    inStock.checked = state.inStock;
    ratingBox.checked = state.rating;
    dealsBox.checked = state.deals;
    priceHint.innerHTML = "Up to <b>" + USV.money(Number(slider.value)) + "</b>";

    var headerSearch = document.querySelector("#q");
    if (headerSearch) headerSearch.value = state.q;

    var headerCategory = document.querySelector("#q-cat");
    if (headerCategory) headerCategory.value = state.category;
  }

  function clearAll() {
    state.q = "";
    state.category = "";
    state.brand = [];
    state.min = "";
    state.max = "";
    state.inStock = false;
    state.rating = false;
    state.deals = false;
    state.sort = "featured";
    state.page = 1;

    renderCategoryList();
    renderBrandList();
    syncControls();
    render(true);
  }

  /* ---------- events ---------- */

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    state.page = 1;
    render(true);
  });

  function onMin() {
    state.min = minInput.value;
    state.page = 1;
    render(true);
  }

  function onMax() {
    state.max = maxInput.value;
    state.page = 1;
    render(true);
  }

  minInput.addEventListener("input", onMin);
  maxInput.addEventListener("input", onMax);

  slider.addEventListener("input", function () {
    var value = Number(slider.value);
    priceHint.innerHTML = "Up to <b>" + USV.money(value) + "</b>";
    if (bounds.max - value < 20) {
      maxInput.value = "";
      state.max = "";
    } else {
      maxInput.value = String(value);
      state.max = String(value);
    }
    state.page = 1;
    render(true);
  });

  inStock.addEventListener("change", function () {
    state.inStock = inStock.checked;
    state.page = 1;
    render(true);
  });

  ratingBox.addEventListener("change", function () {
    state.rating = ratingBox.checked;
    state.page = 1;
    render(true);
  });

  dealsBox.addEventListener("change", function () {
    state.deals = dealsBox.checked;
    state.page = 1;
    render(true);
  });

  document.querySelectorAll("[data-filter-reset]").forEach(function (btn) {
    btn.addEventListener("click", clearAll);
  });

  chipsOut.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-chip-key]");
    if (!btn) return;
    var key = btn.getAttribute("data-chip-key");
    var value = btn.getAttribute("data-chip-value");

    if (key === "q") {
      state.q = "";
      var headerSearch = document.querySelector("#q");
      if (headerSearch) headerSearch.value = "";
    } else if (key === "category") {
      state.category = "";
      renderCategoryList();
    } else if (key === "brand") {
      state.brand = state.brand.filter(function (b) {
        return b !== value;
      });
      renderBrandList();
    } else if (key === "min") {
      state.min = "";
      minInput.value = "";
    } else if (key === "max") {
      state.max = "";
      maxInput.value = "";
      slider.value = slider.max;
      priceHint.innerHTML = "Up to <b>" + USV.money(Number(slider.max)) + "</b>";
    } else if (key === "inStock") {
      state.inStock = false;
      inStock.checked = false;
    } else if (key === "rating") {
      state.rating = false;
      ratingBox.checked = false;
    } else if (key === "deals") {
      state.deals = false;
      dealsBox.checked = false;
    }

    state.page = 1;
    render(true);
  });

  pager.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    var next = parseInt(btn.getAttribute("data-page"), 10);
    if (!next || next === state.page) return;
    state.page = next;
    render(true);
    var top = document.getElementById("shop");
    if (top) {
      var y = top.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  });

  if (filterToggle && filterPanel) {
    filterToggle.addEventListener("click", function () {
      var open = !filterPanel.classList.contains("is-open");
      filterPanel.classList.toggle("is-open", open);
      filterToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- boot ---------- */

  readUrl();
  renderCategoryList();
  renderBrandList();
  syncControls();
  render();

  window.addEventListener("popstate", function () {
    readUrl();
    renderCategoryList();
    renderBrandList();
    syncControls();
    render();
  });
})();
