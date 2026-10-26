// Vercel serverless function: POST /api/contact
// Emails a contact form submission to CONTACT_TO_EMAIL through Resend.
//
// Environment variables (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY      required  Resend API key
//   CONTACT_TO_EMAIL    required  where submissions are delivered
//   CONTACT_FROM_EMAIL  optional  sender, must be on a domain verified in Resend
//                                 e.g. "Puresight Website <website@puresightwc.com>"
//   TELEGRAM_BOT_TOKEN  optional  also send each request to Telegram as a phone alert
//   TELEGRAM_CHAT_ID    optional  chat(s) that get the alert, comma-separated

const LIMITS = { name: 100, email: 254, phone: 30, address: 200, timeframe: 100, message: 5000 };
const SERVICES = ["Window cleaning", "Gutter cleaning", "Solar panel cleaning", "Window + gutter bundle (Fall Special)", "More than one service", "Not sure yet"];
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

function clean(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

// Single-line values (used in the subject line) must not contain line breaks.
function oneLine(value) {
  return value.replace(/[\r\n]+/g, " ");
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function validate(body) {
  const data = {
    name: oneLine(clean(body.name, LIMITS.name)),
    email: oneLine(clean(body.email, LIMITS.email)),
    phone: oneLine(clean(body.phone, LIMITS.phone)),
    // Optional; anything outside the dropdown's choices is dropped.
    service: SERVICES.includes(body.service) ? body.service : "",
    address: oneLine(clean(body.address, LIMITS.address)),
    timeframe: oneLine(clean(body.timeframe, LIMITS.timeframe)),
    message: clean(body.message, LIMITS.message),
  };
  const errors = {};
  if (!data.name) errors.name = "Enter your name.";
  if (!data.email) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(data.email)) errors.email = "Enter a valid email address, like name@example.com.";
  const digits = data.phone.replace(/\D/g, "");
  if (!data.phone) errors.phone = "Enter your phone number.";
  else if (digits.length < 10 || digits.length > 15 || /[^\d\s()+.\-]/.test(data.phone)) errors.phone = "Enter a valid phone number, like 970-306-7489.";
  if (!data.message) errors.message = "Tell us a little about your project.";
  return { data, errors };
}

function buildEmail(d) {
  const rows = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone],
    ["Service", d.service || "Not specified"],
    ["Address", d.address || "Not provided"],
    ["Preferred date/timeframe", d.timeframe || "Not provided"],
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nMessage:\n${d.message}\n`;
  const html =
    `<h2 style="font-family:sans-serif;margin:0 0 16px">New quote request</h2>` +
    `<table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`).join("") +
    `</table>` +
    `<p style="font-family:sans-serif;font-size:15px;color:#666;margin:20px 0 6px">Message</p>` +
    `<p style="font-family:sans-serif;font-size:15px;white-space:pre-wrap;margin:0">${escapeHtml(d.message)}</p>` +
    `<p style="font-family:sans-serif;font-size:13px;color:#999;margin-top:24px">Reply to this email to answer ${escapeHtml(d.name)} directly.</p>`;
  return { text, html };
}

// Phone alert with the full request, so new leads are seen without checking email.
// Never blocks the form: failures are only logged, and a slow Telegram is given up on.
async function sendTelegramAlert(d) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = (process.env.TELEGRAM_CHAT_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!token || !chatIds.length) return;

  // Telegram allows 4096 characters per message; the other fields fit well within the rest.
  const message = d.message.length > 3000 ? d.message.slice(0, 3000) + "… (full message in email)" : d.message;
  const text =
    `<b>🔔 New quote request</b>\n\n` +
    `<b>Name:</b> ${escapeHtml(d.name)}\n` +
    `<b>Phone:</b> ${escapeHtml(d.phone)}\n` +
    `<b>Email:</b> ${escapeHtml(d.email)}\n` +
    `<b>Service:</b> ${escapeHtml(d.service || "Not specified")}\n` +
    `<b>Address:</b> ${escapeHtml(d.address || "Not provided")}\n` +
    `<b>Timeframe:</b> ${escapeHtml(d.timeframe || "Not provided")}\n\n` +
    `<b>Message:</b>\n${escapeHtml(message)}`;

  await Promise.all(chatIds.map(async (chatId) => {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
        signal: AbortSignal.timeout(5000),
      });
      if (!r.ok) console.error("Telegram alert failed", chatId, r.status, await r.text());
      else console.log("Contact form: Telegram alert sent");
    } catch (err) {
      console.error("Telegram alert failed", chatId, err);
    }
  }));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid request." });
  }

  // Honeypot: real visitors never see this field. Pretend success so bots don't retry.
  // Its name must be one browser autofill doesn't recognize (it used to be "company",
  // which autofill filled in, silently dropping real customers' messages).
  if (typeof body.hp_check === "string" && body.hp_check.trim() !== "") {
    console.warn("Contact form: honeypot filled, message not sent.");
    return res.status(200).json({ ok: true });
  }

  const { data, errors } = validate(body);
  if (Object.keys(errors).length) {
    return res.status(422).json({ error: "Check the highlighted fields.", fields: errors });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set.");
    return res.status(500).json({ error: "The form isn't set up to send yet. Please call 970-306-7489." });
  }
  const from = process.env.CONTACT_FROM_EMAIL || "Puresight Website <onboarding@resend.dev>";

  const { text, html } = buildEmail(data);
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: data.email,
        subject: `New quote request from ${data.name}`,
        text,
        html,
      }),
    });
    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return res.status(502).json({ error: "We couldn't send your message. Please try again or call 970-306-7489." });
    }
    console.log("Contact form: email sent", (await r.json().catch(() => ({}))).id || "");
  } catch (err) {
    console.error("Resend request failed", err);
    return res.status(502).json({ error: "We couldn't send your message. Please try again or call 970-306-7489." });
  }

  await sendTelegramAlert(data);
  return res.status(200).json({ ok: true });
}
