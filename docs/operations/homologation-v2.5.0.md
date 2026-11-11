# Homologação Técnica — DinoAtlas API v2.5.0

| Campo | Valor |
|---|---|
| Projeto | DinoAtlas API (`dinoatlas`) |
| Versão homologada | **2.5.0** |
| Última versão com tag | 2.4.5 |
| Branch | `develop` |
| Commit | `4ae65442ce31b3caf646c6deb2b5edefaf07aa5b` |
| Upstream | `origin/develop` (`4e1efca`). Refs locais verificadas na análise: `release`/`develop` (`4ae6544`) está **31 commits à frente** e **0 atrás**; `origin/develop` é ancestral. Não é consulta ao servidor remoto |
| Data da consolidação | 2026-11-11 |
| Plataforma homologada | Windows (Linux suspenso) |
| Veredito | **APROVADA COM RESSALVAS** |

> Documento de consolidação. Números e resultados refletem as evidências
> listadas na seção 10.
>
> **Atualização posterior:** a versão 2.5.0 foi disponibilizada sob a MIT
> License e ainda não possui tag Git. Este relatório descreve o estado da
> homologação em 2026-11-11, anterior à disponibilização.
>
> O commit `a9cde675870cff57632ee5af4b0c09081c53f625` (`a9cde67`) representa o
> estado funcional da 2.5.0, com a correção de privacidade do logger, e
> permanece sob MIT. A migração para a PolyForm Noncommercial 1.0.0 será
> efetivada em um commit posterior; a futura tag `2.5.0` apontará para esse
> commit de migração, já sob PolyForm — e não para `a9cde67`. A tag ainda não
> existe. Este relatório histórico é preservado como registro do estado
> homologado, sem alteração retroativa de licenciamento.

**Legenda de evidência**

- **[R]** resultado persistido em arquivo de evidência;
- **[S]** resultado observado em sessão (saída de terminal, não persistida);
- **[H]** informação histórica de sessões anteriores, não versionada.

**Legenda de sinais**

- **Sinal simulado:** `process.emit('SIGTERM')` / `process.emit('SIGINT')`
  dentro do próprio processo do servidor. Exercita a fiação real de
  `server.js` e o handler real, mas **não** é entrega do sistema operacional.
- **Sinal real:** evento entregue pelo SO (console/Ctrl+C) ou terminação
  imposta por `taskkill`.

---

## 1. Identificação do projeto e versão

- **Nome:** DinoAtlas API
- **Descrição:** API REST pública e gratuita para dados estruturados sobre
  dinossauros e informações paleontológicas relacionadas.
- **Autor:** Davi Ferreira
- **Repositório:** https://github.com/Dferreiraz/DinoAtlasAPI
- **Versão em `package.json`:** `2.5.0`
- **Fonte única da versão pública:** `server/utils/version.js` (lê
  `package.json`)
- **`engines.node`:** `>=18.18.0`

Observações de versionamento:

- No momento desta homologação, a `2.5.0` estava **preparada no repositório e
  ainda não havia sido disponibilizada**; o badge do README em `2.4.5` era
  intencional.
- Não existe tag no commit `4ae6544`.
- `server/database/metadata.json` mantém `lastUpdate: 2026-08-30`, anterior a
  esta homologação (pendência de conteúdo, não de infraestrutura).

O commit `4ae6544` (`feat!: refactor API architecture and prepare v2.5.0
release`) contém **124 arquivos alterados, +12.605/−1.316**, incluindo as
correções das auditorias.

---

## 2. Escopo da homologação

**Incluído**

- Auditorias técnicas AUDIT-001 a AUDIT-020 (executadas em sessões
  anteriores; ver seção 4).
- Correções e validações da arquitetura.
- Suíte automatizada completa e testes de integração relacionados.
- Smoke tests de runtime em cópia isolada.
- Privacidade do access logger (query string/fragmento).
- Encerramento gracioso em processo real no Windows.
- Integridade do repositório, dos dados e das dependências de produção.

**Excluído / não validado**

- Homologação em Linux (suspensa por decisão do responsável).
- Entrega real de sinais POSIX no Windows (limitação do SO; ver 8.2).
- Integração real Cloudflare/Render e deploy.
- Testes de carga, performance e segurança ofensiva.
- Cobertura formal (`npm run test:coverage` não foi executado nesta etapa).
- Correção de advisories de dependências de desenvolvimento.

---

## 3. Ambiente e versões

| Item | Valor |
|---|---|
| Sistema operacional | Microsoft Windows NT 10.0.26300.0 |
| Node.js | **v24.18.0** |
| npm | **11.16.0** |
| `core.autocrlf` | `true` |
| `.gitattributes` | `* whitespace=cr-at-eol` |
| Jest | `^30.5.2` |
| Supertest | `^7.3.1` |
| Nodemon | `^3.1.9` |
| Express | `^4.21.2` |
| Helmet | `^8.3.0` |
| CORS | `^2.8.6` |
| express-rate-limit | `^8.7.1` |

Dependências: **4 de produção** e **3 de desenvolvimento**.

> O Node homologado (24) é superior ao mínimo declarado (`>=18.18.0`). O
> comportamento de shutdown entre versões está na seção 11.3.

---

## 4. Auditorias AUDIT-001 a AUDIT-020

O programa de auditoria foi executado em sessões anteriores. **A lista
completa e os pareceres individuais não estão versionados neste repositório.**
A tabela abaixo registra apenas o que possui rastro verificável no código,
nos testes ou na documentação. Nenhuma informação foi inferida ou inventada
para preencher as lacunas. **[H]**

| AUDIT | Tema | Situação | Rastro verificável |
|---|---|---|---|
| AUDIT-002 | Rate limiting: identidade por `CF-Connecting-IP`, request ID antes do limiter, log de 429 sem dados sensíveis | Corrigido e validado | `CHANGELOG.md` §“Rate limiting (AUDIT-002)”; `docs/operations.md`; `tests/integration/rateLimit.test.js` |
| AUDIT-005 | Contrato de erro: remoção do campo `error` | Corrigido (breaking change) | `docs/responses.md:62`; `CHANGELOG.md` §“Breaking Changes 1” |
| AUDIT-006 | Integridade dos dados JSON e allowlist de pendências | Corrigido e documentado | `docs/data-integrity.md`; `tests/data/integrity.test.js` |
| AUDIT-007 | Validação rigorosa de filtros e parâmetros | Corrigido | `docs/filters.md:8`; testes de integração de validação |
| AUDIT-011 | Armazenamento compartilhado do rate limit (MemoryStore local) | **Pendente** | `docs/operations.md:137`; `CHANGELOG.md:143` |
| AUDIT-016 | Deploy, CI e empacotamento | **Pendente** | `docs/operations.md:201` |
| AUDIT-001, 003, 004, 008–010, 012–015, 017–020 | — | **Sem rastro individual versionado** | Evidência histórica das sessões anteriores; não persistida **[H]** |

> **Lacuna de rastreabilidade:** recomenda-se persistir a matriz completa
> AUDIT-001..020 (tema, parecer, arquivos afetados) para auditoria futura.

---

## 5. Testes automatizados

### 5.1 Suíte completa

| Etapa | Suítes | Testes | Falhas | Ignorados | Evidência |
|---|---|---|---|---|---|
| Antes da correção do logger | 38/38 | 890/890 | 0 | 0 | `jest-final.json`; `homolog-20261111-001855/jest.json` **[R]** |
| Depois da correção (repositório) | 38/38 | **902/902** | 0 | 0 | `jest-logger-fix.json` **[R]** |
| Depois da correção (cópia isolada) | 38/38 | **902/902** | 0 | 0 | `homolog-logger-20261111-003550/jest.json` **[R]** |

As três execuções têm `success: true`, 0 suítes pendentes e 0 `todo`.

### 5.2 Evolução de 890 para 902 testes

O total passou de **890** para **902** (+12) exclusivamente pela correção de
privacidade do access logger:

- `tests/unit/logger.test.js` passou de **3** para **15** casos: **+12**.
- Os 12 novos casos se dividem em **6** no middleware `logger` (query string
  com um e com múltiplos parâmetros, token fictício, fragmento, fallback
  quando não há `originalUrl` nem `url`, e caminho sem query string) e **6**
  casos diretos de `sanitizePath` (query string com um e com vários
  parâmetros, fragmento, query string e fragmento juntos, valores
  ausentes/vazios e tipo inesperado).
- Os **3** casos preexistentes (registro de método/caminho/status/duração/
  requestId, fallback para `req.url` e `requestId=N/A`) foram mantidos; o
  primeiro foi ajustado para não esperar query string. Total atual: **15**.
- Nenhum outro arquivo de teste foi alterado, e o número de suítes
  permaneceu em **38** — o crescimento é apenas de casos dentro de uma suíte
  existente.
- Os 890 testes anteriores continuam aprovados; os 902 incluem os 890 mais
  os 12 novos.

### 5.3 Testes direcionados

| Alvo | Resultado | Evidência |
|---|---|---|
| `tests/unit/logger.test.js` | **15/15** | **[S]** |
| Integração `errors`, `controllerErrors`, `fileErrors`, `rateLimit` | **90/90** | **[S]** |
| `tests/unit/gracefulShutdown.test.js` (última etapa) | **6/6** | **[S]** |

Distribuição dos **38** arquivos de teste (suítes): **23** em `tests/unit/`,
**13** em `tests/integration/`, **1** em `tests/data/` e **1** em
`tests/api.test.js` (raiz). Arquivos auxiliares não contabilizados como
suítes: `tests/helpers/app.js`, `tests/helpers/fixtures.js` e
`tests/data/integrity-allowlist.js`.

> **Diferenciação temporal:** apenas `gracefulShutdown` (6/6) foi reexecutado
> na última etapa. As demais execuções são de etapas anteriores e foram
> consideradas válidas, sem repetição.

### 5.4 Cobertura unitária do shutdown

Cenários cobertos: exit 0, idempotência, erro de `close` → exit 1,
`process.exit` padrão, callback tardio ignorado e timeout → exit 1.

---

## 6. Smoke tests

Executados em cópia isolada, em `localhost`, com 61 verificações:

| Etapa | Checks | Resultado |
|---|---|---|
| Antes da correção do logger | 61 | **60/61** — falha: access log registrava query string |
| Depois da correção | 61 | **61/61** |

Cobertura dos checks: `/`, `/health`, `/docs`, `/docs/`, `/api`,
`/api/status`, `/api/statistics`, `/api/dinosaurs`, `/api/periods`,
`/api/epochs`, `/api/formations`, `/api/continents`, `/api/countries`,
`/api/discoveries`; assets CSS/JS/imagem; CORS e `OPTIONS`; CSP e headers de
segurança; `X-Request-Id`; contrato de erro; validação de parâmetros; 404 e
413; rate limiter e 429; ausência de vazamento interno. **[R]**

---

## 7. Privacidade do access logger

**Problema:** o logger usava `req.originalUrl`, expondo query string.

**Correção:** `sanitizePath()` em `server/middleware/logger.js` remove query
string e fragmento; mantém método, caminho, status, duração e request ID.

Antes:

```
[2026-11-11 03:21:53] GET /api/dinosaurs?search=teste 200 0ms requestId=7f306cba-…
```

Depois:

```
[2026-11-11 03:37:16] GET /api/dinosaurs 200 6ms requestId=logger-privacy-check
```

Requisição real: `GET /api/dinosaurs?token=fake-token-123&page=1` com
`X-Request-Id: logger-privacy-check` → HTTP 200, 10 itens. **[S]**

| Verificação | Resultado |
|---|---|
| Caminho presente | ✔ |
| `fake-token-123` ausente | ✔ |
| `token=` ausente | ✔ |
| `page=1` e `?` ausentes | ✔ |
| Método, status, duração e request ID preservados | ✔ |
| IP ausente | ✔ |

Fragmentos não são enviados pelo navegador ao servidor HTTP; o caso é
coberto por testes unitários (`/docs#introducao?x=1` → `/docs`).

**Estado:** correção validada, **não commitada** (2 arquivos modificados).

---

## 8. Homologação de encerramento gracioso

Implementação: `server/utils/gracefulShutdown.js`, registrada em `server.js`
para `SIGTERM` e `SIGINT`; `server.close()`, timeout de 10 s com `unref()`,
exit 0 em sucesso e exit 1 em timeout/erro.

Todas as execuções ocorreram em cópia isolada, em `127.0.0.1`, portas
3215–3221.

### 8.0 Matriz de sinais — simulado × real

| Sinal / evento | Como foi exercitado | Natureza | Resultado |
|---|---|---|---|
| `SIGTERM` | `process.emit('SIGTERM')` no processo do servidor | **Simulado** | exit 0, handler executado |
| `SIGINT` | `process.emit('SIGINT')` no processo do servidor | **Simulado** | exit 0, handler executado |
| Ctrl+C (`CTRL_C_EVENT`) | console dedicado + `GenerateConsoleCtrlEvent` | **Real** | evento não entregue pelo ambiente |
| `taskkill /F` | terminação imposta pelo Windows | **Real** | processo morto sem handler |

### 8.1 SIGINT

**Simulado — fiação real do `server.js`:**

| Métrica | Valor |
|---|---|
| Exit code | **0** |
| Tempo total | 2556 ms |
| Log | `[SIGINT] Encerrando servidor...` → `Servidor encerrado com sucesso.` |
| Porta após shutdown | liberada |

**[R]** `c1a-sigint-simulado.json`

**Real (Ctrl+C / `CTRL_C_EVENT`) — não comprovado neste ambiente.**
Foram tentadas três abordagens; o servidor subiu e respondeu `/health` 200 em
todas, e `GenerateConsoleCtrlEvent` retornou sucesso, mas o handler nunca foi
executado:

| Tentativa | Método | Resultado |
|---|---|---|
| 1 | `cmd` + console dedicado | `ATTACH_FAILED code=5` (sem console acessível) |
| 2 | `Start-Process node` + evento | evento retornou `True`, sem entrega (provável novo grupo de processos) |
| 3 | `start` em novo console, PID via preload | `CTRL_C_SENT=True`, sem execução do handler |

**[R]** `real-sigint-result.json`, `real-sigint2-result.json`,
`real-sigint3-result.json`

> **Limitação do ambiente**, não da aplicação: a sessão não interativa não
> entrega eventos de console. A prova definitiva exige console interativo ou
> Linux.

### 8.2 SIGTERM e limitação do Windows

- **SIGTERM real é impossível no Windows**: não há sinais POSIX; `taskkill /F`
  e `process.kill` usam `TerminateProcess`.
- **Validado por sinal simulado** (`process.emit('SIGTERM')` no processo real,
  com a fiação de `server.js`): exit **0**, 2551 ms, logs corretos, porta
  liberada. **[R]** `c2-sigterm.json`
- **Comportamento real do Windows comprovado** (`taskkill`): **[R]**
  `c1b-taskkill.json`

| Operação | Resultado |
|---|---|
| `taskkill /PID` (sem `/F`) | código 1; processo **continua vivo** (“só pode ser forçada”) |
| `taskkill /F /PID` | código 0; processo morto **sem log de shutdown e sem código de saída** |

> Em produção no Windows, encerramentos administrativos não executam o
> handler. Em provedores Linux (ex.: Render), o `SIGTERM` é entregue
> normalmente — comportamento **não validado** nesta homologação.

### 8.3 Idempotência

Dois sinais no mesmo tick (`SIGTERM` + `SIGINT`, ambos simulados):

| Métrica | Valor |
|---|---|
| Exit code | **0** |
| Tempo total | 2550 ms |
| Sequências de shutdown | **1** |

**[R]** `c3b-same-tick.json`

### 8.4 Keep-alive

Socket bruto com requisição completa e `Connection: keep-alive` confirmado
(`HTTP/1.1 200 OK`), mantido ocioso no momento do sinal simulado:

| Métrica | Valor |
|---|---|
| Exit code | **0** |
| Sinal → saída | ~1 ms (socket fechado em 4044 ms; exit em 4050 ms) |
| Atraso de `keepAliveTimeout` | **não observado** (Node 24) |

**[R]** `c4c-keepalive-raw.json`

### 8.5 Conexões presas e timeout

Socket com headers parciais, nunca concluídos, com sinal simulado:

| Métrica | Valor |
|---|---|
| Exit code | **1** |
| Tempo total | 13051 ms (3 s + timeout de 10 s) |
| Log (stderr) | `[SIGTERM] Tempo limite de encerramento excedido.` |
| `Servidor encerrado com sucesso.` | ausente |
| Porta após shutdown | liberada |

**[R]** `c5-stuck.json`

### 8.6 EADDRINUSE

Porta ocupada antes da inicialização:

| Métrica | Valor |
|---|---|
| Exit code | **1** |
| Tempo | 231 ms |
| stderr | `Erro ao iniciar o servidor: listen EADDRINUSE: address already in use :::3220` |

**[R]** `c6b-eaddrinuse.json`

### 8.7 Integridade após o encerramento

| Verificação | Resultado |
|---|---|
| Portas 3215–3221 após os testes | todas livres |
| Processos de teste remanescentes | nenhum |
| Hashes dos 15 JSONs de `server/database` | **0 divergências** |
| Arquivos temporários inesperados na cópia | nenhum |
| Stack traces / unhandled rejections nos logs | nenhum |

---

## 9. Integridade do repositório e dependências

### 9.1 Cópia isolada

| Verificação | Resultado |
|---|---|
| Arquivos copiados (sem `.git`, `node_modules`, `coverage`) | **145** |
| SHA-256 dos 145 arquivos × working tree | **0 divergências** |
| `npm ci` | exit 0 |
| `package-lock.json` | SHA-256 inalterado (`FF678081…61DE5`) |
| Hashes do logger (repo × cópia) | idênticos |

Aviso do npm 11 sobre install scripts bloqueados (`@parcel/watcher`,
`unrs-resolver`), sem impacto observado.

### 9.2 Dependências

| Auditoria | Resultado |
|---|---|
| `npm audit --omit=dev` | **0 vulnerabilidades** |
| Dependências de desenvolvimento | **21 advisories**: 1 high (`brace-expansion`), 17 moderate, 3 low |

**[R]** `homolog-20261111-001855/audit-full.json`

### 9.3 Repositório

| Item | Valor |
|---|---|
| Branch / HEAD | `develop` / `4ae6544` |
| Staged | vazio |
| Untracked | `docs/operations/homologation-v2.5.0.md` |
| Modificados | `server/middleware/logger.js`, `tests/unit/logger.test.js` |
| `git diff --check` | exit 0 |
| Tags no HEAD | nenhuma |
| Escrita no Git durante a homologação | nenhuma |

---

## 10. Evidências disponíveis

Diretório base: `%TEMP%\opencode\`

| Caminho | Conteúdo |
|---|---|
| `homolog-shutdown-20261111-014332\c2-sigterm.json` | SIGTERM simulado: exit 0 |
| `…\c1a-sigint-simulado.json` | SIGINT simulado: exit 0 |
| `…\c3b-same-tick.json` | idempotência no mesmo tick |
| `…\c4c-keepalive-raw.json` | keep-alive bruto: exit 0 |
| `…\c5-stuck.json` | timeout de 10 s: exit 1 |
| `…\c6b-eaddrinuse.json` | EADDRINUSE: exit 1 |
| `…\c1b-taskkill.json` | `taskkill` sem/com `/F` |
| `…\real-sigint*-result.json` | tentativas de SIGINT real (limitação) |
| `…\db-baseline.txt` | hashes dos 15 JSONs |
| `homolog-shutdown-…\app\` | cópia isolada (145 arquivos + `node_modules`) |
| `homolog-logger-20261111-003550\jest.json` | 38 suítes / 902 testes |
| `homolog-logger-20261111-003550\smoke.json` | 61/61 checks |
| `homolog-20261111-001855\jest.json` | 38 suítes / 890 testes (pré-correção) |
| `homolog-20261111-001855\smoke.json` | 60/61 checks (pré-correção) |
| `jest-final.json` | 38 / 890 |
| `jest-logger-fix.json` | 38 / 902 |
| `homolog-smoke.js` | harness de 61 checks |
| `logger-privacy-check.js` | teste de privacidade do logger |
| `homolog-20261111-001855\audit-full.json` | `npm audit` (21 advisories dev) |

**Evidências de sessão (não persistidas em arquivo):** 15/15 unitários do
logger, 90/90 de integração, 6/6 de `gracefulShutdown` e a saída do teste de
privacidade. Os resultados completos correspondentes estão nos JSONs da suíte.

> Os nomes dos diretórios usam horário local; os logs internos usam UTC.

---

## 11. Pendências e ressalvas

### 11.1 Homologação Linux suspensa

Não executada. O encerramento gracioso por `SIGTERM` real depende dela.
**Ressalva pendente**, não bloqueio automático de release.

### 11.2 Recebimento real de sinais do sistema operacional

- `SIGTERM` real: **impossível no Windows**.
- `SIGINT` real: **não comprovado** neste ambiente não interativo.
- O que está comprovado: a fiação de `server.js` e o handler, por sinais
  simulados no processo real.

### 11.3 Comportamento entre versões do Node.js

- Homologado em **Node 24.18.0**.
- Mínimo declarado: **18.18.0**.
- Em Node 24, `server.close()` encerrou conexão ociosa imediatamente.
- Em Node 18, conexões ociosas podem aguardar o `keepAliveTimeout` (5 s),
  ainda abaixo do guarda de 10 s. **Não testado.**
- `server.closeIdleConnections()` não é usado.

### 11.4 AUDIT-011

MemoryStore local ao processo; limite não é global entre instâncias.
Requer armazenamento compartilhado (ex.: Redis) — depende de infraestrutura.

### 11.5 AUDIT-016

Sem `render.yaml`, `Dockerfile` ou workflow de CI. Deploy e empacotamento
seguem indefinidos.

### 11.6 Integração Cloudflare/Render

**Não validada.** A identificação por `CF-Connecting-IP`, Pseudo IPv4 e
`CF-Connecting-IPv6` não foram testados em staging. Nenhum acesso a produção
foi realizado.

### 11.7 Advisories de dependências de desenvolvimento

21 advisories (1 high, 17 moderate, 3 low). Não corrigidos; não afetam
`npm audit --omit=dev`.

### 11.8 Outras

- `server/database/metadata.json` com `lastUpdate: 2026-08-30`.
- Correção do logger **não commitada**.
- Matriz AUDIT-001..020 não versionada.

---

## 12. Veredito final e critérios de aceite

**Veredito: APROVADA COM RESSALVAS (Windows).**

| Critério | Situação |
|---|---|
| Suíte completa 38/902 sem falhas | ✔ |
| Smoke 61/61 | ✔ |
| Privacidade do access log | ✔ |
| `npm audit --omit=dev` = 0 | ✔ |
| Shutdown: exit 0 em sucesso | ✔ (sinal simulado) |
| Shutdown: timeout → exit 1 | ✔ (processo real) |
| Idempotência | ✔ (unitário + simulado) |
| Keep-alive ocioso | ✔ (Node 24) |
| `EADDRINUSE` → exit 1 | ✔ |
| Integridade pós-shutdown | ✔ |
| SIGINT/SIGTERM reais | ✘ (limitação de SO/ambiente) |
| Linux | ✘ (suspenso) |
| Cloudflare/Render | ✘ (não validado) |
| Node 18 | ✘ (não testado) |

As ressalvas são de **cobertura de ambiente**, não falhas funcionais
identificadas. As pendências de Linux, sinais reais, Node 18 e
Cloudflare/Render **não reprovam** a homologação Windows e **não bloqueiam
automaticamente** a release; a decisão de publicar cabe ao responsável, com
aceite formal e registro dessas ressalvas.

---

## 13. Recomendações para a próxima etapa

1. Persistir a matriz AUDIT-001..020 (tema, parecer, arquivos).
2. Decidir sobre o commit da correção do logger.
3. Validar `SIGTERM` real em Linux ou console interativo.
4. Avaliar `server.closeIdleConnections()` para determinismo em Node 18.
5. Documentar a limitação de sinais no Windows em `docs/operations.md`.
6. Definir CI (AUDIT-016) executando `npm ci`, `npm test` e `npm audit --omit=dev`.
7. Validar `CF-Connecting-IP` e Pseudo IPv4 em staging.
8. Atualizar `metadata.json.lastUpdate` no momento da release.
9. Planejar correção dos advisories de desenvolvimento.
10. Tratar as ressalvas de ambiente (itens 3–5) antes ou junto da publicação
    da `2.5.0`, sem que elas constituam bloqueio automático.
