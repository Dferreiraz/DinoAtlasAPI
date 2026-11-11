const { countGetRoutes } = require('../../server/utils/endpoints');
const routes = require('../../server/routes');

describe('utils/endpoints', () => {
  it('conta apenas rotas GET, inclusive em roteadores aninhados', () => {
    const stack = [
      { route: { methods: { get: true } } },
      { route: { methods: { post: true } } },
      { route: { methods: { get: true, post: true } } },
      { handle: { stack: [{ route: { methods: { get: true } } }] } },
      { handle: function middleware() {} },
      null
    ];

    expect(countGetRoutes(stack)).toBe(3);
  });

  it('conta os 36 endpoints públicos GET sob /api', () => {
    expect(countGetRoutes(routes.stack)).toBe(36);
  });

  it('retorna zero para pilhas inválidas', () => {
    expect(countGetRoutes(undefined)).toBe(0);
    expect(countGetRoutes(null)).toBe(0);
    expect(countGetRoutes({})).toBe(0);
  });

  it('ignora layers sem rota, sem stack ou com handle nulo', () => {
    const stack = [
      { handle: {} },
      { handle: null },
      { route: { methods: {} } },
      {}
    ];

    expect(countGetRoutes(stack)).toBe(0);
  });
});
