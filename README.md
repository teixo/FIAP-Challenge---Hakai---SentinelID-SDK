# 🛡️ SentinelID: SDK Antifraude

![Status](https://img.shields.io/badge/status-conclu%C3%ADdo-green)
![Tecnologia](https://img.shields.io/badge/stack-Node.js%20|%20Express-blue)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-lightgrey)

## 📄 Sobre o Projeto

[cite_start]O **SentinelID** é um SDK (Software Development Kit) antifraude desenvolvido como solução para o **Challenge 2025 – Hakai**[cite: 4]. [cite_start]O projeto foi criado para proteger e-commerces, como o fictício NetxShop, contra um aumento expressivo em tentativas de fraudes digitais, incluindo a criação de contas falsas, compras com cartões clonados e acessos suspeitos de bots[cite: 16, 17].

[cite_start]Atuando nos fluxos críticos de login e checkout, o SentinelID coleta dados do ambiente e do comportamento do usuário para calcular um score de risco em tempo real[cite: 18]. [cite_start]Com base nesse score, o sistema automatiza a decisão de liberar, solicitar uma revisão manual ou bloquear a ação, aumentando a segurança sem prejudicar a experiência do usuário legítimo[cite: 19, 38].

## ✨ Principais Funcionalidades

* [cite_start]**Coleta de Dados Abrangente:** Coleta de *device fingerprint* (navegador, idioma, timezone, resolução), IP, geolocalização e análise de comportamento do usuário (movimento do mouse, cliques, tempo na página)[cite: 21, 24].
* [cite_start]**Motor de Score Dinâmico:** Calcula um score de risco de 0 a 100, com pesos para cada fator de risco totalmente configuráveis através de um arquivo `config.json`[cite: 24].
* [cite_start]**Decisão Automatizada:** Classifica cada transação em três níveis: `allow` (permitir), `review` (revisar) ou `deny` (negar), com limiares de pontuação ajustáveis[cite: 27].
* [cite_start]**Integração com Google reCAPTCHA v3:** Utiliza o reCAPTCHA invisível para validar a legitimidade do usuário sem causar atritos, adicionando o score do Google à análise de risco[cite: 24, 42].
* [cite_start]**Memória de Histórico:** Mantém um histórico mínimo de IPs e dispositivos por usuário para identificar mudanças de padrão e reconhecer usuários confiáveis[cite: 29, 42].
* [cite_start]**Logs Estruturados:** Gera logs detalhados em formato JSON (NDJSON) para cada decisão, garantindo total auditabilidade do sistema[cite: 28, 42].
* **Fácil Integração:** Projetado como um middleware `plug-and-play` para sistemas baseados em Node.js/Express e um SDK leve em JavaScript para o frontend.

## 💻 Stack Tecnológico

* [cite_start]**Backend:** Node.js com ExpressJS [cite: 27]
* **Frontend (SDK):** JavaScript puro (Vanilla JS)
* [cite_start]**Banco de Dados (MVP):** persistência leve utilizando um arquivo JSON (`history.json`), simulando a funcionalidade de um banco de dados como SQLite para o escopo do projeto[cite: 28, 42].

## 🚀 Como Executar o Projeto

Siga os passos abaixo para iniciar o ambiente de demonstração do SentinelID.

### Pré-requisitos
* Node.js (versão 18 ou superior)
* npm (geralmente instalado com o Node.js)

### Instalação e Execução

1.  **Clone o repositório (se aplicável) ou tenha a pasta do projeto.**

2.  **Abra o terminal na pasta raiz do projeto.**

3.  **Instale as dependências necessárias:**
    ```bash
    npm install
    ```

4.  **Inicie o servidor de demonstração:**
    ```bash
    npm run test-server
    ```
    *O terminal deverá exibir uma mensagem de confirmação de que o servidor está rodando em `http://localhost:3000`.*

5.  **Acesse a página de demonstração:**
    * Abra seu navegador e acesse a URL: [http://localhost:3000/demo.html](http://localhost:3000/demo.html)

## 🛠️ Como Usar (Exemplos)

### Backend (Middleware no Express)
Proteger uma rota é simples. Basta adicionar o middleware do SentinelID antes do seu controller.

```javascript
const sentinelIDMiddleware = require('./src/index');
const config = require('./config.json');

const sentinel = sentinelIDMiddleware(config);

// Rota de login protegida pelo SentinelID
app.post('/login', sentinel, (req, res) => {
  // Este código só executa se o SentinelID permitir (allow/review)
  res.json({ message: 'Login bem-sucedido!' });
});
```

### Frontend (SDK na Página)
Carregue o `sentinelid.js` e o script do reCAPTCHA, e chame a função `preparePayload` antes de enviar os dados para o seu backend.

```html
<script src="[https://www.google.com/recaptcha/api.js?render=SUA_SITE_KEY](https://www.google.com/recaptcha/api.js?render=SUA_SITE_KEY)"></script>
<script src="sentinelid.js"></script>

<script>
  const loginButton = document.getElementById('login-button');
  
  loginButton.addEventListener('click', async () => {
    // 1. Colete os dados com o SDK
    const payload = await window.SentinelID.preparePayload('login', 'SUA_SITE_KEY');
    payload.userId = document.getElementById('user-id').value;
    
    // 2. Envie o payload para o seu backend
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // 3. Trate a resposta
    const result = await response.json();
    console.log(result);
  });
</script>
```

## 👥 Equipe

* [cite_start]Bruno Henrique Frasson Pinto - RM557112 [cite: 3]
* [cite_start]Caroline Lorenzetti Comes - RM555387 [cite: 3]
* [cite_start]Pedro Henrique Camargo Flaminio - RM558098 [cite: 3]
* [cite_start]Samuel Lucas Marques Rocha - RM558766 [cite: 3]

## 🎓 Contexto

[cite_start]Este projeto foi desenvolvido para a disciplina de **Defesa Cibernética** do curso de Análise e Desenvolvimento de Sistemas da **FIAP - Faculdade de Informática e Administração Paulista** (Turma 2TDCOA-2025)[cite: 1, 2, 5].