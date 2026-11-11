const {
  data,
  PROJECT_ROOT
} = require('../helpers/fixtures');
const {
  ORPHAN_FORMATION_REFERENCES,
  FORMATION_PERIOD_MISMATCHES,
  FORMATION_COUNTRY_MISMATCHES,
  DUPLICATE_FAMILY_NAMES,
  LEGACY_FAMILY_IDS
} = require('./integrity-allowlist');

const byId = (records) => new Map(records.map((record) => [record.id, record]));
const idsOf = (records) => new Set(records.map((record) => record.id));
const key = (dinosaurId, formationId) => `${dinosaurId}:${formationId}`;

const tables = {
  dinosaurs: data.dinosaurs,
  discoveries: data.discoveries,
  images: data.images,
  periods: data.periods,
  epochs: data.epochs,
  formations: data.formations,
  continents: data.continents,
  countries: data.countries,
  habitats: data.habitats,
  diets: data.diets,
  families: data.families,
  clades: data.clades,
  classifications: data.classifications,
  museums: data.museums
};

describe('Integridade dos dados JSON', () => {
  describe('Estrutura geral', () => {
    it.each(Object.keys(tables))('%s é um array não vazio de objetos com ID único', (name) => {
      const records = tables[name];
      expect(Array.isArray(records)).toBe(true);
      expect(records.length).toBeGreaterThan(0);

      const ids = [];
      for (const record of records) {
        expect(record).not.toBeNull();
        expect(typeof record).toBe('object');
        expect(Array.isArray(record)).toBe(false);
        expect(Number.isSafeInteger(record.id)).toBe(true);
        expect(record.id).toBeGreaterThan(0);
        ids.push(record.id);
      }

      expect(new Set(ids).size).toBe(ids.length);
    });

    it('mantém os totais esperados da base atual', () => {
      expect(tables.dinosaurs).toHaveLength(100);
      expect(tables.discoveries).toHaveLength(100);
      expect(tables.images).toHaveLength(100);
      expect(tables.formations).toHaveLength(16);
      expect(tables.families).toHaveLength(25);
      expect(tables.periods).toHaveLength(3);
      expect(tables.epochs).toHaveLength(5);
      expect(tables.countries).toHaveLength(17);
      expect(tables.continents).toHaveLength(7);
    });
  });

  describe('Tipos e campos obrigatórios de dinossauros', () => {
    const stringFields = [
      'name',
      'scientificName',
      'meaning',
      'species',
      'genus',
      'status',
      'description'
    ];
    const numberFields = ['length', 'height', 'weight', 'estimatedSpeed'];
    const integerFields = [
      'classificationId',
      'cladeId',
      'familyId',
      'periodId',
      'epochId',
      'dietId',
      'habitatId',
      'continentId',
      'discoveryId',
      'museumId',
      'imageId'
    ];
    const stringArrayFields = ['characteristics', 'curiosities', 'sources'];

    it.each(tables.dinosaurs.map((dinosaur) => [dinosaur.id, dinosaur]))(
      'dinossauro #%i tem os campos obrigatórios com os tipos corretos',
      (id, dinosaur) => {
        for (const field of stringFields) {
          expect(typeof dinosaur[field]).toBe('string');
          expect(dinosaur[field].trim().length).toBeGreaterThan(0);
        }

        for (const field of numberFields) {
          expect(typeof dinosaur[field]).toBe('number');
          expect(Number.isFinite(dinosaur[field])).toBe(true);
          expect(dinosaur[field]).toBeGreaterThanOrEqual(0);
        }

        for (const field of integerFields) {
          expect(Number.isSafeInteger(dinosaur[field])).toBe(true);
          expect(dinosaur[field]).toBeGreaterThan(0);
        }

        for (const field of ['formationId', 'countryId']) {
          expect(Array.isArray(dinosaur[field])).toBe(true);
          expect(dinosaur[field].length).toBeGreaterThan(0);
          for (const reference of dinosaur[field]) {
            expect(Number.isSafeInteger(reference)).toBe(true);
            expect(reference).toBeGreaterThan(0);
          }
          expect(new Set(dinosaur[field]).size).toBe(dinosaur[field].length);
        }

        for (const field of stringArrayFields) {
          expect(Array.isArray(dinosaur[field])).toBe(true);
          for (const value of dinosaur[field]) {
            expect(typeof value).toBe('string');
          }
        }
      }
    );
  });

  describe('Referências entre entidades', () => {
    const referenceMap = {
      classificationId: 'classifications',
      cladeId: 'clades',
      familyId: 'families',
      periodId: 'periods',
      epochId: 'epochs',
      dietId: 'diets',
      habitatId: 'habitats',
      continentId: 'continents',
      discoveryId: 'discoveries',
      museumId: 'museums',
      imageId: 'images'
    };

    it('todas as referências escalares de dinossauros existem', () => {
      for (const [field, table] of Object.entries(referenceMap)) {
        const ids = idsOf(tables[table]);
        const missing = tables.dinosaurs
          .filter((dinosaur) => !ids.has(dinosaur[field]))
          .map((dinosaur) => `${dinosaur.id}:${field}=${dinosaur[field]}`);

        expect({ field, missing }).toEqual({ field, missing: [] });
      }
    });

    it('todas as referências de countryId existem', () => {
      const countryIds = idsOf(tables.countries);

      const orphanCountries = tables.dinosaurs
        .filter((dinosaur) => dinosaur.countryId.some((id) => !countryIds.has(id)))
        .map((dinosaur) => dinosaur.id);

      expect(orphanCountries).toEqual([]);
    });

    it('as referências das entidades auxiliares existem', () => {
      const periodIds = idsOf(tables.periods);
      const countryIds = idsOf(tables.countries);
      const continentIds = idsOf(tables.continents);
      const museumIds = idsOf(tables.museums);

      expect(tables.epochs.filter((epoch) => !periodIds.has(epoch.periodId))).toEqual([]);
      expect(tables.formations.filter((formation) => !countryIds.has(formation.countryId))).toEqual([]);
      expect(tables.formations.filter((formation) => !periodIds.has(formation.periodId))).toEqual([]);
      expect(tables.countries.filter((country) => !continentIds.has(country.continentId))).toEqual([]);
      expect(tables.museums.filter((museum) => !countryIds.has(museum.countryId))).toEqual([]);
      expect(tables.discoveries.filter((discovery) => !museumIds.has(discovery.museumId))).toEqual([]);
    });

    it('descobertas e imagens são recíprocas aos dinossauros', () => {
      const dinosaurs = byId(tables.dinosaurs);
      const discoveries = byId(tables.discoveries);
      const images = byId(tables.images);

      for (const dinosaur of tables.dinosaurs) {
        const discovery = discoveries.get(dinosaur.discoveryId);
        expect(discovery).toBeDefined();
        expect(discovery.dinosaurId).toBe(dinosaur.id);

        const image = images.get(dinosaur.imageId);
        expect(image).toBeDefined();
        expect(image.dinosaurId).toBe(dinosaur.id);
      }

      for (const discovery of tables.discoveries) {
        expect(dinosaurs.has(discovery.dinosaurId)).toBe(true);
      }
      for (const image of tables.images) {
        expect(dinosaurs.has(image.dinosaurId)).toBe(true);
      }
    });

    it('não há duas imagens atribuídas ao mesmo dinossauro', () => {
      const dinosaurIds = tables.images.map((image) => image.dinosaurId);
      expect(new Set(dinosaurIds).size).toBe(dinosaurIds.length);
    });
  });

  describe('Coerência de épocas e períodos', () => {
    it('cada época pertence a um período existente', () => {
      const periodIds = idsOf(tables.periods);
      for (const epoch of tables.epochs) {
        expect(periodIds.has(epoch.periodId)).toBe(true);
      }
    });

    it('cada dinossauro tem época compatível com o período', () => {
      const epochs = byId(tables.epochs);
      const incompatibilities = [];

      for (const dinosaur of tables.dinosaurs) {
        const epoch = epochs.get(dinosaur.epochId);
        if (!epoch) {
          incompatibilities.push(`${dinosaur.id}:época inexistente`);
        } else if (epoch.periodId !== dinosaur.periodId) {
          incompatibilities.push(
            `${dinosaur.id}: período ${dinosaur.periodId} ≠ época ${epoch.id} (período ${epoch.periodId})`
          );
        }
      }

      expect(incompatibilities).toEqual([]);
    });

    it('mantém os vínculos corrigidos de época para os registros históricos', () => {
      const dinosaurs = byId(tables.dinosaurs);
      const expectations = {
        19: { periodId: 1, epochId: 4 },
        20: { periodId: 1, epochId: 4 },
        35: { periodId: 2, epochId: 5 },
        44: { periodId: 2, epochId: 5 },
        67: { periodId: 1, epochId: 4 },
        73: { periodId: 1, epochId: 4 },
        79: { periodId: 2, epochId: 5 },
        88: { periodId: 1, epochId: 4 },
        98: { periodId: 1, epochId: 4 }
      };

      for (const [id, expected] of Object.entries(expectations)) {
        const dinosaur = dinosaurs.get(Number(id));
        expect(dinosaur).toBeDefined();
        expect({ id: dinosaur.id, periodId: dinosaur.periodId, epochId: dinosaur.epochId })
          .toEqual({ id: Number(id), ...expected });
      }
    });

    it('as épocas adicionadas permanecem nomeadas e vinculadas corretamente', () => {
      const epochs = byId(tables.epochs);

      expect(epochs.get(4)).toMatchObject({
        id: 4,
        name: 'Triássico Superior',
        periodId: 1
      });
      expect(epochs.get(5)).toMatchObject({
        id: 5,
        name: 'Jurássico Inferior',
        periodId: 2
      });
    });
  });

  describe('Coerência geográfica', () => {
    it('o continente do dinossauro coincide com o continente de todos os países listados', () => {
      const countries = byId(tables.countries);
      const mismatches = [];

      for (const dinosaur of tables.dinosaurs) {
        for (const countryId of dinosaur.countryId) {
          const country = countries.get(countryId);
          if (country && country.continentId !== dinosaur.continentId) {
            mismatches.push(
              `${dinosaur.id}: continente ${dinosaur.continentId} ≠ país ${countryId} (continente ${country.continentId})`
            );
          }
        }
      }

      expect(mismatches).toEqual([]);
    });
  });

  describe('Famílias', () => {
    it('todos os dinossauros apontam para famílias canônicas (não legadas)', () => {
      const legacy = new Set(LEGACY_FAMILY_IDS);
      const invalid = tables.dinosaurs
        .filter((dinosaur) => legacy.has(dinosaur.familyId))
        .map((dinosaur) => dinosaur.id);

      expect(invalid).toEqual([]);
    });

    it('as famílias legadas permanecem na base sem uso', () => {
      const familyIds = idsOf(tables.families);
      const used = new Set(tables.dinosaurs.map((dinosaur) => dinosaur.familyId));

      for (const id of LEGACY_FAMILY_IDS) {
        expect(familyIds.has(id)).toBe(true);
        expect(used.has(id)).toBe(false);
      }
    });

    it('a lista de nomes duplicados corresponde exatamente à allowlist', () => {
      const grouped = new Map();
      for (const family of tables.families) {
        const current = grouped.get(family.name) || [];
        current.push(family.id);
        grouped.set(family.name, current);
      }

      const actual = [...grouped.entries()]
        .filter(([, ids]) => ids.length > 1)
        .map(([name, ids]) => ({ name, ids: [...ids].sort((a, b) => a - b) }))
        .sort((a, b) => a.name.localeCompare(b.name));

      const expected = DUPLICATE_FAMILY_NAMES
        .map(({ name, ids }) => ({ name, ids: [...ids].sort((a, b) => a - b) }))
        .sort((a, b) => a.name.localeCompare(b.name));

      expect(actual).toEqual(expected);
    });
  });

  describe('Allowlist de pendências de formações', () => {
    it('as formações órfãs coincidem exatamente com a allowlist', () => {
      const formationIds = idsOf(tables.formations);
      const actual = [];

      for (const dinosaur of tables.dinosaurs) {
        for (const formationId of dinosaur.formationId) {
          if (!formationIds.has(formationId)) {
            actual.push({
              dinosaurId: dinosaur.id,
              dinosaurName: dinosaur.name,
              formationId
            });
          }
        }
      }

      const expected = ORPHAN_FORMATION_REFERENCES.map(
        ({ dinosaurId, dinosaurName, formationId }) => ({
          dinosaurId,
          dinosaurName,
          formationId
        })
      );

      expect(actual.length).toBe(expected.length);
      expect(new Set(actual.map((entry) => key(entry.dinosaurId, entry.formationId)))).toEqual(
        new Set(expected.map((entry) => key(entry.dinosaurId, entry.formationId)))
      );
    });

    it('as divergências formação × período coincidem exatamente com a allowlist', () => {
      const formations = byId(tables.formations);
      const actual = [];

      for (const dinosaur of tables.dinosaurs) {
        for (const formationId of dinosaur.formationId) {
          const formation = formations.get(formationId);
          if (formation && formation.periodId !== dinosaur.periodId) {
            actual.push(key(dinosaur.id, formationId));
          }
        }
      }

      const expected = FORMATION_PERIOD_MISMATCHES.map((entry) =>
        key(entry.dinosaurId, entry.formationId)
      );

      expect(new Set(actual)).toEqual(new Set(expected));
      expect(actual.length).toBe(expected.length);
    });

    it('as divergências formação × país coincidem exatamente com a allowlist', () => {
      const formations = byId(tables.formations);
      const actual = [];

      for (const dinosaur of tables.dinosaurs) {
        for (const formationId of dinosaur.formationId) {
          const formation = formations.get(formationId);
          if (!formation) continue;
          if (!dinosaur.countryId.includes(formation.countryId)) {
            actual.push(key(dinosaur.id, formationId));
          }
        }
      }

      const expected = FORMATION_COUNTRY_MISMATCHES.map((entry) =>
        key(entry.dinosaurId, entry.formationId)
      );

      expect(new Set(actual)).toEqual(new Set(expected));
      expect(actual.length).toBe(expected.length);
    });

    it('não há entradas obsoletas na allowlist de formações', () => {
      const formations = byId(tables.formations);
      const dinosaurs = byId(tables.dinosaurs);

      for (const entry of ORPHAN_FORMATION_REFERENCES) {
        const dinosaur = dinosaurs.get(entry.dinosaurId);
        expect(dinosaur).toBeDefined();
        expect(dinosaur.name).toBe(entry.dinosaurName);
        expect(formations.has(entry.formationId)).toBe(false);
        expect(dinosaur.formationId).toContain(entry.formationId);
      }

      for (const entry of FORMATION_PERIOD_MISMATCHES) {
        const dinosaur = dinosaurs.get(entry.dinosaurId);
        const formation = formations.get(entry.formationId);
        expect(dinosaur).toBeDefined();
        expect(formation).toBeDefined();
        expect(dinosaur.name).toBe(entry.dinosaurName);
        expect(dinosaur.formationId).toContain(entry.formationId);
        expect(formation.periodId).not.toBe(dinosaur.periodId);
      }

      for (const entry of FORMATION_COUNTRY_MISMATCHES) {
        const dinosaur = dinosaurs.get(entry.dinosaurId);
        const formation = formations.get(entry.formationId);
        expect(dinosaur).toBeDefined();
        expect(formation).toBeDefined();
        expect(dinosaur.name).toBe(entry.dinosaurName);
        expect(dinosaur.formationId).toContain(entry.formationId);
        expect(dinosaur.countryId).toEqual(entry.countryIds);
        expect(dinosaur.countryId).not.toContain(formation.countryId);
      }
    });
  });

  describe('Documentação da integridade', () => {
    it('a allowlist referencia a documentação correspondente', () => {
      const fs = require('fs');
      const path = require('path');
      const docPath = path.join(PROJECT_ROOT, 'docs', 'data-integrity.md');

      expect(fs.existsSync(docPath)).toBe(true);
      const content = fs.readFileSync(docPath, 'utf8');
      expect(content).toContain('allowlist');
      expect(content).toContain('Triássico Superior');
    });
  });
});
