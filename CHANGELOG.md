# Changelog

Todas as mudanças relevantes deste projeto são registradas neste arquivo.

## [2.5.0] — Publicada

> **Release:** `2.5.0`  
> **Tag Git:** `2.5.0`  
> **Commit da release:** `fb0cd705d274ae24b1d3e1904eaf499ceddc40f4` (`fb0cd70`)  
> **Licença do snapshot da tag:** PolyForm Noncommercial 1.0.0.
>
> **Histórico de licenciamento:** a versão 2.5.0 já havia sido disponibilizada anteriormente sob MIT. O commit `a9cde675870cff57632ee5af4b0c09081c53f625` (`a9cde67`) representa aquele estado funcional, com a correção de privacidade do logger. Posteriormente, a licença do repositório foi migrada para PolyForm Noncommercial 1.0.0, e a tag `2.5.0` foi publicada apontando para o snapshot que contém essa migração.
>
> A alteração de licença não revoga retroativamente as permissões concedidas às cópias anteriormente distribuídas sob MIT. Consulte [docs/licensing.md](docs/licensing.md) para os detalhes.

### Resumo

A `2.5.0` consolida uma rodada de reorganização interna, correções de segurança, melhorias de validação, ampliação da documentação e dos testes e correções e pendências documentadas de integridade dos dados. Ela mantém os endpoints existentes, mas inclui mudanças de contrato que devem ser comunicadas aos consumidores.

### Melhorias

- Reorganização da arquitetura, com separação mais clara entre controllers, routes, repositories, middlewares e utils.
- Repositório JSON centralizado, com cache em memória e índices por ID e agrupados.
- Melhorias no tratamento de erros, com mensagens públicas padronizadas e sem exposição de detalhes internos.
- Validação mais rigorosa de IDs, paginação, filtros, busca e ordenação.
- Melhorias de segurança e de Content Security Policy (CSP), sem `unsafe-inline` para scripts e estilos.
- Novo endpoint de health check em `GET /health`.
- Documentação disponível diretamente em `/docs` e `/docs/`.
- Seleção aleatória uniforme com Fisher–Yates parcial no endpoint `/api/dinosaurs/random`.
- Estatísticas dinâmicas em `/api/statistics`, calculadas a partir dos JSONs.
- Ampliação dos testes automatizados, incluindo integração, unidade e integridade dos dados.
- Atualizações de documentação, correções de integridade dos dados e registro das pendências conhecidas em [`docs/data-integrity.md`](docs/data-integrity.md).

### Breaking Changes

#### 1. Remoção do campo `error` nas respostas de erro

O formato de erro passou a ser:

```json
{
  "success": false,
  "message": "Mensagem pública segura."
}
```

O campo `error`, que antes podia conter detalhes técnicos, foi removido.

**Impacto:** consumidores que liam `response.error` devem passar a utilizar apenas `success` e `message`. Detalhes técnicos continuam disponíveis somente nos logs do servidor.

#### 2. Validação mais rigorosa dos parâmetros

Passam a retornar **400 Bad Request**:

- parâmetros sintaticamente inválidos, como `page=1abc`, `limit=101` e `periodId=1abc`;
- parâmetros repetidos ou enviados em formato de array/objeto;
- campos de ordenação ou filtros não suportados pela allowlist, como `sort=year` e `order=invalido`.

**Impacto:** clientes que dependiam de coerção silenciosa (por exemplo, `parseInt` em valores parcialmente numéricos) passam a receber 400 em vez de uma resposta padrão. Parâmetros desconhecidos arbitrários, como `parametroInexistente=abc`, continuam sendo ignorados; nem todo parâmetro adicional provoca erro.

#### 3. Alteração semântica dos totais em `/api/statistics`

Os campos `totalFamilies`, `totalPeriods`, `totalContinents` e `totalCountries` agora representam o **total de registros das tabelas** de referência, e não a quantidade de valores distintos efetivamente referenciados pelos dinossauros.

O bloco `usage` foi adicionado para expor as quantidades de valores realmente utilizados:

```json
{
  "totalDinosaurs": 100,
  "totalFamilies": 25,
  "totalPeriods": 3,
  "totalContinents": 7,
  "totalCountries": 17,
  "totalDiscoveries": 100,
  "usage": {
    "families": 16,
    "periods": 3,
    "continents": 7,
    "countries": 17
  }
}
```

**Impacto:** consumidores que interpretavam esses totais como “quantidade em uso” devem migrar para os campos correspondentes de `usage`. Os valores numéricos de `totalFamilies` e de outros totais de tabela podem ser maiores que os anteriores porque incluem registros legados.

### Compatibilidade

A `2.5.0` é uma atualização da linha **2.x** com mudanças de contrato. Não há remoção ou renomeação de endpoints, mas as três mudanças acima precisam ser comunicadas aos consumidores antes da adoção da nova versão.

### Rate limiting (AUDIT-002)

- O rate limiter de `/api` passou a identificar clientes públicos exclusivamente por `CF-Connecting-IP`, definido e sobrescrito pela borda Cloudflare gerenciada pela Render.
- `X-Forwarded-For`, `X-Real-IP` e `Forwarded` não são usados como fonte de identidade. `req.ip` também não é usado como fallback.
- `trust proxy` permanece desabilitado (`false`). `trust proxy: 1` identificaria a borda Cloudflare, não o cliente; nenhum valor numérico, `true` ou `*` foi habilitado.
- O valor aceito é normalizado com `ipKeyGenerator`: IPv4 é preservado, IPv4 mapeado ou compatível em IPv6 vira o IPv4 canônico e IPv6 é agrupado em `/56` (clientes do mesmo bloco compartilham o limite).
- Header ausente, vazio, somente com espaços, duplicado ou inválido compartilha a chave `unidentified` (fail-closed). O bucket também é intencional.
- O limite permanece em 100 requisições por IP a cada 15 minutos, com `standardHeaders` habilitado e `legacyHeaders` desabilitado.
- O middleware de request ID passou a rodar antes do rate limiter: respostas `429` incluem `X-Request-Id` e o mesmo ID aparece no log do bloqueio.
- O handler de bloqueio aceita `message` estático ou funcional e usa o `statusCode` configurado na resposta e no log, com fallback para `429`. A produção mantém o status `429` e o corpo público padrão.
- Bloqueios `429` passaram a ser registrados com evento, método, rota sem query string, status, request ID e origem da chave, sem registrar IP, headers completos, tokens, corpo ou dados pessoais.
- Consumidores públicos continuam sem exigir API Key, cadastro ou autenticação.
- O uso de Pseudo IPv4 e de `CF-Connecting-IPv6` ainda não foi validado em staging e não foi implementado.
- O `MemoryStore` do `express-rate-limit` continua local ao processo; um armazenamento compartilhado entre instâncias permanece como **AUDIT-011**.
