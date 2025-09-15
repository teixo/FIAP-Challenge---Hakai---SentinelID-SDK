// src/collector.js
const { verifyRecaptcha } = require("../utils/verify-recaptcha");

module.exports = async function collector(req, config) {
  const body = req.body || {};

  const base = {
    // do frontend:
    fingerprint: body.fingerprint || null,
    location: body.location || null,         // "Cidade, País" ou objeto {city, country}
    timezone: body.timezone || null,
    behavior: body.behavior || null,         // cliques, scroll, dwell time, etc.
    recaptchaClient: body.recaptcha || null, // { token, action }
    userId: body.userId || null,             // se houver (do seu app)
    // do backend:
    ip: body.ip || req.ip,
    userAgent: req.headers["user-agent"] || null,
    // metadados:
    route: req.originalUrl || req.url || "",
    method: req.method || "GET",
    ts: new Date().toISOString()
  };

  // Verificação reCAPTCHA (se habilitado e houver token)
  if (config?.recaptcha?.enabled && base.recaptchaClient?.token) {
    try {
      const verify = await verifyRecaptcha({
        token: base.recaptchaClient.token,
        secret: config.recaptcha.secretKey,
        endpoint: config.recaptcha.verifyEndpoint || "https://www.google.com/recaptcha/api/siteverify",
        remoteip: req.ip
      });
      base.recaptcha = verify; // { success, score, action, hostname, ... }
      base.recaptchaRequestedAction = base.recaptchaClient.action || null;
    } catch (e) {
      base.recaptcha = { success: false, error: "verify_failed" };
    }
  }

  return base;
};
