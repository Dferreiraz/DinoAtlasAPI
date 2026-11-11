const { createShutdownHandler } = require('../../server/utils/gracefulShutdown');

describe('utils/gracefulShutdown', () => {
  let logger;

  beforeEach(() => {
    logger = { log: jest.fn(), error: jest.fn() };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('encerra o servidor e finaliza com código 0', () => {
    const server = { close: jest.fn((callback) => callback()) };
    const exit = jest.fn();
    const shutdown = createShutdownHandler({ server, logger, exit });

    expect(shutdown('SIGTERM')).toBe(true);
    expect(server.close).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(0);
    expect(logger.log).toHaveBeenCalledWith('Servidor encerrado com sucesso.');
  });

  it('ignora chamadas repetidas', () => {
    const server = { close: jest.fn((callback) => callback()) };
    const exit = jest.fn();
    const shutdown = createShutdownHandler({ server, logger, exit });

    shutdown('SIGTERM');

    expect(shutdown('SIGINT')).toBe(false);
    expect(server.close).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('finaliza com código 1 quando o fechamento retorna erro', () => {
    const server = {
      close: jest.fn((callback) => callback(new Error('falha ao fechar')))
    };
    const exit = jest.fn();
    const shutdown = createShutdownHandler({ server, logger, exit });

    shutdown('SIGTERM');

    expect(exit).toHaveBeenCalledWith(1);
    expect(logger.error).toHaveBeenCalled();
  });

  it('usa process.exit por padrão quando nenhuma função é injetada', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const server = { close: jest.fn((callback) => callback()) };
    const shutdown = createShutdownHandler({ server, logger });

    try {
      shutdown('SIGTERM');
      expect(exitSpy).toHaveBeenCalledWith(0);
    } finally {
      exitSpy.mockRestore();
    }
  });

  it('ignora o callback de fechamento que chega após o tempo limite', () => {
    jest.useFakeTimers();

    let closeCallback;
    const server = {
      close: jest.fn((callback) => {
        closeCallback = callback;
      })
    };
    const exit = jest.fn();
    const shutdown = createShutdownHandler({
      server,
      logger,
      exit,
      timeoutMs: 1000
    });

    shutdown('SIGTERM');
    jest.advanceTimersByTime(1000);

    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);

    closeCallback();

    expect(exit).toHaveBeenCalledTimes(1);
  });

  it('força a saída após o tempo limite', () => {
    jest.useFakeTimers();

    const server = { close: jest.fn() };
    const exit = jest.fn();
    const shutdown = createShutdownHandler({
      server,
      logger,
      exit,
      timeoutMs: 1000
    });

    shutdown('SIGTERM');

    expect(exit).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    expect(exit).toHaveBeenCalledWith(1);
    expect(logger.error).toHaveBeenCalledWith(
      '[SIGTERM] Tempo limite de encerramento excedido.'
    );
  });
});
