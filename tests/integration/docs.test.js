const request = require('supertest');
const { createTestApp } = require('../helpers/app');

const app = createTestApp();

describe('Documentação em /docs', () => {
  describe('Página', () => {
    it('GET /docs retorna 200 com HTML', async () => {
      const res = await request(app).get('/docs');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toContain('DinoAtlas API');
      expect(res.text).toContain('Documentação');
    });

    it('GET /docs/ também retorna a documentação', async () => {
      const res = await request(app).get('/docs/');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
      expect(res.text).toContain('DinoAtlas API');
    });

    it('HEAD /docs responde corretamente', async () => {
      const res = await request(app).head('/docs');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('preserva os caminhos relativos e as âncoras internas', async () => {
      const res = await request(app).get('/docs');

      expect(res.text).toContain('href="../css/documentacao.css"');
      expect(res.text).toContain('src="../js/documentacao.js"');
      expect(res.text).toContain('href="../img/dinoatlasapi_logo.png"');
      expect(res.text).toContain('href="#introducao"');
      expect(res.text).toContain('href="#rate-limiting"');
      expect(res.text).toContain('href="#rec-dinosaurs"');
      expect(res.text).toContain('href="#schemas"');
    });

    it('não carrega o script da página inicial', async () => {
      const res = await request(app).get('/docs');

      expect(res.text).not.toContain('src="../js/script.js"');
    });

    it('mantém o índice com 15 seções e todos os links resolvendo', async () => {
      const res = await request(app).get('/docs');
      const ids = new Set(
        [...res.text.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
      );
      const links = [...res.text.matchAll(/class="doc-indice__link[^"]*" href="#([^"]+)"/g)]
        .map((match) => match[1]);

      expect([...res.text.matchAll(/class="doc-secao"/g)]).toHaveLength(15);
      expect(links).toHaveLength(15);
      links.forEach((destino) => expect(ids.has(destino)).toBe(true));
    });

    it('começa com um único item ativo no índice', async () => {
      const res = await request(app).get('/docs');

      expect((res.text.match(/doc-indice__link--ativo/g) || [])).toHaveLength(1);
      expect((res.text.match(/aria-current="location"/g) || [])).toHaveLength(1);
    });

    it('documenta os 36 endpoints GET reais', async () => {
      const res = await request(app).get('/docs');

      expect((res.text.match(/doc-endpoint__metodo/g) || [])).toHaveLength(36);
    });
  });

  describe('Recursos locais', () => {
    it('serve o CSS da documentação', async () => {
      const res = await request(app).get('/css/documentacao.css');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/css/);
      expect(res.text.length).toBeGreaterThan(0);
    });

    it('serve o CSS global importado pela documentação', async () => {
      const res = await request(app).get('/css/global.css');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/css/);
    });

    it('serve o JavaScript da documentação', async () => {
      const res = await request(app).get('/js/documentacao.js');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/javascript/);
      expect(res.text.length).toBeGreaterThan(0);
    });

    it('continua servindo o JavaScript da página inicial', async () => {
      const res = await request(app).get('/js/script.js');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/javascript/);
      expect(res.text.length).toBeGreaterThan(0);
    });

    it('serve as imagens locais', async () => {
      const res = await request(app).get('/img/dinoatlasapi_logo.png');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/image\/png/);
    });

    it('o link de volta para a home resolve para o index', async () => {
      const res = await request(app).get('/index.html');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('Ausência de conflitos', () => {
    it('não altera a rota raiz', async () => {
      const res = await request(app).get('/');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('não intercepta as rotas da API', async () => {
      const api = await request(app).get('/api');
      const health = await request(app).get('/health');

      expect(api.statusCode).toBe(200);
      expect(api.headers['content-type']).toMatch(/application\/json/);
      expect(health.statusCode).toBe(200);
      expect(health.body.success).toBe(true);
    });

    it('/api/docs continua sendo uma rota de API inexistente', async () => {
      const res = await request(app).get('/api/docs');

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Rota não encontrada.'
      });
    });
  });
});
