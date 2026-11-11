/**
 * randomSelection.js
 * Seleção aleatória uniforme, sem reposição e sem alterar o array original.
 */

/**
 * Seleciona até `limit` itens usando Fisher-Yates parcial.
 *
 * O array de entrada não é modificado. A função faz uma cópia e realiza
 * apenas as trocas necessárias para os primeiros `limit` elementos.
 *
 * @param {Array} data - Coleção de origem.
 * @param {Number} limit - Quantidade desejada.
 * @param {Function} [rng=Math.random] - Gerador de números em [0, 1).
 * @returns {Array} Nova lista com os itens selecionados.
 */
const selectRandomItems = (data, limit, rng = Math.random) => {
  const items = Array.isArray(data) ? data : [];
  const numericLimit = Number(limit);
  const parsedLimit = Number.isFinite(numericLimit) ? Math.trunc(numericLimit) : 0;
  const target = Math.max(0, Math.min(parsedLimit, items.length));

  if (target === 0) return [];

  const result = items.slice();

  for (let index = 0; index < target; index += 1) {
    const remaining = result.length - index;
    const offset = Math.min(Math.floor(rng() * remaining), remaining - 1);
    const randomIndex = index + offset;

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result.slice(0, target);
};

module.exports = { selectRandomItems };
