/**
 * server.js
 * Ponto de entrada da DinoAPI. Responsável exclusivamente por iniciar o servidor HTTP.
 */

const app = require('./server/app');

const PORT = process.env.PORT || 3000;

try {
  app.listen(PORT, () => {
    console.log(`🦖 DinoAPI iniciada com sucesso`);
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('Erro ao iniciar o servidor:', err.message);
    process.exit(1);
  });
} catch (error) {
  console.error('Erro crítico na inicialização:', error.message);
  process.exit(1);
}