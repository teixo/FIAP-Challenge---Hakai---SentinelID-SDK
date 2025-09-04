// utils/verify-recaptcha.js
async function verifyRecaptcha({ token, secret, endpoint, remoteip }) {
  if (!token || !secret) {
    return { success: false, error: "missing_token_or_secret" };
  }

  const params = new URLSearchParams();
  params.append("secret", String(secret));
  params.append("response", String(token));
  if (remoteip) params.append("remoteip", String(remoteip));

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  const data = await res.json();
  // Esperado: { success, score, action, hostname, challenge_ts }
  return data;
}

module.exports = { verifyRecaptcha };
