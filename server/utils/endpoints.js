/**
 * endpoints.js
 * Contabiliza rotas GET públicas a partir da pilha de roteadores do Express.
 *
 * O contador ignora middlewares e considera apenas `router.route` com método
 * GET. Roteadores aninhados são percorridos recursivamente. Dessa forma,
 * `totalEndpoints` em `/api` acompanha automaticamente as rotas montadas, sem
 * uma lista manual sujeita a divergência.
 */

/**
 * @param {Array} stack - Pilha de layers do Express (router.stack).
 * @returns {Number}
 */
const countGetRoutes = (stack) => {
  if (!Array.isArray(stack)) return 0;

  let total = 0;

  for (const layer of stack) {
    if (!layer) continue;

    if (layer.route) {
      const methods = layer.route.methods || {};
      if (methods.get) total += 1;
      continue;
    }

    if (layer.handle && Array.isArray(layer.handle.stack)) {
      total += countGetRoutes(layer.handle.stack);
    }
  }

  return total;
};

module.exports = { countGetRoutes };
