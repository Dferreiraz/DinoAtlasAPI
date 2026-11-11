/**
 * jsonRepository.js
 * Ponto único de leitura dos arquivos JSON estáticos da aplicação.
 *
 * - O conteúdo é cacheado em memória por processo, por caminho absoluto.
 * - Leituras concorrentes do mesmo arquivo compartilham a mesma Promise.
 * - Índices por ID e índices agrupados são construídos sob demanda.
 * - Erros de leitura/parse NÃO são cacheados: a próxima chamada tenta de novo.
 * - `writeJson` invalida o caminho gravado para manter o cache consistente.
 *
 * Os arquivos de `server/database` são somente leitura em produção. Alterações
 * externas feitas diretamente no disco exigem reinício do processo ou uma
 * chamada explícita a `invalidate`/`clearCache`.
 */

const path = require('path');
const readJson = require('../utils/readJson');
const { databasePath } = require('../utils/paths');

/** @type {Map<string, Promise<{ data: any, indexes: Map<string, Map<any, any>> }>>} */
const cache = new Map();

const resolvePath = (filePath) => path.resolve(filePath);

/**
 * Retorna o registro cacheado (dados + índices) de um arquivo.
 * @param {String} filePath
 * @returns {Promise<{ data: any, indexes: Map<string, Map<any, any>> }>}
 */
const getRecord = (filePath) => {
  const absolutePath = resolvePath(filePath);
  const cached = cache.get(absolutePath);
  if (cached) return cached;

  const pending = readJson(absolutePath)
    .then((data) => ({ data, indexes: new Map() }))
    .catch((error) => {
      // Uma leitura falha não deve envenenar o cache.
      cache.delete(absolutePath);
      throw error;
    });

  cache.set(absolutePath, pending);
  return pending;
};

/**
 * Lê (ou reutiliza do cache) o conteúdo de um arquivo JSON.
 * @param {String} filePath
 * @returns {Promise<Array|Object>}
 */
const getJson = async (filePath) => (await getRecord(filePath)).data;

/**
 * Retorna um índice `chave -> primeiro registro` para um campo.
 * @param {String} filePath
 * @param {String} field
 * @returns {Promise<Map<any, any>>}
 */
const getIndex = async (filePath, field) => {
  const record = await getRecord(filePath);
  const cacheKey = `field:${field}`;

  if (!record.indexes.has(cacheKey)) {
    const index = new Map();
    const items = Array.isArray(record.data) ? record.data : [];

    for (const item of items) {
      if (!item || item[field] === undefined || item[field] === null) continue;
      index.set(item[field], item);
    }

    record.indexes.set(cacheKey, index);
  }

  return record.indexes.get(cacheKey);
};

/**
 * Retorna um índice agrupado `chave -> lista de registros` para um campo.
 * Útil para relacionamentos 1:N, como imagens por `dinosaurId`.
 * @param {String} filePath
 * @param {String} field
 * @returns {Promise<Map<any, Array>>}
 */
const getGroupedIndex = async (filePath, field) => {
  const record = await getRecord(filePath);
  const cacheKey = `group:${field}`;

  if (!record.indexes.has(cacheKey)) {
    const index = new Map();
    const items = Array.isArray(record.data) ? record.data : [];

    for (const item of items) {
      if (!item || item[field] === undefined || item[field] === null) continue;

      const key = item[field];
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(item);
    }

    record.indexes.set(cacheKey, index);
  }

  return record.indexes.get(cacheKey);
};

/**
 * Busca um registro pelo campo `id` usando o índice.
 * @param {String} filePath
 * @param {*} id
 * @returns {Promise<any|undefined>}
 */
const getById = async (filePath, id) => {
  const index = await getIndex(filePath, 'id');
  return index.get(id);
};

/**
 * Busca um registro pelo primeiro valor de um campo usando o índice.
 * @param {String} filePath
 * @param {String} field
 * @param {*} value
 * @returns {Promise<any|undefined>}
 */
const getByField = async (filePath, field, value) => {
  const index = await getIndex(filePath, field);
  return index.get(value);
};

/**
 * Remove um caminho do cache. Deve ser chamado após qualquer escrita.
 * @param {String} filePath
 */
const invalidate = (filePath) => {
  cache.delete(resolvePath(filePath));
};

/**
 * Remove todos os registros do cache. Usado em testes e em recarregamentos.
 */
const clearCache = () => {
  cache.clear();
};

// Atalhos para os arquivos de server/database.

const getDatabase = (filename) => getJson(databasePath(filename));

const getDatabaseById = (filename, id) => getById(databasePath(filename), id);

const getDatabaseIndex = (filename, field) => getIndex(databasePath(filename), field);

const getDatabaseGroupedIndex = (filename, field) =>
  getGroupedIndex(databasePath(filename), field);

module.exports = {
  getJson,
  getById,
  getByField,
  getIndex,
  getGroupedIndex,
  invalidate,
  clearCache,
  getDatabase,
  getDatabaseById,
  getDatabaseIndex,
  getDatabaseGroupedIndex
};
