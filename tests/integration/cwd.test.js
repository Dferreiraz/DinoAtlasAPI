const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const request = require('supertest');
const { createTestApp } = require('../helpers/app');

const app = createTestApp();

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const SUPERTEST_PATH = require.resolve('supertest');
const CREATE_APP_PATH = path.join(PROJECT_ROOT, 'server', 'createApp.js');
const PATHS_PATH = path.join(PROJECT_ROOT, 'server', 'utils', 'paths.js');

const runFrom = (cwd, script) => spawnSync(process.execPath, ['-e', script], {
  cwd,
  encoding: 'utf8',
  env: process.env,
  timeout: 30000
});

describe('Independência do diretório de trabalho', () => {
  const runAppScenario = (cwd) => {
    const script = `
      const request = require(${JSON.stringify(SUPERTEST_PATH)});
      const createApp = require(${JSON.stringify(CREATE_APP_PATH)});
      const app = createApp({ rateLimiter: false });
      Promise.all([
        request(app).get('/api/dinosaurs/1'),
        request(app).get('/api/statistics'),
        request(app).get('/src/css/style.css'),
        request(app).get('/')
      ]).then(([dinosaur, statistics, css, home]) => {
        process.stdout.write('RESULT' + JSON.stringify({
          dinosaurStatus: dinosaur.statusCode,
          dinosaurId: dinosaur.body.data && dinosaur.body.data.id,
          statisticsStatus: statistics.statusCode,
          totalDinosaurs: statistics.body.data && statistics.body.data.totalDinosaurs,
          cssStatus: css.statusCode,
          cssType: css.headers['content-type'],
          homeStatus: home.statusCode,
          homeType: home.headers['content-type']
        }));
      }).catch((error) => {
        process.stderr.write(String(error && error.stack));
        process.exit(1);
      });
    `;

    return runFrom(cwd, script);
  };

  it.each([
    ['raiz do projeto', PROJECT_ROOT],
    ['diretório pai do projeto', path.dirname(PROJECT_ROOT)],
    ['diretório temporário', os.tmpdir()]
  ])('a aplicação e os arquivos estáticos funcionam a partir da %s', (label, cwd) => {
    const result = runAppScenario(cwd);
    expect({ label, status: result.status }).toEqual({ label, status: 0 });

    const match = /RESULT(\{.*\})/.exec(result.stdout);
    expect(match).not.toBeNull();
    expect(JSON.parse(match[1])).toEqual({
      dinosaurStatus: 200,
      dinosaurId: 1,
      statisticsStatus: 200,
      totalDinosaurs: 100,
      cssStatus: 200,
      cssType: expect.stringContaining('text/css'),
      homeStatus: 200,
      homeType: expect.stringContaining('text/html')
    });
  });

  it('os caminhos resolvidos apontam para o projeto mesmo a partir de outro diretório', () => {
    const script = `
      const fs = require('fs');
      const paths = require(${JSON.stringify(PATHS_PATH)});
      process.stdout.write('RESULT' + JSON.stringify({
        projectRoot: paths.PROJECT_ROOT,
        hasDinosaurs: fs.existsSync(paths.databasePath('dinosaurs.json')),
        hasIndex: fs.existsSync(paths.PUBLIC_DIR + '/index.html')
      }));
    `;

    const result = runFrom(os.tmpdir(), script);
    expect(result.status).toBe(0);
    const match = /RESULT(\{.*\})/.exec(result.stdout);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match[1]);
    expect(parsed.projectRoot).toBe(PROJECT_ROOT);
    expect(parsed.hasDinosaurs).toBe(true);
    expect(parsed.hasIndex).toBe(true);
  });

  it('a instância em processo também responde a partir do cwd atual', async () => {
    const res = await request(app).get('/api/formations/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(1);
  });
});
