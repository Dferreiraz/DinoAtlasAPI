/**
 * server.js
 * Ponto de entrada da DinoAtlas API. Responsável exclusivamente por iniciar o servidor HTTP.
 */

const app = require('./server/app');
const { createShutdownHandler } = require('./server/utils/gracefulShutdown');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🦖 DinoAtlasAPI iniciada com sucesso`);
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Erro ao iniciar o servidor:', err.message);
  process.exit(1);
});

const shutdown = createShutdownHandler({ server });
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
