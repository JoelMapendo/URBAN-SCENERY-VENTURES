/* =========================================================
   Shared behaviour for every page.
   Mobile nav, category menu, search, cart badge, wishlist,
   toasts, add-to-cart delegation, form validation, reveals.
   ========================================================= */

window.USVToast = (function () {
  "use strict";

  var host = null;

  function mount() {
    if (host) return host;
    host = document.querySelector("[data-toast-stack]");
    if (!host) {
      host = document.createElement("div");
      host.className = "toast-stack";
      host.setAttribute("data-toast-stack", "");
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    return host;
  }

  function show(message) {
    var node = document.createElement("div");
    node.className = "toast";
    node.innerHTML = '<span class="toast__icon">' + window.USV.icons.check + "</span><span>" + window.USV.escapeHtml(message) + "</span>";
    mount().appendChild(node);
    window.setTimeout(function () {
      node.classList.add("is-leaving");
      window.setTimeout(function () {
        if (node.parentNode) node.parentNode.removeChild(node);
      }, 300);
    }, 2400);
  }

  return { show: show };
})();

(function () {
  "use strict";

  var USV = window.USV;
  var Cart = window.USVCart;

  /* ---------- header behaviour ---------- */

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var drawer = document.getElementById("mobile-nav");
    var closeBtn = document.querySelector("[data-nav-close]");
    var overlay = document.getElementById("nav-overlay");
    if (!toggle || !drawer) return;

    function open() {
      drawer.classList.add("is-open");
      drawer.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("no-scroll");
      if (overlay) overlay.hidden = false;
      window.requestAnimationFrame(function () {
        if (overlay) overlay.classList.add("is-open");
      });
    }

    function close() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("no-scroll");
      if (overlay) overlay.classList.remove("is-open");
      window.setTimeout(function () {
        if (overlay) overlay.hidden = true;
      }, 300);
    }

    toggle.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) close();
      else open();
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    if (overlay) overlay.addEventListener("click", close);

    drawer.addEventListener("click", function (event) {
      if (event.target.closest("a")) close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && drawer.classList.contains("is-open")) close();
    });
  }

  function initCategoryMenu() {
    var menu = document.querySelector("[data-cat-menu]");
    if (!menu) return;
    var trigger = menu.querySelector("[data-cat-trigger]");
    var panel = menu.querySelector("[data-cat-panel]");
    if (!trigger || !panel) return;

    function close() {
      menu.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", function (event) {
      event.stopPropagation();
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target)) close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  }

  function renderCategoryMenus() {
    var markup = USV.categories
      .map(function (cat) {
        return (
          '<li><a href="shop.html?category=' + encodeURIComponent(cat.id) + '">' +
          '<span class="catmenu__icon">' + USV.icons[cat.icon] + "</span>" +
          '<span class="catmenu__text"><strong>' + USV.escapeHtml(cat.name) + "</strong>" +
          "<small>" + USV.escapeHtml(cat.blurb) + "</small></span>" +
          "</a></li>"
        );
      })
      .join("");

    document.querySelectorAll("[data-cat-menu-list]").forEach(function (node) {
      node.innerHTML = markup;
    });
  }

  function renderCategoryBar() {
    var bar = document.querySelector("[data-catbar]");
    if (!bar) return;
    var existing = bar.querySelectorAll("[data-catbar-link]");
    if (existing.length) return;

    var markup = USV.categories
      .map(function (cat) {
        return (
          '<a class="catbar__link" data-catbar-link href="shop.html?category=' +
          encodeURIComponent(cat.id) +
          '">' +
          USV.icons[cat.icon] +
          "<span>" +
          USV.escapeHtml(cat.name) +
          "</span></a>"
        );
      })
      .join("");

    bar.insertAdjacentHTML("beforeend", markup);
  }

  function fillSearchCategorySelects() {
    document.querySelectorAll("[data-search-form] select[name='category']").forEach(function (select) {
      if (select.dataset.filled === "yes") return;
      USV.categories.forEach(function (cat) {
        var option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
      select.dataset.filled = "yes";
    });
  }

  function renderFooterCategoryLists() {
    var markup = USV.categories
      .map(function (cat) {
        return '<li><a href="shop.html?category=' + encodeURIComponent(cat.id) + '">' + USV.escapeHtml(cat.name) + "</a></li>";
      })
      .join("");
    document.querySelectorAll("[data-footer-cats]").forEach(function (node) {
      node.innerHTML = markup;
    });
  }

  function initSearch() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var field = form.querySelector("input[type='search'], input[name='q']");
        var catSelect = form.querySelector("select[name='category']");
        var q = field ? field.value.trim() : "";
        var cat = catSelect ? catSelect.value : "";
        if (!q && !cat) {
          window.location.href = "shop.html";
          return;
        }
        var params = [];
        if (q) params.push("q=" + encodeURIComponent(q));
        if (cat) params.push("category=" + encodeURIComponent(cat));
        window.location.href = "shop.html?" + params.join("&");
      });
    });
  }

  function markActiveNav() {
    var here = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!here) here = "index.html";

    document.querySelectorAll("[data-nav-link]").forEach(function (link) {
      var target = (link.getAttribute("href") || "").split("?")[0].toLowerCase();
      if (target === here) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- cart badge + add to cart ---------- */

  function syncCounts() {
    var count = Cart.count();
    var wished = Cart.wishlist();

    document.querySelectorAll("[data-cart-count]").forEach(function (node) {
      node.textContent = String(count);
      node.classList.toggle("is-active", count > 0);
    });

    document.querySelectorAll("[data-wish-count]").forEach(function (node) {
      node.textContent = String(wished.length);
      node.classList.toggle("is-active", wished.length > 0);
    });
  }

  function syncWishButtons() {
    document.querySelectorAll("[data-wish]").forEach(function (button) {
      var on = Cart.isWished(button.getAttribute("data-wish"));
      button.classList.toggle("is-on", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function renderBadges() {
    syncCounts();
    syncWishButtons();

    function bump() {
      document.querySelectorAll("[data-cart-count]").forEach(function (node) {
        node.classList.remove("is-bump");
        void node.offsetWidth;
        node.classList.add("is-bump");
      });
    }

    Cart.onChange(function () {
      bump();
      syncCounts();
      syncWishButtons();
    });
  }

  function initCartDelegation() {
    document.addEventListener("click", function (event) {
      var addBtn = event.target.closest("[data-add]");
      if (addBtn) {
        event.preventDefault();
        var id = addBtn.getAttribute("data-add");
        var product = USV.getById(id);
        if (!product) return;
        Cart.add(id, addBtn.getAttribute("data-qty") || 1);
        window.USVToast.show(product.name + " added to your cart");
        return;
      }

      var wishBtn = event.target.closest("[data-wish]");
      if (wishBtn) {
        event.preventDefault();
        var wid = wishBtn.getAttribute("data-wish");
        var wp = USV.getById(wid);
        if (!wp) return;
        var added = Cart.toggleWish(wid);
        window.USVToast.show(added ? wp.name + " saved to your wishlist" : wp.name + " removed from your wishlist");
        return;
      }

      var qtyMinus = event.target.closest("[data-qty-minus]");
      if (qtyMinus) {
        event.preventDefault();
        var mid = qtyMinus.getAttribute("data-qty-minus");
        var mproduct = USV.getById(mid);
        var mline = Cart.lines().filter(function (l) {
          return String(l.id) === String(mid);
        })[0];
        if (mline) {
          Cart.setQty(mid, mline.qty - 1);
          if (mproduct) window.USVToast.show(mproduct.name + " updated");
        }
        return;
      }

      var qtyPlus = event.target.closest("[data-qty-plus]");
      if (qtyPlus) {
        event.preventDefault();
        var pid = qtyPlus.getAttribute("data-qty-plus");
        var pproduct = USV.getById(pid);
        var pline = Cart.lines().filter(function (l) {
          return String(l.id) === String(pid);
        })[0];
        if (pline) {
          Cart.setQty(pid, pline.qty + 1);
          if (pproduct) window.USVToast.show(pproduct.name + " updated");
        }
      }
    });
  }

  /* ---------- forms ---------- */

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
  }

  function setFieldError(field, message) {
    var group = field.closest(".field") || field.parentNode;
    var error = group ? group.querySelector("[data-error]") : null;
    field.classList.toggle("is-invalid", Boolean(message));
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) {
      error.textContent = message || "";
      error.hidden = !message;
    }
  }

  function validateField(field) {
    var value = (field.value || "").trim();
    var required = field.hasAttribute("required");

    if (required && !value) {
      setFieldError(field, field.getAttribute("data-label") + " is required.");
      return false;
    }
    if (field.type === "email" && value && !isEmail(value)) {
      setFieldError(field, "Enter a valid email address.");
      return false;
    }
    if (field.type === "tel" && value && !/^[+()\-\s\d]{7,20}$/.test(value)) {
      setFieldError(field, "Enter a valid phone number.");
      return false;
    }
    if (field.hasAttribute("minlength") && value && value.length < parseInt(field.getAttribute("minlength"), 10)) {
      setFieldError(field, "Please use at least " + field.getAttribute("minlength") + " characters.");
      return false;
    }
    if (field.tagName === "SELECT" && field.hasAttribute("required") && !value) {
      setFieldError(field, "Please choose an option.");
      return false;
    }

    setFieldError(field, "");
    return true;
  }

  function initForms() {
    document.querySelectorAll("[data-validate]").forEach(function (form) {
      var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));

      fields.forEach(function (field) {
        field.addEventListener("blur", function () {
          validateField(field);
        });
        field.addEventListener("input", function () {
          if (field.classList.contains("is-invalid")) validateField(field);
        });
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var valid = true;
        var firstBad = null;

        fields.forEach(function (field) {
          if (!validateField(field)) {
            valid = false;
            if (!firstBad) firstBad = field;
          }
        });

        if (!valid) {
          if (firstBad) firstBad.focus();
          window.USVToast.show("Please correct the highlighted fields.");
          return;
        }

        var status = form.querySelector("[data-form-status]");
        if (status) {
          status.hidden = false;
          status.className = "form-status is-success";
          status.textContent = form.getAttribute("data-success") || "Thanks — your message has been sent.";
        }
        window.USVToast.show(form.getAttribute("data-success") || "Message sent.");
        form.reset();
      });
    });
  }

  /* ---------- scroll + reveal ---------- */

  var seen = new WeakSet();
  var observer = null;

  function ensureObserver() {
    if (observer) return observer;
    if (!("IntersectionObserver" in window)) return null;
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    return observer;
  }

  function initReveals(scope) {
    var root = scope || document;
    var nodes = root.querySelectorAll(".reveal");
    if (!nodes.length) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var obs = ensureObserver();

    Array.prototype.forEach.call(nodes, function (node) {
      if (seen.has(node)) return;
      seen.add(node);
      if (reduced || !obs) node.classList.add("is-in");
      else obs.observe(node);
    });
  }

  window.USVReveal = { refresh: initReveals };

  function initScrollUi() {
    var header = document.getElementById("site-header");
    var toTop = document.querySelector("[data-to-top]");

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-stuck", y > 8);
      if (toTop) toTop.classList.toggle("is-visible", y > 500);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function initCountdown() {
    var host = document.getElementById("sale-countdown");
    if (!host) return;

    var end = new Date();
    end.setDate(end.getDate() + 3);
    end.setHours(23, 59, 59, 0);

    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function tick() {
      var diff = Math.max(0, end.getTime() - Date.now());
      var secs = Math.floor(diff / 1000);
      var map = {
        d: Math.floor(secs / 86400),
        h: Math.floor((secs % 86400) / 3600),
        m: Math.floor((secs % 3600) / 60),
        s: secs % 60
      };
      Object.keys(map).forEach(function (key) {
        var node = host.querySelector('[data-unit="' + key + '"]');
        if (node) node.textContent = pad(map[key]);
      });
    }

    tick();
    window.setInterval(tick, 1000);
  }

  function setFooterYear() {
    var node = document.getElementById("year");
    if (node) node.textContent = String(new Date().getFullYear());
  }

  /* ---------- homepage sections ---------- */

  function categoryCard(cat) {
    var count = USV.filterByCategory(USV.products, cat.id).length;
    return (
      '<a class="cat-card reveal" href="shop.html?category=' + encodeURIComponent(cat.id) + '">' +
      '<span class="cat-card__media"><img src="' + USV.escapeHtml(cat.image) + '" alt="' + USV.escapeHtml(cat.name) + '" loading="lazy" width="400" height="300" /></span>' +
      '<span class="cat-card__body">' +
      "<h3>" + USV.escapeHtml(cat.name) + "</h3>" +
      "<p>" + USV.escapeHtml(cat.blurb) + "</p>" +
      '<span class="cat-card__link">Browse ' + count + " product" + (count === 1 ? "" : "s") + USV.icons.arrow + "</span>" +
      "</span>" +
      "</a>"
    );
  }

  function featureCard(icon, title, text) {
    return (
      '<article class="feature reveal">' +
      '<span class="feature__icon">' + USV.icons[icon] + "</span>" +
      "<h3>" + USV.escapeHtml(title) + "</h3>" +
      "<p>" + USV.escapeHtml(text) + "</p>" +
      "</article>"
    );
  }

  function reviewCard(item) {
    var initials = item.name
      .split(" ")
      .map(function (part) {
        return part.charAt(0);
      })
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      '<article class="review reveal">' +
      '<span class="review__quote">' + USV.icons.quote + "</span>" +
      '<div class="review__stars">' + USV.starsHtml(item.rating) + "</div>" +
      "<h3>" + USV.escapeHtml(item.title) + "</h3>" +
      "<p>" + USV.escapeHtml(item.body) + "</p>" +
      '<p class="review__product">Purchased: <b>' + USV.escapeHtml(item.product) + "</b></p>" +
      '<div class="review__person">' +
      '<span class="review__avatar" aria-hidden="true">' + USV.escapeHtml(initials) + "</span>" +
      "<span>" +
      '<span class="review__name">' + USV.escapeHtml(item.name) + "</span><br />" +
      '<span class="review__meta">' + USV.escapeHtml(item.location) + " &middot; " + USV.escapeHtml(item.date) + "</span>" +
      "</span>" +
      "</div>" +
      "</article>"
    );
  }

  function articleCard(item) {
    return (
      '<article class="article reveal">' +
      '<div class="article__media"><img src="' + USV.escapeHtml(item.image) + '" alt="" loading="lazy" width="400" height="267" /></div>' +
      '<div class="article__body">' +
      '<div class="article__meta"><span class="article__tag">' + USV.escapeHtml(item.category) + "</span>" +
      "<span>" + USV.escapeHtml(item.date) + " &middot; " + USV.escapeHtml(item.readTime) + "</span></div>" +
      "<h3>" + USV.escapeHtml(item.title) + "</h3>" +
      "<p>" + USV.escapeHtml(item.excerpt) + "</p>" +
      '<span class="article__more">Read article ' + USV.icons.arrow + "</span>" +
      "</div>" +
      "</article>"
    );
  }

  function renderHomepage() {
    var catGrid = document.getElementById("cat-grid");
    if (catGrid) catGrid.innerHTML = USV.categories.map(categoryCard).join("");

    var featuredGrid = document.getElementById("featured-grid");
    if (featuredGrid) featuredGrid.innerHTML = USV.productGrid(USV.featured(4));

    var newGrid = document.getElementById("new-grid");
    if (newGrid) newGrid.innerHTML = USV.productGrid(USV.newArrivals(4));

    var featureGrid = document.getElementById("feature-grid");
    if (featureGrid) {
      featureGrid.innerHTML = [
        featureCard("shield", "Verified before it ships", "Every unit is opened, powered and checked against the spec sheet. Serial numbers are logged against your order."),
        featureCard("truck", "Next-day delivery", "Orders confirmed before 2pm leave the same day, and anything over " + USV.money(USV.config.freeShippingOver) + " ships free."),
        featureCard("wallet", "Prices that stay honest", "We track competitor pricing daily and refund the difference if a product drops within 30 days of your purchase."),
        featureCard("headset", "Support that answers", "Real people, seven days a week, with a median first reply under four hours during business days."),
        featureCard("box", "30-day free returns", "Changed your mind? Send it back within 30 days for a full refund. We pay the return pickup.")
      ].join("");
    }

    document.querySelectorAll("[data-reviews]").forEach(function (node) {
      var limit = parseInt(node.getAttribute("data-reviews"), 10) || 3;
      node.innerHTML = USV.testimonials.slice(0, limit).map(reviewCard).join("");
    });

    document.querySelectorAll("[data-icon]").forEach(function (node) {
      node.innerHTML = USV.icons[node.getAttribute("data-icon")] || "";
    });

    document.querySelectorAll("[data-free-shipping]").forEach(function (node) {
      node.textContent = USV.money(USV.config.freeShippingOver);
    });

    var articleGrid = document.getElementById("article-grid");
    if (articleGrid) articleGrid.innerHTML = USV.articles.map(articleCard).join("");
  }

  /* ---------- boot ---------- */

  function init() {
    renderCategoryMenus();
    renderCategoryBar();
    renderFooterCategoryLists();
    fillSearchCategorySelects();
    initMobileNav();
    initCategoryMenu();
    initSearch();
    markActiveNav();
    renderHomepage();
    renderBadges();
    initCartDelegation();
    initForms();
    initReveals();
    initScrollUi();
    initCountdown();
    setFooterYear();

    Cart.onChange(function () {
      Cart.renderCartPage();
    });
    Cart.renderCartPage();
    Cart.bindCartPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
