# 🔍 Filtros

A rota `/api/dinosaurs` suporta a passagem de parâmetros via *Query String* para refinar os resultados. Você pode combinar múltiplos filtros na mesma requisição.

## Filtros Disponíveis

| Parâmetro | Tipo | Descrição |
|-----------|------|-------------|
| `period` | String | Filtra por período geológico (ex: Triassic, Jurassic). |
| `diet` | String | Filtra por tipo de alimentação (ex: Carnivore, Herbivore). |
| `family` | String | Filtra por família taxonômica. |
| `continent` | String | Filtra pela localização dos fósseis. |
| `formation` | String | Filtra pela formação geológica de descoberta. |
| `lengthMin` | Number | Retorna dinossauros com comprimento maior ou igual ao valor especificado (em metros). |
| `lengthMax` | Number | Retorna dinossauros com comprimento menor ou igual ao valor especificado (em metros). |
| `weightMin` | Number | Retorna dinossauros com peso maior ou igual ao valor (em quilogramas). |
| `weightMax` | Number | Retorna dinossauros com peso menor ou igual ao valor (em quilogramas). |

## Controle de Resposta

| Parâmetro | Tipo | Descrição |
|-----------|------|-------------|
| `page` | Number | Define a página atual da requisição (Padrão: 1). |
| `limit` | Number | Define a quantidade de itens por página (Padrão: 10). |
| `sort` | String | Define o campo de ordenação (ex: `name`, `weight`). |
| `order` | String | Define a direção da ordenação (`asc` ou `desc`). |

## Exemplos de Uso

**Buscando carnívoros do período Jurássico:**
```text
/api/dinosaurs?diet=Carnivore&period=Jurassic