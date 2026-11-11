jest.mock('../../server/utils/readJson', () => {
  const actual = jest.requireActual('../../server/utils/readJson');
  return jest.fn(actual);
});

const request = require('supertest');
const readJson = require('../../server/utils/readJson');
const jsonRepository = require('../../server/repositories/jsonRepository');
const { AppError } = require('../../server/utils/errors');
const { createTestApp } = require('../helpers/app');

const app = createTestApp();
const SECRET_PATH = 'C:\\caminho\\interno\\periods.json';

const simulateReadFailure = () => {
  readJson.mockRejectedValueOnce(
    new AppError(`Falha ao ler o arquivo: ${SECRET_PATH}`, {
      code: 'FILE_READ_FAILED',
      cause: Object.assign(new Error('sem permissão'), { code: 'EACCES' })
    })
  );
};

describe('Erros de leitura de arquivo via HTTP', () => {
  let spy;

  beforeEach(() => {
    jsonRepository.clearCache();
    spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('retorna 500 seguro sem caminho interno', async () => {
    simulateReadFailure();

    const res = await request(app).get('/api/periods');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Erro ao buscar períodos.'
    });

    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain(SECRET_PATH);
    expect(serialized).not.toContain('EACCES');
    expect(serialized).not.toContain('Falha ao ler');
    expect(serialized).not.toContain('stack');
  });

  it('registra o caminho e o stack apenas nos logs internos', async () => {
    simulateReadFailure();

    await request(app).get('/api/periods');

    expect(spy).toHaveBeenCalled();
    const logged = spy.mock.calls.map((call) => call.join(' ')).join('\n');
    expect(logged).toContain(SECRET_PATH);
    expect(logged).toContain('FILE_READ_FAILED');
    expect(logged).toContain('requestId=');
  });

  it('mantém X-Request-Id na resposta de erro interno', async () => {
    simulateReadFailure();

    const res = await request(app)
      .get('/api/periods')
      .set('X-Request-Id', 'erro-interno-1');

    expect(res.statusCode).toBe(500);
    expect(res.headers['x-request-id']).toBe('erro-interno-1');
  });

  it('retorna 500 seguro também em /api/statistics', async () => {
    simulateReadFailure();

    const res = await request(app).get('/api/statistics');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Erro ao buscar estatísticas da API.'
    });
  });

  it('retorna 500 seguro também em /api', async () => {
    simulateReadFailure();

    const res = await request(app).get('/api');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Erro ao recuperar informações da API'
    });
  });

  it('retorna 500 seguro também em /api/dinosaurs', async () => {
    simulateReadFailure();

    const res = await request(app).get('/api/dinosaurs');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Erro ao buscar dinossauros'
    });
  });
});
