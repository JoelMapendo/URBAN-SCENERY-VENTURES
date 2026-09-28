/* =========================================================
   Cart + wishlist store (localStorage) and the cart page UI.
   Loaded on every page so the header badge is always correct.
   Exposes window.USVCart.
   ========================================================= */

window.USVCart = (function () {
  "use strict";

  var USV = window.USV;
  var CART_KEY = "usv.cart.v1";
  var WISH_KEY = "usv.wishlist.v1";
  var RECENT_KEY = "usv.recent.v1";

  var listeners = [];

  /* ---------- storage helpers ---------- */

  function read(key) {
    try {
      var raw = window.localStorage.getItem(key);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      return false;
    }
    return true;
  }

  function emit() {
    listeners.forEach(function (fn) {
      try {
        fn();
      } catch (err) {
        return;
      }
    });
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  /* ---------- cart ---------- */

  function lines() {
    return read(CART_KEY)
      .filter(function (line) {
        return USV.getById(line.id) !== null;
      })
      .map(function (line) {
        var product = USV.getById(line.id);
        return {
          id: product.id,
          qty: Math.max(1, parseInt(line.qty, 10) || 1),
          product: product,
          lineTotal: product.price * Math.max(1, parseInt(line.qty, 10) || 1)
        };
      });
  }

  function save(list) {
    var clean = list.map(function (line) {
      return { id: line.id, qty: line.qty };
    });
    write(CART_KEY, clean);
    emit();
    return clean;
  }

  function add(id, qty) {
    var product = USV.getById(id);
    if (!product) return false;
    var amount = Math.max(1, parseInt(qty, 10) || 1);
    var current = read(CART_KEY);

    var existing = current.filter(function (line) {
      return String(line.id) === String(id);
    })[0];

    if (existing) {
      existing.qty = Math.min(99, (parseInt(existing.qty, 10) || 0) + amount);
      current = current.map(function (line) {
        return String(line.id) === String(id) ? existing : line;
      });
    } else {
      current.push({ id: product.id, qty: amount });
    }

    save(current);
    return true;
  }

  function setQty(id, qty) {
    var amount = parseInt(qty, 10) || 0;
    var current = read(CART_KEY).map(function (line) {
      if (String(line.id) !== String(id)) return line;
      return { id: line.id, qty: Math.max(0, amount) };
    });
    save(
      current.filter(function (line) {
        return line.qty > 0;
      })
    );
  }

  function increment(id) {
    var line = lines().filter(function (l) {
      return String(l.id) === String(id);
    })[0];
    if (line) setQty(id, line.qty + 1);
  }

  function decrement(id) {
    var line = lines().filter(function (l) {
      return String(l.id) === String(id);
    })[0];
    if (line) setQty(id, line.qty - 1);
  }

  function remove(id) {
    save(
      read(CART_KEY).filter(function (line) {
        return String(line.id) !== String(id);
      })
    );
  }

  function clear() {
    write(CART_KEY, []);
    emit();
  }

  function count() {
    return lines().reduce(function (sum, line) {
      return sum + line.qty;
    }, 0);
  }

  function subtotal() {
    return lines().reduce(function (sum, line) {
      return sum + line.lineTotal;
    }, 0);
  }

  function savings() {
    return lines().reduce(function (sum, line) {
      if (!line.product.oldPrice) return sum;
      return sum + (line.product.oldPrice - line.product.price) * line.qty;
    }, 0);
  }

  function shipping() {
    var value = subtotal();
    if (value === 0) return 0;
    return value >= USV.config.freeShippingOver ? 0 : USV.config.shippingFlat;
  }

  function tax() {
    return Math.round(subtotal() * USV.config.taxRate * 100) / 100;
  }

  function total() {
    return Math.round((subtotal() + shipping() + tax()) * 100) / 100;
  }

  /* ---------- wishlist ---------- */

  function wishlist() {
    return read(WISH_KEY).filter(function (id) {
      return USV.getById(id) !== null;
    });
  }

  function isWished(id) {
    return wishlist().indexOf(String(id)) !== -1 || wishlist().indexOf(parseInt(id, 10)) !== -1;
  }

  function toggleWish(id) {
    if (!USV.getById(id)) return false;
    var list = read(WISH_KEY);
    var target = String(id);
    var exists = list.some(function (item) {
      return String(item) === target;
    });
    var next = exists
      ? list.filter(function (item) {
          return String(item) !== target;
        })
      : list.concat([USV.getById(id).id]);
    write(WISH_KEY, next);
    emit();
    return !exists;
  }

  /* ---------- recently viewed ---------- */

  function markViewed(id) {
    if (!USV.getById(id)) return;
    var list = read(RECENT_KEY).filter(function (item) {
      return String(item) !== String(id);
    });
    list.unshift(USV.getById(id).id);
    write(RECENT_KEY, list.slice(0, 8));
  }

  function recentlyViewed(limit) {
    return read(RECENT_KEY)
      .map(function (id) {
        return USV.getById(id);
      })
      .filter(Boolean)
      .slice(0, limit || 4);
  }

  /* ---------- cart page ---------- */

  function lineTemplate(line) {
    var p = line.product;
    return (
      '<div class="cart-line" data-line="' + p.id + '">' +
      '<a class="cart-line__media" href="product.html?id=' + p.id + '">' +
      '<img src="' + USV.escapeHtml(p.image) + '" alt="' + USV.escapeHtml(p.name) + '" loading="lazy" width="120" height="90" />' +
      "</a>" +
      '<div class="cart-line__info">' +
      '<span class="cart-line__cat">' + USV.escapeHtml(USV.categoryName(p.category)) + "</span>" +
      '<h3 class="cart-line__name"><a href="product.html?id=' + p.id + '">' + USV.escapeHtml(p.name) + "</a></h3>" +
      '<div class="cart-line__rating">' + USV.starsHtml(p.rating) + "<span>" + p.rating.toFixed(1) + "</span></div>" +
      '<div class="cart-line__unit">' + USV.money(p.price) + " each</div>" +
      "</div>" +
      '<div class="cart-line__qty">' +
      '<div class="stepper">' +
      '<button type="button" data-dec="' + p.id + '" aria-label="Decrease quantity of ' + USV.escapeHtml(p.name) + '">&minus;</button>' +
      '<input type="number" value="' + line.qty + '" min="1" max="99" data-qty="' + p.id + '" aria-label="Quantity of ' + USV.escapeHtml(p.name) + '" />' +
      '<button type="button" data-inc="' + p.id + '" aria-label="Increase quantity of ' + USV.escapeHtml(p.name) + '">+</button>' +
      "</div>" +
      '<button class="cart-line__remove" type="button" data-remove="' + p.id + '">' + USV.icons.close + " Remove</button>" +
      "</div>" +
      '<div class="cart-line__total">' + USV.money(line.lineTotal) + "</div>" +
      "</div>"
    );
  }

  function renderCartPage() {
    var listHost = document.getElementById("cart-lines");
    var emptyHost = document.getElementById("cart-empty");
    var summaryHost = document.getElementById("cart-summary-rows");
    var totalsHost = document.getElementById("cart-totals");
    if (!listHost) return;

    var items = lines();

    if (!items.length) {
      listHost.innerHTML = "";
      listHost.hidden = true;
      if (emptyHost) emptyHost.hidden = false;
      if (summaryHost) summaryHost.innerHTML = "";
      if (totalsHost) totalsHost.innerHTML = "";
      renderCartExtras();
      return;
    }

    listHost.hidden = false;
    if (emptyHost) emptyHost.hidden = true;
    listHost.innerHTML = items.map(lineTemplate).join("");

    if (summaryHost) {
      summaryHost.innerHTML =
        "<dt>Subtotal</dt><dd>" + USV.money(subtotal()) + "</dd>" +
        '<dt>Delivery</dt><dd>' + (shipping() === 0 ? "<span class=\"free\">Free</span>" : USV.money(shipping())) + "</dd>" +
        '<dt>Estimated tax</dt><dd>' + USV.money(tax()) + "</dd>" +
        (savings() > 0 ? "<dt>You save</dt><dd class=\"save\">-" + USV.money(savings()) + "</dd>" : "");
    }

    if (totalsHost) {
      totalsHost.innerHTML =
        "<dt>Total</dt>" +
        '<dd><span class="summary__total">' + USV.money(total()) + "</span>" +
        '<small>Including ' + USV.money(tax()) + " tax</small></dd>";
    }

    renderCartExtras();
  }

  function renderCartExtras() {
    var emptyIcon = document.getElementById("cart-empty-icon");
    if (emptyIcon) emptyIcon.innerHTML = USV.icons.cart;

    var noteIcon = document.getElementById("summary-note-icon");
    if (noteIcon) noteIcon.innerHTML = USV.icons.check;

    var wrap = document.getElementById("cart-recent");
    var grid = document.getElementById("cart-recent-grid");
    if (!wrap || !grid) return;

    var recent = recentlyViewed(4).filter(function (product) {
      return !lines().some(function (line) {
        return line.id === product.id;
      });
    });

    if (!recent.length) {
      wrap.hidden = true;
      return;
    }

    grid.innerHTML = USV.productGrid(recent);
    wrap.hidden = false;
    if (window.USVReveal) window.USVReveal.refresh(grid);
  }

  function bindCartPage() {
    var root = document.getElementById("cart-page");
    if (!root) return;

    root.addEventListener("click", function (event) {
      var inc = event.target.closest("[data-inc]");
      var dec = event.target.closest("[data-dec]");
      var remove = event.target.closest("[data-remove]");
      var clear = event.target.closest("[data-clear]");
      var checkout = event.target.closest("[data-checkout]");

      if (inc) increment(inc.getAttribute("data-inc"));
      if (dec) decrement(dec.getAttribute("data-dec"));
      if (remove) remove(remove.getAttribute("data-remove"));
      if (clear) clear();
      if (checkout) {
        if (!count()) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.USVToast.show("Checkout is not connected yet — your cart is saved.");
      }
    });

    root.addEventListener("change", function (event) {
      var input = event.target.closest("[data-qty]");
      if (!input) return;
      setQty(input.getAttribute("data-qty"), input.value);
    });
  }

  return {
    lines: lines,
    add: add,
    setQty: setQty,
    increment: increment,
    decrement: decrement,
    remove: remove,
    clear: clear,
    count: count,
    subtotal: subtotal,
    savings: savings,
    shipping: shipping,
    tax: tax,
    total: total,
    wishlist: wishlist,
    isWished: isWished,
    toggleWish: toggleWish,
    markViewed: markViewed,
    recentlyViewed: recentlyViewed,
    onChange: onChange,
    renderCartPage: renderCartPage,
    renderCartExtras: renderCartExtras,
    bindCartPage: bindCartPage
  };
})();
