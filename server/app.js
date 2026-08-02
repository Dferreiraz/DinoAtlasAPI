/**
 * app.js
 * Configuração principal da aplicação Express (sem inicialização de porta).
 */

const express = require('express');
const routes = require('./routes');
const middleware = require('./middleware');

const app = express();

// Configuração básica de CORS manual (sem dependências extras)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Trata requisições do tipo Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});

// Headers básicos de segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middlewares de parse do Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disponibilizar arquivos públicos
app.use(express.static('public'));

// 1. Logger (Registra todas as requisições que chegam)
app.use(middleware.logger);

// Rota de teste temporária para verificação rápida
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "DinoAPI funcionando"
  });
});

// 2. Rotas da API
app.use('/api', routes);

// 3. Not Found (Captura rotas que não passaram por nenhum endpoint válido)
app.use(middleware.notFound);

// 4. Error Handler (Captura qualquer erro lançado nas rotas ou controllers)
app.use(middleware.errorHandler);

module.exports = app;