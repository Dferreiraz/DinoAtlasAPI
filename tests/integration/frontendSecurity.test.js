const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { createTestApp } = require('../helpers/app');
const { PROJECT_ROOT } = require('../helpers/fixtures');

const app = createTestApp();

const readProjectFile = (relativePath) => fs.readFileSync(
  path.join(PROJECT_ROOT, relativePath),
  'utf8'
);

const INLINE_HANDLER = /\son(?:error|click|load|change|submit|input|keydown)\s*=/i;
const INLINE_STYLE = /\sstyle\s*=/i;
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>/i;
const INLINE_STYLE_BLOCK = /<style[\s>]/i;

describe('Segurança do frontend', () => {
  it.each([
    'public/src/js/script.js',
    'public/src/js/documentacao.js'
  ])('%s não usa APIs de inserção de HTML', (file) => {
    const script = readProjectFile(file);

    expect(script).not.toMatch(/innerHTML|insertAdjacentHTML|outerHTML|document\.write/);
  });

  it.each([
    'public/index.html',
    'public/src/page/documentacao.html'
  ])('%s não usa handlers, estilos ou scripts inline', (file) => {
    const html = readProjectFile(file);

    expect(html).not.toMatch(INLINE_HANDLER);
    expect(html).not.toMatch(INLINE_STYLE);
    expect(html).not.toMatch(INLINE_SCRIPT);
    expect(html).not.toMatch(INLINE_STYLE_BLOCK);
  });

  it('não usa fallbacks fixos para totais da interface', () => {
    const script = readProjectFile('public/src/js/script.js');

    expect(script).not.toMatch(/\|\|\s*50\b/);
    expect(script).not.toMatch(/\|\|\s*18\b/);
    expect(script).not.toMatch(/totalEndpoints"\)\.textContent\s*=\s*18/);
  });

  it('a CSP não permite unsafe-inline para script ou style', async () => {
    const res = await request(app).get('/api/status');
    const csp = res.headers['content-security-policy'];

    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain("'unsafe-inline'");
  });
});
