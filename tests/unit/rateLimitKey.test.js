const {
  UNIDENTIFIED_KEY,
  countRawHeaderOccurrences,
  normalizeClientIp,
  createRateLimitKeyGenerator
} = require('../../server/utils/rateLimitKey');

const createReq = ({ headers = {}, rawHeaders } = {}) => {
  const req = { headers };
  if (rawHeaders !== undefined) req.rawHeaders = rawHeaders;
  return req;
};

const keyFor = (req) => createRateLimitKeyGenerator()(req);

describe('utils/rateLimitKey', () => {
  describe('normalizeClientIp', () => {
    it.each([
      ['203.0.113.10', '203.0.113.10'],
      ['  203.0.113.10  ', '203.0.113.10'],
      ['2001:db8:abcd:1200::1', '2001:db8:abcd:1200::/56'],
      ['2001:DB8:ABCD:1200::1', '2001:db8:abcd:1200::/56'],
      ['::ffff:203.0.113.10', '203.0.113.10'],
      ['::203.0.113.10', '203.0.113.10']
    ])('normaliza %p para %p', (value, expected) => {
      expect(normalizeClientIp(value)).toBe(expected);
    });

    it('agrupa endereços IPv6 do mesmo bloco /56 na mesma chave', () => {
      expect(normalizeClientIp('2001:db8:abcd:1200::1'))
        .toBe(normalizeClientIp('2001:db8:abcd:12ff::1'));
    });

    it('separa endereços IPv6 de blocos /56 distintos', () => {
      expect(normalizeClientIp('2001:db8:abcd:1200::1'))
        .not.toBe(normalizeClientIp('2001:db8:abcd:1300::1'));
    });

    it.each([
      ['vazio', ''],
      ['somente espaços', '   '],
      ['texto inválido', 'not-an-ip'],
      ['vírgula', '1.2.3.4, 5.6.7.8'],
      ['zone id', 'fe80::1%eth0'],
      ['CIDR', '2001:db8::1/64'],
      ['porta', '1.2.3.4:443'],
      ['acima de 64 caracteres', 'a'.repeat(65)],
      ['null', null],
      ['undefined', undefined],
      ['número', 123],
      ['array', []],
      ['objeto', {}]
    ])('rejeita %s', (_label, value) => {
      expect(normalizeClientIp(value)).toBeNull();
    });
  });

  describe('countRawHeaderOccurrences', () => {
    it('conta ocorrências sem diferenciar maiúsculas de minúsculas', () => {
      expect(countRawHeaderOccurrences([
        'CF-Connecting-IP', '203.0.113.10',
        'cf-connecting-ip', '203.0.113.11',
        'Host', 'example.test'
      ])).toBe(2);
    });

    it('retorna null quando rawHeaders não é um array', () => {
      expect(countRawHeaderOccurrences(undefined)).toBeNull();
    });
  });

  describe('createRateLimitKeyGenerator', () => {
    it('usa o IP público válido e registra a origem', () => {
      const req = createReq({
        headers: { 'cf-connecting-ip': '203.0.113.10' },
        rawHeaders: ['CF-Connecting-IP', '203.0.113.10']
      });

      expect(keyFor(req)).toBe('203.0.113.10');
      expect(req.rateLimitKeySource).toBe('public');
    });

    it('usa rawHeaders ausente como fallback apenas para objetos sintéticos', () => {
      const req = createReq({ headers: { 'cf-connecting-ip': '203.0.113.10' } });

      expect(keyFor(req)).toBe('203.0.113.10');
      expect(req.rateLimitKeySource).toBe('public');
    });

    it.each([
      ['ausente', {}, ['Host', 'example.test']],
      ['vazio', { 'cf-connecting-ip': '' }, ['CF-Connecting-IP', '']],
      ['somente espaços', { 'cf-connecting-ip': '   ' }, ['CF-Connecting-IP', '   ']],
      ['inválido', { 'cf-connecting-ip': 'not-an-ip' }, ['CF-Connecting-IP', 'not-an-ip']],
      ['com vírgula', { 'cf-connecting-ip': '1.2.3.4, 5.6.7.8' }, ['CF-Connecting-IP', '1.2.3.4, 5.6.7.8']],
      ['com %', { 'cf-connecting-ip': 'fe80::1%eth0' }, ['CF-Connecting-IP', 'fe80::1%eth0']],
      ['acima de 64 caracteres', { 'cf-connecting-ip': 'a'.repeat(65) }, ['CF-Connecting-IP', 'a'.repeat(65)]]
    ])('usa unidentified quando o header está %s', (_label, headers, rawHeaders) => {
      const req = createReq({ headers, rawHeaders });

      expect(keyFor(req)).toBe(UNIDENTIFIED_KEY);
      expect(req.rateLimitKeySource).toBe('unidentified');
    });

    it('usa unidentified quando o header aparece duplicado em rawHeaders', () => {
      const req = createReq({
        headers: { 'cf-connecting-ip': '203.0.113.10, 203.0.113.11' },
        rawHeaders: [
          'CF-Connecting-IP', '203.0.113.10',
          'CF-Connecting-IP', '203.0.113.11'
        ]
      });

      expect(keyFor(req)).toBe(UNIDENTIFIED_KEY);
      expect(req.rateLimitKeySource).toBe('unidentified');
    });

    it('usa unidentified quando o valor normalizado é um array', () => {
      const req = createReq({
        headers: { 'cf-connecting-ip': ['203.0.113.10', '203.0.113.11'] },
        rawHeaders: ['CF-Connecting-IP', '203.0.113.10']
      });

      expect(keyFor(req)).toBe(UNIDENTIFIED_KEY);
      expect(req.rateLimitKeySource).toBe('unidentified');
    });

    it('não recorre a X-Forwarded-For, X-Real-IP ou Forwarded', () => {
      const req = createReq({
        headers: {
          'x-forwarded-for': '198.51.100.1',
          'x-real-ip': '198.51.100.2',
          forwarded: 'for=198.51.100.3'
        },
        rawHeaders: ['Host', 'example.test']
      });

      expect(keyFor(req)).toBe(UNIDENTIFIED_KEY);
      expect(req.rateLimitKeySource).toBe('unidentified');
    });

    it('ignora headers de proxy forjados quando CF-Connecting-IP é válido', () => {
      const req = createReq({
        headers: {
          'cf-connecting-ip': '203.0.113.10',
          'x-forwarded-for': '198.51.100.1',
          'x-real-ip': '198.51.100.2',
          forwarded: 'for=198.51.100.3'
        },
        rawHeaders: ['CF-Connecting-IP', '203.0.113.10']
      });

      expect(keyFor(req)).toBe('203.0.113.10');
      expect(req.rateLimitKeySource).toBe('public');
    });

    it.each([
      ['::ffff:203.0.113.10', 'IPv4 mapeado em IPv6'],
      ['::203.0.113.10', 'IPv4 compatível em IPv6']
    ])('produz a mesma chave para IPv4 e %s', (ipv6) => {
      const ipv4 = createReq({
        headers: { 'cf-connecting-ip': '203.0.113.10' },
        rawHeaders: ['CF-Connecting-IP', '203.0.113.10']
      });
      const mapped = createReq({
        headers: { 'cf-connecting-ip': ipv6 },
        rawHeaders: ['CF-Connecting-IP', ipv6]
      });

      expect(keyFor(mapped)).toBe(keyFor(ipv4));
    });

    it('normaliza IPv6 em maiúsculas para o mesmo bloco /56', () => {
      const lower = createReq({
        headers: { 'cf-connecting-ip': '2001:db8:abcd:1200::1' },
        rawHeaders: ['CF-Connecting-IP', '2001:db8:abcd:1200::1']
      });
      const upper = createReq({
        headers: { 'cf-connecting-ip': '2001:DB8:ABCD:1200::1' },
        rawHeaders: ['CF-Connecting-IP', '2001:DB8:ABCD:1200::1']
      });

      expect(keyFor(upper)).toBe(keyFor(lower));
    });

    it('produz a mesma chave para IPv6 dentro do mesmo /56', () => {
      const first = createReq({
        headers: { 'cf-connecting-ip': '2001:db8:abcd:1200::1' },
        rawHeaders: ['CF-Connecting-IP', '2001:db8:abcd:1200::1']
      });
      const second = createReq({
        headers: { 'cf-connecting-ip': '2001:db8:abcd:12ff::1' },
        rawHeaders: ['CF-Connecting-IP', '2001:db8:abcd:12ff::1']
      });

      expect(keyFor(second)).toBe(keyFor(first));
    });
  });
});
