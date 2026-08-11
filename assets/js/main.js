(function () {
  "use strict";

  var doc = document;

  /* ---------- Contact de-obfuscation (basic scraper deterrent) ---------- */
  function decode(b64) {
    try { return atob(b64); } catch (e) { return ""; }
  }
  function hydrateProtectedContacts() {
    doc.querySelectorAll("[data-encoded]").forEach(function (el) {
      var decoded = decode(el.getAttribute("data-encoded"));
      if (!decoded) return;
      if (el.tagName === "A") {
        el.setAttribute("href", decoded);
      } else {
        el.textContent = decoded;
      }
    });
    doc.body.classList.add("contact-loaded");
  }

  /* ---------- Mobile nav ---------- */
  function initNav() {
    var nav = doc.querySelector(".nav");
    if (!nav) return;
    var toggle = nav.querySelector(".nav__toggle");
    var links = nav.querySelectorAll(".nav__links a");

    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* active-link-on-scroll */
    var sections = [];
    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (href && href.charAt(0) === "#" && href.length > 1) {
        var target = doc.getElementById(href.slice(1));
        if (target) sections.push({ link: a, el: target });
      }
    });
    if (sections.length && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var match = sections.find(function (s) { return s.el === entry.target; });
            if (!match) return;
            if (entry.isIntersecting) {
              sections.forEach(function (s) { s.link.classList.remove("is-active"); });
              match.link.classList.add("is-active");
            }
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      sections.forEach(function (s) { io.observe(s.el); });
    }
  }

  /* ---------- Language preference (remembers an explicit EN/KO choice
     so it overrides the browser-language auto-redirect in <head>) ---------- */
  function initLangPref() {
    doc.querySelectorAll(".lang-switch a").forEach(function (a) {
      a.addEventListener("click", function () {
        var href = a.getAttribute("href") || "";
        var lang = href.indexOf("ko.html") !== -1 ? "ko" : "en";
        try { localStorage.setItem("lang", lang); } catch (e) {}
      });
    });
  }

  /* ---------- Filter tabs (projects / publications) ---------- */
  function initFilters() {
    doc.querySelectorAll("[data-filter-group]").forEach(function (group) {
      var buttons = group.querySelectorAll(".filter-btn");
      var targetSelector = group.getAttribute("data-filter-group");
      var items = doc.querySelectorAll(targetSelector);

      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          var cat = btn.getAttribute("data-filter");
          items.forEach(function (item) {
            var cats = (item.getAttribute("data-cats") || "").split(" ");
            var show = cat === "all" || cats.indexOf(cat) !== -1;
            item.style.display = show ? "" : "none";
          });
        });
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = doc.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { io.observe(el); });

    /* Safety net: guarantee every .reveal is visible shortly after load,
       even if an element never intersects (e.g. sits in a hidden tab
       panel) or the observer misbehaves. Content must never stay hidden. */
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }, 2200);
  }

  /* ---------- Proficiency bar fill on view ---------- */
  function initProficiency() {
    var rows = doc.querySelectorAll(".prow-fill");
    if (!rows.length) return;
    if (!("IntersectionObserver" in window)) {
      rows.forEach(function (el) { el.style.width = el.getAttribute("data-value") + "%"; });
      return;
    }
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.style.width = el.getAttribute("data-value") + "%";
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    rows.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Back to top ---------- */
  function initToTop() {
    var btn = doc.querySelector(".to-top");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      function () { btn.classList.toggle("is-visible", window.scrollY > 700); },
      { passive: true }
    );
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var year = String(new Date().getFullYear());
    doc.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ---------- Only one <details> case-study open at a time per card grid (tidiness) ---------- */
  function initDetails() {
    doc.querySelectorAll(".card__more").forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        var grid = d.closest(".card-grid");
        if (!grid) return;
        grid.querySelectorAll(".card__more[open]").forEach(function (other) {
          if (other !== d) other.open = false;
        });
      });
    });
  }

  doc.addEventListener("DOMContentLoaded", function () {
    hydrateProtectedContacts();
    initLangPref();
    initNav();
    initFilters();
    initReveal();
    initProficiency();
    initToTop();
    initYear();
    initDetails();
  });
})();
