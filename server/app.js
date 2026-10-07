const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const middleware = require('./middleware');

const app = express();

// 1. Segurança com Helmet (Headers HTTP seguros automáticos)
app.use(helmet());

// 2. Configuração de CORS (Permitido acesso amplo para desenvolvimento)
app.use(cors({
  origin: '*', // No futuro, substitua por domínios específicos: ['https://seusite.com']
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Rate Limiting (Proteção contra DDoS e força bruta)
// Limita cada IP a 100 requisições a cada 15 minutos
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite por IP
  message: {
    success: false,
    message: "Muitas requisições originadas deste IP. Por favor, tente novamente após 15 minutos."
  },
  standardHeaders: true, // Retorna os headers de rate limit no padrão `RateLimit-*`
  legacyHeaders: false, // Desabilita os headers antigos `X-RateLimit-*`
});

// Aplica o Rate Limit apenas nas rotas da API
app.use('/api', apiLimiter);

// Middlewares de parse do Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disponibilizar arquivos públicos
app.use(express.static('public'));

// 4. Logger (Registra todas as requisições com tempo de resposta)
app.use(middleware.logger);

// Rota de teste temporária para verificação rápida
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "DinoAPI V2.4 funcionando perfeitamente"
  });
});

// 5. Rotas da API
app.use('/api', routes);

// 6. Tratamento de Erros (404 e Erros Internos)
app.use(middleware.notFound);
app.use(middleware.errorHandler);

module.exports = app;