const request = require('supertest');
const { createTestApp } = require('../helpers/app');

const app = createTestApp();

describe('Arquivos estáticos e cabeçalhos de segurança', () => {
  describe('Conteúdo público', () => {
    it('GET / serve o index.html', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toContain('<html');
      expect(res.text).toContain('DinoAtlas');
    });

    it('GET /src/css/style.css serve o CSS', async () => {
      const res = await request(app).get('/src/css/style.css');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/css/);
      expect(res.text.length).toBeGreaterThan(0);
    });

    it('GET /src/js/script.js serve o JavaScript', async () => {
      const res = await request(app).get('/src/js/script.js');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/javascript/);
      expect(res.text.length).toBeGreaterThan(0);
    });

    it('GET /src/page/documentacao.html serve a documentação', async () => {
      const res = await request(app).get('/src/page/documentacao.html');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('arquivo estático inexistente retorna 404 JSON', async () => {
      const res = await request(app).get('/src/img/nao-existe.png');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Rota não encontrada.'
      });
    });
  });

  describe('Cabeçalhos', () => {
    it('aplica os cabeçalhos do Helmet', async () => {
      const res = await request(app).get('/api/status');

      expect(res.headers['content-security-policy']).toContain("default-src 'self'");
      expect(res.headers['content-security-policy']).toContain('https://res.cloudinary.com');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['referrer-policy']).toBe('no-referrer');
    });

    it('aplica CORS para qualquer origem', async () => {
      const res = await request(app).get('/api/status');

      expect(res.headers['access-control-allow-origin']).toBe('*');
    });

    it('responde ao preflight OPTIONS', async () => {
      const res = await request(app)
        .options('/api/dinosaurs')
        .set('Origin', 'https://example.com')
        .set('Access-Control-Request-Method', 'GET');

      expect([200, 204]).toContain(res.statusCode);
      expect(res.headers['access-control-allow-origin']).toBe('*');
    });

    it('respeita a ordem do express.static antes da rota raiz', async () => {
      const res = await request(app).get('/');
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });
  });
});
