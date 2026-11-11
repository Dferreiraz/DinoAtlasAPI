# 🗄️ Banco de Dados

Para manter alta performance e custo nulo, a DinoAtlas API utiliza arquivos
`.json` estáticos como fonte de dados primária. Os arquivos ficam em
`server/database/` e são lidos pela aplicação através do repositório
`server/repositories/jsonRepository.js`.

Os caminhos são resolvidos por `server/utils/paths.js` a partir da localização
do próprio módulo, portanto a aplicação funciona independentemente do diretório
de trabalho (`cwd`).

## Cache em memória

O acesso aos arquivos é centralizado no `jsonRepository`, que mantém um cache
por processo, indexado pelo caminho absoluto do arquivo:

- o conteúdo é lido e convertido uma única vez e reutilizado nas requisições
  seguintes;
- leituras concorrentes do mesmo arquivo compartilham a mesma *Promise*,
  evitando leituras duplicadas;
- índices por `id` e índices agrupados (por exemplo, `images` por `dinosaurId`)
  são construídos sob demanda e reutilizados;
- erros de leitura ou de *parse* **não** são cacheados, então a próxima
  chamada tenta novamente;
- `server/utils/writeJson.js` invalida o caminho gravado após cada escrita.

Como não há observação do sistema de arquivos, alterações feitas diretamente
nos JSONs fora da aplicação exigem reinício do processo ou uma chamada
explícita a `invalidate`/`clearCache`. Esse cache é local ao processo: em um
deploy com múltiplas instâncias cada uma mantém a própria cópia.

## Arquivos

| Arquivo | Conteúdo atual |
| ------- | -------------- |
| `dinosaurs.json` | 100 dinossauros com dados descritivos, medidas e referências. |
| `discoveries.json` | 100 registros de descoberta. |
| `images.json` | 100 registros de mídia (imagem, thumbnail, autor e licença). |
| `formations.json` | 16 formações geológicas. |
| `families.json` | 25 famílias taxonômicas. |
| `periods.json` | 3 períodos geológicos. |
| `epochs.json` | 5 épocas geológicas. |
| `countries.json` | 17 países. |
| `continents.json` | 7 continentes. |
| `habitats.json` | 4 habitats. |
| `diets.json` | 3 dietas. |
| `clades.json` | 5 clados. |
| `classifications.json` | 3 classificações gerais. |
| `museums.json` | 13 museus. |
| `metadata.json` | Metadados públicos da API. |

## Relações

- `dinosaurs.json` é a entidade central e referencia as demais por ID.
- `formationId` e `countryId` são **arrays** de IDs.
- `continentId`, `periodId`, `epochId`, `dietId`, `habitatId`, `familyId`,
  `cladeId`, `classificationId`, `discoveryId`, `museumId` e `imageId` são
  escalares (`number`).
- `epochs.json` referencia `periods.json` por `periodId`.
- `formations.json` referencia `countries.json` por `countryId` e
  `periods.json` por `periodId`.
- `countries.json` referencia `continents.json` por `continentId`.
- `discoveries.json` e `images.json` referenciam dinossauros por `dinosaurId`.
- `museums.json` referencia países por `countryId`.

### Semântica de `countryId`

Em `dinosaurs.json`, `countryId` representa o(s) país(es) onde o fóssil foi
descoberto. Não representa necessariamente o país da formação geológica.

### Campos de mídia em `images.json`

Cada registro possui os campos booleanos `modified` e textual `modification`,
com a seguinte regra:

- quando `modified` é `true`, `modification` descreve a alteração aplicada à
  imagem;
- quando `modified` é `false`, `modification` vazio (`""`) é válido e indica que
  nenhuma alteração foi registrada.

Situação atual: 100 registros, sendo 60 com `modified: true` e `modification`
preenchido, e 40 com `modified: false` e `modification` vazio. Não há valores
nulos ou ausentes. O campo `modification` não é obrigatório quando `modified` é
`false` e não deve ser preenchido artificialmente.

### Status em `dinosaurs.json`

O campo `status` é uma string não vazia. Os valores presentes atualmente na base
são:

| Valor | Registros | Observação |
| ----- | --------- | ---------- |
| `Válido` | 99 | Táxon atualmente aceito. |
| `Debated` | 1 | `Nanotyrannus` (ID 83), cuja validade é objeto de debate científico. |

Esses são os únicos valores existentes; não há enumeração mais ampla definida na
documentação. O valor `Debated` é preservado como está até que exista uma
decisão documental ou científica sobre sua tradução ou padronização.

## Integridade

A suíte `tests/data/integrity.test.js` valida:

- IDs únicos;
- tipos esperados;
- referências existentes;
- reciprocidade entre dinossauros, descobertas e imagens;
- coerência entre época e período;
- coerência entre continente do dinossauro e continente dos países;
- duplicidades de nomes de famílias;
- referências órfãs de formação;
- divergências formação × período e formação × país.

Pendências conhecidas que não puderam ser corrigidas sem fonte estratigráfica
por espécime estão listadas em
[Integridade dos Dados](data-integrity.md) e em
`tests/data/integrity-allowlist.js`.

> Os testes de dados são somente leitura. Nenhum teste grava nos arquivos reais;
> os testes de escrita usam diretórios temporários.

## Execução dos testes de dados

```bash
npm run test:data
```
