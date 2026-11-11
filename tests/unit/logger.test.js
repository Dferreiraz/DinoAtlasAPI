const logger = require('../../server/middleware/logger');
const { sanitizePath } = logger;

describe('middleware/logger', () => {
  let spy;
  let finish;

  const createRes = () => ({
    statusCode: 200,
    on(event, callback) {
      if (event === 'finish') finish = callback;
    }
  });

  const run = (req, statusCode = 200) => {
    const res = createRes();
    logger(req, res, jest.fn());
    res.statusCode = statusCode;
    finish();
    return spy.mock.calls[0][0];
  };

  beforeEach(() => {
    spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    finish = null;
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('registra método, caminho, status, duração e requestId', () => {
    const line = run({ method: 'GET', originalUrl: '/api/dinosaurs', id: 'req-1' }, 304);

    expect(line).toMatch(/^\[[^\]]+\] GET \/api\/dinosaurs 304 \d+ms requestId=req-1$/);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('remove um parâmetro de query string', () => {
    const line = run({ method: 'GET', originalUrl: '/api/dinosaurs?page=1', id: 'req-2' });

    expect(line).toContain('GET /api/dinosaurs 200');
    expect(line).not.toContain('?');
    expect(line).not.toContain('page=1');
  });

  it('remove múltiplos parâmetros de query string', () => {
    const line = run({
      method: 'GET',
      originalUrl: '/api/dinosaurs?page=1&limit=10&search=rex',
      id: 'req-3'
    });

    expect(line).toContain('GET /api/dinosaurs 200');
    expect(line).not.toMatch(/page=|limit=|search=/);
  });

  it('não registra token fictício enviado na query string', () => {
    const line = run({
      method: 'GET',
      originalUrl: '/api/dinosaurs?token=fake-token-123',
      id: 'req-4'
    });

    expect(line).toContain('GET /api/dinosaurs 200');
    expect(line).not.toContain('token=');
    expect(line).not.toContain('fake-token-123');
  });

  it('remove fragmento da URL', () => {
    const line = run({
      method: 'GET',
      originalUrl: '/docs#introducao?x=1',
      id: 'req-5'
    });

    expect(line).toContain('GET /docs 200');
    expect(line).not.toContain('#');
    expect(line).not.toContain('introducao');
  });

  it('usa req.url quando originalUrl não existe', () => {
    const line = run({ method: 'POST', url: '/x?y=1', id: 'req-6' });

    expect(line).toContain('POST /x 200');
    expect(line).not.toContain('y=1');
  });

  it('usa / quando não há originalUrl nem url', () => {
    const line = run({ method: 'GET', id: 'req-7' });

    expect(line).toContain('GET / 200');
  });

  it('usa N/A quando não há requestId', () => {
    const line = run({ method: 'GET', url: '/x' });

    expect(line).toContain('requestId=N/A');
  });
});

describe('middleware/logger sanitizePath', () => {
  it('mantém o caminho quando não há query string', () => {
    expect(sanitizePath('/api/dinosaurs')).toBe('/api/dinosaurs');
  });

  it('remove query string com um parâmetro', () => {
    expect(sanitizePath('/api/dinosaurs?page=1')).toBe('/api/dinosaurs');
  });

  it('remove query string com vários parâmetros', () => {
    expect(sanitizePath('/api/dinosaurs?page=1&limit=10&search=rex')).toBe('/api/dinosaurs');
  });

  it('remove fragmento', () => {
    expect(sanitizePath('/docs#introducao')).toBe('/docs');
  });

  it('remove query string e fragmento na mesma URL', () => {
    expect(sanitizePath('/docs?x=1#introducao')).toBe('/docs');
  });

  it('usa / para valores ausentes ou vazios', () => {
    expect(sanitizePath(undefined)).toBe('/');
    expect(sanitizePath(null)).toBe('/');
    expect(sanitizePath('')).toBe('/');
    expect(sanitizePath('?x=1')).toBe('/');
  });

  it('não lança exceção para valores de tipo inesperado', () => {
    expect(() => sanitizePath(123)).not.toThrow();
    expect(sanitizePath(123)).toBe('/');
    expect(sanitizePath({ url: '/x' })).toBe('/');
  });
});
