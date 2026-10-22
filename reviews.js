// Home page reviews carousel. The review cards are written into index.html from reviews.json
// by tools/sync.mjs; this script adds the arrows, "Read more" buttons and keyboard paging.
(function () {
  var track = document.getElementById("review-track");
  if (!track) return;
  var section = document.getElementById("reviews");
  var prev = section.querySelector(".carousel-btn.prev");
  var next = section.querySelector(".carousel-btn.next");

  function updateButtons() {
    var max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
  }

  // Only offer "Read more" on reviews that are actually cut off.
  track.querySelectorAll(".review-card").forEach(function (card) {
    var text = card.querySelector(".review-text");
    if (text.scrollHeight - text.clientHeight < 2) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "review-more";
    btn.textContent = "Read more";
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", function () {
      var open = card.classList.toggle("expanded");
      btn.textContent = open ? "Show less" : "Read more";
      btn.setAttribute("aria-expanded", open);
    });
    card.appendChild(btn);
  });

  function page(dir) { track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" }); }
  prev.hidden = next.hidden = false;
  updateButtons();
  prev.addEventListener("click", function () { page(-1); });
  next.addEventListener("click", function () { page(1); });
  track.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); page(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); page(-1); }
  });
})();
