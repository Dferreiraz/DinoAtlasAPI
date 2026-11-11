/**
 * rateLimitKey.js
 * Deriva a chave do rate limiter a partir de fontes confiáveis.
 *
 * O tráfego público é identificado exclusivamente por `CF-Connecting-IP`,
 * definido/sobrescrito pela borda Cloudflare gerenciada pela Render.
 * `X-Forwarded-For`, `X-Real-IP`, `Forwarded`, `req.ip` e `req.ips` não são
 * usados como fallback.
 *
 * Ausência, duplicidade ou valor inválido resulta na chave compartilhada
 * `unidentified` (fail-closed), sem permitir que o cliente escolha um bucket.
 */

const net = require('node:net');
const { ipKeyGenerator } = require('express-rate-limit');

const CF_CONNECTING_IP_HEADER = 'cf-connecting-ip';
const UNIDENTIFIED_KEY = 'unidentified';
const MAX_IP_LENGTH = 64;

/**
 * Conta quantas vezes `CF-Connecting-IP` aparece em `req.rawHeaders`.
 *
 * O Node pode combinar headers duplicados em `req.headers` com `, `, por isso
 * a contagem bruta é feita separadamente. Retorna `null` quando `rawHeaders`
 * não está disponível (por exemplo, em um objeto de requisição sintético).
 *
 * @param {unknown} rawHeaders
 * @returns {number|null}
 */
const countRawHeaderOccurrences = (rawHeaders) => {
  if (!Array.isArray(rawHeaders)) return null;

  let occurrences = 0;

  for (let index = 0; index + 1 < rawHeaders.length; index += 2) {
    const name = rawHeaders[index];

    if (typeof name === 'string' && name.toLowerCase() === CF_CONNECTING_IP_HEADER) {
      occurrences += 1;
    }
  }

  return occurrences;
};

/**
 * Valida e normaliza um IP recebido em `CF-Connecting-IP`.
 *
 * - aceita apenas string;
 * - remove espaços externos;
 * - rejeita vazio, tamanho acima de 64, vírgula e `%` (zone id);
 * - exige `net.isIP() !== 0` antes de chamar `ipKeyGenerator`;
 * - IPv4 é preservado;
 * - IPv6 é agregado em `/56` pela própria biblioteca;
 * - IPv4 mapeado em IPv6 é convertido para o IPv4 canônico.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
const normalizeClientIp = (value) => {
  if (typeof value !== 'string') return null;

  const candidate = value.trim();

  if (!candidate || candidate.length > MAX_IP_LENGTH) return null;
  if (candidate.includes(',') || candidate.includes('%')) return null;
  if (net.isIP(candidate) === 0) return null;

  try {
    return ipKeyGenerator(candidate);
  } catch {
    return null;
  }
};

/**
 * Cria o `keyGenerator` do `express-rate-limit`.
 *
 * A chave é sempre uma de:
 * - IP público normalizado (`rateLimitKeySource = 'public'`);
 * - `unidentified` (`rateLimitKeySource = 'unidentified'`).
 *
 * @returns {(req: import('express').Request) => string}
 */
const createRateLimitKeyGenerator = () => (req) => {
  const request = req || {};
  const headers = request.headers || {};
  const occurrences = countRawHeaderOccurrences(request.rawHeaders);
  const value = headers[CF_CONNECTING_IP_HEADER];

  // `rawHeaders` disponível e diferente de exatamente uma ocorrência significa
  // header ausente ou duplicado. Em ambos os casos a chave é compartilhada.
  if (occurrences !== null && occurrences !== 1) {
    request.rateLimitKeySource = 'unidentified';
    return UNIDENTIFIED_KEY;
  }

  // Defesa extra: `cf-connecting-ip` não é um header de array no Node, mas um
  // objeto sintético poderia fornecer múltiplos valores.
  if (Array.isArray(value)) {
    request.rateLimitKeySource = 'unidentified';
    return UNIDENTIFIED_KEY;
  }

  const normalized = normalizeClientIp(value);

  if (normalized === null) {
    request.rateLimitKeySource = 'unidentified';
    return UNIDENTIFIED_KEY;
  }

  request.rateLimitKeySource = 'public';
  return normalized;
};

module.exports = {
  CF_CONNECTING_IP_HEADER,
  UNIDENTIFIED_KEY,
  MAX_IP_LENGTH,
  countRawHeaderOccurrences,
  normalizeClientIp,
  createRateLimitKeyGenerator
};
