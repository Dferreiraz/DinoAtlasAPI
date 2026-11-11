const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const middleware = require('./middleware');
const { createRateLimitKeyGenerator } = require('./utils/rateLimitKey');
const { createRateLimitHandler } = require('./utils/rateLimitHandler');
const { PUBLIC_DIR } = require('./utils/paths');
const { countGetRoutes } = require('./utils/endpoints');
const version = require('./utils/version');

const DEFAULT_RATE_LIMIT = Object.freeze({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições originadas deste IP. Por favor, tente novamente após 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Cria uma instância isolada da aplicação.
 *
 * Opções:
 * - `rateLimiter`: objeto com overrides do express-rate-limit ou `false` para
 *   desabilitar o limitador (uso exclusivo em testes isolados). O valor padrão
 *   preserva integralmente a configuração de produção.
 *
 * @param {Object} [options]
 * @param {Object|false} [options.rateLimiter]
 * @returns {import('express').Express}
 */
const createApp = (options = {}) => {
  const { rateLimiter } = options;
  const app = express();

  // O cliente público é identificado por CF-Connecting-IP no keyGenerator do
  // limiter, não por req.ip. Manter trust proxy desabilitado impede que o
  // Express reconstrua o IP a partir de X-Forwarded-For (controlável pelo
  // cliente) e evita que o socket do proxy seja confundido com o cliente.
  app.set('trust proxy', false);

  // Quantidade de rotas GET públicas sob /api, calculada a partir da pilha de
  // roteadores em vez de um número fixo sujeito a divergência.
  app.locals.publicEndpointCount = countGetRoutes(routes.stack);

  // 1. Segurança com Helmet e Content Security Policy (CSP) restritiva.
  // A interface usa apenas arquivos externos de CSS/JS, portanto não há
  // necessidade de liberar 'unsafe-inline'.
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  }));

  // 2. Configuração de CORS
  app.use(cors({
    origin: '*',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // 3. Identificação da requisição (antes do limiter para que respostas 429
  // também recebam X-Request-Id e possam ser correlacionadas nos logs).
  app.use(middleware.requestId);

  // 4. Rate Limiting (pode ser isolado/desabilitado apenas em testes)
  if (rateLimiter !== false) {
    const apiLimiter = rateLimit({
      ...DEFAULT_RATE_LIMIT,
      ...(rateLimiter || {}),
      // Controles fixos: overrides de teste não podem substituir a
      // identificação do cliente nem o registro seguro de bloqueios.
      keyGenerator: createRateLimitKeyGenerator(),
      handler: createRateLimitHandler()
    });
    app.use('/api', apiLimiter);
  }

  // 5. Middlewares de Parse e Arquivos Estáticos
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(PUBLIC_DIR));

  // A página de documentação vive em public/src/page/documentacao.html e usa
  // caminhos relativos (../css, ../js, ../img, ../../index.html). Servi-la em
  // /docs mantém a URL estável e exige os aliases abaixo para que esses
  // caminhos continuem resolvendo a partir da raiz.
  app.get('/docs', (req, res) => {
    return res.sendFile(path.join(PUBLIC_DIR, 'src', 'page', 'documentacao.html'));
  });

  app.use('/css', express.static(path.join(PUBLIC_DIR, 'src', 'css')));
  app.use('/js', express.static(path.join(PUBLIC_DIR, 'src', 'js')));
  app.use('/img', express.static(path.join(PUBLIC_DIR, 'src', 'img')));

  // 6. Logger
  app.use(middleware.logger);

  // 7. Health check operacional. Fica fora de /api e, portanto, não é afetado
  // pelo rate limiter destinado às rotas de dados.
  app.get('/health', (req, res) => {
    return res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        version,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  });

  // 8. Rotas da API
  app.use('/api', routes);

  // 9. Tratamento de Erros (404 e Erros Internos)
  app.use(middleware.notFound);
  app.use(middleware.errorHandler);

  return app;
};

module.exports = createApp;
module.exports.DEFAULT_RATE_LIMIT = DEFAULT_RATE_LIMIT;
