// Builds the home page reviews section from reviews.json.
(function () {
  var track = document.getElementById("review-track");
  if (!track) return;
  var section = document.getElementById("reviews");
  var prev = section.querySelector(".carousel-btn.prev");
  var next = section.querySelector(".carousel-btn.next");
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function stars(n) {
    var count = Math.round(Number(n) || 0);
    return '<span class="stars" role="img" aria-label="' + count + ' out of 5 stars">' + new Array(count + 1).join(STAR) + "</span>";
  }
  // "2026-08-18" -> "Aug 18, 2026" (parsed by hand so time zones can't shift the day)
  function formatDate(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return "";
    return MONTHS[Number(p[1]) - 1] + " " + Number(p[2]) + ", " + p[0];
  }

  function updateButtons() {
    var max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= max - 4;
  }

  fetch("reviews.json")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var list = (data.reviews || []).filter(function (r) { return r.text && String(r.text).trim(); });

      document.getElementById("rating-num").textContent = Number(data.average_rating).toFixed(1);
      document.getElementById("rating-stars").outerHTML = stars(data.average_rating);
      var count = document.getElementById("reviews-count");
      count.textContent = data.total_reviews + " Google reviews";
      if (data.google_maps_url) {
        count.href = data.google_maps_url;
        document.getElementById("all-reviews").href = data.google_maps_url;
      }
      if (data.write_review_url) document.getElementById("write-review").href = data.write_review_url;
      document.getElementById("reviews-summary").hidden = false;

      track.innerHTML = list.map(function (r) {
        return '<article class="review-card">' +
          '<div class="review-head"><h3 class="review-name">' + esc(r.reviewer) + '</h3>' +
          '<time class="review-date" datetime="' + esc(r.date) + '">' + formatDate(r.date) + '</time></div>' +
          stars(r.rating) +
          '<p class="review-text">' + esc(String(r.text).trim()) + '</p>' +
          '</article>';
      }).join("");

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

      prev.hidden = next.hidden = false;
      updateButtons();
    })
    .catch(function () {
      track.outerHTML = '<p class="reviews-error">Reviews couldn\'t load here. You can read them all on Google.</p>';
      prev.hidden = next.hidden = true;
    });

  function page(dir) { track.scrollBy({ left: dir * track.clientWidth, behavior: "smooth" }); }
  prev.addEventListener("click", function () { page(-1); });
  next.addEventListener("click", function () { page(1); });
  track.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); page(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); page(-1); }
  });
})();
