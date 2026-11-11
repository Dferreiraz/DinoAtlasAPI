const request = require('supertest');
const { createTestApp } = require('../helpers/app');
const { data } = require('../helpers/fixtures');

const app = createTestApp();

const ids = (records) => records.map((record) => record.id);

describe('GET /api/dinosaurs', () => {
  describe('Listagem e paginação', () => {
    it('usa page=1 e limit=10 por padrão', async () => {
      const res = await request(app).get('/api/dinosaurs');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(10);
      expect(res.body.meta).toEqual({
        page: 1,
        limit: 10,
        total: data.dinosaurs.length,
        totalPages: Math.ceil(data.dinosaurs.length / 10)
      });
      expect(ids(res.body.data)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('retorna a página solicitada', async () => {
      const res = await request(app).get('/api/dinosaurs?page=2&limit=10');
      expect(res.body.meta.page).toBe(2);
      expect(ids(res.body.data)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    });

    it('aceita limit=100', async () => {
      const res = await request(app).get('/api/dinosaurs?limit=100');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(data.dinosaurs.length);
    });

    it('aceita zeros à esquerda em page e limit', async () => {
      const res = await request(app).get('/api/dinosaurs?page=0002&limit=0005');
      expect(res.statusCode).toBe(200);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(5);
      expect(res.body.data).toHaveLength(5);
    });

    it('retorna página vazia quando excede o total', async () => {
      const res = await request(app).get('/api/dinosaurs?page=999&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.totalPages).toBe(10);
    });

    it('injeta dados de imagem em cada item', async () => {
      const res = await request(app).get('/api/dinosaurs?limit=3');
      for (const dinosaur of res.body.data) {
        expect(dinosaur).toHaveProperty('imagem');
        expect(dinosaur).toHaveProperty('thumbnail');
        expect(dinosaur).toHaveProperty('imageAuthor');
        expect(dinosaur).toHaveProperty('imageLicense');
      }
    });
  });

  describe('Ordenação', () => {
    it('ordena por nome em ordem crescente', async () => {
      const res = await request(app).get('/api/dinosaurs?sort=name&order=asc&limit=10');
      const expected = [...data.dinosaurs]
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10)
        .map((dinosaur) => dinosaur.name);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.map((dinosaur) => dinosaur.name)).toEqual(expected);
    });

    it('ordena por nome em ordem decrescente', async () => {
      const res = await request(app).get('/api/dinosaurs?sort=name&order=desc&limit=10');
      const expected = [...data.dinosaurs]
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, 10)
        .map((dinosaur) => dinosaur.name);

      expect(res.body.data.map((dinosaur) => dinosaur.name)).toEqual(expected);
    });

    it('ordena por peso decrescente', async () => {
      const res = await request(app).get('/api/dinosaurs?sort=weight&order=desc&limit=5');
      const weights = res.body.data.map((dinosaur) => dinosaur.weight);
      expect(weights).toEqual([...weights].sort((a, b) => b - a));
    });

    it('aceita order em maiúsculas', async () => {
      const lower = await request(app).get('/api/dinosaurs?sort=id&order=desc&limit=5');
      const upper = await request(app).get('/api/dinosaurs?sort=id&order=DESC&limit=5');
      expect(ids(upper.body.data)).toEqual(ids(lower.body.data));
    });

    it('combina ordenação e paginação', async () => {
      const res = await request(app).get('/api/dinosaurs?sort=id&order=desc&page=2&limit=10');
      expect(ids(res.body.data)).toEqual([90, 89, 88, 87, 86, 85, 84, 83, 82, 81]);
      expect(res.body.meta.page).toBe(2);
    });
  });

  describe('Filtros', () => {
    it('filtra por periodId', async () => {
      const res = await request(app).get('/api/dinosaurs?periodId=3&limit=100');
      const expected = data.dinosaurs.filter((dinosaur) => dinosaur.periodId === 3);

      expect(res.body.data).toHaveLength(expected.length);
      expect(res.body.meta.total).toBe(expected.length);
      for (const dinosaur of res.body.data) {
        expect(dinosaur.periodId).toBe(3);
      }
    });

    it('filtra por formationId em campo array', async () => {
      const res = await request(app).get('/api/dinosaurs?formationId=1&limit=100');
      const expected = data.dinosaurs.filter((dinosaur) =>
        dinosaur.formationId.includes(1)
      );

      expect(res.body.data).toHaveLength(expected.length);
      for (const dinosaur of res.body.data) {
        expect(dinosaur.formationId).toContain(1);
      }
    });

    it('filtra por countryId em campo array', async () => {
      const res = await request(app).get('/api/dinosaurs?countryId=1&limit=100');
      const expected = data.dinosaurs.filter((dinosaur) =>
        dinosaur.countryId.includes(1)
      );

      expect(res.body.data).toHaveLength(expected.length);
      for (const dinosaur of res.body.data) {
        expect(dinosaur.countryId).toContain(1);
      }
    });

    it('aceita zeros à esquerda em filtros de relacionamento', async () => {
      const comZero = await request(app).get('/api/dinosaurs?periodId=01&limit=100');
      const semZero = await request(app).get('/api/dinosaurs?periodId=1&limit=100');

      expect(comZero.statusCode).toBe(200);
      expect(comZero.body.meta.total).toBe(semZero.body.meta.total);
      expect(ids(comZero.body.data)).toEqual(ids(semZero.body.data));
      expect(comZero.body.meta.total).toBeGreaterThan(0);
    });

    it('aceita zeros à esquerda em filtros de campo array', async () => {
      const comZero = await request(app).get('/api/dinosaurs?countryId=01&limit=100');
      const semZero = await request(app).get('/api/dinosaurs?countryId=1&limit=100');

      expect(comZero.statusCode).toBe(200);
      expect(ids(comZero.body.data)).toEqual(ids(semZero.body.data));
      expect(comZero.body.meta.total).toBeGreaterThan(0);
    });

    it('filtra por limites numéricos', async () => {
      const res = await request(app).get(
        '/api/dinosaurs?lengthMin=10&lengthMax=15&limit=100'
      );
      const expected = data.dinosaurs.filter(
        (dinosaur) => dinosaur.length >= 10 && dinosaur.length <= 15
      );

      expect(res.body.data).toHaveLength(expected.length);
      for (const dinosaur of res.body.data) {
        expect(dinosaur.length).toBeGreaterThanOrEqual(10);
        expect(dinosaur.length).toBeLessThanOrEqual(15);
      }
    });

    it('combina múltiplos filtros', async () => {
      const res = await request(app).get(
        '/api/dinosaurs?periodId=3&dietId=1&limit=100'
      );

      for (const dinosaur of res.body.data) {
        expect(dinosaur.periodId).toBe(3);
        expect(dinosaur.dietId).toBe(1);
      }
    });

    it('ignora parâmetros desconhecidos', async () => {
      const res = await request(app).get('/api/dinosaurs?parametroInexistente=abc&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(5);
    });

    it('filtro sem correspondência retorna lista vazia e meta coerente', async () => {
      const res = await request(app).get('/api/dinosaurs?periodId=1&familyId=1');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
      expect(res.body.meta.totalPages).toBe(0);
    });
  });

  describe('Busca textual', () => {
    it('busca sem diferenciar maiúsculas de minúsculas', async () => {
      const res = await request(app).get('/api/dinosaurs?search=REX&limit=100');
      const expected = data.dinosaurs.filter((dinosaur) =>
        ['name', 'scientificName', 'description'].some((field) =>
          dinosaur[field].toLowerCase().includes('rex')
        )
      );

      expect(res.body.data).toHaveLength(expected.length);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('busca parcial no nome científico', async () => {
      const res = await request(app).get('/api/dinosaurs?search=saurus&limit=100');
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const dinosaur of res.body.data) {
        const haystack = [
          dinosaur.name,
          dinosaur.scientificName,
          dinosaur.description
        ].join(' ').toLowerCase();
        expect(haystack).toContain('saurus');
      }
    });

    it('busca sem resultado retorna lista vazia', async () => {
      const res = await request(app).get('/api/dinosaurs?search=zzzznaoexiste');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it('combina busca e filtro', async () => {
      const res = await request(app).get('/api/dinosaurs?search=rex&periodId=3&limit=100');
      for (const dinosaur of res.body.data) {
        expect(dinosaur.periodId).toBe(3);
      }
    });
  });

  describe('GET /api/dinosaurs/random', () => {
    it('retorna um único dinossauro por padrão', async () => {
      const res = await request(app).get('/api/dinosaurs/random');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(false);
      expect(typeof res.body.data.id).toBe('number');
      expect(res.body.meta.count).toBe(1);
    });

    it('retorna a quantidade solicitada sem repetir', async () => {
      const res = await request(app).get('/api/dinosaurs/random?limit=5');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(5);
      expect(res.body.meta.count).toBe(5);
      expect(new Set(ids(res.body.data)).size).toBe(5);
    });

    it('aceita o limite máximo de 50 sem repetir', async () => {
      const res = await request(app).get('/api/dinosaurs/random?limit=50');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(50);
      expect(new Set(ids(res.body.data)).size).toBe(50);
    });

    it('aceita zeros à esquerda', async () => {
      const res = await request(app).get('/api/dinosaurs/random?limit=05');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(5);
    });

    it('aceita zeros à esquerda no limite máximo', async () => {
      const res = await request(app).get('/api/dinosaurs/random?limit=050');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(50);
      expect(new Set(ids(res.body.data)).size).toBe(50);
    });

    it('todos os itens retornados existem na base', async () => {
      const known = new Set(ids(data.dinosaurs));
      const res = await request(app).get('/api/dinosaurs/random?limit=20');
      for (const dinosaur of res.body.data) {
        expect(known.has(dinosaur.id)).toBe(true);
      }
    });
  });

  describe('GET /api/dinosaurs/name/:name', () => {
    it('busca por nome sem diferenciar maiúsculas', async () => {
      const lower = await request(app).get('/api/dinosaurs/name/rex');
      const upper = await request(app).get('/api/dinosaurs/name/REX');

      expect(lower.statusCode).toBe(200);
      expect(lower.body.data.length).toBeGreaterThan(0);
      expect(upper.body.data.map((dinosaur) => dinosaur.id)).toEqual(
        lower.body.data.map((dinosaur) => dinosaur.id)
      );
    });

    it('retorna 404 quando não encontra o nome', async () => {
      const res = await request(app).get('/api/dinosaurs/name/nao-existe-zzz');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Nenhum dinossauro encontrado com esse nome.'
      });
    });

    it('rejeita nome acima de 100 caracteres', async () => {
      const res = await request(app).get(`/api/dinosaurs/name/${'a'.repeat(101)}`);
      expect(res.statusCode).toBe(400);
    });

    it('não é confundido com a rota de ID', async () => {
      const res = await request(app).get('/api/dinosaurs/name/rex');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/dinosaurs/:id', () => {
    it('retorna o dinossauro e os dados de imagem', async () => {
      const res = await request(app).get('/api/dinosaurs/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.name).toBe('Tyrannosaurus Rex');
      expect(res.body.data).toHaveProperty('imagem');
      expect(res.body.data).toHaveProperty('thumbnail');
    });

    it('aceita zero à esquerda', async () => {
      const res = await request(app).get('/api/dinosaurs/001');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('retorna 404 para ID inexistente', async () => {
      const res = await request(app).get('/api/dinosaurs/9999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Dinossauro não encontrado.'
      });
    });
  });

  describe('GET /api/dinosaurs/:id/images', () => {
    it('retorna imagens do dinossauro com metadados', async () => {
      const res = await request(app).get('/api/dinosaurs/1/images');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.dinosaurId).toBe(1);
      expect(res.body.meta.total).toBe(res.body.data.length);
      for (const image of res.body.data) {
        expect(image.dinosaurId).toBe(1);
      }
    });

    it('retorna 404 para dinossauro inexistente', async () => {
      const res = await request(app).get('/api/dinosaurs/9999/images');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Dinossauro não encontrado.'
      });
    });
  });
});
