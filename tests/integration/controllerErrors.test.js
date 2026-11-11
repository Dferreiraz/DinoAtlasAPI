jest.mock('../../server/utils/readJson', () => jest.fn());

const request = require('supertest');
const readJson = require('../../server/utils/readJson');
const { AppError } = require('../../server/utils/errors');
const { createTestApp } = require('../helpers/app');

const app = createTestApp();
const INTERNAL_PATH = 'C:\\servidor\\interno\\database.json';

const endpoints = [
  ['/api', 'informações da API'],
  ['/api/statistics', 'estatísticas'],
  ['/api/dinosaurs', 'listagem de dinossauros'],
  ['/api/dinosaurs/random', 'dinossauros aleatórios'],
  ['/api/dinosaurs/1', 'dinossauro por ID'],
  ['/api/dinosaurs/name/tyrannosaurus', 'dinossauro por nome'],
  ['/api/dinosaurs/1/images', 'imagens do dinossauro'],
  ['/api/images', 'listagem de imagens'],
  ['/api/periods', 'listagem de períodos'],
  ['/api/periods/1', 'período por ID'],
  ['/api/epochs', 'listagem de épocas'],
  ['/api/epochs/1', 'época por ID'],
  ['/api/formations', 'listagem de formações'],
  ['/api/formations/1', 'formação por ID'],
  ['/api/formations/1/dinosaurs', 'dinossauros por formação'],
  ['/api/continents', 'listagem de continentes'],
  ['/api/continents/1', 'continente por ID'],
  ['/api/continents/1/dinosaurs', 'dinossauros por continente'],
  ['/api/countries', 'listagem de países'],
  ['/api/countries/1', 'país por ID'],
  ['/api/countries/1/dinosaurs', 'dinossauros por país'],
  ['/api/habitats', 'listagem de habitats'],
  ['/api/habitats/1', 'habitat por ID'],
  ['/api/diets', 'listagem de dietas'],
  ['/api/diets/1', 'dieta por ID'],
  ['/api/families', 'listagem de famílias'],
  ['/api/families/1', 'família por ID'],
  ['/api/clades', 'listagem de clados'],
  ['/api/clades/1', 'clado por ID'],
  ['/api/classifications', 'listagem de classificações'],
  ['/api/classifications/1', 'classificação por ID'],
  ['/api/discoveries', 'listagem de descobertas'],
  ['/api/discoveries/1', 'descoberta por ID'],
  ['/api/museums', 'listagem de museus'],
  ['/api/museums/1', 'museu por ID']
];

describe('Falhas internas em todos os controllers', () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    readJson.mockRejectedValue(
      new AppError(`Falha ao ler o arquivo: ${INTERNAL_PATH}`, {
        code: 'FILE_READ_FAILED',
        cause: Object.assign(new Error('permissão negada'), { code: 'EACCES' })
      })
    );
  });

  afterEach(() => {
    errorSpy.mockRestore();
    readJson.mockReset();
  });

  it.each(endpoints)('%s retorna 500 seguro (%s)', async (url) => {
    const res = await request(app).get(url);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: expect.any(String)
    });

    const serialized = JSON.stringify(res.body);
    expect(serialized).not.toContain(INTERNAL_PATH);
    expect(serialized).not.toContain('FILE_READ_FAILED');
    expect(serialized).not.toContain('EACCES');
    expect(serialized).not.toContain('Falha ao ler');
    expect(serialized).not.toContain('stack');
  });

  it('registra stack e requestId internamente em cada falha', async () => {
    const res = await request(app)
      .get('/api/dinosaurs')
      .set('X-Request-Id', 'controller-erro-1');

    expect(res.statusCode).toBe(500);
    expect(res.headers['x-request-id']).toBe('controller-erro-1');

    const logged = errorSpy.mock.calls.map((call) => call.join(' ')).join('\n');
    expect(logged).toContain('FILE_READ_FAILED');
    expect(logged).toContain('requestId=controller-erro-1');
    expect(logged).toContain('AppError');
  });
});
