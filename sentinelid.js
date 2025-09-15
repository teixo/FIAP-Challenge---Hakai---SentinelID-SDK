// frontend/sentinelid.js
(function () {
  function basicFingerprint() {
    const ua = navigator.userAgent;
    const lang = navigator.language;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
    const scr = `${screen.width}x${screen.height}`;
    return `${ua}|${lang}|${tz}|${scr}`;
  }

  const behavior = { moves: 0, scrolls: 0, clicks: 0, dwellMs: 0 };
  const start = performance.now();
  document.addEventListener("mousemove", () => (behavior.moves += 1), { passive: true });
  document.addEventListener("scroll", () => (behavior.scrolls += 1), { passive: true });
  document.addEventListener("click", () => (behavior.clicks += 1), { passive: true });

  async function getIPMeta() {
    try {
      const r = await fetch("https://ipapi.co/json");
      return await r.json();
    } catch {
      return {};
    }
  }

  async function getRecaptchaToken(siteKey, action) {
    if (!window.grecaptcha || !siteKey) return null;
    await new Promise((resolve) => grecaptcha.ready(resolve));
    try {
      return await grecaptcha.execute(siteKey, { action });
    } catch {
      return null;
    }
  }

  window.SentinelID = {
    async preparePayload(action, siteKey) {
      behavior.dwellMs = Math.floor(performance.now() - start);
      const ipMeta = await getIPMeta();

      const payload = {
        fingerprint: basicFingerprint(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        location: ipMeta && ipMeta.city ? `${ipMeta.city}, ${ipMeta.country_name}` : null,
        ip: ipMeta?.ip || null,
        behavior
      };

      const token = await getRecaptchaToken(siteKey, action);
      if (token) {
        payload.recaptcha = { token, action };
      }
      return payload;
    }
  };
})();
