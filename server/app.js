const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const middleware = require('./middleware');

const app = express();

// 1. Segurança com Helmet e Content Security Policy (CSP) ajustada
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Permite handlers inline (ex: onclick no HTML)
      styleSrc: ["'self'", "'unsafe-inline'"],  // Permite estilos inline
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"], // Permite imagens do Cloudinary
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

// 3. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    success: false,
    message: "Muitas requisições originadas deste IP. Por favor, tente novamente após 15 minutos."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// 4. Middlewares de Parse e Arquivos Estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 5. Logger
app.use(middleware.logger);

// 6. Rota de Status
app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: "DinoAtlas API V2.5 funcionando perfeitamente"
  });
});

// 7. Rotas da API
app.use('/api', routes);

// 8. Tratamento de Erros (404 e Erros Internos)
app.use(middleware.notFound);
app.use(middleware.errorHandler);

module.exports = app;