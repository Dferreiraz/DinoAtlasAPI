# 🔍 Filtros e Busca Avançada

A rota `/api/dinosaurs` suporta a passagem de parâmetros via *Query String* para refinar os resultados. Com a chegada da **V2.3**, agora é possível realizar buscas textuais avançadas e combinar múltiplos parâmetros simultaneamente.

## Busca Textual (Search)

A busca textual varre os campos essenciais do banco de dados para encontrar correspondências, mesmo que parciais.

| Parâmetro | Tipo | Descrição |
|-----------|------|-------------|
| `search` | String | Busca correspondências no `name`, `scientificName` e `description`. |

## Filtros de Correspondência Exata

Você pode combinar múltiplos filtros na mesma requisição. Todos operam com lógica aditiva (AND). Como a API é estruturada relacionalmente, utilize os IDs correspondentes.

| Parâmetro | Tipo | Descrição |
|-----------|------|-------------|
| `periodId` | Number | Filtra por ID do período geológico. |
| `dietId` | Number | Filtra por ID do tipo de alimentação. |
| `continentId`| Number | Filtra pela localização (ID) dos fósseis. |
| *(Qualquer Chave)* | Number/String | A API suporta nativamente qualquer chave existente no JSON (ex: `familyId`, `habitatId`). |

## Filtros Numéricos

Permitem a estipulação de tetos e pisos para atributos físicos dos dinossauros.

| Parâmetro | Tipo | Descrição |
|-----------|------|-------------|
| `lengthMin` | Number | Retorna dinossauros com comprimento maior ou igual ao valor especificado (em metros). |
| `lengthMax` | Number | Retorna dinossauros com comprimento menor ou igual ao valor especificado (em metros). |
| `weightMin` | Number | Retorna dinossauros com peso maior ou igual ao valor (em quilogramas). |
| `weightMax` | Number | Retorna dinossauros com peso menor ou igual ao valor (em quilogramas). |

## Controle de Resposta e Ordenação Avançada

| Parâmetro | Tipo | Descrição |
|-----------|------|-------------|
| `page` | Number | Define a página atual da requisição (Padrão: 1). |
| `limit` | Number | Define a quantidade de itens por página (Padrão: 10). |
| `sort` | String | Define o campo de ordenação (campos suportados: `name`, `length`, `weight`, `year`). |
| `order` | String | Define a direção da ordenação (`asc` para crescente ou `desc` para decrescente). |

---

## 💡 Exemplos Reais de Uso

**1. Busca Textual Simples:**
*Buscando dinossauros que possuam a palavra "rex" no nome ou descrição:*
```text
/api/dinosaurs?search=rex
```

**2. Filtros Combinados (Dietas + Períodos):**
*Buscando dinossauros do período Jurássico (ID 2) que são carnívoros (ID 1):*
```text
/api/dinosaurs?periodId=2&dietId=1
```

**3. Filtros Numéricos Combinados:**
*Buscando dinossauros com no mínimo 10 metros de comprimento e peso máximo de 8.000 kg:*
```text
/api/dinosaurs?lengthMin=10&weightMax=8000
```

**4. Ordenação Avançada:**
*Buscando a lista ordenada dos dinossauros mais pesados da história:*
```text
/api/dinosaurs?sort=weight&order=desc
```

**5. O Poder da V2.3 (Combinando tudo):**
*Buscando carnívoros (ID 1), com mais de 5 metros de comprimento, e exibindo-os ordenados do mais leve para o mais pesado:*
```text
/api/dinosaurs?dietId=1&lengthMin=5&sort=weight&order=asc
```

