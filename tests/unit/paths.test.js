const fs = require('fs');
const path = require('path');
const {
  SERVER_ROOT,
  PROJECT_ROOT,
  DATABASE_DIR,
  PUBLIC_DIR,
  databasePath
} = require('../../server/utils/paths');

describe('utils/paths', () => {
  it('resolve caminhos absolutos', () => {
    for (const value of [SERVER_ROOT, PROJECT_ROOT, DATABASE_DIR, PUBLIC_DIR]) {
      expect(path.isAbsolute(value)).toBe(true);
    }
  });

  it('aponta para diretórios existentes do projeto', () => {
    expect(fs.statSync(SERVER_ROOT).isDirectory()).toBe(true);
    expect(fs.statSync(PROJECT_ROOT).isDirectory()).toBe(true);
    expect(fs.statSync(DATABASE_DIR).isDirectory()).toBe(true);
    expect(fs.statSync(PUBLIC_DIR).isDirectory()).toBe(true);
  });

  it('não depende do diretório de trabalho', () => {
    const originalCwd = process.cwd();
    try {
      process.chdir(require('os').tmpdir());
      const paths = require('../../server/utils/paths');
      expect(fs.existsSync(paths.databasePath('dinosaurs.json'))).toBe(true);
      expect(fs.existsSync(path.join(paths.PUBLIC_DIR, 'index.html'))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('databasePath monta o caminho absoluto dentro de server/database', () => {
    const file = databasePath('dinosaurs.json');
    expect(path.isAbsolute(file)).toBe(true);
    expect(path.dirname(file)).toBe(DATABASE_DIR);
    expect(path.basename(file)).toBe('dinosaurs.json');
    expect(fs.existsSync(file)).toBe(true);
  });

  it('PUBLIC_DIR termina em public', () => {
    expect(path.basename(PUBLIC_DIR)).toBe('public');
  });

  it('SERVER_ROOT termina em server', () => {
    expect(path.basename(SERVER_ROOT)).toBe('server');
  });
});
