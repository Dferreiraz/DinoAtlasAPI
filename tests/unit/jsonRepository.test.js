jest.mock('../../server/utils/readJson', () => jest.fn());

const path = require('path');
const readJson = require('../../server/utils/readJson');
const repository = require('../../server/repositories/jsonRepository');

const file = path.join(__dirname, 'fixture-repository.json');

describe('repositories/jsonRepository', () => {
  beforeEach(() => {
    repository.clearCache();
    readJson.mockReset();
  });

  it('cacheia leitura e parse por caminho', async () => {
    readJson.mockResolvedValue([{ id: 1 }]);

    const first = await repository.getJson(file);
    const second = await repository.getJson(file);

    expect(readJson).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it('deduplica leituras concorrentes do mesmo arquivo', async () => {
    let resolveRead;
    readJson.mockReturnValue(new Promise((resolve) => {
      resolveRead = resolve;
    }));

    const first = repository.getJson(file);
    const second = repository.getJson(file);

    expect(readJson).toHaveBeenCalledTimes(1);

    resolveRead([{ id: 1 }]);

    await expect(Promise.all([first, second])).resolves.toEqual([
      [{ id: 1 }],
      [{ id: 1 }]
    ]);
  });

  it('não cacheia erros de leitura', async () => {
    readJson
      .mockRejectedValueOnce(new Error('falha temporária'))
      .mockResolvedValueOnce([{ id: 1 }]);

    await expect(repository.getJson(file)).rejects.toThrow('falha temporária');
    await expect(repository.getJson(file)).resolves.toEqual([{ id: 1 }]);

    expect(readJson).toHaveBeenCalledTimes(2);
  });

  it('constrói índice por id sob demanda', async () => {
    readJson.mockResolvedValue([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' }
    ]);

    await expect(repository.getById(file, 2)).resolves.toEqual({ id: 2, name: 'B' });
    await expect(repository.getById(file, 1)).resolves.toEqual({ id: 1, name: 'A' });

    expect(readJson).toHaveBeenCalledTimes(1);
  });

  it('constrói índice agrupado para relacionamentos 1:N', async () => {
    readJson.mockResolvedValue([
      { id: 1, dinosaurId: 1 },
      { id: 2, dinosaurId: 1 },
      { id: 3, dinosaurId: 2 }
    ]);

    const index = await repository.getGroupedIndex(file, 'dinosaurId');

    expect(index.get(1)).toHaveLength(2);
    expect(index.get(2)).toHaveLength(1);
  });

  it('invalida um caminho específico', async () => {
    readJson
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 2 }]);

    expect(await repository.getJson(file)).toEqual([{ id: 1 }]);

    repository.invalidate(file);

    expect(await repository.getJson(file)).toEqual([{ id: 2 }]);
  });

  it('limpa todo o cache', async () => {
    readJson.mockResolvedValue([{ id: 1 }]);

    await repository.getJson(file);
    repository.clearCache();
    await repository.getJson(file);

    expect(readJson).toHaveBeenCalledTimes(2);
  });

  it('getDatabase resolve caminhos dentro de server/database', async () => {
    readJson.mockResolvedValue([{ id: 1 }]);

    await repository.getDatabase('periods.json');

    expect(readJson).toHaveBeenCalledWith(
      expect.stringContaining(path.join('server', 'database', 'periods.json'))
    );
  });

  it('getByField retorna o primeiro registro que corresponde ao campo', async () => {
    readJson.mockResolvedValue([
      { id: 1, code: 'A' },
      { id: 2, code: 'B' }
    ]);

    await expect(repository.getByField(file, 'code', 'B')).resolves.toEqual({
      id: 2,
      code: 'B'
    });
    await expect(repository.getByField(file, 'code', 'inexistente')).resolves.toBeUndefined();
    expect(readJson).toHaveBeenCalledTimes(1);
  });

  it('getDatabaseById e getDatabaseIndex resolvem caminhos e reutilizam o cache', async () => {
    readJson.mockResolvedValue([
      { id: 1, slug: 'triassico' },
      { id: 2, slug: 'jurassico' }
    ]);

    await expect(repository.getDatabaseById('periods.json', 2)).resolves.toEqual({
      id: 2,
      slug: 'jurassico'
    });

    const index = await repository.getDatabaseIndex('periods.json', 'slug');

    expect(index.get('triassico')).toEqual({ id: 1, slug: 'triassico' });
    expect(readJson).toHaveBeenCalledTimes(1);
  });

  it('ignora itens nulos e campos ausentes ao construir índices', async () => {
    readJson.mockResolvedValue([
      null,
      { id: 1 },
      { id: 2, code: null },
      { id: 3, code: undefined },
      { id: 4, code: 'A' }
    ]);

    const byId = await repository.getIndex(file, 'id');
    const grouped = await repository.getGroupedIndex(file, 'code');

    expect([...byId.keys()]).toEqual([1, 2, 3, 4]);
    expect([...grouped.keys()]).toEqual(['A']);
  });

  it('trata dados que não são array como índice vazio', async () => {
    readJson.mockResolvedValue({ id: 1 });

    await expect(repository.getIndex(file, 'id')).resolves.toEqual(new Map());
    await expect(repository.getGroupedIndex(file, 'id')).resolves.toEqual(new Map());
  });
});
