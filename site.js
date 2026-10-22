// Shared header + footer so every page stays in sync.
(function () {
  var PHONE = "970-306-7489";
  var page = document.body.dataset.page;
  var more = [
    { id: "services", href: "services-offered.html", label: "Services Offered" },
    { id: "gallery", href: "gallery.html", label: "Gallery" },
    { id: "areas", href: "service-areas.html", label: "Service Areas" }
  ];
  var cur = function (id) { return page === id ? ' aria-current="page"' : ""; };
  var inMore = more.some(function (m) { return m.id === page; });
  var chevron = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 4.2l4 4 4-4"/></svg>';

  var header =
    '<div class="topbar">Now Open for 2026 Summer season</div>' +
    '<header class="header">' +
      '<div class="header-inner">' +
        '<button class="burger" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>' +
        '<nav class="nav" aria-label="Main">' +
          '<a class="nav-link" href="index.html"' + cur("home") + '>Home</a>' +
          '<a class="nav-link" href="contact.html"' + cur("contact") + '>Contact</a>' +
          '<div class="more">' +
            '<button class="nav-link" aria-expanded="false" aria-haspopup="true"' + (inMore ? ' aria-current="page"' : "") + '>More ' + chevron + '</button>' +
            '<div class="dropdown">' + more.map(function (m) { return '<a href="' + m.href + '"' + cur(m.id) + '>' + m.label + '</a>'; }).join("") + '</div>' +
          '</div>' +
        '</nav>' +
        '<a class="logo" href="index.html">Puresight Window Cleaning</a>' +
        '<div class="header-cta"><a class="btn btn-dark" href="tel:' + PHONE + '">Call Us Now</a></div>' +
      '</div>' +
      '<nav class="mobile-menu" aria-label="Mobile">' +
        '<a href="index.html"' + cur("home") + '>Home</a>' +
        '<a href="contact.html"' + cur("contact") + '>Contact</a>' +
        more.map(function (m) { return '<a href="' + m.href + '"' + cur(m.id) + '>' + m.label + '</a>'; }).join("") +
        '<a href="tel:' + PHONE + '">Call ' + PHONE + '</a>' +
      '</nav>' +
    '</header>';

  var footer =
    '<footer class="footer"><p>Copyright © 2026 Puresight Window Cleaning - All Rights Reserved.</p></footer>' +
    // Fixed to the bottom of the screen on phones only (see .action-bar in styles.css).
    '<nav class="action-bar" aria-label="Quick contact">' +
      '<a href="tel:' + PHONE + '">Call Now</a>' +
      '<a href="sms:' + PHONE + '">Text Us</a>' +
      '<a class="action-quote" href="' + (page === "contact" ? "#quote-form" : "contact.html") + '">Get a Quote</a>' +
    '</nav>';

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);

  var hdr = document.querySelector(".header");
  var moreEl = hdr.querySelector(".more");
  var moreBtn = moreEl.querySelector("button");
  var burger = hdr.querySelector(".burger");

  moreBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = moreEl.classList.toggle("open");
    moreBtn.setAttribute("aria-expanded", open);
  });
  document.addEventListener("click", function (e) {
    if (!moreEl.contains(e.target)) { moreEl.classList.remove("open"); moreBtn.setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { moreEl.classList.remove("open"); moreBtn.setAttribute("aria-expanded", "false"); }
  });
  burger.addEventListener("click", function () {
    var open = hdr.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
  });
})();
