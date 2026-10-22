// Writes the shared header, footer and review markup into every page as plain HTML,
// so search engines and AI crawlers that don't run JavaScript still see it.
//
// Edit the templates below (or reviews.json), then run from the project root:
//   node tools/sync.mjs
//
// Each generated block sits between <!-- site:NAME --> and <!-- /site:NAME --> markers.
// Anything between the markers is overwritten on every run.

import fs from "node:fs";

const PHONE = "970-306-7489";
const EMAIL = "iker@puresightwc.com";
const PAGES = {
  "index.html": "home",
  "contact.html": "contact",
  "services-offered.html": "services",
  "gallery.html": "gallery",
  "service-areas.html": "areas",
  "404.html": "404"
};
const MORE = [
  { id: "services", href: "services-offered.html", label: "Services Offered" },
  { id: "gallery", href: "gallery.html", label: "Gallery" },
  { id: "areas", href: "service-areas.html", label: "Service Areas" }
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cur = (page, id) => (page === id ? ' aria-current="page"' : "");

const leaf = (cls) =>
  `<svg class="tb-leaf${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20C4 11 10 5 20 4c-1 10-7 16-16 16z"/><path d="M4 20l9-9M9 15h4M12 12V8"/></svg>`;
const autumnLeaf =
  `<svg class="tb-leaf tb-autumn" viewBox="0 0 24 24" aria-hidden="true"><path fill="#e0702f" d="M3 21C3 12 9 6 19 5c-1 10-7 16-16 16z"/><path fill="#c8432b" d="M10 21c0-6 4-11 11-12-1 7-5 12-11 12z"/></svg>`;
const chevron = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 4.2l4 4 4-4"/></svg>`;
const STAR = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>`;
const stars = (n) => `<span class="stars" role="img" aria-label="${Math.round(n)} out of 5 stars">${STAR.repeat(Math.round(n))}</span>`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (iso) => { const [y, m, d] = String(iso).split("-"); return `${MONTHS[+m - 1]} ${+d}, ${y}`; };

function header(page) {
  const inMore = MORE.some((m) => m.id === page);
  return `
  <a class="topbar" href="contact.html?service=bundle">
    <span class="tb-pair">${leaf("")}${leaf("tb-flip")}</span>${autumnLeaf}
    <span class="tb-text">Fall Special: $50 off gutter cleaning when you bundle it with a window cleaning</span>
    ${leaf("tb-flip")}${leaf("tb-far")}
  </a>
  <header class="header">
    <div class="header-inner">
      <button class="burger" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
      <nav class="nav" aria-label="Main">
        <a class="nav-link" href="index.html"${cur(page, "home")}>Home</a>
        <a class="nav-link" href="contact.html"${cur(page, "contact")}>Contact</a>
        <div class="more">
          <button class="nav-link" aria-expanded="false" aria-haspopup="true"${inMore ? ' aria-current="page"' : ""}>More ${chevron}</button>
          <div class="dropdown">
            ${MORE.map((m) => `<a href="${m.href}"${cur(page, m.id)}>${m.label}</a>`).join("\n            ")}
          </div>
        </div>
      </nav>
      <a class="logo" href="index.html">Puresight Window Cleaning</a>
      <div class="header-cta"><a class="btn btn-dark" href="tel:${PHONE}">Call Us Now</a></div>
    </div>
    <nav class="mobile-menu" aria-label="Mobile">
      <a href="index.html"${cur(page, "home")}>Home</a>
      <a href="contact.html"${cur(page, "contact")}>Contact</a>
      ${MORE.map((m) => `<a href="${m.href}"${cur(page, m.id)}>${m.label}</a>`).join("\n      ")}
      <a href="tel:${PHONE}">Call ${PHONE}</a>
    </nav>
  </header>
  `;
}

function footer(page) {
  return `
  <footer class="footer">
    <nav class="footer-links" aria-label="Footer">
      <a href="index.html">Home</a>
      <a href="services-offered.html">Services</a>
      <a href="gallery.html">Gallery</a>
      <a href="service-areas.html">Service Areas</a>
      <a href="contact.html">Free Quote</a>
    </nav>
    <p class="footer-nap">Window, gutter &amp; solar panel cleaning in Vail and across Eagle County, Colorado<br>
      <a href="tel:${PHONE}">${PHONE}</a> · <a href="mailto:${EMAIL}">${EMAIL}</a> · Mon–Sat 8AM–5PM</p>
    <p>Copyright © 2026 Puresight Window Cleaning - All Rights Reserved.</p>
  </footer>
  <nav class="action-bar" aria-label="Quick contact">
    <a href="tel:${PHONE}">Call Now</a>
    <a href="sms:${PHONE}">Text Us</a>
    <a class="action-quote" href="${page === "contact" ? "#quote-form" : "contact.html"}">Get a Quote</a>
  </nav>
  `;
}

const reviews = JSON.parse(fs.readFileSync("reviews.json", "utf8"));
const withText = reviews.reviews.filter((r) => r.text && String(r.text).trim());

function reviewCards() {
  return "\n" + withText.map((r) =>
    `          <article class="review-card">` +
    `<div class="review-head"><h3 class="review-name">${esc(r.reviewer)}</h3><time class="review-date" datetime="${esc(r.date)}">${formatDate(r.date)}</time></div>` +
    stars(r.rating) +
    `<p class="review-text">${esc(String(r.text).trim())}</p></article>`
  ).join("\n") + "\n        ";
}

function reviewSummary() {
  return `
        <span class="rating-num">${Number(reviews.average_rating).toFixed(1)}</span>
        ${stars(reviews.average_rating)}
        <a href="${esc(reviews.google_maps_url)}" target="_blank" rel="noopener">${reviews.total_reviews} Google reviews</a>
      `;
}

// Three short, specific quotes for the contact page.
function contactReviews() {
  const picks = withText
    .map((r) => ({ ...r, text: String(r.text).trim().replace(/\s+/g, " ") }))
    .filter((r) => r.text.length >= 70 && r.text.length <= 220)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  return `
      <section class="contact-reviews" aria-labelledby="contact-reviews-title">
        <h2 class="h3" id="contact-reviews-title">What your neighbors say</h2>
        ${picks.map((r) => `<figure class="quote"><blockquote>${esc(r.text)}</blockquote><figcaption>${stars(r.rating)} ${esc(r.reviewer)}</figcaption></figure>`).join("\n        ")}
        <a class="reviews-link-dark" href="${esc(reviews.google_maps_url)}" target="_blank" rel="noopener">Read all ${reviews.total_reviews} reviews on Google</a>
      </section>
      `;
}

function fill(html, name, content) {
  const re = new RegExp(`(<!-- site:${name} -->)[\\s\\S]*?(<!-- /site:${name} -->)`);
  if (!re.test(html)) throw new Error(`missing <!-- site:${name} --> markers`);
  return html.replace(re, (m, open, close) => open + content + close);
}

for (const [file, page] of Object.entries(PAGES)) {
  const raw = fs.readFileSync(file, "utf8");
  const nl = raw.includes("\r\n") ? "\r\n" : "\n";
  let html = raw.replace(/\r\n/g, "\n");
  html = fill(html, "header", header(page));
  html = fill(html, "footer", footer(page));
  if (page === "home") {
    html = fill(html, "reviews", reviewCards());
    html = fill(html, "review-summary", reviewSummary());
  }
  if (page === "contact") html = fill(html, "contact-reviews", contactReviews());
  fs.writeFileSync(file, html.replace(/\n/g, nl));
  console.log("synced", file);
}
