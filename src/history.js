// src/history.js
const fs = require("fs").promises; // Usamos a versão de Promises do 'fs'
const path = require("path");

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

function getHistoryPath(config) {
  const root = path.resolve(__dirname, "..");
  return path.resolve(root, "data", "history.json");
}

async function readHistory(config) {
  const file = getHistoryPath(config);
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw || "{}");
  } catch (error) {
    // Se o arquivo não existe (ENOENT) ou está vazio/corrompido, retorna um objeto vazio
    if (error.code === 'ENOENT') return {}; 
    return {};
  }
}

async function updateHistory(obj, config) {
  const file = getHistoryPath(config);
  await ensureDir(file);
  await fs.writeFile(file, JSON.stringify(obj, null, 2));
}

module.exports = { readHistory, updateHistory };