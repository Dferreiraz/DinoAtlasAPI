# 🛠️ Operação e Deploy

Este documento descreve o comportamento operacional da DinoAtlas API e o que
ainda depende de decisão de infraestrutura. Ele reflete apenas o que está
implementado no repositório — nenhum provedor, segredo ou configuração externa
é presumido.

## Requisitos de execução

| Item | Valor |
| ---- | ----- |
| Runtime | Node.js `>=18.18.0` (`engines.node` em `package.json`) |
| Porta | `PORT` (padrão `3000`) |
| Dependências de produção | `express`, `cors`, `helmet`, `express-rate-limit` |
| Dependências externas | Nenhuma (sem banco externo, sem Redis, sem chaves de API) |

Para iniciar:

```bash
npm install
npm start        # produção
npm run dev      # desenvolvimento (nodemon)
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| -------- | ----------- | --------- |
| `PORT` | Não | Porta HTTP. Padrão `3000`. |

A aplicação não exige variáveis de ambiente além de `PORT`.

## Health check

O endpoint `GET /health` retorna `200` com:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "2.5.0",
    "uptime": 12.34,
    "timestamp": "2026-01-01T00:00:00.000Z"
  }
}
```

Ele fica **fora** de `/api` e, portanto, não é afetado pelo rate limiter
destinado às rotas de dados. Use-o em *probes* de liveness/readiness do
provedor de hospedagem.

O endpoint `GET /api/status` continua disponível para consumidores da API e
segue o rate limit de `/api`.

## Rate limiting

- Escopo: todas as rotas sob `/api` (`app.use('/api', limiter)`).
- Janela: 15 minutos.
- Limite de produção: 100 requisições por IP por janela.
- Resposta ao exceder: `429` com a mensagem pública padrão e cabeçalhos
  `RateLimit-Limit`, `RateLimit-Remaining` e `Retry-After`.
- Os cabeçalhos legados `X-RateLimit-Limit`, `X-RateLimit-Remaining` e
  `X-RateLimit-Reset` estão desabilitados (`legacyHeaders: false`).
- Consumidores públicos não precisam de API Key, cadastro ou autenticação.

### Identificação do cliente

O tráfego público é identificado exclusivamente pelo header
`CF-Connecting-IP`, definido e sobrescrito pela borda Cloudflare gerenciada
pela Render. O suporte oficial da Render confirmou que esse header contém o
endereço do cliente conectado e que tentativas de envio pelo cliente são
rejeitadas/substituídas pela infraestrutura.

- `trust proxy` permanece **desativado** (`false`). Essa é uma escolha
  deliberada: a identificação do cliente não depende de `req.ip`. Conforme o
  esclarecimento oficial da Render, `trust proxy: 1` faria o Express
  identificar a borda Cloudflare (o primeiro salto confiável), não o cliente
  final.
- A confiança em um número de saltos de proxy depende da topologia real
  (quantas camadas de proxy existem e quais são confiáveis). Valores numéricos
  não são, por si só, inseguros em qualquer topologia; nenhum deles foi
  habilitado nesta implementação porque `req.ip` não é usado como identidade.
- `trust proxy: true`, `trust proxy: '*'` e `X-Forwarded-For` **não** são
  usados como alternativa ao `CF-Connecting-IP`.
- `X-Forwarded-For`, `X-Real-IP` e `Forwarded` **não** são fontes de
  identificação. O `X-Forwarded-For` é acrescentado pela infraestrutura,
  preservando valores enviados pelo cliente à esquerda.
- `req.ip` e `req.ips` não são usados como fallback.
- O valor de `CF-Connecting-IP` é validado com `net.isIP()`, tem espaços
  externos removidos, precisa ter no máximo 64 caracteres e não pode conter
  vírgula ou `%`. Em seguida é normalizado com `ipKeyGenerator` do
  `express-rate-limit`: IPv4 é preservado, IPv6 é agrupado em `/56` e IPv4
  mapeado ou compatível em IPv6 é convertido para o IPv4 canônico.
- O agrupamento IPv6 em `/56` é intencional: clientes que compartilham o mesmo
  bloco /56 dividem o mesmo limite. Isso reduz a criação de buckets por
  rotação de endereços dentro de uma mesma rede.
- Header ausente, vazio, somente com espaços, duplicado ou inválido resulta na
  chave compartilhada `unidentified` (fail-closed). Todos os clientes nessa
  condição dividem o mesmo limite; não há fallback para headers ou para o
  socket. Esse bucket também é intencional.
- O uso de Pseudo IPv4 e de `CF-Connecting-IPv6` **ainda não foi validado em
  staging**. A implementação atual usa apenas `CF-Connecting-IP` e não adiciona
  suporte especulativo a esses headers.
- Chamadas pela rede privada da Render podem não passar pela Cloudflare e,
  portanto, não recebem `CF-Connecting-IP`. Caso exista um consumidor privado no
  futuro, ele exigirá uma decisão específica de identificação (por exemplo,
  token de serviço). Os headers públicos não devem ser presumidos como
  confiáveis nesse caminho, pois podem ser fornecidos pelo próprio chamador.

### Armazenamento e observabilidade

O armazenamento padrão do `express-rate-limit` é em memória e **local ao
processo**. Consequências:

- reinícios zeram os contadores;
- com múltiplas instâncias, cada uma aplica seu próprio limite;
- o limite é aplicado por cliente identificado, não como um teto global.

O middleware de request ID roda **antes** do rate limiter. Por isso, respostas
`429` também recebem `X-Request-Id` e o bloqueio pode ser correlacionado com os
demais logs da mesma requisição. Um valor de `X-Request-Id` enviado pelo
cliente só é reaproveitado se passar pela validação existente; caso contrário,
um UUID é gerado.

Bloqueios `429` são registrados pelo handler do limiter como
`rate_limit_exceeded`, com método, rota sem query string, status e origem da
chave (`public` ou `unidentified`), além do mesmo request ID devolvido na
resposta. O log não inclui IP, valor bruto de `CF-Connecting-IP`, headers
completos, tokens, corpo ou query string.

O handler respeita `message` estático ou funcional e o `statusCode` configurado
na instância do limiter, usando o mesmo status na resposta e no log (com
fallback para `429`). A configuração de produção mantém o status `429` e o
corpo público padrão.

**Pendência (AUDIT-011):** para um limite global consistente entre instâncias,
é necessário um armazenamento compartilhado (por exemplo, Redis). Isso depende
de infraestrutura externa e não foi adicionado sem essa definição.

## Encerramento gracioso

`server.js` escuta `SIGTERM` e `SIGINT` e:

1. para de aceitar novas conexões (`server.close`);
2. encerra com código `0` quando as conexões existentes terminam;
3. força a saída com código `1` após 10 segundos sem conclusão.

A lógica fica em `server/utils/gracefulShutdown.js` e é testada isoladamente.
Provedores que enviam `SIGTERM` antes de encerrar uma instância se beneficiam
desse comportamento.

## Segurança HTTP

- `helmet` com CSP restritiva: apenas `'self'` para scripts e estilos, imagens
  de `'self'`, `data:` e `https://res.cloudinary.com`.
- CORS liberado para `GET`/`OPTIONS` (API pública de leitura).
- `express.json` e `express.urlencoded` com limite de payload de 100 KB.
- Erros nunca expõem stack trace, caminhos internos ou detalhes técnicos.
- `X-Request-Id` é gerado ou reaproveitado para correlação de logs.

O frontend foi reescrito sem `innerHTML`, sem handlers inline e sem estilos
inline, de modo que a CSP não precisa de `'unsafe-inline'`.

## Cache dos JSONs

O `server/repositories/jsonRepository.js` mantém os JSONs em memória por
processo. Implicações operacionais:

- a primeira leitura de cada arquivo ocorre no primeiro acesso;
- alterações feitas diretamente no disco exigem reinício do processo;
- em múltiplas instâncias, cada processo tem seu próprio cache;
- erros de leitura não são cacheados.

Veja [Banco de Dados](database.md) para detalhes.

## Testes e verificação

```bash
npm test               # suíte completa
npm run test:unit      # testes unitários
npm run test:integration
npm run test:data      # integridade dos JSONs
npm run test:coverage  # cobertura
npm audit --omit=dev   # vulnerabilidades de produção
git diff --check       # espaços em branco e conflitos
```

## Deploy

O repositório não inclui `render.yaml`, `Dockerfile` nem workflow de CI. A URL
pública citada no README é apenas informativa. Qualquer automação de deploy
deve ser definida junto com a decisão de infraestrutura, observando:

- `npm ci` seguido de `npm test` antes de publicar;
- `PORT` fornecido pelo provedor;
- *probe* apontando para `/health`;
- envio de `SIGTERM` no encerramento da instância;
- limite de requisições por instância (ver pendência acima).

**Pendência (AUDIT-016):** configuração de deploy, CI e empacotamento em
container permanecem sob decisão de infraestrutura e não foram inventados neste
repositório.
