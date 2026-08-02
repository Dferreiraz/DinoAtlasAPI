/**
 * writeJson.js
 * Módulo responsável pela escrita segura em arquivos JSON.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Escreve dados em um arquivo JSON.
 * @param {String} filePath - Caminho do arquivo a ser salvo.
 * @param {Array|Object} data - Dados para salvar.
 * @returns {Promise<void>}
 */
const writeJson = async (filePath, data) => {
  try {
    const absolutePath = path.resolve(filePath);
    const jsonString = JSON.stringify(data, null, 2); // 2 espaços de indentação
    
    await fs.writeFile(absolutePath, jsonString, 'utf-8');
  } catch (error) {
    throw new Error(`Erro ao escrever no arquivo ${filePath}: ${error.message}`);
  }
};

module.exports = writeJson;

/*
EXEMPLO DE USO FUTURO:
const writeJson = require('../utils/writeJson');

async function addDinosaur(newDino) {
  const data = await readJson('./database/dinosaurs.json');
  data.push(newDino);
  await writeJson('./database/dinosaurs.json', data);
}
*/