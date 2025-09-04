// src/scorer.js
const { readHistory, updateHistory } = require("./history");

function inUnusualHour(date, tzCfg) {
  try {
    const d = new Date(date);
    const hour = d.getHours(); // simplificado; se quiser usar timezone do config, podemos ajustar depois
    const start = tzCfg?.unusualHourRange?.start ?? 0;
    const end = tzCfg?.unusualHourRange?.end ?? 5;
    // intervalo [start, end], ex.: 0..5
    return hour >= start && hour <= end;
  } catch {
    return false;
  }
}

// Transformamos a função em 'async' para poder usar 'await'
module.exports = async function scorer(data, config) {
  const W = config?.weights || {};
  let score = 0;

  // Carrega histórico simples (JSON). Chaveamos por userId, se não, por fingerprint.
  const key = data.userId || data.fingerprint || data.ip || "anon";
  // Usamos 'await' pois readHistory agora é assíncrono
  const history = await readHistory(config);
  const last = history[key] || {};

  // ===================================================================
  // ## BLOCO DE LÓGICA CORRIGIDO ##
  // Esta lógica agora trata corretamente usuários novos e existentes.
  // ===================================================================

  // 1) IP novo ou diferente
  if (!last.ip || (data.ip && data.ip !== last.ip)) {
    score += W.newIP || 0;
  }

  // 2) Localização nova ou diferente
  if (!last.location || (data.location && data.location !== last.location)) {
    score += W.newLocation || 0;
  }

  // 3) Fingerprint novo ou diferente
  if (!last.fingerprint || (data.fingerprint && data.fingerprint !== last.fingerprint)) {
    score += W.newFingerprint || 0;
  }

  // ===================================================================
  // ## FIM DO BLOCO CORRIGIDO ##
  // ===================================================================

  // 4) Horário incomum
  if (inUnusualHour(data.ts, config?.time)) score += W.unusualHour || 0;

  // 5) Baixa interação (exemplo: behavior { moves, scrolls, clicks, dwellMs })
  if (data.behavior) {
    const { moves = 0, scrolls = 0, clicks = 0, dwellMs = 0 } = data.behavior || {};
    const lowInteraction = (moves + scrolls + clicks) < 2 || dwellMs < 1500;
    if (lowInteraction) score += W.lowInteraction || 0;
  }

  // 6) reCAPTCHA v3
  if (config?.recaptcha?.enabled) {
    const threshold = config.recaptcha.threshold ?? 0.5;
    const allowedHosts = config.recaptcha.allowHosts || ["localhost", "127.0.0.1"];

    const v = data.recaptcha;
    const ok = v?.success === true;
    const okAction = v?.action ? (v.action === data.recaptchaRequestedAction) : true;
    const okHost = v?.hostname ? allowedHosts.includes(v.hostname) : true;
    const okScore = (v?.score ?? 0) >= threshold;

    if (!ok || !okAction || !okHost || !okScore) {
      score += W.recaptchaLowScore || 0;
    }
  }

  // Atualiza histórico (últimos dados)
  history[key] = {
    ip: data.ip || last.ip || null,
    location: data.location || last.location || null,
    fingerprint: data.fingerprint || last.fingerprint || null,
    lastSeen: data.ts
  };
  // Usamos 'await' pois updateHistory agora é assíncrono
  await updateHistory(history, config);

  // Clampa e retorna
  score = Math.max(0, Math.min(100, score));
  return score;
};