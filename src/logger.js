// src/logger.js
const fs = require("fs").promises; // 1. Importamos a versão de Promises do File System
const path = require("path");

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  try {
    // Tenta acessar o diretório, se falhar (não existe), cria no catch
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
  }
}

module.exports = async function logger(entry, config) {
  if (!config?.logging?.enabled) return;

  const filePath = config.logging.path || path.resolve(__dirname, "..", "logs", "logs.json");
  await ensureDir(filePath);

  const line = {
    timestamp: new Date().toISOString(),
    decision: entry.decision,
    score: entry.score,
    route: entry.data?.route,
    method: entry.data?.method,
    ip: entry.data?.ip,
    userId: entry.data?.userId || null,
    fingerprint: entry.data?.fingerprint || null,
    reason: entry.data?.recaptcha?.success === false ? "recaptcha_failed" : undefined,
    data: entry.data
  };

  // 2. Usamos a versão assíncrona e não-bloqueante
  await fs.appendFile(filePath, JSON.stringify(line) + "\n");
};