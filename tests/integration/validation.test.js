const request = require('supertest');
const { createTestApp } = require('../helpers/app');
const { DINOSAUR_SORT_FIELDS } = require('../../server/utils/validation');

const app = createTestApp();

const expectBadRequest = (res, message) => {
  expect(res.statusCode).toBe(400);
  expect(res.body).toEqual({ success: false, message });
};

describe('Validação de parâmetros via HTTP', () => {
  describe('Paginação', () => {
    it.each(['0', '101', 'abc', '1abc', '1.5', '1e2', '-1'])(
      'rejeita limit=%p',
      async (limit) => {
        const res = await request(app).get(`/api/dinosaurs?limit=${encodeURIComponent(limit)}`);
        expectBadRequest(
          res,
          "O parâmetro 'limit' deve ser um número inteiro entre 1 e 100."
        );
      }
    );

    it.each(['1', '100', '0100'])('aceita limit=%p', async (limit) => {
      const res = await request(app).get(`/api/dinosaurs?limit=${limit}`);
      expect(res.statusCode).toBe(200);
    });

    it.each(['0', 'abc', '1.5', '-1'])('rejeita page=%p', async (page) => {
      const res = await request(app).get(`/api/dinosaurs?page=${encodeURIComponent(page)}`);
      expectBadRequest(
        res,
        "O parâmetro 'page' deve ser um número inteiro maior ou igual a 1."
      );
    });

    it('rejeita page repetida', async () => {
      const res = await request(app).get('/api/dinosaurs?page=1&page=2');
      expectBadRequest(
        res,
        "O parâmetro 'page' deve ser um número inteiro maior ou igual a 1."
      );
    });

    it('rejeita limit repetido', async () => {
      const res = await request(app).get('/api/dinosaurs?limit=10&limit=20');
      expectBadRequest(
        res,
        "O parâmetro 'limit' deve ser um número inteiro entre 1 e 100."
      );
    });

    it.each([
      ['page', '/api/dinosaurs?page[foo]=1'],
      ['limit', '/api/dinosaurs?limit[foo]=1'],
      ['sort', '/api/dinosaurs?sort[foo]=name'],
      ['order', '/api/dinosaurs?order[foo]=asc'],
      ['search', '/api/dinosaurs?search[foo]=rex'],
      ['periodId', '/api/dinosaurs?periodId[foo]=1'],
      ['lengthMin', '/api/dinosaurs?lengthMin[foo]=1'],
      ['random limit', '/api/dinosaurs/random?limit[foo]=1']
    ])('rejeita parâmetro em formato de objeto: %s', async (label, url) => {
      const res = await request(app).get(url);
      expect({ label, status: res.statusCode }).toEqual({ label, status: 400 });
      expect(res.body).toEqual({
        success: false,
        message: expect.any(String)
      });
    });
  });

  describe('Ordenação', () => {
    it.each(DINOSAUR_SORT_FIELDS)('aceita sort=%p', async (sort) => {
      const res = await request(app).get(`/api/dinosaurs?sort=${encodeURIComponent(sort)}&limit=1`);
      expect(res.statusCode).toBe(200);
    });

    it('rejeita sort=year (campo de descobertas)', async () => {
      const res = await request(app).get('/api/dinosaurs?sort=year');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("O parâmetro 'sort' deve ser um dos campos suportados");
    });

    it.each(['unknown', 'formationId', 'nome', ''])('rejeita sort=%p', async (sort) => {
      const res = await request(app).get(`/api/dinosaurs?sort=${encodeURIComponent(sort)}`);
      expect(res.statusCode).toBe(400);
    });

    it('rejeita sort repetido', async () => {
      const res = await request(app).get('/api/dinosaurs?sort=name&sort=id');
      expect(res.statusCode).toBe(400);
    });

    it.each(['asc', 'desc', 'ASC', 'DESC', 'Asc'])('aceita order=%p', async (order) => {
      const res = await request(app).get(`/api/dinosaurs?sort=id&order=${order}&limit=1`);
      expect(res.statusCode).toBe(200);
    });

    it.each(['up', 'down', 'ascending'])('rejeita order=%p', async (order) => {
      const res = await request(app).get(`/api/dinosaurs?sort=id&order=${order}`);
      expectBadRequest(res, "O parâmetro 'order' deve ser 'asc' ou 'desc'.");
    });

    it('rejeita order repetido', async () => {
      const res = await request(app).get('/api/dinosaurs?order=asc&order=desc');
      expectBadRequest(res, "O parâmetro 'order' deve ser 'asc' ou 'desc'.");
    });
  });

  describe('Filtros', () => {
    it.each([
      ['periodId', 'abc'],
      ['periodId', '0'],
      ['epochId', '1.5'],
      ['dietId', '-1'],
      ['continentId', '1abc'],
      ['countryId', '1e3'],
      ['formationId', ''],
      ['familyId', 'abc'],
      ['cladeId', '0'],
      ['habitatId', '1.5'],
      ['classificationId', '-2'],
      ['museumId', 'abc']
    ])('rejeita %s=%p com 400', async (filter, value) => {
      const res = await request(app).get(
        `/api/dinosaurs?${filter}=${encodeURIComponent(value)}`
      );
      expectBadRequest(
        res,
        `O parâmetro '${filter}' deve ser um número inteiro positivo.`
      );
    });

    it.each([
      ['lengthMin', 'abc'],
      ['lengthMax', '-1'],
      ['weightMin', '1.5.2'],
      ['weightMax', '1,5'],
      ['heightMin', '1e3'],
      ['heightMax', ''],
      ['estimatedSpeedMin', '-0.1'],
      ['estimatedSpeedMax', 'abc']
    ])('rejeita %s=%p com 400', async (filter, value) => {
      const res = await request(app).get(
        `/api/dinosaurs?${filter}=${encodeURIComponent(value)}`
      );
      expectBadRequest(
        res,
        `O parâmetro '${filter}' deve ser um número maior ou igual a zero.`
      );
    });

    it.each([
      ['lengthMin', '0'],
      ['lengthMax', '12.5'],
      ['weightMin', '01.5'],
      ['heightMax', '4'],
      ['estimatedSpeedMin', '0.5']
    ])('aceita %s=%p', async (filter, value) => {
      const res = await request(app).get(
        `/api/dinosaurs?${filter}=${encodeURIComponent(value)}&limit=1`
      );
      expect(res.statusCode).toBe(200);
    });

    it('rejeita filtro repetido', async () => {
      const res = await request(app).get('/api/dinosaurs?periodId=1&periodId=2');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Busca', () => {
    it('rejeita busca com 101 caracteres', async () => {
      const res = await request(app).get(`/api/dinosaurs?search=${'a'.repeat(101)}`);
      expectBadRequest(
        res,
        "O parâmetro 'search' deve ter no máximo 100 caracteres."
      );
    });

    it('aceita busca com 100 caracteres', async () => {
      const res = await request(app).get(`/api/dinosaurs?search=${'a'.repeat(100)}`);
      expect(res.statusCode).toBe(200);
    });

    it('rejeita busca repetida', async () => {
      const res = await request(app).get('/api/dinosaurs?search=rex&search=trike');
      expectBadRequest(res, "O parâmetro 'search' deve ser um texto único.");
    });
  });

  describe('Random', () => {
    it.each(['0', '51', 'abc', '1.5', '1abc', '-1'])(
      'rejeita limit=%p',
      async (limit) => {
        const res = await request(app).get(
          `/api/dinosaurs/random?limit=${encodeURIComponent(limit)}`
        );
        expectBadRequest(
          res,
          "O parâmetro 'limit' deve ser um número inteiro entre 1 e 50."
        );
      }
    );

    it.each(['1', '50', '050'])('aceita limit=%p', async (limit) => {
      const res = await request(app).get(`/api/dinosaurs/random?limit=${limit}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Contrato de erro', () => {
    it('todos os erros de validação usam apenas success e message', async () => {
      const urls = [
        '/api/dinosaurs?limit=101',
        '/api/dinosaurs?page=abc',
        '/api/dinosaurs?sort=year',
        '/api/dinosaurs?periodId=abc',
        '/api/dinosaurs?lengthMin=-1',
        '/api/dinosaurs/random?limit=51',
        '/api/dinosaurs/abc'
      ];

      for (const url of urls) {
        const res = await request(app).get(url);
        expect(res.statusCode).toBe(400);
        expect(Object.keys(res.body).sort()).toEqual(['message', 'success']);
        expect(res.body).not.toHaveProperty('error');
        expect(res.body).not.toHaveProperty('stack');
      }
    });
  });
});
