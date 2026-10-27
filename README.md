# cv.andolfatto.co.uk

Marco Andolfatto's online CV in English and French, each with a matched A4 print sheet and a
pre-rendered PDF.

Plain HTML, CSS and one small JavaScript file. No framework, no build step, no
dependencies — clone it and open `index.html`, or push and GitHub Pages serves it.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | The web CV: single scrolling page, dark editorial treatment. |
| `styles.css` | Everything the web CV looks like. Design tokens live in `:root`. |
| `main.js` | Scroll progress, role expand/collapse, glossary tooltips, contact form. |
| `print.html` | The A4 one-page print sheet. Deliberately light and toner-safe. |
| `fr/index.html`, `fr/print.html` | The French web CV and print sheet, served at `/fr/`. Same CSS and JS, paths up one level. |
| `print.css` | Styles for the print sheet. Spacing in mm, type in pt, `@page` A4. |
| `Marco-Andolfatto-CV.pdf` | Pre-rendered from `print.html`. What the Download PDF button serves. |
| `Marco-Andolfatto-CV-FR.pdf` | Pre-rendered from `fr/print.html`. Served by the French page. |
| `assets/fonts/` | Bricolage Grotesque and Schibsted Grotesk, self-hosted as woff2. |
| `assets/og-source.html` | Source for the social card and app icon. Regeneration steps are in the file. |
| `favicon.svg` | Tab icon. |
| `CNAME` | The custom domain. Do not delete — GitHub Pages needs it. |

## Deployment

GitHub Pages serves the `master` branch from the repository root. Pushing to
`master` publishes. The custom domain is `cv.andolfatto.co.uk`, set by `CNAME`;
"Enforce HTTPS" should stay ticked in Settings → Pages.

`.nojekyll` stops Pages from running the files through Jekyll.

## The contact form

The site is static, so the form posts to [Web3Forms](https://web3forms.com), which
relays it to `jobs@andolfatto.co.uk`. The access key at the top of `main.js` is
public by design — it only ever delivers to the address it was issued for, and it
can be rotated from the Web3Forms dashboard if it ever attracts noise.

Volume is limited in layers, so a burst can't turn into an inbox problem:

| Layer | What it stops |
| --- | --- |
| Two honeypot fields (`website`, `botcheck`) | Bots that fill in every field they find. |
| Four-second time trap | Scripted submits that fire the instant the page loads. |
| 120-second cooldown, per browser | Repeat sends and double-clicks. |
| Five sends per rolling 24 hours, per browser | One person flooding the form. |
| Web3Forms' own monthly quota and spam filter | Everything that gets past the above. |

The cooldown and the daily cap are held in `localStorage`, so they are per browser
rather than per person — they are a courtesy limiter, not a security control. The
quota on the Web3Forms side is the hard backstop. All four thresholds are constants
in the `CONTACT` object at the top of `main.js`.

If the access key is ever blanked out, the form falls back to opening the visitor's
mail client with the message pre-filled, so the page keeps working either way.

## Regenerating the PDF

The PDF is committed rather than generated on the fly, because browser print output
varies. After editing `print.html` or `print.css`, re-render it with headless Chrome:

```bash
chrome --headless --disable-gpu --no-pdf-header-footer --allow-file-access-from-files --print-to-pdf="Marco-Andolfatto-CV.pdf" "file:///path/to/print.html"
chrome --headless --disable-gpu --no-pdf-header-footer --allow-file-access-from-files --print-to-pdf="Marco-Andolfatto-CV-FR.pdf" "file:///path/to/fr/print.html"
```

`print.css` sets `@page { size: A4; margin: 0 }` and the sheet is exactly
210 × 297 mm, so the output is one page with no browser headers. Check the page
count afterwards — the sheet has roughly 10 mm of slack, and added content will
spill onto a second page rather than shrink to fit.

## Languages

English lives at the root, French under `/fr/`. They are two hand-maintained
pages rather than one page with swapped strings, so each is complete without
JavaScript and indexable on its own; `hreflang` links tie them together. A content
change means editing both `index.html` files and both `print.html` files.

`main.js` reads `<html lang>` and picks its UI strings and glossary from the
`STRINGS` and `GLOSSARY` tables at the top. The French page addresses visitors as
*vous* and keeps SaaS job titles and acronyms in English, as French SaaS does.

The print sheets are tighter than the web copy on purpose: French runs longer,
and both sheets must stay on one page.

## Notes on the build

- Fonts are self-hosted rather than pulled from Google Fonts: no third-party
  request on load, and nothing about visitors leaves the site.
- Role detail panels animate with `grid-template-rows: 0fr → 1fr`, not a fixed
  `max-height`, so long content can never be clipped. Closed panels are `inert`,
  which keeps them out of the tab order and away from screen readers.
- Glossary terms are real `<button>` elements: they work on hover, on focus and on
  tap, dismiss on Escape or an outside tap, and expose their definition through
  `aria-describedby`.
- The ticker stops for `prefers-reduced-motion`.
- `index.html` has a modest print stylesheet as a safety net, so an accidental
  Ctrl+P produces something readable rather than a page of dark ink. The real print
  artefact is `print.html` / the PDF.
