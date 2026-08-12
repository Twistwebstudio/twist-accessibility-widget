/*!
 * Twist Accessibility Widget
 * A lightweight, dependency-free accessibility toolbar for any website.
 * Built by Twist Web Studio (https://twistwebstudio.com)
 *
 * USAGE
 * Drop this before </body>:
 *   <script src="twist-accessibility-widget.js"
 *           data-position="bottom-right"
 *           data-accent="#2563eb"
 *           data-brand="Your Site Name"
 *           data-statement-url="/accessibility-statement"
 *           data-feedback-url="mailto:you@example.com"
 *           data-credit="true"></script>
 *
 * All data- attributes are optional. See README for the full list.
 */
(function () {
  "use strict";

  if (window.__twaLoaded) return; // avoid double init if script included twice
  window.__twaLoaded = true;

  /* -------------------------------------------------------------- *
   * 1. CONFIG
   * -------------------------------------------------------------- */
  var scriptEl =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  function getData(name, fallback) {
    var v = scriptEl && scriptEl.getAttribute("data-" + name);
    return v === null || v === undefined || v === "" ? fallback : v;
  }

  var CONFIG = {
    position: getData("position", "bottom-right"),
    accent: getData("accent", "#2563eb"),
    brand: getData("brand", "This site"),
    statementUrl: getData("statement-url", ""),
    feedbackUrl: getData("feedback-url", ""),
    contactUrl: getData("contact-url", getData("feedback-url", "")),
    credit: getData("credit", "true") !== "false",
    creditUrl: getData("credit-url", "https://twistwebstudio.com"),
    storageKey: "twa-settings:" + location.hostname,
  };

  var FONT_STEPS = [100, 110, 120, 135, 150];

  var DEFAULTS = {
    fontStep: 0,
    letterSpacing: false,
    lineHeight: false,
    dyslexiaFont: false,
    highContrast: false,
    darkMode: false,
    keyboardHighlight: false,
    readingGuide: false,
    pauseAnimations: false,
    altChecker: false,
  };

  /* -------------------------------------------------------------- *
   * 2. STATE (persisted per-domain in localStorage)
   * -------------------------------------------------------------- */
  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return Object.assign({}, DEFAULTS);
      var parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULTS, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULTS);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
    } catch (e) {
      /* storage unavailable (private mode, quota, etc) - fail silently */
    }
  }

  /* -------------------------------------------------------------- *
   * 3. STYLES
   *    Everything is scoped to #twa-root so the widget's own UI is
   *    never affected by the site-wide accessibility toggles it
   *    applies (high contrast, dark mode, font scale, etc).
   * -------------------------------------------------------------- */
  var css = "" +
  "#twa-root, #twa-root *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}" +
  "#twa-root{position:fixed;z-index:2147483000;line-height:1.4;}" +
  "#twa-root.twa-pos-bottom-right{bottom:20px;right:20px;}" +
  "#twa-root.twa-pos-bottom-left{bottom:20px;left:20px;}" +
  "#twa-root.twa-pos-top-right{top:20px;right:20px;}" +
  "#twa-root.twa-pos-top-left{top:20px;left:20px;}" +
  "#twa-toggle{width:56px;height:56px;border-radius:50%;background:var(--twa-accent,#2563eb);color:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;padding:0;}" +
  "#twa-toggle:hover{filter:brightness(1.08);}" +
  "#twa-toggle:focus-visible{outline:3px solid #fff;outline-offset:2px;box-shadow:0 0 0 5px var(--twa-accent,#2563eb);}" +
  "#twa-toggle svg{width:30px;height:30px;}" +
  "#twa-panel{display:none;position:absolute;width:330px;max-height:80vh;overflow-y:auto;background:#fff;color:#1a1a1a;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.28);padding:16px;font-size:14px;}" +
  "#twa-root.twa-pos-bottom-right #twa-panel, #twa-root.twa-pos-top-right #twa-panel{right:0;}" +
  "#twa-root.twa-pos-bottom-left #twa-panel, #twa-root.twa-pos-top-left #twa-panel{left:0;}" +
  "#twa-root.twa-pos-bottom-right #twa-panel, #twa-root.twa-pos-bottom-left #twa-panel{bottom:66px;}" +
  "#twa-root.twa-pos-top-right #twa-panel, #twa-root.twa-pos-top-left #twa-panel{top:66px;}" +
  "#twa-panel.twa-open{display:block;}" +
  "#twa-panel h2{font-size:16px;margin:0 0 4px;color:#111;}" +
  "#twa-panel .twa-sub{font-size:12px;color:#666;margin:0 0 14px;}" +
  "#twa-panel h3{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#555;margin:16px 0 8px;border-top:1px solid #eee;padding-top:12px;}" +
  "#twa-panel h3:first-of-type{border-top:none;padding-top:0;margin-top:4px;}" +
  "#twa-row{display:flex;}" +
  ".twa-btn-row{display:flex;gap:6px;margin-bottom:8px;}" +
  ".twa-btn{flex:1;background:#f2f4f7;border:1px solid #dde1e7;color:#1a1a1a;border-radius:8px;padding:8px 6px;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;}" +
  ".twa-btn:hover{background:#e8ebef;}" +
  ".twa-btn:focus-visible{outline:2px solid var(--twa-accent,#2563eb);outline-offset:1px;}" +
  ".twa-toggle-row{display:flex;align-items:center;justify-content:space-between;padding:7px 2px;gap:10px;}" +
  ".twa-toggle-row label{font-size:13px;color:#222;cursor:pointer;flex:1;}" +
  ".twa-switch{position:relative !important;display:block !important;box-sizing:border-box !important;width:40px !important;height:22px !important;max-width:40px !important;min-width:40px !important;max-height:22px !important;min-height:22px !important;flex:0 0 40px !important;cursor:pointer;margin:0 !important;padding:0 !important;float:none !important;}" +
  ".twa-switch input{-webkit-appearance:none !important;appearance:none !important;opacity:0 !important;width:0 !important;height:0 !important;min-width:0 !important;min-height:0 !important;position:absolute !important;margin:0 !important;padding:0 !important;border:0 !important;pointer-events:none;}" +
  ".twa-switch .twa-slider{position:absolute !important;inset:0 !important;background:#ccc !important;border-radius:22px !important;transition:background .15s;cursor:pointer;display:block !important;}" +
  ".twa-switch .twa-slider:before{content:'' !important;position:absolute !important;width:16px !important;height:16px !important;left:3px !important;top:3px !important;background:#fff !important;border-radius:50% !important;transition:transform .15s;}" +
  ".twa-switch input:checked + .twa-slider{background:var(--twa-accent,#2563eb) !important;}" +
  ".twa-switch input:checked + .twa-slider:before{transform:translateX(18px) !important;}" +
  ".twa-switch input:focus-visible + .twa-slider{outline:2px solid var(--twa-accent,#2563eb);outline-offset:2px;}" +
  "#twa-panel .twa-note{background:#f6f8fb;border-radius:10px;padding:10px;font-size:12.5px;color:#333;margin-top:6px;}" +
  "#twa-panel .twa-note a{color:var(--twa-accent,#2563eb);font-weight:600;}" +
  "#twa-panel .twa-footer{margin-top:16px;padding-top:12px;border-top:1px solid #eee;display:flex;flex-direction:column;gap:8px;}" +
  "#twa-panel .twa-footer a, #twa-panel .twa-footer button{color:var(--twa-accent,#2563eb);background:none;border:none;padding:0;font-size:12.5px;text-align:left;cursor:pointer;text-decoration:underline;}" +
  "#twa-reset{background:#fdeceb;color:#b42318;border:1px solid #f3c6c2;border-radius:8px;padding:8px;font-size:12.5px;font-weight:600;cursor:pointer;text-decoration:none !important;text-align:center !important;}" +
  "#twa-credit{color:#999 !important;text-decoration:none !important;font-size:11.5px !important;}" +
  "#twa-close{position:absolute;top:10px;right:10px;background:none;border:none;color:#666;cursor:pointer;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;}" +
  "#twa-close:hover{background:#f2f2f2;}" +
  "#twa-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;}" +
  "#twa-reading-guide{position:fixed;left:0;width:100%;height:46px;background:rgba(255,224,0,.35);border-top:2px solid rgba(0,0,0,.35);border-bottom:2px solid rgba(0,0,0,.35);pointer-events:none;z-index:2147482999;display:none;}" +
  "@media (max-width:420px){#twa-panel{width:calc(100vw - 32px);}}" +
  /* ---- site-wide effects, scoped away from the widget itself ---- */
  "html.twa-active{font-size:calc(100% * var(--twa-font-mult,1));}" +
  "html.twa-letter-spacing body :not(#twa-root):not(#twa-root *){letter-spacing:.09em !important;word-spacing:.12em !important;}" +
  "html.twa-line-height body :not(#twa-root):not(#twa-root *){line-height:1.9 !important;}" +
  "html.twa-dyslexia body :not(#twa-root):not(#twa-root *){font-family:'Lexend',Verdana,Tahoma,sans-serif !important;}" +
  "html.twa-keyboard-highlight :not(#twa-root):not(#twa-root *):focus-visible{outline:3px solid var(--twa-accent,#2563eb) !important;outline-offset:3px !important;border-radius:2px;}" +
  "html.twa-pause-animations *:not(#twa-root):not(#twa-root *){animation:none !important;transition:none !important;scroll-behavior:auto !important;}" +
  "html.twa-high-contrast body :not(#twa-root):not(#twa-root *){background-color:#000 !important;color:#fff !important;border-color:#6b6b6b !important;}" +
  "html.twa-high-contrast body a:not(#twa-root *),html.twa-high-contrast body button:not(#twa-root *){color:#ffd400 !important;}" +
  "html.twa-high-contrast img:not(#twa-root *),html.twa-high-contrast video:not(#twa-root *){filter:grayscale(.2) contrast(1.15);}" +
  "html.twa-dark-mode{background:#fff;filter:invert(1) hue-rotate(180deg);}" +
  "html.twa-dark-mode img:not(#twa-root *),html.twa-dark-mode video:not(#twa-root *),html.twa-dark-mode picture:not(#twa-root *),html.twa-dark-mode svg:not(#twa-root *),html.twa-dark-mode canvas:not(#twa-root *),html.twa-dark-mode iframe:not(#twa-root *){filter:invert(1) hue-rotate(180deg);}" +
  "html.twa-dark-mode #twa-root{filter:invert(1) hue-rotate(180deg);}" +
  ".twa-alt-flag{outline:3px dashed #e11d48 !important;outline-offset:2px !important;}" +
  ".twa-alt-badge{position:absolute;background:#e11d48;color:#fff;font-size:11px;font-weight:600;padding:2px 6px;border-radius:4px;z-index:2147482998;pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}" +
  "@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600&display=swap');";

  var styleTag = document.createElement("style");
  styleTag.id = "twa-styles";
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* -------------------------------------------------------------- *
   * 4. ICONS (inline SVG, no external requests)
   * -------------------------------------------------------------- */
  var ICON_ACCESS =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.001"/>' +
    '<circle cx="12" cy="5" r="2.1" fill="#fff"/>' +
    '<path d="M4.5 8.2c2.4.9 5 1.3 7.5 1.3s5.1-.4 7.5-1.3" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M12 9.5v4.4l-2.6 6.6" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M12 13.9l2.6 6.6" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M12 11.6v3.1" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>';

  var ICON_CLOSE =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">' +
    '<path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  /* -------------------------------------------------------------- *
   * 5. BUILD DOM
   * -------------------------------------------------------------- */
  var root = document.createElement("div");
  root.id = "twa-root";
  root.className = "twa-pos-" + CONFIG.position;
  root.style.setProperty("--twa-accent", CONFIG.accent);

  root.innerHTML =
    '<div id="twa-live" aria-live="polite" role="status"></div>' +
    '<button id="twa-toggle" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="twa-panel" aria-label="Open accessibility options">' +
    ICON_ACCESS +
    "</button>" +
    '<div id="twa-panel" role="dialog" aria-modal="true" aria-labelledby="twa-panel-title" tabindex="-1">' +
    '<button id="twa-close" type="button" aria-label="Close accessibility options">' + ICON_CLOSE + "</button>" +
    '<h2 id="twa-panel-title">Accessibility Options</h2>' +
    '<p class="twa-sub">' + escapeHtml(CONFIG.brand) + " is committed to being usable by everyone. Adjust the settings below to fit your needs.</p>" +

    "<h3>Text &amp; display</h3>" +
    '<div class="twa-btn-row">' +
    '<button class="twa-btn" id="twa-font-dec" type="button" aria-label="Decrease text size">A&minus;</button>' +
    '<button class="twa-btn" id="twa-font-reset" type="button" aria-label="Reset text size">Reset</button>' +
    '<button class="twa-btn" id="twa-font-inc" type="button" aria-label="Increase text size">A+</button>' +
    "</div>" +
    toggleRow("letterSpacing", "Increase letter &amp; word spacing") +
    toggleRow("lineHeight", "Increase line height") +
    toggleRow("dyslexiaFont", "Dyslexia-friendly font") +
    toggleRow("highContrast", "High contrast mode") +
    toggleRow("darkMode", "Dark mode") +

    "<h3>Navigation</h3>" +
    toggleRow("keyboardHighlight", "Strong keyboard focus outline") +
    toggleRow("readingGuide", "Reading guide (follow cursor)") +
    toggleRow("pauseAnimations", "Pause animations &amp; motion") +
    '<div class="twa-btn-row">' +
    '<button class="twa-btn" id="twa-skip" type="button" style="flex:1 1 100%;">Skip to main content</button>' +
    "</div>" +

    "<h3>Screen reader &amp; visual checks</h3>" +
    toggleRow("altChecker", "Flag images missing alt text") +
    '<div class="twa-note">Need to connect in ASL or by video instead of text? ' +
    (CONFIG.contactUrl
      ? '<a href="' + escapeAttr(CONFIG.contactUrl) + '">Reach out here</a>.'
      : "Let us know through the contact page.") +
    "</div>" +

    '<div class="twa-footer">' +
    (CONFIG.statementUrl
      ? '<a href="' + escapeAttr(CONFIG.statementUrl) + '">View accessibility statement</a>'
      : "") +
    (CONFIG.feedbackUrl
      ? '<a href="' + escapeAttr(CONFIG.feedbackUrl) + '">Report an accessibility issue</a>'
      : "") +
    '<button id="twa-reset" type="button">Reset all settings</button>' +
    (CONFIG.credit
      ? '<a id="twa-credit" href="' + escapeAttr(CONFIG.creditUrl) + '" target="_blank" rel="noopener">Accessibility widget by Twist Web Studio</a>'
      : "") +
    "</div>" +
    "</div>";

  document.addEventListener("DOMContentLoaded", mount);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    mount();
  }

  function mount() {
    if (root.isConnected) return;
    document.body.appendChild(root);
    var guide = document.createElement("div");
    guide.id = "twa-reading-guide";
    guide.setAttribute("aria-hidden", "true");
    document.body.appendChild(guide);
    wireEvents();
    applyAllSettings();
  }

  function toggleRow(key, label) {
    return (
      '<div class="twa-toggle-row">' +
      '<label for="twa-toggle-' + key + '">' + label + "</label>" +
      '<label class="twa-switch" for="twa-toggle-' + key + '"><input type="checkbox" id="twa-toggle-' + key + '" data-key="' + key + '">' +
      '<span class="twa-slider" aria-hidden="true"></span></label>' +
      "</div>"
    );
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(str) {
    return escapeHtml(str);
  }

  /* -------------------------------------------------------------- *
   * 6. EVENTS
   * -------------------------------------------------------------- */
  var toggleBtn, panel, closeBtn, liveRegion, readingGuideEl;
  var lastFocused = null;

  function wireEvents() {
    toggleBtn = root.querySelector("#twa-toggle");
    panel = root.querySelector("#twa-panel");
    closeBtn = root.querySelector("#twa-close");
    liveRegion = root.querySelector("#twa-live");
    readingGuideEl = document.getElementById("twa-reading-guide");

    toggleBtn.addEventListener("click", function () {
      panel.classList.contains("twa-open") ? closePanel() : openPanel();
    });
    closeBtn.addEventListener("click", closePanel);

    document.addEventListener("keydown", function (e) {
      if (!panel.classList.contains("twa-open")) return;
      if (e.key === "Escape") {
        closePanel();
        return;
      }
      if (e.key === "Tab") trapFocus(e);
    });

    document.addEventListener("click", function (e) {
      if (panel.classList.contains("twa-open") && !root.contains(e.target)) {
        closePanel();
      }
    });

    // font size buttons
    root.querySelector("#twa-font-inc").addEventListener("click", function () {
      state.fontStep = Math.min(state.fontStep + 1, FONT_STEPS.length - 1);
      applyAllSettings();
      saveState();
      announce("Text size " + FONT_STEPS[state.fontStep] + " percent.");
    });
    root.querySelector("#twa-font-dec").addEventListener("click", function () {
      state.fontStep = Math.max(state.fontStep - 1, 0);
      applyAllSettings();
      saveState();
      announce("Text size " + FONT_STEPS[state.fontStep] + " percent.");
    });
    root.querySelector("#twa-font-reset").addEventListener("click", function () {
      state.fontStep = 0;
      applyAllSettings();
      saveState();
      announce("Text size reset to default.");
    });

    // toggle switches
    Array.prototype.forEach.call(root.querySelectorAll('[data-key]'), function (input) {
      input.addEventListener("change", function () {
        var key = input.getAttribute("data-key");
        state[key] = input.checked;
        applyAllSettings();
        saveState();
        announce(labelFor(key) + (input.checked ? " enabled." : " disabled."));
      });
    });

    root.querySelector("#twa-skip").addEventListener("click", skipToContent);
    root.querySelector("#twa-reset").addEventListener("click", resetAll);

    document.addEventListener("mousemove", function (e) {
      if (state.readingGuide) {
        readingGuideEl.style.top = e.clientY - 23 + "px";
      }
    });
  }

  function labelFor(key) {
    var map = {
      letterSpacing: "Extra letter and word spacing",
      lineHeight: "Extra line height",
      dyslexiaFont: "Dyslexia-friendly font",
      highContrast: "High contrast mode",
      darkMode: "Dark mode",
      keyboardHighlight: "Strong keyboard focus outline",
      readingGuide: "Reading guide",
      pauseAnimations: "Paused animations",
      altChecker: "Missing alt text flagging",
    };
    return map[key] || key;
  }

  function openPanel() {
    lastFocused = document.activeElement;
    panel.classList.add("twa-open");
    toggleBtn.setAttribute("aria-expanded", "true");
    panel.focus();
  }

  function closePanel() {
    panel.classList.remove("twa-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    } else {
      toggleBtn.focus();
    }
  }

  function trapFocus(e) {
    var focusables = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    // brief timeout so assistive tech reliably picks up the change
    setTimeout(function () {
      liveRegion.textContent = msg;
    }, 50);
  }

  function skipToContent() {
    var target =
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.querySelector("h1");
    if (!target) {
      announce("No main content landmark found on this page.");
      return;
    }
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }
    target.focus();
    target.scrollIntoView({ behavior: state.pauseAnimations ? "auto" : "smooth", block: "start" });
    announce("Jumped to main content.");
    closePanel();
  }

  function resetAll() {
    state = Object.assign({}, DEFAULTS);
    saveState();
    applyAllSettings();
    syncControls();
    announce("All accessibility settings reset to default.");
  }

  /* -------------------------------------------------------------- *
   * 7. APPLY SETTINGS
   * -------------------------------------------------------------- */
  function applyAllSettings() {
    var html = document.documentElement;
    var anyActive = Object.keys(state).some(function (k) {
      return k === "fontStep" ? state[k] !== 0 : !!state[k];
    });
    html.classList.toggle("twa-active", anyActive || state.fontStep !== 0);
    html.style.setProperty("--twa-font-mult", (FONT_STEPS[state.fontStep] / 100).toString());

    toggleClass(html, "twa-letter-spacing", state.letterSpacing);
    toggleClass(html, "twa-line-height", state.lineHeight);
    toggleClass(html, "twa-dyslexia", state.dyslexiaFont);
    toggleClass(html, "twa-high-contrast", state.highContrast);
    toggleClass(html, "twa-dark-mode", state.darkMode);
    toggleClass(html, "twa-keyboard-highlight", state.keyboardHighlight);
    toggleClass(html, "twa-pause-animations", state.pauseAnimations);

    readingGuideEl.style.display = state.readingGuide ? "block" : "none";

    runAltChecker(state.altChecker);
    syncControls();
  }

  function toggleClass(el, cls, on) {
    el.classList.toggle(cls, !!on);
  }

  function syncControls() {
    if (!root.isConnected) return;
    Array.prototype.forEach.call(root.querySelectorAll("[data-key]"), function (input) {
      input.checked = !!state[input.getAttribute("data-key")];
    });
  }

  /* -------------------------------------------------------------- *
   * 8. ALT-TEXT CHECKER
   * -------------------------------------------------------------- */
  var altBadges = [];
  var altObserver = null;
  var altDebounceTimer = null;

  function debouncedScanImages() {
    clearTimeout(altDebounceTimer);
    altDebounceTimer = setTimeout(function () {
      altDebounceTimer = null;
      scanImages();
    }, 400);
  }

  function runAltChecker(on) {
    clearTimeout(altDebounceTimer);
    altDebounceTimer = null;
    clearAltFlags();
    if (!on) {
      if (altObserver) {
        altObserver.disconnect();
        altObserver = null;
      }
      return;
    }
    scanImages();
    if (!altObserver) {
      altObserver = new MutationObserver(debouncedScanImages);
      altObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["alt"] });
    }
    window.addEventListener("scroll", positionBadges, { passive: true });
    window.addEventListener("resize", positionBadges);
  }

  function scanImages() {
    clearAltFlags();
    var imgs = document.querySelectorAll("img");
    var flagged = 0;
    Array.prototype.forEach.call(imgs, function (img) {
      if (root.contains(img)) return;
      var alt = img.getAttribute("alt");
      var decorative = img.getAttribute("role") === "presentation" || img.getAttribute("aria-hidden") === "true";
      if ((alt === null || alt.trim() === "") && !decorative) {
        img.classList.add("twa-alt-flag");
        var badge = document.createElement("div");
        badge.className = "twa-alt-badge";
        badge.textContent = "Missing alt text";
        document.body.appendChild(badge);
        altBadges.push({ img: img, badge: badge });
        flagged++;
      }
    });
    positionBadges();
    announce(
      flagged > 0
        ? flagged + " image" + (flagged === 1 ? "" : "s") + " missing alt text found on this page."
        : "No missing alt text found on this page."
    );
  }

  function positionBadges() {
    altBadges.forEach(function (entry) {
      var rect = entry.img.getBoundingClientRect();
      entry.badge.style.top = Math.max(rect.top, 0) + window.scrollY + "px";
      entry.badge.style.left = rect.left + window.scrollX + "px";
      entry.badge.style.display = rect.width === 0 && rect.height === 0 ? "none" : "block";
    });
  }

  function clearAltFlags() {
    altBadges.forEach(function (entry) {
      entry.img.classList.remove("twa-alt-flag");
      if (entry.badge.parentNode) entry.badge.parentNode.removeChild(entry.badge);
    });
    altBadges = [];
  }

})();
