const request = require('supertest');
const { createTestApp, createRateLimitedApp } = require('../helpers/app');
const { DEFAULT_RATE_LIMIT } = require('../../server/createApp');

const PUBLIC_IP = '203.0.113.10';
const OTHER_PUBLIC_IP = '203.0.113.11';

const apiGet = (app, { ip, headers = {} } = {}) => {
  let req = request(app).get('/api/status');

  if (ip !== undefined) {
    req = req.set('CF-Connecting-IP', ip);
  }

  for (const [name, value] of Object.entries(headers)) {
    req = req.set(name, value);
  }

  return req;
};

const publicApiGet = (app, ip, headers = {}) => apiGet(app, { ip, headers });

describe('Rate limiting isolado', () => {
  it('mantém a configuração de produção inalterada', () => {
    expect(DEFAULT_RATE_LIMIT).toMatchObject({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false
    });
    expect(DEFAULT_RATE_LIMIT.message.success).toBe(false);
  });

  it('bloqueia após o limite configurado e informa os cabeçalhos', async () => {
    const app = createRateLimitedApp({ max: 2 });

    const first = await publicApiGet(app, PUBLIC_IP);
    const second = await publicApiGet(app, PUBLIC_IP);
    const third = await publicApiGet(app, PUBLIC_IP);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(third.statusCode).toBe(429);
    expect(third.headers['ratelimit-limit']).toBe('2');
    expect(third.headers['ratelimit-remaining']).toBe('0');
    expect(third.headers['retry-after']).toBeDefined();
    expect(third.body).toEqual({
      success: false,
      message: 'Muitas requisições originadas deste IP. Por favor, tente novamente após 15 minutos.'
    });
  });

  it('mantém trust proxy desativado', () => {
    expect(createRateLimitedApp().get('trust proxy')).toBe(false);
    expect(createTestApp().get('trust proxy')).toBe(false);
  });

  it('não interfere nas rotas estáticas fora de /api', async () => {
    const app = createRateLimitedApp({ max: 1 });

    await publicApiGet(app, PUBLIC_IP);
    const blocked = await publicApiGet(app, PUBLIC_IP);
    const staticFile = await request(app).get('/src/css/style.css');

    expect(blocked.statusCode).toBe(429);
    expect(staticFile.statusCode).toBe(200);
  });

  it('instâncias separadas possuem contadores independentes', async () => {
    const firstApp = createRateLimitedApp({ max: 1 });
    const secondApp = createRateLimitedApp({ max: 1 });

    expect((await publicApiGet(firstApp, PUBLIC_IP)).statusCode).toBe(200);
    expect((await publicApiGet(firstApp, PUBLIC_IP)).statusCode).toBe(429);

    expect((await publicApiGet(secondApp, PUBLIC_IP)).statusCode).toBe(200);
    expect((await publicApiGet(secondApp, PUBLIC_IP)).statusCode).toBe(429);
  });

  it('createTestApp desabilita o limitador por padrão', async () => {
    const app = createTestApp();

    const responses = [];
    for (let index = 0; index < 5; index += 1) {
      responses.push(await request(app).get('/api/status'));
    }

    expect(responses.every((response) => response.statusCode === 200)).toBe(true);
    expect(responses[0].headers['ratelimit-limit']).toBeUndefined();
  });
});

describe('Rate limiting por CF-Connecting-IP', () => {
  it('compartilha o bucket para o mesmo IP público', async () => {
    const app = createRateLimitedApp({ max: 1 });

    expect((await publicApiGet(app, PUBLIC_IP)).statusCode).toBe(200);
    expect((await publicApiGet(app, PUBLIC_IP)).statusCode).toBe(429);
  });

  it('separa IPs públicos diferentes em buckets independentes', async () => {
    const app = createRateLimitedApp({ max: 1 });

    expect((await publicApiGet(app, PUBLIC_IP)).statusCode).toBe(200);
    expect((await publicApiGet(app, OTHER_PUBLIC_IP)).statusCode).toBe(200);

    expect((await publicApiGet(app, PUBLIC_IP)).statusCode).toBe(429);
    expect((await publicApiGet(app, OTHER_PUBLIC_IP)).statusCode).toBe(429);
  });

  it.each([
    ['X-Forwarded-For', '198.51.100.1'],
    ['X-Real-IP', '198.51.100.2'],
    ['Forwarded', 'for=198.51.100.3']
  ])('não permite que %s altere a identificação', async (header, value) => {
    const app = createRateLimitedApp({ max: 1 });

    expect((await publicApiGet(app, PUBLIC_IP, { [header]: value })).statusCode).toBe(200);
    expect((await publicApiGet(app, PUBLIC_IP, { [header]: `${value}-outro` })).statusCode).toBe(429);
  });

  it('compartilha unidentified quando o header está ausente', async () => {
    const app = createRateLimitedApp({ max: 1 });

    expect((await apiGet(app)).statusCode).toBe(200);
    expect((await apiGet(app, {
      headers: { 'X-Forwarded-For': '198.51.100.1' }
    })).statusCode).toBe(429);
  });

  it.each([
    ['texto inválido', 'not-an-ip'],
    ['vírgula', '203.0.113.10, 198.51.100.1'],
    ['zone id', 'fe80::1%eth0'],
    ['acima de 64 caracteres', 'a'.repeat(65)]
  ])('usa unidentified sem fallback para header %s', async (_label, value) => {
    const app = createRateLimitedApp({ max: 1 });

    expect((await publicApiGet(app, value, { 'X-Forwarded-For': '198.51.100.9' })).statusCode).toBe(200);
    expect((await publicApiGet(app, value, { 'X-Real-IP': '198.51.100.8' })).statusCode).toBe(429);
  });

  it('trata header duplicado como unidentified', async () => {
    const app = createRateLimitedApp({ max: 1 });

    const first = await request(app)
      .get('/api/status')
      .set('CF-Connecting-IP', [PUBLIC_IP, OTHER_PUBLIC_IP]);
    const second = await request(app)
      .get('/api/status')
      .set('CF-Connecting-IP', ['198.51.100.1', '198.51.100.2']);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(429);

    // A chave pública válida continua em um bucket próprio.
    expect((await publicApiGet(app, PUBLIC_IP)).statusCode).toBe(200);
  });

  it('trata header duplicado com o mesmo IP repetido como unidentified', async () => {
    const app = createRateLimitedApp({ max: 1 });

    const first = await request(app)
      .get('/api/status')
      .set('CF-Connecting-IP', [PUBLIC_IP, PUBLIC_IP]);
    const second = await request(app)
      .get('/api/status')
      .set('CF-Connecting-IP', [PUBLIC_IP, PUBLIC_IP]);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(429);

    // O bucket do IP público continua independente.
    expect((await publicApiGet(app, PUBLIC_IP)).statusCode).toBe(200);
  });

  // O parser HTTP do Node remove OWS das extremidades, então um valor contendo
  // apenas espaços chega à aplicação como string vazia. A distinção entre vazio
  // e somente espaços é coberta nos testes unitários de rateLimitKey.
  it.each([
    ['vazio', ''],
    ['somente espaços', '   ']
  ])('usa unidentified quando CF-Connecting-IP está %s', async (_label, value) => {
    const app = createRateLimitedApp({ max: 1 });

    expect((await publicApiGet(app, value)).statusCode).toBe(200);
    expect((await publicApiGet(app, value)).statusCode).toBe(429);
  });

  it('agrupa IPv6 no mesmo bloco /56', async () => {
    const app = createRateLimitedApp({ max: 1 });

    expect((await publicApiGet(app, '2001:db8:abcd:1200::1')).statusCode).toBe(200);
    expect((await publicApiGet(app, '2001:db8:abcd:12ff::1')).statusCode).toBe(429);
  });

  it('separa IPv6 de blocos /56 distintos', async () => {
    const app = createRateLimitedApp({ max: 1 });

    expect((await publicApiGet(app, '2001:db8:abcd:1200::1')).statusCode).toBe(200);
    expect((await publicApiGet(app, '2001:db8:abcd:1300::1')).statusCode).toBe(200);
  });

  it('canoniza IPv4 mapeado em IPv6 para o mesmo bucket do IPv4', async () => {
    const app = createRateLimitedApp({ max: 1 });

    expect((await publicApiGet(app, PUBLIC_IP)).statusCode).toBe(200);
    expect((await publicApiGet(app, `::ffff:${PUBLIC_IP}`)).statusCode).toBe(429);
  });

  it('não permite que overrides de teste substituam a identificação', async () => {
    const app = createRateLimitedApp({ max: 1, keyGenerator: () => 'chave-forcada' });

    expect((await publicApiGet(app, PUBLIC_IP)).statusCode).toBe(200);
    expect((await publicApiGet(app, OTHER_PUBLIC_IP)).statusCode).toBe(200);
  });

  it('não exige autenticação para consumidores públicos', async () => {
    const app = createRateLimitedApp({ max: 1 });

    const response = await request(app).get('/api/status').set('CF-Connecting-IP', PUBLIC_IP);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('não emite ERR_ERL com headers de proxy forjados', async () => {
    const errors = [];
    const errorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args.map(String).join(' '));
    });

    try {
      const app = createRateLimitedApp({ max: 2 });

      await publicApiGet(app, PUBLIC_IP, {
        'X-Forwarded-For': '198.51.100.1',
        Forwarded: 'for=198.51.100.2'
      });
      await publicApiGet(app, PUBLIC_IP, { 'X-Real-IP': '198.51.100.3' });
      await publicApiGet(app, OTHER_PUBLIC_IP);
    } finally {
      errorSpy.mockRestore();
    }

    expect(errors.filter((line) => line.includes('ERR_ERL_'))).toEqual([]);
  });

  it('registra o bloqueio 429 sem IP, headers sensíveis ou query string', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    let lines;

    try {
      const app = createRateLimitedApp({ max: 1 });

      await publicApiGet(app, PUBLIC_IP, {
        'X-Forwarded-For': '198.51.100.77',
        Authorization: 'Bearer segredo'
      });
      await request(app)
        .get('/api/status?token=segredo-na-query')
        .set('CF-Connecting-IP', PUBLIC_IP);

      lines = logSpy.mock.calls
        .map((args) => args.map(String).join(' '))
        .filter((line) => line.includes('rate_limit_exceeded'));
    } finally {
      logSpy.mockRestore();
    }

    expect(lines).toHaveLength(1);

    const line = lines[0];
    expect(line).toContain('method=GET');
    expect(line).toContain('route=/api/status');
    expect(line).toContain('status=429');
    expect(line).toContain('keySource=public');
    expect(line).not.toContain(PUBLIC_IP);
    expect(line).not.toContain('198.51.100.77');
    expect(line).not.toContain('segredo');
    expect(line).not.toContain('authorization');
  });
});

describe('Rate limiting — 429, observabilidade e contrato', () => {
  const collectRateLimitLogs = async (run) => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    let lines;

    try {
      await run();
      lines = logSpy.mock.calls
        .map((args) => args.map(String).join(' '))
        .filter((line) => line.includes('rate_limit_exceeded'));
    } finally {
      logSpy.mockRestore();
    }

    return lines;
  };

  it('não envia os headers legados X-RateLimit-*', async () => {
    const app = createRateLimitedApp({ max: 1 });

    await publicApiGet(app, PUBLIC_IP);
    const blocked = await publicApiGet(app, PUBLIC_IP);

    expect(blocked.statusCode).toBe(429);
    expect(blocked.headers['ratelimit-limit']).toBeDefined();
    expect(blocked.headers['x-ratelimit-limit']).toBeUndefined();
    expect(blocked.headers['x-ratelimit-remaining']).toBeUndefined();
    expect(blocked.headers['x-ratelimit-reset']).toBeUndefined();
  });

  it('mantém GET /health fora do rate limiter', async () => {
    const app = createRateLimitedApp({ max: 1 });

    await publicApiGet(app, PUBLIC_IP);
    expect((await publicApiGet(app, PUBLIC_IP)).statusCode).toBe(429);

    const health = await request(app).get('/health');

    expect(health.statusCode).toBe(200);
    expect(health.headers['ratelimit-limit']).toBeUndefined();
  });

  it('inclui X-Request-Id na resposta 429 e registra o mesmo ID no log', async () => {
    const app = createRateLimitedApp({ max: 1 });
    const requestId = 'audit-002-request-id';
    let blocked;

    const lines = await collectRateLimitLogs(async () => {
      await publicApiGet(app, PUBLIC_IP);
      blocked = await request(app)
        .get('/api/status')
        .set('CF-Connecting-IP', PUBLIC_IP)
        .set('X-Request-Id', requestId);
    });

    expect(blocked.statusCode).toBe(429);
    expect(blocked.headers['x-request-id']).toBe(requestId);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain(`requestId=${requestId}`);
    expect(lines[0]).toContain('status=429');
  });

  it('gera X-Request-Id quando o cliente não envia um valor válido', async () => {
    const app = createRateLimitedApp({ max: 1 });

    await publicApiGet(app, PUBLIC_IP);
    const blocked = await request(app)
      .get('/api/status')
      .set('CF-Connecting-IP', PUBLIC_IP)
      .set('X-Request-Id', 'valor com espaço');

    expect(blocked.statusCode).toBe(429);
    expect(blocked.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(blocked.headers['x-request-id']).not.toBe('valor com espaço');
  });

  it('registra keySource=unidentified no bloqueio sem CF-Connecting-IP', async () => {
    const app = createRateLimitedApp({ max: 1 });
    let blocked;

    const lines = await collectRateLimitLogs(async () => {
      await apiGet(app);
      blocked = await apiGet(app);
    });

    expect(blocked.statusCode).toBe(429);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('keySource=unidentified');
    expect(lines[0]).toContain('status=429');
  });

  it('aceita message funcional assíncrona', async () => {
    const messageFn = jest.fn(async () => ({
      success: false,
      message: 'Mensagem dinâmica do limiter.'
    }));
    const app = createRateLimitedApp({ max: 1, message: messageFn });

    await publicApiGet(app, PUBLIC_IP);
    const blocked = await publicApiGet(app, PUBLIC_IP);

    expect(messageFn).toHaveBeenCalled();
    expect(blocked.statusCode).toBe(429);
    expect(blocked.body).toEqual({
      success: false,
      message: 'Mensagem dinâmica do limiter.'
    });
  });

  it('usa statusCode alternativo na resposta e no log', async () => {
    const app = createRateLimitedApp({
      max: 1,
      statusCode: 503,
      message: { success: false, message: 'Serviço temporariamente limitado.' }
    });
    let blocked;

    const lines = await collectRateLimitLogs(async () => {
      await publicApiGet(app, PUBLIC_IP);
      blocked = await publicApiGet(app, PUBLIC_IP);
    });

    expect(blocked.statusCode).toBe(503);
    expect(blocked.body).toEqual({
      success: false,
      message: 'Serviço temporariamente limitado.'
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('status=503');
    expect(lines[0]).not.toContain('status=429');
  });
});
