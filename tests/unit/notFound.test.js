const notFound = require('../../server/middleware/notFound');

describe('middleware/notFound', () => {
  it('retorna 404 padronizado sem detalhes internos', () => {
    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      }
    };

    notFound({ method: 'GET', originalUrl: '/x' }, res, jest.fn());

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: 'Rota não encontrada.'
    });
  });
});
