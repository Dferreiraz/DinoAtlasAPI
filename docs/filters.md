# 🔍 Filtros, Busca e Validação

A rota `/api/dinosaurs` suporta parâmetros via **Query String** para refinar,
filtrar, ordenar e paginar os resultados. Os parâmetros podem ser combinados em
uma mesma requisição e, quando múltiplos filtros são utilizados, todos devem ser
atendidos pelo resultado.

> **Validação (AUDIT-007):** parâmetros inválidos, repetidos ou em formato de
> array/objeto retornam **400 Bad Request** com uma mensagem pública segura.
> Parâmetros desconhecidos continuam sendo ignorados por compatibilidade.

---

## 🔎 Busca Textual

O parâmetro `search` realiza uma busca textual parcial e *case-insensitive* nos
campos `name`, `scientificName` e `description`.

| Parâmetro | Tipo   | Regras                                                                 |
| :-------- | :----- | :--------------------------------------------------------------------- |
| `search`  | String | Valor único, no máximo **100 caracteres**. Espaços nas extremidades são removidos. Busca vazia equivale a não filtrar. |

### Exemplo

```http
/api/dinosaurs?search=rex
```

---

## 🎯 Filtros por Entidades

Os filtros por entidades restringem os resultados utilizando os IDs das
entidades relacionadas. Os IDs devem ser obtidos pelos respectivos endpoints.

| Parâmetro          | Tipo   | Descrição                                            |
| :----------------- | :----- | :--------------------------------------------------- |
| `periodId`         | Number | Filtra pelo período geológico.                       |
| `epochId`          | Number | Filtra pela época geológica.                         |
| `dietId`           | Number | Filtra pelo tipo de alimentação.                     |
| `continentId`      | Number | Filtra pelo continente associado ao registro.        |
| `countryId`        | Number | Filtra pelo país onde o fóssil foi descoberto.       |
| `formationId`      | Number | Filtra pela formação geológica.                      |
| `familyId`         | Number | Filtra pela família taxonômica.                      |
| `cladeId`          | Number | Filtra pelo clado evolutivo.                         |
| `habitatId`        | Number | Filtra pelo tipo de habitat ou ambiente.             |
| `classificationId` | Number | Filtra pela classificação taxonômica.                |
| `museumId`         | Number | Filtra pelo museu associado ao espécime ou registro. |

Regras:

- Cada valor deve ser um **inteiro positivo** (`>= 1`).
- Zeros à esquerda são aceitos (`periodId=01` equivale a `periodId=1`).
- Valores como `abc`, `1abc`, `1.5`, `-1`, `0`, `1e3` ou acima do inteiro
  seguro retornam **400**.
- Parâmetros repetidos (`periodId=1&periodId=2`) ou em formato de array/objeto
  retornam **400**.

### Exemplo

```http
/api/dinosaurs?periodId=2&dietId=1
```

A consulta acima combina o período geológico com o tipo de dieta.

---

## 📏 Filtros Numéricos

Os filtros numéricos estabelecem valores mínimos e máximos para características
físicas dos dinossauros.

| Parâmetro           | Tipo   | Descrição                                                                          |
| :------------------ | :----- | :--------------------------------------------------------------------------------- |
| `lengthMin`         | Number | Comprimento maior ou igual ao valor informado, em metros.                          |
| `lengthMax`         | Number | Comprimento menor ou igual ao valor informado, em metros.                          |
| `weightMin`         | Number | Peso maior ou igual ao valor informado, em quilogramas.                            |
| `weightMax`         | Number | Peso menor ou igual ao valor informado, em quilogramas.                            |
| `heightMin`         | Number | Altura maior ou igual ao valor informado, em metros.                               |
| `heightMax`         | Number | Altura menor ou igual ao valor informado, em metros.                               |
| `estimatedSpeedMin` | Number | Velocidade estimada maior ou igual ao valor informado, em km/h.                    |
| `estimatedSpeedMax` | Number | Velocidade estimada menor ou igual ao valor informado, em km/h.                    |

Regras:

- Valores devem ser **decimais não negativos** (`>= 0`).
- Formato aceito: dígitos inteiros e, opcionalmente, uma parte decimal com ponto
  (`10`, `10.5`, `0.5`).
- `abc`, `-1`, `1,5`, `1e3`, `1.5.2` e valores vazios retornam **400**.
- Parâmetros repetidos ou em formato de array/objeto retornam **400**.

### Exemplo

```http
/api/dinosaurs?lengthMin=10&weightMax=8000
```

A consulta retorna dinossauros com pelo menos **10 metros de comprimento** e no
máximo **8.000 kg** de peso.

---

## 📄 Paginação

A listagem de dinossauros é paginada. Os demais recursos continuam retornando
suas listas completas, sem paginação.

| Parâmetro | Tipo   | Regras                                                                 |
| :-------- | :----- | :--------------------------------------------------------------------- |
| `page`    | Number | Inteiro `>= 1`. Padrão: `1`. Zeros à esquerda são aceitos.             |
| `limit`   | Number | Inteiro entre **1 e 100**. Padrão: `10`. Zeros à esquerda são aceitos. |

Valores inválidos, decimais, parcialmente numéricos, repetidos ou fora da faixa
retornam **400**. Os metadados da resposta informam `page`, `limit`, `total` e
`totalPages`.

### Exemplo

```http
/api/dinosaurs?page=2&limit=20
```

> O limite máximo da **listagem** é `100`. O endpoint
> `/api/dinosaurs/random` possui um limite próprio de `50` (veja abaixo).

---

## ↕️ Ordenação

Os resultados podem ser ordenados utilizando os parâmetros `sort` e `order`.

| Parâmetro | Tipo   | Regras                                                       |
| :-------- | :----- | :----------------------------------------------------------- |
| `sort`    | String | Deve ser um dos campos reais listados abaixo.                |
| `order`   | String | `asc` ou `desc`, sem diferenciar maiúsculas de minúsculas.   |

### Campos suportados

`id`, `name`, `scientificName`, `meaning`, `classificationId`, `cladeId`,
`familyId`, `periodId`, `epochId`, `dietId`, `habitatId`, `continentId`,
`discoveryId`, `museumId`, `imageId`, `length`, `height`, `weight`,
`estimatedSpeed`, `species`, `genus` e `status`.

Campos desconhecidos — incluindo `year`, que pertence a `discoveries.json` e não
a `dinosaurs.json` — retornam **400**. O mesmo vale para `order` inválido,
parâmetros repetidos e valores em formato de array/objeto.

### Exemplo

```http
/api/dinosaurs?sort=weight&order=desc
```

Retorna os resultados ordenados pelo peso, do maior para o menor.

---

## 🎲 Endpoint `/api/dinosaurs/random`

| Parâmetro | Tipo   | Regras                                                        |
| :-------- | :----- | :------------------------------------------------------------ |
| `limit`   | Number | Inteiro entre **1 e 50**. Padrão: `1`. Zeros à esquerda aceitos. |

- `limit=1` retorna um objeto único.
- `limit>1` retorna um array com `meta.count`.
- `limit=51`, `limit=0`, `limit=1abc`, `limit=1.5`, `limit=1e1` e parâmetros
  repetidos retornam **400**.

---

## 🧾 Resumo dos status

| Situação                                              | Status |
| :---------------------------------------------------- | :----- |
| Parâmetro sintaticamente inválido                     | 400    |
| Parâmetro repetido, array ou objeto                   | 400    |
| `sort` fora da allowlist ou `order` inválido          | 400    |
| Recurso com ID válido, mas inexistente                | 404    |
| Recurso com ID sintaticamente inválido                | 400    |
| Rota inexistente                                      | 404    |
| Payload acima do limite                               | 413    |
| Muitas requisições                                    | 429    |

> **Compatibilidade:** parâmetros desconhecidos (por exemplo
> `?parametroInexistente=abc`) continuam ignorados nesta versão. A decisão é
> preservar o comportamento anterior e será reavaliada em versões futuras.

---

# 💡 Exemplos de Uso

## 1. Busca Textual

```http
/api/dinosaurs?search=rex
```

## 2. Filtros Combinados

```http
/api/dinosaurs?periodId=2&dietId=1
```

## 3. Filtros por Características Físicas

```http
/api/dinosaurs?lengthMin=10&weightMax=8000
```

## 4. Ordenação por Peso

```http
/api/dinosaurs?sort=weight&order=desc
```

## 5. Consulta Combinada

```http
/api/dinosaurs?dietId=1&lengthMin=5&sort=weight&order=asc
```

## 6. Filtro Geográfico

```http
/api/dinosaurs?countryId=16
```

> O ID utilizado deve corresponder a um país cadastrado na entidade de países.

## 7. Filtro por Formação Geológica

```http
/api/dinosaurs?formationId=2
```

> O ID utilizado deve corresponder a uma formação cadastrada na entidade de
> formações geológicas.

## 8. Consulta Paleontológica Avançada

```http
/api/dinosaurs?dietId=2&continentId=1&weightMin=5000&sort=name&order=asc
```

Essa consulta combina diferentes dimensões dos dados do **Atlas** permitindo
pesquisas mais específicas sobre os registros paleontológicos.
