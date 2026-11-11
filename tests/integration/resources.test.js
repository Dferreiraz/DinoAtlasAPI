const request = require('supertest');
const { createTestApp } = require('../helpers/app');
const {
  data,
  RESOURCES,
  NESTED_RESOURCES,
  INVALID_ID_VALUES,
  SAFE_BUT_UNKNOWN_ID,
  EXISTING_ID_WITH_LEADING_ZERO,
  NONEXISTENT_ID
} = require('../helpers/fixtures');

const app = createTestApp();

describe('Recursos da API', () => {
  describe('Listagens', () => {
    it.each(RESOURCES.map((resource) => [resource.name, resource]))(
      'GET %s retorna todos os registros',
      async (name, resource) => {
        // A listagem de dinossauros é paginada por padrão (10 itens).
        const url = resource.name === 'dinosaurs'
          ? `${resource.endpoint}?limit=100`
          : resource.endpoint;
        const res = await request(app).get(url);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(resource.count);
      }
    );

    it('GET /api/images inclui o total nos metadados', async () => {
      const res = await request(app).get('/api/images');
      expect(res.body.meta).toEqual({ total: data.images.length });
    });
  });

  describe('Consulta por ID', () => {
    const idResources = RESOURCES.filter((resource) => resource.name !== 'images');

    it.each(idResources.map((resource) => [resource.name, resource.endpoint]))(
      'GET %s/1 retorna o registro de ID 1',
      async (name, endpoint) => {
        const res = await request(app).get(`${endpoint}/1`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(1);
      }
    );

    it.each(idResources.map((resource) => [resource.name, resource.endpoint]))(
      'GET %s/9999 retorna 404',
      async (name, endpoint) => {
        const res = await request(app).get(`${endpoint}/${NONEXISTENT_ID}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(typeof res.body.message).toBe('string');
        expect(res.body).not.toHaveProperty('error');
      }
    );

    it.each(idResources.map((resource) => [resource.name, resource.endpoint]))(
      'GET %s/:id rejeita IDs inválidos com 400',
      async (name, endpoint) => {
        for (const value of INVALID_ID_VALUES) {
          const res = await request(app).get(`${endpoint}/${encodeURIComponent(value)}`);
          expect({ endpoint, value, status: res.statusCode }).toEqual({
            endpoint,
            value,
            status: 400
          });
          expect(res.body).toEqual({
            success: false,
            message: 'O ID fornecido é inválido. Deve ser um número inteiro positivo.'
          });
        }
      }
    );

    it.each(idResources.map((resource) => [resource.name, resource.endpoint]))(
      'GET %s/:id aceita zeros à esquerda para IDs existentes',
      async (name, endpoint) => {
        const res = await request(app).get(`${endpoint}/${EXISTING_ID_WITH_LEADING_ZERO}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.id).toBe(1);
      }
    );

    it.each(idResources.map((resource) => [resource.name, resource.endpoint]))(
      'GET %s/:id retorna 404 para inteiro seguro inexistente',
      async (name, endpoint) => {
        const res = await request(app).get(`${endpoint}/${SAFE_BUT_UNKNOWN_ID}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
      }
    );

    it('GET /api/images/:id não existe e retorna 404 de rota', async () => {
      const res = await request(app).get('/api/images/1');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Rota não encontrada.'
      });
    });
  });

  describe('Rotas aninhadas', () => {
    it.each(NESTED_RESOURCES.map((resource) => [resource.name, resource.endpoint]))(
      'GET %s relaciona dinossauros',
      async (name, endpoint) => {
        const res = await request(app).get(endpoint);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.meta.count).toBe(res.body.data.length);
      }
    );

    it.each(NESTED_RESOURCES.map((resource) => [resource.name, resource.endpoint]))(
      'GET %s retorna 404 para entidade inexistente',
      async (name, endpoint) => {
        const res = await request(app).get(endpoint.replace('/1/', `/${NONEXISTENT_ID}/`));
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
      }
    );

    it.each(NESTED_RESOURCES.map((resource) => [resource.name, resource.endpoint]))(
      'GET %s valida o ID antes de consultar',
      async (name, endpoint) => {
        for (const value of INVALID_ID_VALUES) {
          const res = await request(app).get(
            endpoint.replace('/1/', `/${encodeURIComponent(value)}/`)
          );
          expect(res.statusCode).toBe(400);
          expect(res.body.message).toBe(
            'O ID fornecido é inválido. Deve ser um número inteiro positivo.'
          );
        }
      }
    );
  });
});
