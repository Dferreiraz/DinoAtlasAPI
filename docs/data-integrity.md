# 🧬 Integridade dos Dados

Este documento registra as correções de integridade aplicadas à base JSON da
DinoAtlas API (AUDIT-006), as pendências que permanecem e a **allowlist**
exata usada pelos testes automatizados.

A allowlist executável fica em
[`tests/data/integrity-allowlist.js`](../tests/data/integrity-allowlist.js) e é
validada por [`tests/data/integrity.test.js`](../tests/data/integrity.test.js).

---

## Regras adotadas

- IDs existentes **não são renumerados**.
- Nenhuma formação ou época fictícia é criada.
- Nenhuma família legada é removida.
- Uma pendência só pode ser ignorada se estiver listada explicitamente na
  allowlist, com o motivo correspondente.
- O teste de integridade falha se uma entrada da allowlist deixar de
  corresponder a uma violação real (entrada obsoleta) ou se surgir qualquer
  violação não listada.

---

## Correções aplicadas

### 1. Épocas compatíveis com o período

Foram adicionadas duas épocas com nomes estratigráficos reais, sem alterar as
épocas existentes:

| ID | Época                | periodId | Período associado |
| -- | -------------------- | -------- | ----------------- |
| 4  | Triássico Superior   | 1        | Triássico         |
| 5  | Jurássico Inferior   | 2        | Jurássico         |

### 2. Dinossauros remapeados

Nove registros que apontavam para épocas de períodos diferentes foram
corrigidos. Os IDs públicos foram preservados.

| ID  | Dinossauro       | periodId final | epochId final |
| --- | ---------------- | -------------- | ------------- |
| 19  | Plateosaurus     | 1              | 4             |
| 20  | Coelophysis      | 1              | 4             |
| 35  | Dilophosaurus    | 2              | 5             |
| 44  | Cryolophosaurus  | 2              | 5             |
| 67  | Eoraptor         | 1              | 4             |
| 73  | Herrerasaurus    | 1              | 4             |
| 79  | Lufengosaurus    | 2              | 5             |
| 88  | Panphagia        | 1              | 4             |
| 98  | Staurikosaurus   | 1              | 4             |

Resultado: **0 incompatibilidades** entre `periodId` do dinossauro e
`periodId` da época.

#### Critério e fontes

As épocas `4` e `5` utilizam nomenclatura cronoestratigráfica padrão
(Triássico Superior e Jurássico Inferior). Os vínculos foram definidos pela
idade geológica amplamente aceita para cada táxon e conferidos com o campo
`sources` já existente em cada registro, que referencia instituições
científicas e, na maioria dos casos, a **Paleobiology Database**.

Nenhuma referência bibliográfica, URL ou formação foi inventada nesta etapa. As
correções limitaram-se a alinhar `periodId` e `epochId` dentro do vocabulário
já existente ou de épocas cronoestratigráficas reais.

### 3. Semântica de `countryId`

`countryId` representa o(s) país(es) onde o fóssil foi descoberto.

---

## Pendências documentadas

As pendências abaixo dependem de fonte estratigráfica por espécime, que não
está disponível neste repositório. Por esse motivo, os dados **não foram
alterados** e permanecem explicitamente na allowlist.

### 1. Referências a formações inexistentes (29)

| Formação referenciada | Dinossauros (ID — nome) |
| --------------------- | ----------------------- |
| 7  | 12 Giganotosaurus, 13 Argentinosaurus, 63 Dreadnoughtus, 81 Megaraptor, 89 Patagotitan |
| 8  | 14 Iguanodon, 60 Dacentrurus, 68 Eustreptospondylus, 74 Hypsilophodon, 96 Scelidosaurus |
| 12 | 18 Amargasaurus |
| 14 | 20 Coelophysis |
| 15 | 21 Archaeopteryx, 22 Compsognathus |
| 16 | 23 Gallimimus, 24 Oviraptor, 71 Gigantoraptor, 99 Tarbosaurus |
| 19 | 33 Therizinosaurus, 34 Deinocheirus |
| 22 | 43 Muttaburrasaurus, 78 Leaellynasaura |
| 23 | 44 Cryolophosaurus, 53 Antarctopelta |
| 24 | 45 Microraptor, 55 Beipiaosaurus, 75 Incisivosaurus |
| 27 | 50 Tsintaosaurus, 97 Shantungosaurus |

### 2. Divergências formação × período (9)

| Dinossauro | Formação referenciada | Motivo |
| ---------- | --------------------- | ------ |
| 47 Pentaceratops    | 2 Formação Morrison   | Formação jurássica; dinossauro cretáceo |
| 54 Bambiraptor      | 2 Formação Morrison   | Formação jurássica; dinossauro cretáceo |
| 67 Eoraptor         | 6 Formação Anacleto   | Formação cretácea; dinossauro triássico |
| 73 Herrerasaurus    | 6 Formação Anacleto   | Formação cretácea; dinossauro triássico |
| 79 Lufengosaurus    | 3 Formação Djadokhta  | Formação cretácea; dinossauro jurássico |
| 82 Monolophosaurus  | 3 Formação Djadokhta  | Formação cretácea; dinossauro jurássico |
| 86 Omeisaurus       | 3 Formação Djadokhta  | Formação cretácea; dinossauro jurássico |
| 88 Panphagia        | 6 Formação Anacleto   | Formação cretácea; dinossauro triássico |
| 98 Staurikosaurus   | 25 Formação Romualdo  | Formação cretácea; dinossauro triássico |

### 3. Divergências formação × país (4)

| Dinossauro | Formação referenciada | `countryId` | Motivo |
| ---------- | --------------------- | ----------- | ------ |
| 38 Carcharodontosaurus | 4 Formação Bahariya | 12, 13 | O registro lista Marrocos e Argélia; a formação está associada ao Egito |
| 79 Lufengosaurus       | 3 Formação Djadokhta | 3       | Formação mongol; país do registro é a China |
| 82 Monolophosaurus     | 3 Formação Djadokhta | 3       | Formação mongol; país do registro é a China |
| 86 Omeisaurus          | 3 Formação Djadokhta | 3       | Formação mongol; país do registro é a China |

### 4. Nomes de famílias duplicados (9)

| Nome             | IDs       | Situação |
| ---------------- | --------- | -------- |
| Ceratopsidae     | 2, 13     | ID 2 legado sem uso; ID 13 canônico |
| Stegosauridae    | 3, 14     | ID 3 legado sem uso; ID 14 canônico |
| Brachiosauridae  | 4, 12     | ID 4 legado sem uso; ID 12 canônico |
| Dromaeosauridae  | 5, 15     | ID 5 legado sem uso; ID 15 canônico |
| Spinosauridae    | 6, 11     | ID 6 legado sem uso; ID 11 canônico |
| Allosauridae     | 7, 16     | ID 7 legado sem uso; ID 16 canônico |
| Ankylosauridae   | 8, 23     | ID 8 legado sem uso; ID 23 canônico |
| Diplodocidae     | 9, 19     | ID 9 legado sem uso; ID 19 canônico |
| Hadrosauridae    | 10, 21    | ID 10 legado sem uso; ID 21 canônico |

Os IDs legados (`2` a `10`) permanecem na base por compatibilidade, não são
referenciados por nenhum dinossauro e não foram removidos nem renumerados.

---

## Verificações automatizadas

O comando:

```bash
npm run test:data
```

verifica, entre outros pontos:

- IDs únicos e tipos corretos;
- existência de todas as referências escalares e de `countryId`;
- reciprocidade entre dinossauros, descobertas e imagens;
- compatibilidade entre época e período;
- coerência entre continente do dinossauro e continente dos países;
- correspondência exata entre violações reais e entradas da allowlist;
- ausência de entradas obsoletas na allowlist.

---

## Limitações

- As associações de formação das seções 1, 2 e 3 **não foram corrigidas por
  falta de fonte estratigráfica por espécime** no repositório.
- Não foram criadas formações fictícias para eliminar referências órfãs.
- As fontes gerais de cada dinossauro continuam disponíveis no campo `sources`
  de `server/database/dinosaurs.json`.
