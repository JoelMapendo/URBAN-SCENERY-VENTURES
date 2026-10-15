/* =========================================================
   Account store (localStorage) plus the account page UI.
   Exposes window.USVAuth.

   Accounts live in THIS browser only. That is a demo-grade
   account system: it proves the sign-up / sign-in flow and
   is safe to swap for a real API later, because everything
   is read and written through this one module.
   ========================================================= */

window.USVAuth = (function () {
  "use strict";

  var USERS_KEY = "usv.users.v1";
  var SESSION_KEY = "usv.session.v1";

  var listeners = [];

  /* ---------- storage ---------- */

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function emit() {
    listeners.forEach(function (fn) {
      try {
        fn(current());
      } catch (err) {
        /* a broken listener must not break the others */
      }
    });
  }

  function onChange(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }

  /* ---------- helpers ---------- */

  function users() {
    var list = read(USERS_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function normalize(email) {
    return String(email || "").trim().toLowerCase();
  }

  function clean(value) {
    return String(value == null ? "" : value).trim();
  }

  function makeId() {
    return "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function makeSalt() {
    if (window.crypto && window.crypto.getRandomValues) {
      var bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      return Array.prototype.map
        .call(bytes, function (b) {
          return ("0" + b.toString(16)).slice(-2);
        })
        .join("");
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /* Password hashing.
     crypto.subtle needs a secure context (https or localhost). When the page is
     opened straight from disk we fall back to a plain scramble so the demo still
     works — clearly not production security, which is why accounts are local. */
  function hashPassword(password, salt) {
    var input = salt + ":" + password;

    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      var data = new TextEncoder().encode(input);
      return window.crypto.subtle.digest("SHA-256", data).then(function (buffer) {
        return Array.prototype.map
          .call(new Uint8Array(buffer), function (b) {
            return ("0" + b.toString(16)).slice(-2);
          })
          .join("");
      });
    }

    var h1 = 0x811c9dc5;
    var h2 = 0x1000193;
    for (var i = 0; i < input.length; i++) {
      var code = input.charCodeAt(i);
      h1 = (h1 ^ code) * 16777619;
      h2 = (h2 + code * (i + 1)) >>> 0;
    }
    return Promise.resolve((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16));
  }

  function publicUser(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      since: user.since
    };
  }

  /* ---------- public API ---------- */

  function current() {
    var session = read(SESSION_KEY, null);
    return session && session.id ? session : null;
  }

  function isSignedIn() {
    return !!current();
  }

  function signUp(input) {
    var name = clean(input && input.name);
    var email = normalize(input && input.email);
    var password = String((input && input.password) || "");

    if (name.length < 2) return Promise.resolve({ ok: false, error: "Enter your full name." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Promise.resolve({ ok: false, error: "Enter a valid email address." });
    }
    if (password.length < 8) {
      return Promise.resolve({ ok: false, error: "Use at least 8 characters for your password." });
    }

    var list = users();
    var taken = list.some(function (user) {
      return normalize(user.email) === email;
    });
    if (taken) {
      return Promise.resolve({ ok: false, error: "That email already has an account. Sign in instead." });
    }

    var salt = makeSalt();
    return hashPassword(password, salt).then(function (pass) {
      var user = {
        id: makeId(),
        name: name,
        email: email,
        salt: salt,
        pass: pass,
        since: new Date().toISOString()
      };
      list.push(user);
      if (!write(USERS_KEY, list)) {
        return { ok: false, error: "This browser is blocking storage, so accounts cannot be saved." };
      }
      var session = publicUser(user);
      write(SESSION_KEY, session);
      emit();
      return { ok: true, user: session };
    });
  }

  function signIn(input) {
    var email = normalize(input && input.email);
    var password = String((input && input.password) || "");

    if (!email || !password) {
      return Promise.resolve({ ok: false, error: "Enter your email and password." });
    }

    var found = users().filter(function (user) {
      return normalize(user.email) === email;
    })[0];

    if (!found) {
      return Promise.resolve({ ok: false, error: "No account found for that email." });
    }

    return hashPassword(password, found.salt).then(function (pass) {
      if (pass !== found.pass) {
        return { ok: false, error: "That password is not correct." };
      }
      var session = publicUser(found);
      write(SESSION_KEY, session);
      emit();
      return { ok: true, user: session };
    });
  }

  function signOut() {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch (err) {
      /* nothing to clean up */
    }
    emit();
  }

  function accountCount() {
    return users().length;
  }

  function reset() {
    try {
      window.localStorage.removeItem(USERS_KEY);
      window.localStorage.removeItem(SESSION_KEY);
    } catch (err) {
      /* nothing to clean up */
    }
    emit();
  }

  /* ---------- account page UI ---------- */

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function initials(name) {
    return String(name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (part) {
        return part.charAt(0).toUpperCase();
      })
      .join("");
  }

  function formatDate(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }

  function setStatus(node, message, ok) {
    if (!node) return;
    if (!message) {
      node.hidden = true;
      node.textContent = "";
      return;
    }
    node.hidden = false;
    node.className = "form-status " + (ok ? "is-success" : "is-error");
    node.textContent = message;
  }

  function setFieldError(field, message) {
    var holder = field.closest(".field") || field.parentNode;
    var error = holder ? holder.querySelector("[data-error]") : null;
    field.classList.toggle("is-invalid", !!message);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) {
      error.hidden = !message;
      error.textContent = message || "";
    }
  }

  function validate(form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll("input"));
    var firstBad = null;
    var values = {};

    fields.forEach(function (field) {
      values[field.name] = field.value;
      var value = (field.value || "").trim();
      var message = "";

      if (field.hasAttribute("required") && !value) {
        message = (field.getAttribute("data-label") || "This field") + " is required.";
      } else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = "Enter a valid email address.";
      } else if (field.hasAttribute("minlength") && value && value.length < parseInt(field.getAttribute("minlength"), 10)) {
        message = "Please use at least " + field.getAttribute("minlength") + " characters.";
      }

      setFieldError(field, message);
      if (message && !firstBad) firstBad = field;
    });

    var confirm = form.querySelector("[data-confirm]");
    if (confirm && !firstBad) {
      var target = form.querySelector('[name="' + confirm.getAttribute("data-confirm") + '"]');
      if (target && confirm.value !== target.value) {
        setFieldError(confirm, "Passwords do not match.");
        firstBad = confirm;
      }
    }

    if (firstBad) {
      firstBad.focus();
      return null;
    }
    return values;
  }

  function renderAccountPage() {
    var root = document.getElementById("account");
    if (!root) return;

    var out = root.querySelector("[data-account-out]");
    var panel = root.querySelector("[data-account-in]");
    var user = current();

    if (out) out.hidden = !!user;
    if (panel) panel.hidden = !user;
    if (!user || !panel) return;

    var cartCount = window.USVCart ? window.USVCart.count() : 0;
    var wishCount = window.USVCart ? window.USVCart.wishlist().length : 0;

    var avatar = panel.querySelector("[data-account-avatar]");
    if (avatar) avatar.textContent = initials(user.name) || "U";

    var name = panel.querySelector("[data-account-name]");
    if (name) name.textContent = user.name;

    var email = panel.querySelector("[data-account-email]");
    if (email) email.textContent = user.email;

    var since = panel.querySelector("[data-account-since]");
    if (since) since.textContent = formatDate(user.since);

    var cart = panel.querySelector("[data-account-cart]");
    if (cart) cart.textContent = String(cartCount);

    var wish = panel.querySelector("[data-account-wish]");
    if (wish) wish.textContent = String(wishCount);
  }

  function bindAccountPage() {
    var root = document.getElementById("account");
    if (!root) return;

    var status = root.querySelector("[data-auth-status]");
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-auth-tab]"));

    function showTab(key) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute("data-auth-tab") === key;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      Array.prototype.slice.call(root.querySelectorAll("[data-auth-form]")).forEach(function (form) {
        form.hidden = form.getAttribute("data-auth-form") !== key;
      });
      setStatus(status, "");
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        showTab(tab.getAttribute("data-auth-tab"));
      });
    });

    var links = Array.prototype.slice.call(root.querySelectorAll("[data-auth-goto]"));
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        showTab(link.getAttribute("data-auth-goto"));
      });
    });

    Array.prototype.slice.call(root.querySelectorAll("[data-auth-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var values = validate(form);
        if (!values) return;

        var kind = form.getAttribute("data-auth-form");
        var button = form.querySelector('button[type="submit"]');
        if (button) button.disabled = true;

        var action = kind === "signup" ? signUp(values) : signIn(values);

        action.then(function (result) {
          if (button) button.disabled = false;

          if (!result.ok) {
            setStatus(status, result.error, false);
            if (window.USVToast) window.USVToast.show(result.error);
            return;
          }

          form.reset();
          setStatus(
            status,
            kind === "signup"
              ? "Account created. Welcome, " + result.user.name + "."
              : "Signed in as " + result.user.name + ".",
            true
          );
          if (window.USVToast) {
            window.USVToast.show(kind === "signup" ? "Account created." : "Welcome back, " + result.user.name + ".");
          }
          renderAccountPage();
        });
      });
    });

    var signOutBtn = root.querySelector("[data-account-signout]");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", function () {
        signOut();
        setStatus(status, "You have been signed out.", true);
        showTab("signin");
        if (window.USVToast) window.USVToast.show("Signed out.");
      });
    }

    var resetBtn = root.querySelector("[data-account-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        reset();
        setStatus(status, "Local accounts cleared.", true);
        showTab("signin");
      });
    }
  }

  function initAccountPage() {
    bindAccountPage();
    renderAccountPage();
  }

  return {
    current: current,
    isSignedIn: isSignedIn,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    accountCount: accountCount,
    reset: reset,
    onChange: onChange,
    renderAccountPage: renderAccountPage,
    initAccountPage: initAccountPage
  };
})();
