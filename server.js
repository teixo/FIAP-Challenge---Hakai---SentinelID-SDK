// server.js
const express = require('express');
const path = require('path');
const sentinelIDMiddleware = require('./src/index'); // Importa nosso middleware
const config = require('./config.json'); // Importa nossa configuração

const app = express();
const PORT = 3000;

// Middleware para servir arquivos estáticos (html, js do frontend)
app.use(express.static(path.join(__dirname)));
// Middleware para o Express entender o JSON que o frontend envia
app.use(express.json());

// Criamos a instância do nosso middleware com a configuração
const sentinel = sentinelIDMiddleware(config);

// Nossa rota de análise, protegida pelo SentinelID
// É a mesma rota que a demo.html chama no 'fetch'
app.post('/analyze', sentinel, (req, res) => {
  // Se o middleware deixou a requisição passar (allow/review), respondemos com sucesso.
  // A alteração principal está aqui: enviamos o objeto 'sentinel' completo de volta.
  res.json({ 
    message: 'Ação processada com sucesso.',
    sentinel: req.sentinel // req.sentinel foi adicionado pelo nosso middleware
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor de demonstração rodando em http://localhost:${PORT}`);
  console.log(`➡️ Abra http://localhost:${PORT}/demo.html no seu navegador.`);
});