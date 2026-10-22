// Contact form: validates in the browser, then posts to the /api/contact serverless function.
(function () {
  var form = document.getElementById("quote-form");
  if (!form) return;
  var note = document.getElementById("form-note");
  var success = document.getElementById("form-success");
  var button = form.querySelector('button[type="submit"]');
  var EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
  var REQUIRED = ["name", "email", "phone", "message"];

  // Mirrors the checks in api/contact.js so most mistakes are caught before sending.
  function validate(v) {
    var errors = {};
    if (!v.name) errors.name = "Enter your name.";
    if (!v.email) errors.email = "Enter your email address.";
    else if (!EMAIL_RE.test(v.email)) errors.email = "Enter a valid email address, like name@example.com.";
    var digits = v.phone.replace(/\D/g, "");
    if (!v.phone) errors.phone = "Enter your phone number.";
    else if (digits.length < 10 || digits.length > 15 || /[^\d\s()+.\-]/.test(v.phone)) errors.phone = "Enter a valid phone number, like 970-306-7489.";
    if (!v.message) errors.message = "Tell us a little about your project.";
    return errors;
  }

  function setFieldError(name, msg) {
    var input = form.elements[name];
    var out = document.getElementById("e-" + name);
    if (!input || !out) return;
    input.closest(".field").classList.toggle("invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    out.textContent = msg || "";
  }

  function showErrors(errors) {
    REQUIRED.forEach(function (n) { setFieldError(n, errors[n]); });
    var first = REQUIRED.filter(function (n) { return errors[n]; })[0];
    if (first) form.elements[first].focus();
  }

  function setNote(kind, text) {
    note.className = "form-note" + (kind ? " " + kind : "");
    note.textContent = text;
  }

  function values() {
    var get = function (n) { return (form.elements[n].value || "").trim(); };
    return {
      name: get("name"), email: get("email"), phone: get("phone"),
      address: get("address"), timeframe: get("timeframe"), message: get("message"),
      company: form.elements.company.value
    };
  }

  // Clear a field's error as soon as the visitor fixes it.
  REQUIRED.forEach(function (n) {
    form.elements[n].addEventListener("input", function () {
      if (!this.closest(".field").classList.contains("invalid")) return;
      var errs = validate(values());
      setFieldError(n, errs[n]);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = values();
    var errors = validate(v);
    if (Object.keys(errors).length) {
      showErrors(errors);
      setNote("err", "Check the highlighted fields.");
      return;
    }
    showErrors({});
    setNote("", "");
    button.disabled = true;
    button.textContent = "Sending…";

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v)
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (body) { return { ok: r.ok, body: body }; });
      })
      .then(function (res) {
        if (res.ok) {
          form.hidden = true;
          success.hidden = false;
          success.focus();
          if (window.gtag) gtag("event", "generate_lead");
          return;
        }
        if (res.body.fields) showErrors(res.body.fields);
        setNote("err", res.body.error || "We couldn't send your message. Please try again or call 970-306-7489.");
      })
      .catch(function () {
        setNote("err", "We couldn't reach the server. Check your connection and try again, or call 970-306-7489.");
      })
      .then(function () {
        button.disabled = false;
        button.textContent = "Send";
      });
  });
})();
