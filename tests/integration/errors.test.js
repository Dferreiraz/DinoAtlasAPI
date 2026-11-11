const request = require('supertest');
const { createTestApp } = require('../helpers/app');

const app = createTestApp();

const assertSafeError = (res, status, message) => {
  expect(res.statusCode).toBe(status);
  expect(res.body).toEqual({ success: false, message });
  expect(Object.keys(res.body).sort()).toEqual(['message', 'success']);

  const serialized = JSON.stringify(res.body);
  for (const forbidden of [
    'Unexpected token',
    'SyntaxError',
    'node_modules',
    'body-parser',
    'entity.parse.failed',
    ' at ',
    '\\',
    'stack'
  ]) {
    expect(serialized).not.toContain(forbidden);
  }
};

describe('Tratamento de erros e segurança das respostas', () => {
  describe('Rota inexistente', () => {
    it('retorna 404 JSON padronizado', async () => {
      const res = await request(app).get('/api/rota-que-nao-existe');
      assertSafeError(res, 404, 'Rota não encontrada.');
    });

    it.each([
      '/rota-inexistente',
      '/api/dinosaurs/1/extra',
      '/api/periods/1/extra',
      '/api/images/1'
    ])('retorna 404 para %s', async (url) => {
      const res = await request(app).get(url);
      assertSafeError(res, 404, 'Rota não encontrada.');
    });

    it('método não suportado cai no 404 de rota', async () => {
      const res = await request(app).post('/api/periods');
      assertSafeError(res, 404, 'Rota não encontrada.');
    });
  });

  describe('JSON malformado', () => {
    it('retorna 400 sem detalhes do parser', async () => {
      const res = await request(app)
        .post('/api/dinosaurs')
        .set('Content-Type', 'application/json')
        .send('{"name":');

      assertSafeError(res, 400, 'Requisição inválida.');
    });

    it('retorna X-Request-Id mesmo em erro de parse', async () => {
      const res = await request(app)
        .post('/api/dinosaurs')
        .set('Content-Type', 'application/json')
        .send('{invalid}');

      expect(res.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('preserva o X-Request-Id válido enviado pelo cliente', async () => {
      const res = await request(app)
        .post('/api/dinosaurs')
        .set('Content-Type', 'application/json')
        .set('X-Request-Id', 'cliente-123')
        .send('{invalid}');

      expect(res.headers['x-request-id']).toBe('cliente-123');
    });

    it('substitui X-Request-Id inválido', async () => {
      const res = await request(app)
        .get('/api/status')
        .set('X-Request-Id', 'valor com espacos');

      expect(res.headers['x-request-id']).not.toBe('valor com espacos');
      expect(res.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('Payload excessivo', () => {
    it('retorna 413 seguro para corpo acima de 100 KB', async () => {
      const res = await request(app)
        .post('/api/dinosaurs')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ payload: 'x'.repeat(110000) }));

      assertSafeError(res, 413, 'Payload muito grande.');
    });

    it('mantém X-Request-Id na resposta 413', async () => {
      const res = await request(app)
        .post('/api/dinosaurs')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ payload: 'x'.repeat(110000) }));

      expect(res.headers['x-request-id']).toBeDefined();
    });
  });

  describe('Contrato mínimo', () => {
    it('erros nunca retornam data, error, stack ou trace', async () => {
      const res = await request(app).get('/api/dinosaurs/abc');
      expect(res.body).toEqual({
        success: false,
        message: 'O ID fornecido é inválido. Deve ser um número inteiro positivo.'
      });
    });

    it('respostas de sucesso mantêm success e data', async () => {
      const res = await request(app).get('/api/periods/1');
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body).not.toHaveProperty('message');
    });
  });
});
