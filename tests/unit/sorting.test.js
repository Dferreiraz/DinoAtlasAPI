const sortData = require('../../server/utils/sorting');

const dataset = [
  { id: 3, name: 'Charlie', weight: 300 },
  { id: 1, name: 'Alpha', weight: 100 },
  { id: 2, name: 'Bravo', weight: 200 }
];

describe('utils/sorting', () => {
  it('retorna o mesmo array quando não há campo de ordenação', () => {
    expect(sortData(dataset)).toBe(dataset);
    expect(sortData(dataset, '')).toBe(dataset);
    expect(sortData(dataset, null)).toBe(dataset);
    expect(sortData(dataset, 42)).toBe(dataset);
  });

  it('ordena strings em ordem crescente por padrão', () => {
    const result = sortData(dataset, 'name');
    expect(result.map((item) => item.name)).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('ordena strings em ordem decrescente', () => {
    const result = sortData(dataset, 'name', 'desc');
    expect(result.map((item) => item.name)).toEqual(['Charlie', 'Bravo', 'Alpha']);
  });

  it('ordena números em ordem crescente', () => {
    const result = sortData(dataset, 'weight');
    expect(result.map((item) => item.weight)).toEqual([100, 200, 300]);
  });

  it('ordena números em ordem decrescente', () => {
    const result = sortData(dataset, 'weight', 'desc');
    expect(result.map((item) => item.weight)).toEqual([300, 200, 100]);
  });

  it('normaliza a direção para minúsculas', () => {
    const result = sortData(dataset, 'weight', 'DESC');
    expect(result.map((item) => item.weight)).toEqual([300, 200, 100]);
  });

  it('trata direção desconhecida como ascendente', () => {
    const result = sortData(dataset, 'weight', 'lateral');
    expect(result.map((item) => item.weight)).toEqual([100, 200, 300]);
  });

  it('trata direção que não é string como ascendente', () => {
    const result = sortData(dataset, 'weight', 42);
    expect(result.map((item) => item.weight)).toEqual([100, 200, 300]);
  });

  it('posiciona valores nulos e indefinidos ao final', () => {
    const data = [
      { id: 1, value: 2 },
      { id: 2, value: null },
      { id: 3, value: 1 },
      { id: 4 }
    ];
    const result = sortData(data, 'value');
    expect(result.slice(0, 2).map((item) => item.id)).toEqual([3, 1]);
    expect(result.slice(2).map((item) => item.id).sort()).toEqual([2, 4]);
  });

  it('não muta o array original', () => {
    const copy = JSON.parse(JSON.stringify(dataset));
    sortData(dataset, 'name', 'desc');
    expect(dataset).toEqual(copy);
  });

  it('é estável para valores iguais', () => {
    const data = [
      { id: 1, value: 10 },
      { id: 2, value: 10 },
      { id: 3, value: 10 }
    ];
    expect(sortData(data, 'value').map((item) => item.id)).toEqual([1, 2, 3]);
  });
});
