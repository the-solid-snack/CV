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

  /* --- Language ------------------------------------------------------------
     One script for both pages; <html lang> picks the strings. The French page
     lives at /fr/ and addresses visitors as "vous".
     ------------------------------------------------------------------------ */

  var LANG = (document.documentElement.lang || "en").slice(0, 2) === "fr" ? "fr" : "en";

  // French typography: narrow no-break space before ; ! ? and %, no-break before :
  var NNBSP = " ";

  var STRINGS = {
    en: {
      more: "More detail",
      less: "Less",
      expandAll: "Expand all",
      collapseAll: "Collapse all",
      noteMailto: "Opens your mail app with the message ready — nothing is stored here.",
      missing: "Name, email and a message, please.",
      tooShort: "A little more detail would help — ten characters minimum.",
      sentHoneypot: "Thanks — message sent.",
      tooFast: "That was quick — give it a couple of seconds and press send again.",
      dailyCap: "You have sent a few messages today already. Mail me directly at ",
      cooldown: function (s) { return "Message already on its way. You can send another in " + s + " seconds."; },
      opening: "Opening your mail app…",
      sending: "Sending…",
      sent: function (email) { return "Thanks — that is in my inbox. I will reply to " + email + "."; },
      failedBefore: "That did not go through. Mail me directly at ",
      failedAfter: " and the message will come with you.",
      send: "Send message"
    },
    fr: {
      more: "Plus de détails",
      less: "Moins",
      expandAll: "Tout déplier",
      collapseAll: "Tout replier",
      noteMailto: "Ouvre votre messagerie avec le message prêt — rien n’est stocké ici.",
      missing: "Un nom, un e-mail et un message, s’il vous plaît.",
      tooShort: "Un peu plus de détails aideraient — dix caractères minimum.",
      sentHoneypot: "Merci — message envoyé.",
      tooFast: "C’était rapide — patientez quelques secondes et renvoyez.",
      dailyCap: "Vous avez déjà envoyé plusieurs messages aujourd’hui. Écrivez-moi directement à ",
      cooldown: function (s) { return "Message déjà en route. Vous pourrez en envoyer un autre dans " + s + " secondes."; },
      opening: "Ouverture de votre messagerie…",
      sending: "Envoi…",
      sent: function (email) { return "Merci — c’est bien arrivé. Je vous répondrai à " + email + "."; },
      failedBefore: "L’envoi a échoué. Écrivez-moi directement à ",
      failedAfter: ", le message est déjà prérempli.",
      send: "Envoyer le message"
    }
  }[LANG];

  /* --- Glossary ------------------------------------------------------------
     Drafted during design rather than written by Marco, so the handoff flagged
     them as needing his sign-off before launch. English approved as it stands,
     18 September 2026. The PCB entry and the French translations were added
     27 October 2026 and still need his sign-off.
     ------------------------------------------------------------------------ */

  var GLOSSARY = {
    en: {
      arr: ["ARR", "Annual recurring revenue — the yearly value of subscription contracts, the standard unit of size in SaaS."],
      nrr: ["Net revenue retention", "Revenue kept from existing customers over a period, counting expansion and upsell minus churn and downgrades. Above 100% means the same customers spend more than they did a year ago."],
      ems: ["EMS", "Electronics manufacturing services — contract manufacturers who assemble circuit boards and products for the companies that design them."],
      oem: ["OEM", "Original equipment manufacturer — the company that designs and sells the product, and buys assembly from an EMS."],
      pcb: ["PCB", "Printed circuit board — the bare board, before any components are fitted."],
      pcba: ["PCBA", "Printed circuit board assembly — a bare board with its components populated and soldered."],
      bom: ["BOM", "Bill of materials — the line-by-line list of every component a product needs, with quantities and part numbers. Pricing and sourcing all hang off it."],
      mcp: ["MCP", "Model Context Protocol — an open standard that lets AI assistants call a product's own tools and data, so small purpose-built applets can be assembled on top of a platform."],
      qbr: ["QBR", "Quarterly business review — the recurring executive meeting where a vendor and customer review value delivered and agree what happens next."],
      finops: ["FinOps", "The practice of managing cloud spend as an ongoing discipline: visibility, right-sizing, commitment purchases, and accountability for the bill."]
    },
    fr: {
      arr: ["ARR", "Annual recurring revenue, ou revenu annuel récurrent — la valeur annuelle des contrats d’abonnement, l’unité de mesure standard de la taille d’un SaaS."],
      nrr: ["Rétention nette du revenu (NRR)", "Le revenu conservé auprès des clients existants sur une période, expansion et upsell compris, moins le churn et les réductions de contrat. Au-dessus de 100" + NNBSP + "%, les mêmes clients dépensent plus qu’un an auparavant."],
      ems: ["EMS", "Electronics manufacturing services — les sous-traitants en fabrication électronique, qui assemblent cartes et produits pour les entreprises qui les conçoivent."],
      oem: ["OEM", "Original equipment manufacturer — l’entreprise qui conçoit et vend le produit, et en confie l’assemblage à un EMS."],
      pcb: ["PCB", "Printed circuit board, ou circuit imprimé — la carte nue, avant le montage des composants."],
      pcba: ["PCBA", "Printed circuit board assembly — un circuit imprimé dont les composants sont montés et soudés."],
      bom: ["BOM", "Bill of materials, ou nomenclature — la liste ligne par ligne de chaque composant d’un produit, avec quantités et références. Prix et sourcing en dépendent entièrement."],
      mcp: ["MCP", "Model Context Protocol — un standard ouvert qui permet aux assistants IA d’appeler les outils et les données d’un produit, pour assembler de petites applications sur mesure par-dessus une plateforme."],
      qbr: ["QBR", "Quarterly business review — la revue trimestrielle avec la direction du client, où l’on fait le bilan de la valeur apportée et où l’on décide de la suite."],
      finops: ["FinOps", "La gestion des dépenses cloud comme une discipline continue : visibilité, dimensionnement, engagements d’achat et responsabilité sur la facture."]
    }
  }[LANG];

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
      if (label) label.textContent = open ? STRINGS.less : STRINGS.more;
    }

    function syncAll() {
      if (!all) return;
      var every = toggles.every(function (t) {
        return t.getAttribute("aria-expanded") === "true";
      });
      all.textContent = every ? STRINGS.collapseAll : STRINGS.expandAll;
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
      note.textContent = STRINGS.noteMailto;
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
        say(STRINGS.missing, "error");
        return;
      }
      if (message.length < 10) {
        say(STRINGS.tooShort, "error");
        return;
      }

      // Honeypots: a real person leaves both of these alone.
      if (form.website.value || form.botcheck.checked) {
        say(STRINGS.sentHoneypot, "ok");
        form.reset();
        return;
      }

      // Time trap.
      if ((Date.now() - openedAt) / 1000 < CONTACT.minSecondsOnPage) {
        say(STRINGS.tooFast, "error");
        return;
      }

      // Volume limiter.
      var sends = readSends();
      if (sends.length >= CONTACT.maxPerDay) {
        say(STRINGS.dailyCap +
          '<a href="mailto:' + CONTACT.mailto + '">' + CONTACT.mailto + "</a>.", "error", true);
        return;
      }
      var last = sends.length ? sends[sends.length - 1] : 0;
      var wait = Math.ceil((CONTACT.cooldownSeconds * 1000 - (Date.now() - last)) / 1000);
      if (last && wait > 0) {
        say(STRINGS.cooldown(wait), "error");
        return;
      }

      // No endpoint configured yet: hand off to the visitor's mail client.
      if (!configured) {
        recordSend();
        window.location.href = mailtoHref(name, email, message);
        say(STRINGS.opening, "ok");
        return;
      }

      sending = true;
      submit.disabled = true;
      submit.textContent = STRINGS.sending;
      say(STRINGS.sending, null);

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
            say(STRINGS.sent(email), "ok");
          } else {
            throw new Error((data && data.message) || "Send failed");
          }
        })
        .catch(function () {
          say(STRINGS.failedBefore +
            '<a href="' + mailtoHref(name, email, message) + '">' + CONTACT.mailto +
            "</a>" + STRINGS.failedAfter, "error", true);
        })
        .then(function () {
          sending = false;
          submit.disabled = false;
          submit.textContent = STRINGS.send;
        });
    });
  }

  /* --- Go ------------------------------------------------------------------ */

  initProgress();
  initRoles();
  initGlossary();
  initContact();
})();
