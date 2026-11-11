const filterData = require('../../server/utils/filtering');

const dataset = [
  {
    id: 1,
    name: 'Alpha',
    periodId: 1,
    countryId: [1, 2],
    length: 10,
    weight: 1000
  },
  {
    id: 2,
    name: 'Beta',
    periodId: 2,
    countryId: [2],
    length: 20,
    weight: 2000
  },
  {
    id: 3,
    name: 'Gamma',
    periodId: 3,
    countryId: [3],
    length: 30,
    weight: 3000
  }
];

describe('utils/filtering', () => {
  it('retorna o próprio array quando não há filtros', () => {
    expect(filterData(dataset, {})).toBe(dataset);
    expect(filterData(dataset, undefined)).toBe(dataset);
    expect(filterData(dataset, null)).toBe(dataset);
  });

  it('filtra por igualdade em campos escalares', () => {
    const result = filterData(dataset, { periodId: '2' });
    expect(result.map((item) => item.id)).toEqual([2]);
  });

  it('compara valores numéricos como texto para manter independência do parser', () => {
    const result = filterData(dataset, { periodId: 3 });
    expect(result.map((item) => item.id)).toEqual([3]);
  });

  it('filtra campos que são arrays', () => {
    const result = filterData(dataset, { countryId: '2' });
    expect(result.map((item) => item.id)).toEqual([1, 2]);
  });

  it('aceita zeros à esquerda em campos numéricos escalares', () => {
    const result = filterData(dataset, { periodId: '01' });
    expect(result.map((item) => item.id)).toEqual([1]);
  });

  it('aceita zeros à esquerda em campos numéricos array', () => {
    const result = filterData(dataset, { countryId: '02' });
    expect(result.map((item) => item.id)).toEqual([1, 2]);
  });

  it('mantém a comparação textual para campos string', () => {
    const result = filterData(dataset, { name: 'Alpha' });
    expect(result.map((item) => item.id)).toEqual([1]);
    expect(filterData(dataset, { name: 'alpha' })).toEqual([]);
  });

  it('aplica filtros de mínimo', () => {
    const result = filterData(dataset, { lengthMin: '20' });
    expect(result.map((item) => item.id)).toEqual([2, 3]);
  });

  it('aplica filtros de máximo', () => {
    const result = filterData(dataset, { lengthMax: '20' });
    expect(result.map((item) => item.id)).toEqual([1, 2]);
  });

  it('combina mínimo e máximo', () => {
    const result = filterData(dataset, { lengthMin: '15', lengthMax: '25' });
    expect(result.map((item) => item.id)).toEqual([2]);
  });

  it('combina múltiplos filtros (AND)', () => {
    const result = filterData(dataset, {
      lengthMin: '15',
      weightMax: '2500',
      countryId: '2'
    });
    expect(result.map((item) => item.id)).toEqual([2]);
  });

  it('ignora parâmetros reservados de paginação, ordenação e busca', () => {
    const result = filterData(dataset, {
      page: '1',
      limit: '10',
      sort: 'name',
      order: 'asc',
      search: 'Alpha'
    });
    expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('ignora filtros de campos inexistentes', () => {
    const result = filterData(dataset, { campoInexistente: 'valor' });
    expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('elimina todos os itens quando o limite mínimo é inválido', () => {
    const result = filterData(dataset, { lengthMin: 'abc' });
    expect(result).toEqual([]);
  });

  it('elimina todos os itens quando o limite máximo é inválido', () => {
    const result = filterData(dataset, { weightMax: '1,5' });
    expect(result).toEqual([]);
  });

  it('elimina itens que não possuem o campo numérico filtrado', () => {
    const data = [{ id: 1, length: '10' }, { id: 2 }];
    expect(filterData(data, { lengthMin: '5' })).toEqual([]);
  });

  it('não muta o array original', () => {
    const copy = JSON.parse(JSON.stringify(dataset));
    filterData(dataset, { periodId: '1' });
    expect(dataset).toEqual(copy);
  });
});
