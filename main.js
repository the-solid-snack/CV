/* ==========================================================================
   Marco Andolfatto — CV. Page behaviour.
   No dependencies, no build step. Runs deferred, after parse.
   ========================================================================== */

(function () {
  "use strict";

  /* --- Contact form configuration ----------------------------------------
     Web3Forms access keys are designed to be public in client-side code:
     they only ever deliver to the address the key was issued for. Get one
     at https://web3forms.com using jobs@andolfatto.co.uk and paste it below.
     Until it is filled in, the form falls back to opening a mail client.
     ---------------------------------------------------------------------- */

  var CONTACT = {
    accessKey: "a2225a36-1903-4025-880a-e78f13b940a3",
    endpoint: "https://api.web3forms.com/submit",
    mailto: "jobs@andolfatto.co.uk",

    // Volume limiter, browser-side. Web3Forms' own monthly quota and spam
    // filtering are the backstop; these stop the ordinary causes of floods.
    minSecondsOnPage: 4,      // anything faster is not a person typing
    cooldownSeconds: 120,     // between two sends from this browser
    maxPerDay: 5              // rolling 24 hours from this browser
  };

  var STORE_KEY = "cv.contact.sends";

  /* --- Glossary ----------------------------------------------------------- */

  var GLOSSARY = {
    arr: ["ARR", "Annual recurring revenue — the yearly value of subscription contracts, the standard unit of size in SaaS."],
    nrr: ["Net revenue retention", "Revenue kept from existing customers over a period, counting expansion and upsell minus churn and downgrades. Above 100% means the same customers spend more than they did a year ago."],
    ems: ["EMS", "Electronics manufacturing services — contract manufacturers who assemble circuit boards and products for the companies that design them."],
    oem: ["OEM", "Original equipment manufacturer — the company that designs and sells the product, and buys assembly from an EMS."],
    pcba: ["PCBA", "Printed circuit board assembly — a bare board with its components populated and soldered."],
    bom: ["BOM", "Bill of materials — the line-by-line list of every component a product needs, with quantities and part numbers. Pricing and sourcing all hang off it."],
    mcp: ["MCP", "Model Context Protocol — an open standard that lets AI assistants call a product's own tools and data, so small purpose-built applets can be assembled on top of a platform."],
    qbr: ["QBR", "Quarterly business review — the recurring executive meeting where a vendor and customer review value delivered and agree what happens next."],
    finops: ["FinOps", "The practice of managing cloud spend as an ongoing discipline: visibility, right-sizing, commitment purchases, and accountability for the bill."]
  };

  /* --- Scroll progress ---------------------------------------------------- */

  function initProgress() {
    var fill = document.getElementById("progress-fill");
    if (!fill) return;
    var frame = null;

    function paint() {
      frame = null;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      fill.style.width = (pct * 100).toFixed(2) + "%";
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    paint();
  }

  /* --- Role expand / collapse ---------------------------------------------
     grid-template-rows 0fr -> 1fr, so content of any length opens fully.
     ------------------------------------------------------------------------ */

  function initRoles() {
    var toggles = Array.prototype.slice.call(document.querySelectorAll(".role__toggle"));
    var all = document.getElementById("expand-all");
    if (!toggles.length) return;

    function setOpen(button, open) {
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) return;
      button.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("data-open", open ? "true" : "false");
      panel.inert = !open;
      var label = button.querySelector(".role__toggle-label");
      if (label) label.textContent = open ? "Less" : "More detail";
    }

    function syncAll() {
      if (!all) return;
      var every = toggles.every(function (t) {
        return t.getAttribute("aria-expanded") === "true";
      });
      all.textContent = every ? "Collapse all" : "Expand all";
      all.setAttribute("aria-expanded", every ? "true" : "false");
    }

    toggles.forEach(function (button) {
      setOpen(button, false);
      button.addEventListener("click", function () {
        setOpen(button, button.getAttribute("aria-expanded") !== "true");
        syncAll();
      });
    });

    if (all) {
      all.addEventListener("click", function () {
        var every = toggles.every(function (t) {
          return t.getAttribute("aria-expanded") === "true";
        });
        toggles.forEach(function (t) { setOpen(t, !every); });
        syncAll();
      });
    }

    syncAll();
  }

  /* --- Glossary tooltips ---------------------------------------------------
     Hover, focus and tap all work. Click pins it so it survives a tap on
     touch; Escape or an outside tap dismisses.
     ------------------------------------------------------------------------ */

  function initGlossary() {
    var tip = document.getElementById("glossary-tip");
    var tipTitle = document.getElementById("glossary-tip-title");
    var tipBody = document.getElementById("glossary-tip-body");
    var terms = Array.prototype.slice.call(document.querySelectorAll(".term"));
    if (!tip || !terms.length) return;

    var active = null;
    var pinned = false;

    function hide() {
      if (active) active.removeAttribute("aria-describedby");
      active = null;
      pinned = false;
      tip.hidden = true;
    }

    function show(el) {
      var entry = GLOSSARY[el.dataset.term];
      if (!entry) return;

      tipTitle.textContent = entry[0];
      tipBody.textContent = entry[1];
      tip.hidden = false;

      if (active && active !== el) active.removeAttribute("aria-describedby");
      active = el;
      el.setAttribute("aria-describedby", "glossary-tip");

      // Position: centred on the term, clamped inside the viewport, and
      // flipped below when there is no room above (phones, top of page).
      var r = el.getBoundingClientRect();
      var below = r.top < 192;
      var x = Math.min(Math.max(r.left + r.width / 2, 150), window.innerWidth - 150);
      var y = below
        ? Math.min(r.bottom + 12, window.innerHeight - 20)
        : r.top - 12;

      tip.style.left = x + "px";
      tip.style.top = y + "px";
      tip.style.transform = below ? "translate(-50%, 0)" : "translate(-50%, -100%)";
    }

    terms.forEach(function (el) {
      el.setAttribute("aria-haspopup", "true");

      el.addEventListener("pointerenter", function () {
        if (!pinned) show(el);
      });

      el.addEventListener("pointerleave", function () {
        if (!pinned) hide();
      });

      el.addEventListener("focus", function () {
        show(el);
      });

      el.addEventListener("blur", function () {
        if (!pinned) hide();
      });

      el.addEventListener("click", function (event) {
        event.preventDefault();
        if (pinned && active === el) {
          hide();
        } else {
          show(el);
          pinned = true;
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && active) {
        var el = active;
        hide();
        el.blur();
      }
    });

    document.addEventListener("pointerdown", function (event) {
      if (active && !event.target.closest(".term")) hide();
    });

    window.addEventListener("scroll", function () {
      if (active) hide();
    }, { passive: true });
  }

  /* --- Contact form -------------------------------------------------------- */

  function readSends() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      var cutoff = Date.now() - 24 * 60 * 60 * 1000;
      return list.filter(function (t) {
        return typeof t === "number" && t > cutoff;
      });
    } catch (err) {
      return [];
    }
  }

  function recordSend() {
    try {
      var list = readSends();
      list.push(Date.now());
      window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch (err) {
      /* Private mode or blocked storage: the server-side quota still applies. */
    }
  }

  function mailtoHref(name, email, message) {
    var subject = "CV site — " + (name || "message");
    var body = "From: " + name + " <" + email + ">\n\n" + message;
    return "mailto:" + CONTACT.mailto +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  function initContact() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var status = document.getElementById("form-status");
    var note = document.getElementById("form-note");
    var submit = document.getElementById("c-submit");
    var nameEl = document.getElementById("c-name");
    var emailEl = document.getElementById("c-email");
    var msgEl = document.getElementById("c-message");
    var openedAt = Date.now();
    var sending = false;

    var configured = CONTACT.accessKey && CONTACT.accessKey.indexOf("PASTE_") !== 0;

    if (!configured && note) {
      note.textContent = "Opens your mail app with the message ready — nothing is stored here.";
    }

    function say(text, tone, html) {
      if (!status) return;
      if (html) {
        status.innerHTML = text;
      } else {
        status.textContent = text;
      }
      if (tone) {
        status.setAttribute("data-tone", tone);
      } else {
        status.removeAttribute("data-tone");
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (sending) return;

      var name = nameEl.value.trim();
      var email = emailEl.value.trim();
      var message = msgEl.value.trim();

      // Browser validation, run explicitly because the form is novalidate.
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (!name || !email || !message) {
        say("Name, email and a message, please.", "error");
        return;
      }
      if (message.length < 10) {
        say("A little more detail would help — ten characters minimum.", "error");
        return;
      }

      // Honeypots: a real person leaves both of these alone.
      if (form.website.value || form.botcheck.checked) {
        say("Thanks — message sent.", "ok");
        form.reset();
        return;
      }

      // Time trap.
      if ((Date.now() - openedAt) / 1000 < CONTACT.minSecondsOnPage) {
        say("That was quick — give it a couple of seconds and press send again.", "error");
        return;
      }

      // Volume limiter.
      var sends = readSends();
      if (sends.length >= CONTACT.maxPerDay) {
        say("You have sent a few messages today already. Mail me directly at " +
          '<a href="mailto:' + CONTACT.mailto + '">' + CONTACT.mailto + "</a>.", "error", true);
        return;
      }
      var last = sends.length ? sends[sends.length - 1] : 0;
      var wait = Math.ceil((CONTACT.cooldownSeconds * 1000 - (Date.now() - last)) / 1000);
      if (last && wait > 0) {
        say("Message already on its way. You can send another in " + wait + " seconds.", "error");
        return;
      }

      // No endpoint configured yet: hand off to the visitor's mail client.
      if (!configured) {
        recordSend();
        window.location.href = mailtoHref(name, email, message);
        say("Opening your mail app…", "ok");
        return;
      }

      sending = true;
      submit.disabled = true;
      submit.textContent = "Sending…";
      say("Sending…", null);

      fetch(CONTACT.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: CONTACT.accessKey,
          subject: "CV site — " + name,
          from_name: "cv.andolfatto.co.uk",
          replyto: email,
          name: name,
          email: email,
          message: message
        })
      })
        .then(function (res) {
          return res.json().catch(function () { return { success: res.ok }; });
        })
        .then(function (data) {
          if (data && data.success) {
            recordSend();
            form.reset();
            say("Thanks — that is in my inbox. I will reply to " + email + ".", "ok");
          } else {
            throw new Error((data && data.message) || "Send failed");
          }
        })
        .catch(function () {
          say("That did not go through. Mail me directly at " +
            '<a href="' + mailtoHref(name, email, message) + '">' + CONTACT.mailto +
            "</a> and the message will come with you.", "error", true);
        })
        .then(function () {
          sending = false;
          submit.disabled = false;
          submit.textContent = "Send message";
        });
    });
  }

  /* --- Go ------------------------------------------------------------------ */

  initProgress();
  initRoles();
  initGlossary();
  initContact();
})();
