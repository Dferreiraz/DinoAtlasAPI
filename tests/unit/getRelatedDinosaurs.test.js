const fs = require('fs');
const os = require('os');
const path = require('path');
const getRelatedDinosaurs = require('../../server/utils/getRelatedDinosaurs');
const jsonRepository = require('../../server/repositories/jsonRepository');

describe('utils/getRelatedDinosaurs', () => {
  let dir;
  let file;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dinoatlas-related-'));
    file = path.join(dir, 'dinosaurs.json');
    fs.writeFileSync(file, JSON.stringify([
      { id: 1, name: 'Alpha', continentId: 1, countryId: [1, 2] },
      { id: 2, name: 'Beta', continentId: 2, countryId: [2] },
      { id: 3, name: 'Gamma', continentId: 1, countryId: [3] }
    ]), 'utf8');
  });

  afterEach(() => {
    jsonRepository.clearCache();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('filtra campos escalares por igualdade estrita', async () => {
    const result = await getRelatedDinosaurs(file, 'continentId', 1);
    expect(result.map((dinosaur) => dinosaur.id)).toEqual([1, 3]);
  });

  it('filtra campos que são arrays por inclusão', async () => {
    const result = await getRelatedDinosaurs(file, 'countryId', 2);
    expect(result.map((dinosaur) => dinosaur.id)).toEqual([1, 2]);
  });

  it('retorna vazio quando não há correspondência', async () => {
    const result = await getRelatedDinosaurs(file, 'countryId', 99);
    expect(result).toEqual([]);
  });

  it('não confunde tipos diferentes em campos escalares', async () => {
    const result = await getRelatedDinosaurs(file, 'continentId', '1');
    expect(result).toEqual([]);
  });

  it('propaga erro de leitura tipado', async () => {
    await expect(
      getRelatedDinosaurs(path.join(dir, 'missing.json'), 'continentId', 1)
    ).rejects.toMatchObject({ code: 'FILE_NOT_FOUND' });
  });
});
