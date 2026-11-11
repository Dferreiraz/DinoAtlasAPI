/**
 * gracefulShutdown.js
 * Cria um manipulador de encerramento gracioso para o servidor HTTP.
 *
 * O manipulador:
 * - executa apenas uma vez, mesmo se receber SIGTERM e SIGINT em sequência;
 * - para de aceitar novas conexões com `server.close`;
 * - encerra com código 0 quando as conexões existentes terminam;
 * - força a saída com código 1 se o tempo limite for excedido.
 */

/**
 * @param {Object} options
 * @param {import('http').Server} options.server - Servidor HTTP a encerrar.
 * @param {Number} [options.timeoutMs=10000] - Tempo máximo de espera.
 * @param {Object} [options.logger=console] - Logger com `log`/`error`.
 * @param {Function} [options.exit] - Função de saída (injetável em testes).
 * @returns {(signal?: String) => Boolean} `true` quando inicia o encerramento.
 */
const createShutdownHandler = ({
  server,
  timeoutMs = 10000,
  logger = console,
  exit = (code) => process.exit(code)
}) => {
  let shuttingDown = false;

  return (signal = 'SIGTERM') => {
    if (shuttingDown) return false;
    shuttingDown = true;

    logger.log(`[${signal}] Encerrando servidor...`);

    let finished = false;
    let timer;

    const finish = (code, message, isError = false) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);

      if (message) {
        if (isError) logger.error(message);
        else logger.log(message);
      }

      exit(code);
    };

    timer = setTimeout(() => {
      finish(1, `[${signal}] Tempo limite de encerramento excedido.`, true);
    }, timeoutMs);

    if (timer && typeof timer.unref === 'function') {
      timer.unref();
    }

    server.close((error) => {
      if (error) {
        finish(1, `[${signal}] Falha ao encerrar o servidor: ${error.message}`, true);
        return;
      }

      finish(0, 'Servidor encerrado com sucesso.');
    });

    return true;
  };
};

module.exports = { createShutdownHandler };
