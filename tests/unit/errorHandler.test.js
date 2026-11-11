const errorHandler = require('../../server/middleware/errorHandler');

const createRes = () => ({
  headersSent: false,
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  }
});

const createReq = (overrides = {}) => ({
  method: 'GET',
  originalUrl: '/api/teste',
  url: '/api/teste',
  id: 'request-1',
  ...overrides
});

describe('middleware/errorHandler', () => {
  let spy;

  beforeEach(() => {
    spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('retorna 500 seguro para erro sem status', () => {
    const res = createRes();
    const error = new Error('detalhe interno secreto');

    errorHandler(error, createReq(), res, jest.fn());

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Erro interno do servidor.'
    });
  });

  it('nunca expõe a mensagem técnica do erro', () => {
    const res = createRes();
    const error = new Error('C:\\caminho\\secreto\\database.json Unexpected token');
    error.status = 400;

    errorHandler(error, createReq(), res, jest.fn());

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: 'Requisição inválida.'
    });
    expect(JSON.stringify(res.body)).not.toContain('caminho');
    expect(JSON.stringify(res.body)).not.toContain('Unexpected token');
  });

  it.each([
    [400, 'Requisição inválida.'],
    [401, 'Não autorizado.'],
    [403, 'Acesso negado.'],
    [404, 'Recurso não encontrado.'],
    [405, 'Método não permitido.'],
    [408, 'Tempo limite da requisição excedido.'],
    [413, 'Payload muito grande.'],
    [415, 'Tipo de conteúdo não suportado.'],
    [429, 'Muitas requisições. Tente novamente mais tarde.'],
    [500, 'Erro interno do servidor.'],
    [502, 'Serviço temporariamente indisponível.'],
    [503, 'Serviço temporariamente indisponível.'],
    [504, 'Tempo limite do serviço excedido.']
  ])('mapeia o status %i para a mensagem pública', (status, message) => {
    const res = createRes();
    const error = Object.assign(new Error('técnico'), { status });

    errorHandler(error, createReq(), res, jest.fn());

    expect(res.statusCode).toBe(status);
    expect(res.body).toEqual({ success: false, message });
  });

  it('usa mensagem genérica de cliente para status 4xx não mapeado', () => {
    const res = createRes();
    const error = Object.assign(new Error('técnico'), { status: 418 });

    errorHandler(error, createReq(), res, jest.fn());

    expect(res.statusCode).toBe(418);
    expect(res.body.message).toBe('Requisição inválida.');
  });

  it('usa mensagem genérica de servidor para status 5xx não mapeado', () => {
    const res = createRes();
    const error = Object.assign(new Error('técnico'), { status: 599 });

    errorHandler(error, createReq(), res, jest.fn());

    expect(res.statusCode).toBe(599);
    expect(res.body.message).toBe('Erro interno do servidor.');
  });

  it('normaliza status fora da faixa 400-599 para 500', () => {
    for (const status of [200, 302, 399, 600, 'abc', null, undefined, 400.5]) {
      const res = createRes();
      const error = Object.assign(new Error('técnico'), { status });
      errorHandler(error, createReq(), res, jest.fn());
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe('Erro interno do servidor.');
    }
  });

  it('prefere statusCode válido a status', () => {
    const res = createRes();
    const error = Object.assign(new Error('técnico'), { statusCode: 429, status: 500 });
    errorHandler(error, createReq(), res, jest.fn());
    expect(res.statusCode).toBe(429);
  });

  it('registra o erro com stack e contexto da requisição', () => {
    const res = createRes();
    const error = new Error('detalhe interno');
    errorHandler(error, createReq({ id: 'req-abc' }), res, jest.fn());

    expect(spy).toHaveBeenCalledTimes(1);
    const [header, stack] = spy.mock.calls[0];
    expect(header).toContain('GET');
    expect(header).toContain('/api/teste');
    expect(header).toContain('requestId=req-abc');
    expect(stack).toContain('detalhe interno');
  });

  it('delega ao próximo middleware quando os headers já foram enviados', () => {
    const res = createRes();
    res.headersSent = true;
    const next = jest.fn();
    const error = new Error('depois do envio');

    errorHandler(error, createReq(), res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.statusCode).toBeNull();
    expect(res.body).toBeNull();
  });

  it('expõe helpers de normalização para teste', () => {
    expect(errorHandler.resolveStatus({ statusCode: 404 })).toBe(404);
    expect(errorHandler.resolveStatus({})).toBe(500);
    expect(errorHandler.resolvePublicMessage(413)).toBe('Payload muito grande.');
    expect(errorHandler.resolvePublicMessage(499)).toBe('Requisição inválida.');
    expect(errorHandler.resolvePublicMessage(599)).toBe('Erro interno do servidor.');
  });
});
