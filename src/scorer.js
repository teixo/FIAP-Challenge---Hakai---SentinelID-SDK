// src/scorer.js
const { readHistory, updateHistory } = require("./history");

function inUnusualHour(date, tzCfg) {
  try {
    const d = new Date(date);
    const hour = d.getHours();
    const start = tzCfg?.unusualHourRange?.start ?? 0;
    const end = tzCfg?.unusualHourRange?.end ?? 5;
    return hour >= start && hour <= end;
  } catch {
    return false;
  }
}

module.exports = async function scorer(data, config) {
  const W = config?.weights || {};
  let score = 0;

  const key = data.userId || data.fingerprint;
  const history = await readHistory(config);
  const last = history[key] || {};

  if (!last.ip || (data.ip && data.ip !== last.ip)) { score += W.newIP || 0; }
  if (!last.location || (data.location && data.location !== last.location)) { score += W.newLocation || 0; }
  if (!last.fingerprint || (data.fingerprint && data.fingerprint !== last.fingerprint)) { score += W.newFingerprint || 0; }
  
  if (inUnusualHour(data.ts, config?.time)) { score += W.unusualHour || 0; }

  if (data.behavior) {
    const { moves = 0, scrolls = 0, clicks = 0, dwellMs = 0 } = data.behavior;
    const isLowInteraction = (moves + scrolls + clicks) < 2 || dwellMs < 1500;
    if (isLowInteraction) { score += W.lowInteraction || 0; }
  }

  if (config?.recaptcha?.enabled && data.recaptcha) {
    const isSuccess = data.recaptcha.success === true;
    const isScoreOk = (data.recaptcha.score ?? 0) >= (config.recaptcha.threshold ?? 0.5);
    if (!isSuccess || !isScoreOk) { score += W.recaptchaLowScore || 0; }
  }

  history[key] = {
    ip: data.ip || last.ip,
    location: data.location || last.location,
    fingerprint: data.fingerprint || last.fingerprint,
    lastSeen: data.ts
  };
  await updateHistory(history, config);

  return Math.min(100, score);
};