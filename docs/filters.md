# 🔍 Filtros e Busca Avançada

A rota `/api/dinosaurs` suporta parâmetros via **Query String** para refinar, filtrar, ordenar e paginar os resultados.

A partir da **V2.5.0 (Atlas)**, a API também permite realizar consultas relacionadas à localização geográfica, contexto geológico e classificação taxonômica dos dinossauros.

Os parâmetros podem ser combinados em uma mesma requisição. Quando múltiplos filtros são utilizados, todos devem ser atendidos pelo resultado.

---

## 🔎 Busca Textual

O parâmetro `search` permite realizar uma busca textual nos principais campos de identificação e descrição dos dinossauros.

| Parâmetro | Tipo   | Descrição                                                                                   |
| :-------- | :----- | :------------------------------------------------------------------------------------------ |
| `search`  | String | Busca correspondências parciais em campos textuais, como nome científico, nome e descrição. |

### Exemplo

```http
/api/dinosaurs?search=rex
```

---

## 🎯 Filtros por Entidades

Os filtros por entidades permitem restringir os resultados utilizando os IDs das entidades relacionadas aos dinossauros.

Os IDs devem ser obtidos através dos respectivos endpoints da API.

| Parâmetro          | Tipo   | Descrição                                            |
| :----------------- | :----- | :--------------------------------------------------- |
| `periodId`         | Number | Filtra pelo período geológico.                       |
| `epochId`          | Number | Filtra pela época geológica.                         |
| `dietId`           | Number | Filtra pelo tipo de alimentação.                     |
| `continentId`      | Number | Filtra pelo continente associado ao registro.        |
| `countryId`        | Number | Filtra pelo país associado ao registro fóssil.       |
| `formationId`      | Number | Filtra pela formação geológica.                      |
| `familyId`         | Number | Filtra pela família taxonômica.                      |
| `cladeId`          | Number | Filtra pelo clado evolutivo.                         |
| `habitatId`        | Number | Filtra pelo tipo de habitat ou ambiente.             |
| `classificationId` | Number | Filtra pela classificação taxonômica.                |
| `museumId`         | Number | Filtra pelo museu associado ao espécime ou registro. |

> **Nota:** Os valores dos parâmetros correspondem aos IDs cadastrados nas entidades relacionadas da API.

### Exemplo

```http
/api/dinosaurs?periodId=2&dietId=1
```

A consulta acima combina o período geológico com o tipo de dieta.

---

## 📏 Filtros Numéricos

Os filtros numéricos permitem estabelecer valores mínimos e máximos para características físicas dos dinossauros.

| Parâmetro   | Tipo   | Descrição                                                                         |
| :---------- | :----- | :-------------------------------------------------------------------------------- |
| `lengthMin` | Number | Retorna dinossauros com comprimento maior ou igual ao valor informado, em metros. |
| `lengthMax` | Number | Retorna dinossauros com comprimento menor ou igual ao valor informado, em metros. |
| `weightMin` | Number | Retorna dinossauros com peso maior ou igual ao valor informado, em quilogramas.   |
| `weightMax` | Number | Retorna dinossauros com peso menor ou igual ao valor informado, em quilogramas.   |

### Exemplo

```http
/api/dinosaurs?lengthMin=10&weightMax=8000
```

A consulta retorna dinossauros com pelo menos **10 metros de comprimento** e no máximo **8.000 kg** de peso.

---

## 📄 Paginação

A API permite controlar a quantidade de resultados retornados através dos parâmetros de paginação.

| Parâmetro | Tipo   | Descrição                                                                        |
| :-------- | :----- | :------------------------------------------------------------------------------- |
| `page`    | Number | Define a página dos resultados. O padrão é `1`.                                  |
| `limit`   | Number | Define a quantidade de resultados por página. O padrão é `10` e o máximo é `50`. |

### Exemplo

```http
/api/dinosaurs?page=2&limit=20
```

---

## ↕️ Ordenação

Os resultados podem ser ordenados utilizando os parâmetros `sort` e `order`.

| Parâmetro | Tipo   | Descrição                                       |
| :-------- | :----- | :---------------------------------------------- |
| `sort`    | String | Define o campo utilizado para ordenação.        |
| `order`   | String | Define a direção da ordenação: `asc` ou `desc`. |

### Campos suportados

* `name`
* `length`
* `weight`
* `year`

### Exemplo

```http
/api/dinosaurs?sort=weight&order=desc
```

Retorna os resultados ordenados pelo peso, do maior para o menor.

---

# 💡 Exemplos de Uso

## 1. Busca Textual

Buscar dinossauros relacionados ao termo `rex`:

```http
/api/dinosaurs?search=rex
```

---

## 2. Filtros Combinados

Buscar dinossauros utilizando período geológico e dieta:

```http
/api/dinosaurs?periodId=2&dietId=1
```

---

## 3. Filtros por Características Físicas

Buscar dinossauros com pelo menos 10 metros de comprimento e peso máximo de 8.000 kg:

```http
/api/dinosaurs?lengthMin=10&weightMax=8000
```

---

## 4. Ordenação por Peso

Buscar dinossauros ordenados do mais pesado para o mais leve:

```http
/api/dinosaurs?sort=weight&order=desc
```

---

## 5. Consulta Combinada

Combinar filtro de dieta, comprimento mínimo e ordenação:

```http
/api/dinosaurs?dietId=1&lengthMin=5&sort=weight&order=asc
```

---

## 6. Filtro Geográfico

Buscar dinossauros associados a um país específico:

```http
/api/dinosaurs?countryId=16
```

> O ID utilizado deve corresponder a um país cadastrado na entidade de países.

---

## 7. Filtro por Formação Geológica

Buscar dinossauros associados a uma formação geológica específica:

```http
/api/dinosaurs?formationId=2
```

> O ID utilizado deve corresponder a uma formação cadastrada na entidade de formações geológicas.

---

## 8. Consulta Paleontológica Avançada

Combinar filtros geográficos, características físicas e ordenação:

```http
/api/dinosaurs?dietId=2&continentId=1&weightMin=5000&sort=name&order=asc
```

Essa consulta demonstra a possibilidade de combinar diferentes dimensões dos dados do **Atlas**, permitindo pesquisas mais específicas sobre os registros paleontológicos.

---