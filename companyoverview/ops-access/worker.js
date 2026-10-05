/**
 * Cloudflare Worker — Operational Overview access
 *
 * Endpoints (POST JSON):
 *   { action: "request", fullName, company, email, verifyUrlBase, opsUrl, origin }
 *   { action: "verify", token }
 *
 * Secrets / vars:
 *   RESEND_API_KEY   — send mail via Resend
 *   TOKEN_SECRET     — HMAC secret for tokens
 *   FROM_EMAIL       — e.g. "Trilogy Digital <ops-access@yourdomain.com>"
 *   UNLOCK_HASH      — session hash written by ops-verify (must match operations.html gate)
 *   NOTIFY_EMAIL     — optional sales BCC / notify on request
 *
 * KV binding (optional but recommended): OPS_TOKENS
 */
const FREE_DOMAINS = new Set([
  "gmail.com","googlemail.com","yahoo.com","yahoo.co.uk","yahoo.co.za","ymail.com",
  "hotmail.com","hotmail.co.uk","outlook.com","outlook.co.za","live.com","msn.com",
  "icloud.com","me.com","mac.com","aol.com","proton.me","protonmail.com","pm.me",
  "zoho.com","gmx.com","mail.com","yandex.com","mail.ru","fastmail.com","tutanota.com",
  "hey.com","duck.com","tempmail.com","mailinator.com","guerrillamail.com","yopmail.com",
  "10minutemail.com","trashmail.com"
]);

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

function domainOf(email) {
  const parts = String(email || "").trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

function isFree(email) {
  const d = domainOf(email);
  if (!d) return true;
  if (FREE_DOMAINS.has(d)) return true;
  for (const free of FREE_DOMAINS) {
    if (d.endsWith("." + free)) return true;
  }
  return false;
}

function b64url(bytes) {
  let str;
  if (typeof bytes === "string") str = btoa(bytes);
  else str = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlJson(obj) {
  return b64url(JSON.stringify(obj));
}

async function hmacSign(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return b64url(sig);
}

async function makeToken(secret, payload) {
  const body = b64urlJson(payload);
  const sig = await hmacSign(secret, body);
  return `${body}.${sig}`;
}

async function readToken(secret, token) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const expect = await hmacSign(secret, body);
  if (expect !== sig) return null;
  try {
    const jsonStr = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

async function sendResend(env, { to, subject, html, text }) {
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");
  const from = env.FROM_EMAIL || "Trilogy Digital <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
      ...(env.NOTIFY_EMAIL ? { bcc: [env.NOTIFY_EMAIL] } : {})
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Email send failed: ${res.status} ${errText}`);
  }
  return res.json();
}

async function handleRequest(body, env, requestOrigin) {
  const email = String(body.email || "").trim().toLowerCase();
  const fullName = String(body.fullName || "").trim();
  const company = String(body.company || "").trim();
  if (!fullName || !company || !email) {
    return json({ ok: false, error: "Full name, company and corporate email are required." }, 400, requestOrigin);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ ok: false, error: "Please enter a valid email address." }, 400, requestOrigin);
  }
  if (isFree(email)) {
    return json({
      ok: false,
      error: "Please use your corporate email address. Personal inboxes are not accepted."
    }, 400, requestOrigin);
  }

  const secret = env.TOKEN_SECRET || "dev-only-change-me";
  const exp = Date.now() + 1000 * 60 * 60 * 24; // 24h
  const token = await makeToken(secret, {
    email,
    fullName,
    company,
    exp,
    nonce: crypto.randomUUID()
  });

  if (env.OPS_TOKENS) {
    await env.OPS_TOKENS.put(`ops:${token.slice(0, 48)}`, JSON.stringify({
      email, fullName, company, exp, createdAt: new Date().toISOString(), used: false
    }), { expirationTtl: 60 * 60 * 36 });
  }

  const verifyBase = String(body.verifyUrlBase || "").replace(/\/?$/, "");
  const verifyUrl = `${verifyBase}?token=${encodeURIComponent(token)}`;

  await sendResend(env, {
    to: email,
    subject: "Verify your email — Trilogy Operational Overview",
    text: `Hi ${fullName},\n\nPlease verify your corporate email to receive the Trilogy Digital Operational Overview.\n\nVerify: ${verifyUrl}\n\nThis link expires in 24 hours.\n\n— Trilogy Digital`,
    html: `<p>Hi ${fullName},</p>
<p>Please verify your corporate email (<strong>${email}</strong> / ${company}) to receive the Trilogy Digital Operational Overview.</p>
<p><a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#61d779;color:#13202e;font-weight:700;text-decoration:none;border-radius:999px">Verify email</a></p>
<p style="color:#667">Or paste this link:<br>${verifyUrl}</p>
<p style="color:#667">This link expires in 24 hours.</p>
<p>— Trilogy Digital</p>`
  });

  return json({ ok: true }, 200, requestOrigin);
}

async function handleVerify(body, env, requestOrigin) {
  const token = String(body.token || "");
  const secret = env.TOKEN_SECRET || "dev-only-change-me";
  const payload = await readToken(secret, token);
  if (!payload || !payload.email || !payload.exp) {
    return json({ ok: false, error: "This verification link is invalid." }, 400, requestOrigin);
  }
  if (Date.now() > Number(payload.exp)) {
    return json({ ok: false, error: "This verification link has expired. Please request access again." }, 400, requestOrigin);
  }

  const kvKey = `ops:${token.slice(0, 48)}`;
  if (env.OPS_TOKENS) {
    const raw = await env.OPS_TOKENS.get(kvKey);
    if (raw) {
      const row = JSON.parse(raw);
      if (row.used) {
        return json({ ok: false, error: "This verification link has already been used." }, 400, requestOrigin);
      }
      row.used = true;
      row.verifiedAt = new Date().toISOString();
      await env.OPS_TOKENS.put(kvKey, JSON.stringify(row), { expirationTtl: 60 * 60 * 36 });
    }
  }

  const opsUrl = String(body.opsUrl || "https://proposal.trilogybpo.com/companyoverview/operations.html");
  const unlockHash = env.UNLOCK_HASH || "74de07c4e919534b1b460e3465bb216ce0cc2bd458e42abaf0f22448da08d063";

  await sendResend(env, {
    to: payload.email,
    subject: "Your Trilogy Operational Overview link",
    text: `Hi ${payload.fullName},\n\nYour email is verified. Open the Operational Overview here:\n${opsUrl}\n\n— Trilogy Digital`,
    html: `<p>Hi ${payload.fullName},</p>
<p>Your corporate email is verified. You can open the Operational Overview here:</p>
<p><a href="${opsUrl}" style="display:inline-block;padding:12px 18px;background:#61d779;color:#13202e;font-weight:700;text-decoration:none;border-radius:999px">Open Operational Overview</a></p>
<p style="color:#667">Or paste: ${opsUrl}</p>
<p>— Trilogy Digital</p>`
  });

  return json({
    ok: true,
    unlockKey: "trilogyOpsOverviewUnlock",
    unlockHash,
    opsUrl,
    email: payload.email,
    fullName: payload.fullName,
    company: payload.company
  }, 200, requestOrigin);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";
    if (request.method === "OPTIONS") {
      return json({ ok: true }, 200, origin);
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "POST only" }, 405, origin);
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON" }, 400, origin);
    }
    try {
      if (body.action === "verify") return await handleVerify(body, env, origin);
      return await handleRequest(body, env, origin);
    } catch (err) {
      return json({ ok: false, error: err.message || "Server error" }, 500, origin);
    }
  }
};
