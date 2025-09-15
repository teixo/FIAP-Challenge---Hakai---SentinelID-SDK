// src/index.js
const path = require("path");
const collector = require("./collector");
const scorer = require("./scorer");
const logger = require("./logger");

/**
 * Middleware principal do SentinelID.
 * @param {object} config - Objeto de configuração, geralmente vindo do config.json.
 * @returns {function} Uma função de middleware assíncrona para Express.js.
 */
module.exports = function sentinelIDMiddleware(config) {
  // Resolvem caminhos relativos do config para caminhos absolutos, com base na raiz do SDK
  const rootDir = path.resolve(__dirname, "..");
  const cfg = {
    ...config,
    logging: {
      ...config.logging,
      path: path.resolve(rootDir, config?.logging?.path || "logs/logs.json")
    },
    database: {
      ...config.database,
      path: path.resolve(rootDir, config?.database?.path || "data/sentinelid.db")
    }
  };

  return async (req, res, next) => {
    try {
      // 1. Coleta os dados da requisição de forma assíncrona
      const data = await collector(req, cfg);

      // 2. Calcula o score de forma assíncrona (com a correção do 'await')
      const score = await scorer(data, cfg);

      // 3. Define os limiares de decisão, com fallbacks seguros
      const allowT = cfg?.thresholds?.allow ?? 40;
      const reviewT = cfg?.thresholds?.review ?? 70;

      // 4. Toma a decisão com base no score
      const decision = score < allowT ? "allow" : score < reviewT ? "review" : "deny";

      // 5. Loga a transação de forma assíncrona
      if (cfg?.logging?.enabled) {
        await logger({ data, score, decision }, cfg);
      }

      // 6. Age com base na decisão
      if (decision === "deny") {
        return res.status(403).json({
          message: "Acesso bloqueado pelo SentinelID",
          reason: "risk_score_threshold",
          score
        });
      }

      // Se a decisão for 'review', adiciona um header para o app cliente poder tratar
      if (decision === "review") {
        res.setHeader("X-SentinelID-Decision", "review");
      }
      
      // Adiciona o resultado na requisição para que a rota principal possa usá-lo se necessário
      req.sentinel = { score, decision };

      // 7. Se não bloqueou, passa para a próxima etapa da aplicação (o controller da rota)
      return next();

    } catch (err) {
      console.error("[SentinelID] Erro crítico no middleware:", err);
      
      // Fallback seguro: Em caso de erro interno, não quebramos a aplicação do cliente.
      // Apenas adicionamos um header indicando a necessidade de revisão e passamos adiante.
      res.setHeader("X-SentinelID-Decision", "review");
      res.setHeader("X-SentinelID-Error", "internal_error");
      return next();
    }
  };
};