# 🔄 Respostas

A DinoAtlas API utiliza os códigos de status HTTP padrão para indicar o sucesso
ou a falha de uma requisição. Todas as respostas trafegam em formato JSON, com
exceção dos arquivos estáticos servidos pela interface pública.

## Códigos de Status HTTP

| Código | Descrição | Significado na API |
|--------|-------------|--------------------|
| **200** | `OK` | A requisição foi bem-sucedida e os dados foram retornados. |
| **400** | `Bad Request` | Parâmetro inválido, repetido, fora da faixa ou em formato de array/objeto. |
| **404** | `Not Found` | O recurso solicitado não existe ou a rota é desconhecida. |
| **413** | `Payload Too Large` | O corpo da requisição excede o limite de 100 KB. |
| **429** | `Too Many Requests` | O limite de requisições por IP foi excedido. |
| **500** | `Internal Server Error` | Erro interno inesperado no servidor. |

## Estrutura de Resposta com Sucesso (200 OK)

A resposta bem-sucedida engloba os dados solicitados. Para listagens, metadados
de paginação podem ser incluídos em `meta`.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tyrannosaurus Rex",
      "scientificName": "Tyrannosaurus rex",
      "periodId": 3,
      "dietId": 1,
      "length": 12.3,
      "height": 4,
      "weight": 8400,
      "estimatedSpeed": 27
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

Objetos únicos (por exemplo, `/api/dinosaurs/1` e `/api/periods/1`) retornam
`data` como objeto, sem `meta`.

## Estrutura de Resposta de Erro

Todas as respostas de erro seguem o mesmo contrato mínimo:

```json
{
  "success": false,
  "message": "Mensagem pública segura."
}
```

> **Mudança de contrato (AUDIT-005):** o campo `error`, que antes podia conter
> `err.message` e detalhes técnicos, foi **removido** das respostas de erro.
> Consumidores devem utilizar apenas `success` e `message`. Detalhes técnicos,
> stack trace, caminhos internos, códigos de sistema operacional e mensagens de
> parser são registrados exclusivamente nos logs do servidor.

### Exemplos de erro

**400 — parâmetro inválido**

```json
{
  "success": false,
  "message": "O parâmetro 'limit' deve ser um número inteiro entre 1 e 100."
}
```

**404 — rota inexistente**

```json
{
  "success": false,
  "message": "Rota não encontrada."
}
```

**404 — recurso inexistente**

```json
{
  "success": false,
  "message": "Dinossauro não encontrado."
}
```

**413 — payload excessivo**

```json
{
  "success": false,
  "message": "Payload muito grande."
}
```

**429 — rate limit**

```json
{
  "success": false,
  "message": "Muitas requisições originadas deste IP. Por favor, tente novamente após 15 minutos."
}
```

**500 — erro interno**

```json
{
  "success": false,
  "message": "Erro interno do servidor."
}
```

## Cabeçalhos relevantes

| Cabeçalho | Descrição |
| --------- | --------- |
| `X-Request-Id` | Identificador da requisição, útil para correlacionar logs. Um valor válido enviado pelo cliente é reaproveitado; caso contrário, um UUID é gerado. |
| `RateLimit-Limit` | Limite configurado para a janela atual. |
| `RateLimit-Remaining` | Requisições restantes na janela. |
| `Retry-After` | Segundos até poder tentar novamente, presente em respostas 429. |
