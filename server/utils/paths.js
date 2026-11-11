/**
 * paths.js
 * Centraliza a resolução dos caminhos do projeto a partir da localização
 * deste arquivo, em vez de depender do diretório de trabalho (process.cwd()).
 */

const path = require('path');

// __dirname aponta para server/utils
const SERVER_ROOT = path.join(__dirname, '..');
const PROJECT_ROOT = path.join(SERVER_ROOT, '..');
const DATABASE_DIR = path.join(SERVER_ROOT, 'database');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

/**
 * Retorna o caminho absoluto de um arquivo dentro de server/database.
 * @param {String} filename - Nome do arquivo (ex: 'dinosaurs.json').
 * @returns {String}
 */
const databasePath = (filename) => path.join(DATABASE_DIR, filename);

module.exports = {
  SERVER_ROOT,
  PROJECT_ROOT,
  DATABASE_DIR,
  PUBLIC_DIR,
  databasePath
};
