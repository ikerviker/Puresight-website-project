// Header menu behavior. The header and footer markup itself is written into each page by tools/sync.mjs.
(function () {
  var hdr = document.querySelector(".header");
  if (!hdr) return;
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
