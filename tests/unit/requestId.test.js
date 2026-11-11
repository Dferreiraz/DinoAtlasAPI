const requestId = require('../../server/middleware/requestId');

const createRes = () => {
  const headers = {};
  return {
    headers,
    set(name, value) {
      headers[name] = value;
      return this;
    }
  };
};

const createReq = (incoming) => ({
  get(name) {
    if (name.toLowerCase() !== 'x-request-id') return undefined;
    return incoming;
  }
});

describe('middleware/requestId', () => {
  it('reaproveita um X-Request-Id válido', () => {
    const req = createReq('abc-123_XYZ.4');
    const res = createRes();
    const next = jest.fn();

    requestId(req, res, next);

    expect(req.id).toBe('abc-123_XYZ.4');
    expect(res.headers['X-Request-Id']).toBe('abc-123_XYZ.4');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it.each([
    'com espaço',
    'com/barra',
    'com\\barra',
    'com\nquebra',
    'a'.repeat(129),
    ''
  ])('substitui o valor inválido %p por um UUID', (incoming) => {
    const req = createReq(incoming);
    const res = createRes();
    const next = jest.fn();

    requestId(req, res, next);

    expect(req.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(req.id).not.toBe(incoming);
    expect(res.headers['X-Request-Id']).toBe(req.id);
  });

  it('gera UUID quando o cabeçalho não existe', () => {
    const req = createReq(undefined);
    const res = createRes();

    requestId(req, res, jest.fn());

    expect(req.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('define um ID diferente por requisição', () => {
    const first = createReq(undefined);
    const second = createReq(undefined);

    requestId(first, createRes(), jest.fn());
    requestId(second, createRes(), jest.fn());

    expect(first.id).not.toBe(second.id);
  });

  it('aceita o limite máximo de 128 caracteres', () => {
    const incoming = 'a'.repeat(128);
    const req = createReq(incoming);

    requestId(req, createRes(), jest.fn());

    expect(req.id).toBe(incoming);
  });
});
