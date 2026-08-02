# 🔄 Respostas

A DinoAPI utiliza os códigos de status HTTP padrão para indicar o sucesso ou falha de uma requisição. Todas as respostas trafegam em formato JSON.

## Códigos de Status HTTP

| Código | Descrição | Significado na API |
|--------|-------------|--------------------|
| **200** | `OK` | A requisição foi bem-sucedida e os dados foram retornados. |
| **400** | `Bad Request` | Erro na requisição (ex: filtros inválidos, tipo de dado incorreto). |
| **404** | `Not Found` | O recurso solicitado (ex: ID do dinossauro) não existe. |
| **500** | `Server Error` | Erro interno no servidor da API. |

## Estrutura de Resposta com Sucesso (200 OK)

A resposta bem-sucedida engloba os dados solicitados. Para listagens, metadados de paginação também podem ser incluídos.

```json
{
  "success": true,
  "data": [
    {
      "id": "tyrannosaurus-rex",
      "name": "Tyrannosaurus Rex",
      "diet": "Carnivore",
      "period": "Late Cretaceous",
      "length": 12.0,
      "weight": 8000
    }
  ]
}