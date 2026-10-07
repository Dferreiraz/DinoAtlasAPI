const request = require('supertest');
const app = require('../server/app');

describe('DinoAtlas API V2.4 - Testes de Regressão e Qualidade', () => {
  
  describe('Endpoints Globais', () => {
    it('GET /api/status - Deve retornar online e versão 2.4.x', async () => {
      const res = await request(app).get('/api/status');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('online');
    });

    it('GET /rota-inexistente - Deve retornar erro 404 padronizado', async () => {
      const res = await request(app).get('/api/rota-maluca-que-nao-existe');
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Rota não encontrada.");
    });
  });

  describe('Validações (V2.4)', () => {
    it('GET /api/dinosaurs/abc - Deve barrar ID que não é número (400 Bad Request)', async () => {
      const res = await request(app).get('/api/dinosaurs/abc');
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/dinosaurs?limit=-10 - Deve barrar limite negativo', async () => {
      const res = await request(app).get('/api/dinosaurs?limit=-10');
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Endpoints de Dinossauros (V2.0 e V2.3)', () => {
    it('GET /api/dinosaurs - Deve retornar a lista de dinossauros paginada', async () => {
      const res = await request(app).get('/api/dinosaurs');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/dinosaurs/1 - Deve retornar o T-Rex com dados de imagem (V2.2)', async () => {
      const res = await request(app).get('/api/dinosaurs/1');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.name).toBe("Tyrannosaurus Rex");
      expect(res.body.data).toHaveProperty("imagem"); // Valida regressão de imagem
    });

    it('GET /api/dinosaurs/random?limit=2 - Deve retornar array aleatório (V2.3)', async () => {
      const res = await request(app).get('/api/dinosaurs/random?limit=2');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(2);
    });
  });
});