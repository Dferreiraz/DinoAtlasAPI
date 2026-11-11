const {
  MAX_ROUTE_LOG_LENGTH,
  safeRoute,
  safeRequestId,
  resolveStatusCode,
  createRateLimitHandler
} = require('../../server/utils/rateLimitHandler');

const createRes = (overrides = {}) => ({
  statusCode: null,
  body: undefined,
  writableEnded: false,
  status(code) {
    this.statusCode = code;
    return this;
  },
  send(body) {
    this.body = body;
    this.writableEnded = true;
    return this;
  },
  ...overrides
});

const message = {
  success: false,
  message: 'Muitas requisições originadas deste IP. Por favor, tente novamente após 15 minutos.'
};

const baseReq = {
  method: 'GET',
  originalUrl: '/api/status',
  id: 'req-1',
  rateLimitKeySource: 'public'
};

describe('utils/rateLimitHandler', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('mantém status e corpo da resposta 429', async () => {
    const res = createRes();

    await createRateLimitHandler()(baseReq, res, jest.fn(), { statusCode: 429, message });

    expect(res.statusCode).toBe(429);
    expect(res.body).toEqual(message);
  });

  it('registra evento, método, rota sem query, status, request ID e origem', async () => {
    const req = {
      ...baseReq,
      originalUrl: '/api/dinosaurs?token=segredo&page=1'
    };

    await createRateLimitHandler()(req, createRes(), jest.fn(), { statusCode: 429, message });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const line = logSpy.mock.calls[0][0];
    expect(line).toContain('rate_limit_exceeded');
    expect(line).toContain('method=GET');
    expect(line).toContain('route=/api/dinosaurs');
    expect(line).toContain('status=429');
    expect(line).toContain('requestId=req-1');
    expect(line).toContain('keySource=public');
    expect(line).not.toContain('segredo');
    expect(line).not.toContain('token=');
  });

  it('aceita message funcional assíncrona', async () => {
    const req = { ...baseReq, id: 'req-2' };
    const res = createRes();
    const messageFn = jest.fn(async () => ({
      success: false,
      message: 'Mensagem dinâmica.'
    }));

    await createRateLimitHandler()(req, res, jest.fn(), {
      statusCode: 429,
      message: messageFn
    });

    expect(messageFn).toHaveBeenCalledWith(req, res);
    expect(res.statusCode).toBe(429);
    expect(res.body).toEqual({ success: false, message: 'Mensagem dinâmica.' });
  });

  it('usa statusCode diferente de 429 na resposta e no log', async () => {
    const res = createRes();

    await createRateLimitHandler()(baseReq, res, jest.fn(), {
      statusCode: 503,
      message
    });

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual(message);

    const line = logSpy.mock.calls[0][0];
    expect(line).toContain('status=503');
    expect(line).not.toContain('status=429');
  });

  it.each([undefined, null, 42, 1000, '429', 429.5])(
    'usa 429 quando statusCode é %p',
    async (statusCode) => {
      const res = createRes();

      await createRateLimitHandler()(baseReq, res, jest.fn(), { statusCode, message });

      expect(res.statusCode).toBe(429);
      expect(logSpy.mock.calls[0][0]).toContain('status=429');
    }
  );

  it('não envia segunda resposta quando writableEnded já é true', async () => {
    const send = jest.fn();
    const res = createRes({ writableEnded: true, send });

    await createRateLimitHandler()(baseReq, res, jest.fn(), { statusCode: 429, message });

    expect(res.statusCode).toBe(429);
    expect(send).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('normaliza origem ausente ou inesperada para unidentified', async () => {
    const req = { method: 'POST', url: '/x' };

    await createRateLimitHandler()(req, createRes(), jest.fn(), { statusCode: 429, message });

    expect(logSpy.mock.calls[0][0]).toContain('keySource=unidentified');
  });

  it('não registra IP, headers ou outros dados sensíveis', async () => {
    const req = {
      ...baseReq,
      id: 'req-safe',
      headers: {
        'cf-connecting-ip': '203.0.113.10',
        authorization: 'Bearer segredo',
        'x-forwarded-for': '198.51.100.1'
      },
      ip: '10.0.0.1'
    };

    await createRateLimitHandler()(req, createRes(), jest.fn(), { statusCode: 429, message });

    const line = logSpy.mock.calls[0][0];
    expect(line).toContain('requestId=req-safe');
    expect(line).not.toContain('203.0.113.10');
    expect(line).not.toContain('198.51.100.1');
    expect(line).not.toContain('10.0.0.1');
    expect(line).not.toContain('segredo');
    expect(line).not.toContain('authorization');
  });

  it('usa req.url quando originalUrl não existe', async () => {
    const req = { method: 'GET', url: '/fallback?x=1', rateLimitKeySource: 'unidentified' };

    await createRateLimitHandler()(req, createRes(), jest.fn(), { statusCode: 429, message });

    expect(logSpy.mock.calls[0][0]).toContain('route=/fallback');
  });

  it('sanitiza o request ID antes de registrar', async () => {
    const req = { ...baseReq, id: 'req\n-2' };

    await createRateLimitHandler()(req, createRes(), jest.fn(), { statusCode: 429, message });

    const line = logSpy.mock.calls[0][0];
    expect(line).toContain('requestId=req-2');
    expect(line).not.toContain('\n');
  });

  it('remove caracteres de controle e limita o tamanho da rota', () => {
    const route = `/api/${'a'.repeat(MAX_ROUTE_LOG_LENGTH + 50)}\n`;
    expect(safeRoute({ originalUrl: route })).toHaveLength(MAX_ROUTE_LOG_LENGTH);
    expect(safeRoute({ originalUrl: '/api/a\nb' })).toBe('/api/ab');
  });

  it('safeRequestId usa N/A para valores ausentes ou apenas controle', () => {
    expect(safeRequestId({})).toBe('N/A');
    expect(safeRequestId({ id: '' })).toBe('N/A');
    expect(safeRequestId({ id: '\n\t' })).toBe('N/A');
  });

  it('resolveStatusCode aceita apenas inteiros entre 100 e 999', () => {
    expect(resolveStatusCode({ statusCode: 429 })).toBe(429);
    expect(resolveStatusCode({ statusCode: 503 })).toBe(503);
    expect(resolveStatusCode({})).toBe(429);
    expect(resolveStatusCode({ statusCode: 99 })).toBe(429);
    expect(resolveStatusCode({ statusCode: 1000 })).toBe(429);
    expect(resolveStatusCode({ statusCode: '429' })).toBe(429);
  });
});
