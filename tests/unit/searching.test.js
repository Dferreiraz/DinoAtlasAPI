const searchData = require('../../server/utils/searching');

const dataset = [
  { id: 1, name: 'Tyrannosaurus Rex', scientificName: 'Tyrannosaurus rex', description: 'Predador gigante' },
  { id: 2, name: 'Triceratops', scientificName: 'Triceratops horridus', description: 'Herbívoro com chifres' },
  { id: 3, name: 'Velociraptor', scientificName: 'Velociraptor mongoliensis', description: 'Pequeno predador ágil' }
];

const FIELDS = ['name', 'scientificName', 'description'];

describe('utils/searching', () => {
  it('retorna o mesmo array quando não há termo', () => {
    expect(searchData(dataset, undefined, FIELDS)).toBe(dataset);
    expect(searchData(dataset, null, FIELDS)).toBe(dataset);
    expect(searchData(dataset, '', FIELDS)).toBe(dataset);
    expect(searchData(dataset, '   ', FIELDS)).toBe(dataset);
  });

  it('retorna o mesmo array quando não há campos de busca', () => {
    expect(searchData(dataset, 'rex')).toBe(dataset);
    expect(searchData(dataset, 'rex', [])).toBe(dataset);
  });

  it('ignora termos que não são strings', () => {
    expect(searchData(dataset, ['rex'], FIELDS)).toBe(dataset);
    expect(searchData(dataset, 123, FIELDS)).toBe(dataset);
  });

  it('busca sem diferenciar maiúsculas de minúsculas', () => {
    expect(searchData(dataset, 'REX', FIELDS).map((item) => item.id)).toEqual([1]);
  });

  it('busca parcialmente', () => {
    expect(searchData(dataset, 'raptor', FIELDS).map((item) => item.id)).toEqual([3]);
  });

  it('normaliza espaços nas extremidades', () => {
    expect(searchData(dataset, '  rex  ', FIELDS).map((item) => item.id)).toEqual([1]);
  });

  it('busca em qualquer um dos campos', () => {
    expect(searchData(dataset, 'chifres', FIELDS).map((item) => item.id)).toEqual([2]);
    expect(searchData(dataset, 'horridus', FIELDS).map((item) => item.id)).toEqual([2]);
    expect(searchData(dataset, 'predador', FIELDS).map((item) => item.id)).toEqual([1, 3]);
  });

  it('retorna vazio quando não encontra', () => {
    expect(searchData(dataset, 'pterodáctilo', FIELDS)).toEqual([]);
  });

  it('ignora campos cujo valor não é string', () => {
    const data = [{ id: 1, name: 123 }, { id: 2, name: 'Rex' }];
    expect(searchData(data, 'rex', ['name']).map((item) => item.id)).toEqual([2]);
  });

  it('ignora termos acima de 100 caracteres', () => {
    const result = searchData(dataset, 'a'.repeat(101), FIELDS);
    expect(result).toBe(dataset);
  });

  it('não muta o array original', () => {
    const copy = JSON.parse(JSON.stringify(dataset));
    searchData(dataset, 'rex', FIELDS);
    expect(dataset).toEqual(copy);
  });
});
