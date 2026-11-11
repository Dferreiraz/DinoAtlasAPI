const { AppError, logError } = require('../../server/utils/errors');

describe('utils/errors', () => {
  describe('AppError', () => {
    it('cria um erro interno com valores padrão', () => {
      const error = new AppError('falha interna');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.name).toBe('AppError');
      expect(error.message).toBe('falha interna');
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.expose).toBe(false);
    });

    it('aceita código, status e causa', () => {
      const cause = new Error('motivo original');
      const error = new AppError('falha ao ler', {
        code: 'FILE_READ_FAILED',
        statusCode: 503,
        cause
      });

      expect(error.code).toBe('FILE_READ_FAILED');
      expect(error.statusCode).toBe(503);
      expect(error.cause).toBe(cause);
      expect(error.expose).toBe(false);
    });
  });

  describe('logError', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      spy.mockRestore();
    });

    it('registra contexto, método, URL, requestId e stack', () => {
      const error = new Error('falha técnica secreta');
      const req = {
        method: 'GET',
        originalUrl: '/api/dinosaurs?x=1',
        id: 'req-123'
      };

      logError('dinosaurs:list', error, req);

      expect(spy).toHaveBeenCalledTimes(1);
      const [header, stack] = spy.mock.calls[0];
      expect(header).toContain('[dinosaurs:list]');
      expect(header).toContain('GET');
      expect(header).toContain('/api/dinosaurs?x=1');
      expect(header).toContain('requestId=req-123');
      expect(stack).toContain('falha técnica secreta');
    });

    it('inclui o código interno quando disponível', () => {
      const error = new AppError('arquivo ausente', { code: 'FILE_NOT_FOUND' });
      logError('read', error, { method: 'GET', originalUrl: '/api', id: 'abc' });

      expect(spy.mock.calls[0][0]).toContain('code=FILE_NOT_FOUND');
    });

    it('funciona sem requisição', () => {
      logError('startup', new Error('sem request'));
      const [header, stack] = spy.mock.calls[0];
      expect(header).toContain('N/A');
      expect(header).toContain('requestId=N/A');
      expect(stack).toContain('sem request');
    });

    it('registra valores que não são Error sem quebrar', () => {
      logError('custom', { motivo: 'objeto' }, { method: 'POST', url: '/x' });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][1]).toEqual({ motivo: 'objeto' });
    });

    it('usa a mensagem quando o Error não possui stack', () => {
      const error = new Error('sem stack');
      delete error.stack;

      logError('sem-stack', error);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][1]).toBe('sem stack');
    });
  });
});
