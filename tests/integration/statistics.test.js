const request = require('supertest');
const { createTestApp } = require('../helpers/app');
const { data } = require('../helpers/fixtures');

const app = createTestApp();

const distinct = (values) => new Set(
  values.filter((value) => value !== undefined && value !== null)
).size;

const countryIds = data.dinosaurs.flatMap((dinosaur) => (
  Array.isArray(dinosaur.countryId) ? dinosaur.countryId : [dinosaur.countryId]
));

const tableTotals = [
  ['totalDinosaurs', data.dinosaurs.length],
  ['totalFamilies', data.families.length],
  ['totalPeriods', data.periods.length],
  ['totalContinents', data.continents.length],
  ['totalCountries', data.countries.length],
  ['totalDiscoveries', data.discoveries.length]
];

const usageTotals = [
  ['families', distinct(data.dinosaurs.map((dinosaur) => dinosaur.familyId))],
  ['periods', distinct(data.dinosaurs.map((dinosaur) => dinosaur.periodId))],
  ['continents', distinct(data.dinosaurs.map((dinosaur) => dinosaur.continentId))],
  ['countries', distinct(countryIds)]
];

const getStatistics = () => request(app).get('/api/statistics');

describe('GET /api/statistics', () => {
  it.each(tableTotals)('%s conta os registros reais da tabela', async (metric, expected) => {
    const res = await getStatistics();

    expect(res.statusCode).toBe(200);
    expect(res.body.data[metric]).toBe(expected);
  });

  it.each(usageTotals)('usage.%s conta apenas valores distintos referenciados', async (metric, expected) => {
    const res = await getStatistics();

    expect(res.statusCode).toBe(200);
    expect(res.body.data.usage[metric]).toBe(expected);
  });

  it('totalFamilies reflete a tabela, incluindo famílias legadas não usadas', async () => {
    const res = await getStatistics();

    expect(res.body.data.totalFamilies).toBe(data.families.length);
    expect(res.body.data.usage.families).toBeLessThan(res.body.data.totalFamilies);
  });

  it('conta countryId escalar e array sem duplicar valores', async () => {
    const res = await getStatistics();

    expect(res.body.data.totalCountries).toBe(data.countries.length);
    expect(res.body.data.usage.countries).toBe(new Set(countryIds).size);
  });

  it('trata countryId escalar em usage.countries', async () => {
    const repository = require('../../server/repositories/jsonRepository');
    const spy = jest.spyOn(repository, 'getDatabase').mockImplementation((filename) => {
      if (filename === 'dinosaurs.json') {
        return Promise.resolve([{ countryId: 5 }, { countryId: [5, 6] }]);
      }
      return Promise.resolve([]);
    });

    try {
      const res = await getStatistics();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalCountries).toBe(0);
      expect(res.body.data.usage.countries).toBe(2);
    } finally {
      spy.mockRestore();
    }
  });
});
