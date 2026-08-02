/**
 * readJson.js
 * Módulo responsável pela leitura assíncrona de arquivos JSON.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Lê e faz o parse de um arquivo JSON.
 * @param {String} filePath - Caminho relativo ou absoluto do arquivo.
 * @returns {Promise<Array|Object>}
 */
const readJson = async (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // Trata erro caso o arquivo não exista
    if (error.code === 'ENOENT') {
      throw new Error(`Arquivo não encontrado no caminho: ${filePath}`);
    }
    // Trata erro de parse de JSON inválido
    if (error instanceof SyntaxError) {
      throw new Error(`Falha ao decodificar o arquivo JSON: ${filePath}`);
    }
    
    throw new Error(`Erro inesperado ao ler o arquivo: ${error.message}`);
  }
};

module.exports = readJson;

/*
EXEMPLO DE USO FUTURO:
const readJson = require('../utils/readJson');

async function getDinosaurs() {
  try {
    const data = await readJson('./database/dinosaurs.json');
    console.log(data);
  } catch (error) {
    console.error(error.message);
  }
}
*/