const {
  parseStrictInteger,
  parseStrictNumber,
  isSingleString,
  RELATION_FILTERS,
  NUMERIC_FILTERS,
  DINOSAUR_SORT_FIELDS,
  SORT_ORDERS,
  LIMITS
} = require('../../server/utils/validation');

describe('utils/validation', () => {
  describe('parseStrictInteger', () => {
    it.each([
      ['0', 0],
      ['1', 1],
      ['01', 1],
      ['000123', 123],
      [String(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER]
    ])('aceita o inteiro estrito %p', (input, expected) => {
      expect(parseStrictInteger(input)).toBe(expected);
    });

    it.each([
      ['', 'string vazia'],
      ['abc', 'texto'],
      ['1abc', 'sufixo textual'],
      ['abc1', 'prefixo textual'],
      ['1.5', 'decimal'],
      ['-1', 'negativo'],
      ['+1', 'sinal positivo'],
      [' 1', 'espaço inicial'],
      ['1 ', 'espaço final'],
      ['1e3', 'notação científica'],
      ['0x10', 'hexadecimal'],
      ['1,5', 'vírgula decimal'],
      [String(Number.MAX_SAFE_INTEGER + 1), 'acima do inteiro seguro'],
      [1, 'number em vez de string'],
      [null, 'null'],
      [undefined, 'undefined'],
      [[], 'array'],
      [{}, 'objeto'],
      ['Infinity', 'infinito']
    ])('rejeita %p (%s)', (input) => {
      expect(parseStrictInteger(input)).toBeNull();
    });

    it('respeita os limites mínimo e máximo', () => {
      expect(parseStrictInteger('5', { min: 5, max: 5 })).toBe(5);
      expect(parseStrictInteger('4', { min: 5 })).toBeNull();
      expect(parseStrictInteger('6', { max: 5 })).toBeNull();
      expect(parseStrictInteger('0', { min: 1 })).toBeNull();
    });
  });

  describe('parseStrictNumber', () => {
    it.each([
      ['0', 0],
      ['0.0', 0],
      ['1', 1],
      ['1.5', 1.5],
      ['01.25', 1.25],
      ['000.500', 0.5],
      ['10.000', 10]
    ])('aceita o decimal estrito %p', (input, expected) => {
      expect(parseStrictNumber(input)).toBe(expected);
    });

    it.each([
      ['', 'string vazia'],
      ['abc', 'texto'],
      ['1abc', 'sufixo textual'],
      ['-1', 'negativo'],
      ['+1', 'sinal positivo'],
      [' 1', 'espaço inicial'],
      ['1 ', 'espaço final'],
      ['1.', 'ponto sem casas decimais'],
      ['.5', 'sem parte inteira'],
      ['1,5', 'vírgula decimal'],
      ['1e3', 'notação científica'],
      ['Infinity', 'infinito'],
      ['NaN', 'NaN'],
      [1.5, 'number em vez de string'],
      [null, 'null'],
      [undefined, 'undefined'],
      [[], 'array'],
      [{}, 'objeto']
    ])('rejeita %p (%s)', (input) => {
      expect(parseStrictNumber(input)).toBeNull();
    });

    it('respeita os limites mínimo e máximo', () => {
      expect(parseStrictNumber('0', { min: 0 })).toBe(0);
      expect(parseStrictNumber('0.1', { min: 0.2 })).toBeNull();
      expect(parseStrictNumber('2.5', { max: 2.4 })).toBeNull();
      expect(parseStrictNumber('2.5', { min: 0, max: 2.5 })).toBe(2.5);
    });

    it('rejeita número que transborda para Infinity', () => {
      expect(parseStrictNumber('9'.repeat(400))).toBeNull();
    });
  });

  describe('isSingleString', () => {
    it('aceita apenas string simples', () => {
      expect(isSingleString('a')).toBe(true);
      expect(isSingleString('')).toBe(true);
      expect(isSingleString(['a'])).toBe(false);
      expect(isSingleString(undefined)).toBe(false);
      expect(isSingleString(null)).toBe(false);
      expect(isSingleString(1)).toBe(false);
      expect(isSingleString({})).toBe(false);
    });
  });

  describe('allowlists', () => {
    it('expõe os filtros de relacionamento suportados', () => {
      expect(RELATION_FILTERS).toEqual([
        'periodId',
        'epochId',
        'dietId',
        'continentId',
        'countryId',
        'formationId',
        'familyId',
        'cladeId',
        'habitatId',
        'classificationId',
        'museumId'
      ]);
      expect(Object.isFrozen(RELATION_FILTERS)).toBe(true);
    });

    it('expõe os filtros numéricos suportados', () => {
      expect(NUMERIC_FILTERS).toEqual([
        'lengthMin',
        'lengthMax',
        'weightMin',
        'weightMax',
        'heightMin',
        'heightMax',
        'estimatedSpeedMin',
        'estimatedSpeedMax'
      ]);
      expect(Object.isFrozen(NUMERIC_FILTERS)).toBe(true);
    });

    it('a allowlist de ordenação contém apenas campos reais de dinossauros', () => {
      const { data } = require('../helpers/fixtures');
      const actualFields = new Set(
        data.dinosaurs.flatMap((dinosaur) => Object.keys(dinosaur))
      );

      for (const field of DINOSAUR_SORT_FIELDS) {
        expect(actualFields.has(field)).toBe(true);
      }
      expect(DINOSAUR_SORT_FIELDS).not.toContain('year');
      expect(Object.isFrozen(DINOSAUR_SORT_FIELDS)).toBe(true);
    });

    it('aceita apenas asc e desc como direção', () => {
      expect(SORT_ORDERS).toEqual(['asc', 'desc']);
      expect(Object.isFrozen(SORT_ORDERS)).toBe(true);
    });

    it('declara os limites públicos', () => {
      expect(LIMITS).toEqual({
        MAX_PAGE_SIZE: 100,
        MAX_RANDOM_SIZE: 50,
        MAX_SEARCH_LENGTH: 100
      });
      expect(Object.isFrozen(LIMITS)).toBe(true);
    });
  });
});
