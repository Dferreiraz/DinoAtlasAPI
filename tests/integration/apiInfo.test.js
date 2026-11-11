const request = require('supertest');
const { createTestApp } = require('../helpers/app');
const { data } = require('../helpers/fixtures');
const packageJson = require('../../package.json');
const metadata = require('../../server/database/metadata.json');
const routes = require('../../server/routes');
const { countGetRoutes } = require('../../server/utils/endpoints');

const app = createTestApp();
const expectedEndpointCount = countGetRoutes(routes.stack);

const distinct = (values) => new Set(
  values.filter((value) => value !== undefined && value !== null)
).size;

const countryIds = data.dinosaurs.flatMap((dinosaur) => (
  Array.isArray(dinosaur.countryId) ? dinosaur.countryId : [dinosaur.countryId]
));

describe('GET /api e endpoints informativos', () => {
  it('GET /api retorna metadados da API', async () => {
    const res = await request(app).get('/api');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: metadata.apiName,
      version: packageJson.version,
      description: metadata.description,
      status: metadata.status,
      author: metadata.author,
      github: metadata.github,
      lastUpdate: metadata.lastUpdate,
      totalEndpoints: expectedEndpointCount
    });
    expect(res.body.data.totalDinosaurs).toBe(data.dinosaurs.length);
  });

  it('GET /api usa a versão de package.json como fonte de verdade', async () => {
    const res = await request(app).get('/api');

    expect(res.body.data.version).toBe(packageJson.version);
    expect(res.body.data.totalEndpoints).toBe(expectedEndpointCount);
    expect(expectedEndpointCount).toBeGreaterThan(0);
  });

  it('GET /api/status retorna status online, versão e uptime', async () => {
    const res = await request(app).get('/api/status');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('online');
    expect(res.body.data.version).toBe(packageJson.version);
    expect(typeof res.body.data.uptime).toBe('number');
    expect(Number.isNaN(Date.parse(res.body.data.timestamp))).toBe(false);
  });

  it('GET /health retorna um health check operacional', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      status: 'ok',
      version: packageJson.version
    });
    expect(typeof res.body.data.uptime).toBe('number');
    expect(Number.isNaN(Date.parse(res.body.data.timestamp))).toBe(false);
  });

  it('GET /api/statistics retorna totais de registros e relações usadas', async () => {
    const res = await request(app).get('/api/statistics');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      totalDinosaurs: data.dinosaurs.length,
      totalFamilies: data.families.length,
      totalPeriods: data.periods.length,
      totalContinents: data.continents.length,
      totalCountries: data.countries.length,
      totalDiscoveries: data.discoveries.length,
      usage: {
        families: distinct(data.dinosaurs.map((dinosaur) => dinosaur.familyId)),
        periods: distinct(data.dinosaurs.map((dinosaur) => dinosaur.periodId)),
        continents: distinct(data.dinosaurs.map((dinosaur) => dinosaur.continentId)),
        countries: distinct(countryIds)
      }
    });
  });

  it('GET /api com barra final também funciona', async () => {
    const res = await request(app).get('/api/');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
