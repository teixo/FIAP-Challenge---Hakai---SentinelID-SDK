// src/history.js
const fs = require("fs").promises;
const path = require("path");

// Função auxiliar para garantir que o diretório de um arquivo existe.
async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  try {
    await fs.access(dir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dir, { recursive: true });
    } else {
      throw error;
    }
  }
}

// Função para ler o histórico do arquivo especificado na configuração.
async function readHistory(config) {
  // Pega o caminho do banco de dados a partir da configuração recebida.
  // Se não houver, usa um fallback seguro.
  const filePath = config?.database?.path;
  if (!filePath) {
    console.error("[SentinelID] Erro: Caminho do banco de dados não definido na configuração.");
    return {}; // Retorna um objeto vazio se o caminho não for encontrado.
  }

  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw || "{}");
  } catch (error) {
    // Se o arquivo não existe, isso é esperado na primeira execução. Retorna um objeto vazio.
    if (error.code === 'ENOENT') {
      return {};
    }
    // Para outros erros (ex: permissão de leitura, JSON corrompido), loga o erro mas não quebra a aplicação.
    console.error(`[SentinelID] Erro ao ler o arquivo de histórico (${filePath}):`, error);
    return {};
  }
}

// Função para atualizar o arquivo de histórico.
async function updateHistory(data, config) {
  const filePath = config?.database?.path;
  if (!filePath) {
    console.error("[SentinelID] Erro: Não foi possível salvar o histórico. Caminho do banco de dados não definido.");
    return;
  }

  try {
    await ensureDir(filePath);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    // Se houver um erro de escrita (ex: falta de permissão), loga o erro.
    console.error(`[SentinelID] Erro ao escrever no arquivo de histórico (${filePath}):`, error);
  }
}

module.exports = { readHistory, updateHistory };