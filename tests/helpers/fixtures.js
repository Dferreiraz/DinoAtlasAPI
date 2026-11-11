const fs = require('fs');
const { databasePath, PROJECT_ROOT } = require('../../server/utils/paths');

const load = (filename) => JSON.parse(fs.readFileSync(databasePath(filename), 'utf8'));

const data = {
  dinosaurs: load('dinosaurs.json'),
  discoveries: load('discoveries.json'),
  images: load('images.json'),
  periods: load('periods.json'),
  epochs: load('epochs.json'),
  formations: load('formations.json'),
  continents: load('continents.json'),
  countries: load('countries.json'),
  habitats: load('habitats.json'),
  diets: load('diets.json'),
  families: load('families.json'),
  clades: load('clades.json'),
  classifications: load('classifications.json'),
  museums: load('museums.json')
};

const RESOURCES = Object.freeze([
  { name: 'periods', endpoint: '/api/periods', count: data.periods.length },
  { name: 'epochs', endpoint: '/api/epochs', count: data.epochs.length },
  { name: 'formations', endpoint: '/api/formations', count: data.formations.length },
  { name: 'continents', endpoint: '/api/continents', count: data.continents.length },
  { name: 'countries', endpoint: '/api/countries', count: data.countries.length },
  { name: 'habitats', endpoint: '/api/habitats', count: data.habitats.length },
  { name: 'diets', endpoint: '/api/diets', count: data.diets.length },
  { name: 'families', endpoint: '/api/families', count: data.families.length },
  { name: 'clades', endpoint: '/api/clades', count: data.clades.length },
  { name: 'classifications', endpoint: '/api/classifications', count: data.classifications.length },
  { name: 'museums', endpoint: '/api/museums', count: data.museums.length },
  { name: 'discoveries', endpoint: '/api/discoveries', count: data.discoveries.length },
  { name: 'dinosaurs', endpoint: '/api/dinosaurs', count: data.dinosaurs.length },
  { name: 'images', endpoint: '/api/images', count: data.images.length }
]);

// Recursos que possuem rota /:id e devem aceitar a mesma matriz de validação.
const ID_RESOURCES = Object.freeze(
  RESOURCES.filter((resource) => resource.name !== 'images')
);

const NESTED_RESOURCES = Object.freeze([
  { name: 'continents', endpoint: '/api/continents/1/dinosaurs' },
  { name: 'countries', endpoint: '/api/countries/1/dinosaurs' },
  { name: 'formations', endpoint: '/api/formations/1/dinosaurs' }
]);

const INVALID_ID_VALUES = Object.freeze([
  'abc',
  '1abc',
  '1.5',
  '-1',
  '0',
  '9007199254740992'
]);

const SAFE_BUT_UNKNOWN_ID = '9007199254740991';
const EXISTING_ID_WITH_LEADING_ZERO = '01';
const NONEXISTENT_ID = '9999';

module.exports = {
  data,
  RESOURCES,
  ID_RESOURCES,
  NESTED_RESOURCES,
  INVALID_ID_VALUES,
  SAFE_BUT_UNKNOWN_ID,
  EXISTING_ID_WITH_LEADING_ZERO,
  NONEXISTENT_ID,
  PROJECT_ROOT
};
