const paginate = require('../../server/utils/pagination');

const data = Array.from({ length: 25 }, (_, index) => ({ id: index + 1 }));

describe('utils/pagination', () => {
  it('usa página 1 e limite 10 por padrão', () => {
    const result = paginate(data);
    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3
    });
    expect(result.data.map((item) => item.id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    ]);
  });

  it('pagina a segunda página corretamente', () => {
    const result = paginate(data, '2', '10');
    expect(result.data.map((item) => item.id)).toEqual([
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ]);
    expect(result.meta.page).toBe(2);
  });

  it('retorna página vazia quando ultrapassa o total', () => {
    const result = paginate(data, '9', '10');
    expect(result.data).toEqual([]);
    expect(result.meta.totalPages).toBe(3);
  });

  it('aceita zeros à esquerda', () => {
    const result = paginate(data, '01', '010');
    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3
    });
  });

  it('limita o máximo a 100 na chamada direta', () => {
    const result = paginate(data, '1', '500');
    expect(result.meta.limit).toBe(100);
    expect(result.data).toHaveLength(25);
  });

  it('degrada para os padrões quando os valores são inválidos', () => {
    const cases = [
      ['abc', 'xyz'],
      ['0', '0'],
      ['-1', '-5'],
      ['1.5', '2.5'],
      [[], {}]
    ];

    for (const [page, limit] of cases) {
      const result = paginate(data, page, limit);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    }
  });

  it('calcula totalPages corretamente com divisão exata', () => {
    const exact = Array.from({ length: 20 }, (_, index) => ({ id: index + 1 }));
    const result = paginate(exact, '1', '10');
    expect(result.meta.totalPages).toBe(2);
  });

  it('não muta o array original', () => {
    const copy = JSON.parse(JSON.stringify(data));
    paginate(data, '2', '5');
    expect(data).toEqual(copy);
  });
});
