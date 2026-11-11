/**
 * version.js
 * Fonte única da versão pública da API.
 * A versão é lida de `package.json` para evitar números duplicados no código.
 */

const { version } = require('../../package.json');

module.exports = version;
