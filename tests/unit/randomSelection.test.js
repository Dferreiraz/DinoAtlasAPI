const { selectRandomItems } = require('../../server/utils/randomSelection');

/**
 * Cria um RNG determinístico que percorre a sequência informada e repete o
 * último valor caso a função seja chamada mais vezes que o esperado.
 * @param {Number[]} values
 * @returns {Function}
 */
const sequenceRng = (values) => {
  let index = 0;
  return () => {
    const value = values[Math.min(index, values.length - 1)];
    index += 1;
    return value;
  };
};

describe('utils/randomSelection', () => {
  const data = [1, 2, 3, 4, 5];

  it('seleciona os itens esperados com uma sequência determinística de RNG', () => {
    const selected = selectRandomItems(data, 3, sequenceRng([0.5, 0, 0.99]));

    expect(selected).toEqual([3, 2, 5]);
  });

  it('é determinística quando o RNG é reiniciado com a mesma sequência', () => {
    const first = selectRandomItems(data, 3, sequenceRng([0.5, 0, 0.99]));
    const second = selectRandomItems(data, 3, sequenceRng([0.5, 0, 0.99]));

    expect(first).toEqual(second);
  });

  it('não repete elementos na seleção', () => {
    const many = Array.from({ length: 100 }, (_, index) => index + 1);
    const selected = selectRandomItems(many, 50, sequenceRng([0.99]));

    expect(selected).toHaveLength(50);
    expect(new Set(selected).size).toBe(50);
    for (const item of selected) {
      expect(many).toContain(item);
    }
  });

  it('não modifica o array original', () => {
    const original = [1, 2, 3, 4, 5];
    const snapshot = [...original];

    selectRandomItems(original, 5, sequenceRng([0.99]));

    expect(original).toEqual(snapshot);
  });

  it('retorna todos os elementos quando o limite é maior que o array', () => {
    const selected = selectRandomItems(data, 999, sequenceRng([0.99]));

    expect(selected).toHaveLength(data.length);
    expect(new Set(selected)).toEqual(new Set(data));
  });

  it('retorna todos os elementos, sem repetição, quando o limite é igual ao tamanho', () => {
    const selected = selectRandomItems(data, 5, sequenceRng([0.1]));

    expect(selected).toHaveLength(5);
    expect(new Set(selected).size).toBe(5);
  });

  it('retorna uma lista vazia quando o limite é zero ou inválido', () => {
    expect(selectRandomItems(data, 0, sequenceRng([0.5]))).toEqual([]);
    expect(selectRandomItems(data, -3, sequenceRng([0.5]))).toEqual([]);
    expect(selectRandomItems(data, Number.NaN, sequenceRng([0.5]))).toEqual([]);
  });

  it('retorna uma lista vazia para um array vazio sem chamar o RNG', () => {
    const rng = jest.fn();

    expect(selectRandomItems([], 10, rng)).toEqual([]);
    expect(rng).not.toHaveBeenCalled();
  });

  it('chama o RNG exatamente uma vez por item selecionado', () => {
    const rng = jest.fn(() => 0.5);

    selectRandomItems(data, 3, rng);

    expect(rng).toHaveBeenCalledTimes(3);
  });

  it('mantém a ordem original quando o RNG sempre retorna zero', () => {
    expect(selectRandomItems(data, 3, sequenceRng([0]))).toEqual([1, 2, 3]);
  });
});
