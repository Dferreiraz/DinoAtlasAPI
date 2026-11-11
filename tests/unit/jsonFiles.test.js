const fs = require('fs');
const fsp = require('fs').promises;
const os = require('os');
const path = require('path');
const readJson = require('../../server/utils/readJson');
const writeJson = require('../../server/utils/writeJson');
const jsonRepository = require('../../server/repositories/jsonRepository');
const { AppError } = require('../../server/utils/errors');

describe('utils/readJson e utils/writeJson', () => {
  let dir;

  beforeEach(() => {
    jsonRepository.clearCache();
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dinoatlas-json-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  describe('writeJson', () => {
    it('grava JSON com indentação de 2 espaços', async () => {
      const file = path.join(dir, 'out.json');
      const data = [{ id: 1, name: 'Teste' }];

      await writeJson(file, data);

      const raw = await fsp.readFile(file, 'utf8');
      expect(raw).toBe(JSON.stringify(data, null, 2));
      expect(JSON.parse(raw)).toEqual(data);
    });

    it('sobrescreve arquivos existentes', async () => {
      const file = path.join(dir, 'out.json');
      await writeJson(file, { version: 1 });
      await writeJson(file, { version: 2 });
      expect(JSON.parse(await fsp.readFile(file, 'utf8'))).toEqual({ version: 2 });
    });

    it('lança AppError FILE_WRITE_FAILED quando o diretório não existe', async () => {
      const file = path.join(dir, 'nao-existe', 'out.json');
      await expect(writeJson(file, { a: 1 })).rejects.toMatchObject({
        name: 'AppError',
        code: 'FILE_WRITE_FAILED'
      });
    });

    it('invalida o cache do repositório após escrever', async () => {
      const file = path.join(dir, 'cached.json');
      await fsp.writeFile(file, JSON.stringify([{ id: 1 }]), 'utf8');

      expect(await jsonRepository.getJson(file)).toEqual([{ id: 1 }]);

      await writeJson(file, [{ id: 2 }]);

      expect(await jsonRepository.getJson(file)).toEqual([{ id: 2 }]);
    });

    it('mantém a causa original do erro de escrita', async () => {
      const file = path.join(dir, 'nao-existe', 'out.json');
      try {
        await writeJson(file, { a: 1 });
        throw new Error('deveria ter falhado');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.cause).toBeDefined();
        expect(error.cause.code).toBe('ENOENT');
      }
    });
  });

  describe('readJson', () => {
    it('lê e converte um arquivo JSON válido', async () => {
      const file = path.join(dir, 'in.json');
      const data = [{ id: 1 }, { id: 2 }];
      await fsp.writeFile(file, JSON.stringify(data), 'utf8');

      await expect(readJson(file)).resolves.toEqual(data);
    });

    it('aceita caminho relativo resolvido a partir do cwd do processo', async () => {
      const file = path.join(dir, 'relative.json');
      await fsp.writeFile(file, '{"ok":true}', 'utf8');
      const relative = path.relative(process.cwd(), file);

      await expect(readJson(relative)).resolves.toEqual({ ok: true });
    });

    it('lança AppError FILE_NOT_FOUND para arquivo inexistente', async () => {
      const file = path.join(dir, 'missing.json');
      await expect(readJson(file)).rejects.toMatchObject({
        name: 'AppError',
        code: 'FILE_NOT_FOUND'
      });
    });

    it('lança AppError INVALID_JSON para conteúdo malformado', async () => {
      const file = path.join(dir, 'broken.json');
      await fsp.writeFile(file, '{ "id": 1,', 'utf8');

      await expect(readJson(file)).rejects.toMatchObject({
        name: 'AppError',
        code: 'INVALID_JSON'
      });
    });

    it('mantém a causa original do erro de parse', async () => {
      const file = path.join(dir, 'broken.json');
      await fsp.writeFile(file, 'not json', 'utf8');

      try {
        await readJson(file);
        throw new Error('deveria ter falhado');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.cause).toBeDefined();
        expect(error.cause.name).toBe('SyntaxError');
      }
    });

    it('lança AppError FILE_READ_FAILED para falhas de leitura diferentes de ENOENT', async () => {
      const fsp = require('fs').promises;
      const spy = jest.spyOn(fsp, 'readFile').mockRejectedValue(
        Object.assign(new Error('permissão negada'), { code: 'EACCES' })
      );

      try {
        await expect(readJson(path.join(dir, 'qualquer.json'))).rejects.toMatchObject({
          name: 'AppError',
          code: 'FILE_READ_FAILED'
        });
      } finally {
        spy.mockRestore();
      }
    });

    it('não altera o arquivo lido', async () => {
      const file = path.join(dir, 'readonly.json');
      const raw = '{"id":1}';
      await fsp.writeFile(file, raw, 'utf8');

      await readJson(file);

      expect(await fsp.readFile(file, 'utf8')).toBe(raw);
    });
  });
});
