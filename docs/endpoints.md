# 🛣️ Endpoints

A DinoAtlas API possui rotas intuitivas para facilitar a busca de dados. Todas
as rotas de dados baseiam-se no método `GET`.

## Regras gerais

- Respostas de sucesso seguem `{ "success": true, "data": ... }`, com `meta`
  quando aplicável.
- Respostas de erro seguem `{ "success": false, "message": "..." }` e nunca
  incluem stack trace, caminhos internos ou detalhes técnicos.
- Parâmetros de rota `:id` devem ser inteiros positivos. ID sintaticamente
  inválido retorna **400**; ID válido e inexistente retorna **404**.
- Zeros à esquerda são aceitos em IDs (`/api/dinosaurs/01` equivale a `1`).
- Rotas inexistentes retornam **404** com `"Rota não encontrada."`.
- A API aplica rate limiting em `/api` (100 requisições por 15 minutos por IP em
  produção). Ao exceder, retorna **429**.

---

## Saúde e Estatísticas

### Raiz
- **Descrição:** Serve a interface pública (`public/index.html`).
- **Método:** `GET`
- **URL:** `/`
- **Resposta Esperada:** Documento HTML.

### Documentação
- **Descrição:** Serve a página de documentação da API
  (`public/src/page/documentacao.html`) diretamente em `/docs`, preservando a
  URL na barra de endereço.
- **Método:** `GET`
- **URL:** `/docs` (também aceita `/docs/`)
- **Resposta Esperada:** Documento HTML.
- **Observações:** os recursos relativos da página (CSS, JavaScript, imagens e o
  link para a home) são atendidos por aliases estáticos em `/css`, `/js` e
  `/img`; não há redirecionamento.

### Informações da API
- **Descrição:** Retorna os metadados da API e o total de dinossauros.
- **Método:** `GET`
- **URL:** `/api`
- **Resposta Esperada:** Objeto JSON com `name`, `version`, `description`,
  `status`, `totalDinosaurs`, `totalEndpoints`, `author`, `github` e
  `lastUpdate`.
- **Observações:** `version` é lida de `package.json` (fonte única) e
  `totalEndpoints` é calculado a partir das rotas `GET` efetivamente montadas
  sob `/api` (atualmente 36), sem lista manual sujeita a divergência.

### Health Check
- **Descrição:** Verificação operacional leve, usada por *probes* de
  infraestrutura. Fica fora de `/api`, portanto não é afetado pelo rate limiter
  das rotas de dados.
- **Método:** `GET`
- **URL:** `/health`
- **Resposta Esperada:** Objeto JSON com `success: true` e `data` contendo
  `status` (`ok`), `version`, `uptime` e `timestamp`.

### Status da API
- **Descrição:** Retorna o status de saúde, tempo de atividade (uptime) e versão
  do serviço.
- **Método:** `GET`
- **URL:** `/api/status`
- **Resposta Esperada:** Objeto JSON com `status`, `version`, `timestamp` e
  `uptime`.

### Estatísticas Globais
- **Descrição:** Retorna contagens dinâmicas calculadas a partir dos JSONs.
- **Método:** `GET`
- **URL:** `/api/statistics`
- **Resposta Esperada:** Objeto JSON com os totais de registros das tabelas
  (`totalDinosaurs`, `totalFamilies`, `totalPeriods`, `totalContinents`,
  `totalCountries`, `totalDiscoveries`) e um bloco `usage` com a quantidade de
  valores distintos realmente referenciados pelos dinossauros
  (`families`, `periods`, `continents`, `countries`).
- **Observações:** os totais de tabela incluem registros legados que podem não
  ser usados por nenhum dinossauro. Use `usage` para saber quantos valores
  distintos estão de fato em uso. Por exemplo, `totalFamilies` conta todas as
  famílias cadastradas, enquanto `usage.families` conta apenas as referenciadas.

---

## 🦖 Dinossauros

### Listar Todos os Dinossauros
- **Descrição:** Retorna a lista paginada de dinossauros. Suporta busca textual,
  ordenação, paginação e filtros numéricos/exatos. Imagens são injetadas
  automaticamente quando existem.
- **Método:** `GET`
- **URL:** `/api/dinosaurs`
- **Parâmetros:** Veja a seção de [Filtros](filters.md) para opções e regras.
- **Resposta Esperada:** Array de objetos JSON com metadados de paginação
  (`page`, `limit`, `total`, `totalPages`).

### Buscar Dinossauros Aleatórios
- **Descrição:** Retorna um ou mais dinossauros de forma aleatória.
- **Método:** `GET`
- **URL:** `/api/dinosaurs/random`
- **Parâmetros de Query:** `limit` (inteiro entre 1 e 50; padrão 1).
- **Resposta Esperada:** Objeto JSON único (se `limit=1`) ou array de objetos
  (se `limit > 1`), com `meta.count`.

### Buscar Dinossauro por ID
- **Descrição:** Retorna os dados de um dinossauro específico, incluindo dados
  de imagem injetados.
- **Método:** `GET`
- **URL:** `/api/dinosaurs/:id`
- **Parâmetros de Rota:** `id` (inteiro positivo).
- **Resposta Esperada:** Objeto JSON único do dinossauro.

### Buscar Dinossauro por Nome
- **Descrição:** Retorna dinossauros cujo nome contenha o termo informado
  (parcial e *case-insensitive*).
- **Método:** `GET`
- **URL:** `/api/dinosaurs/name/:name`
- **Parâmetros de Rota:** `name` (string, no máximo 100 caracteres).
- **Resposta Esperada:** Array de objetos correspondentes ou **404** quando não
  houver correspondência.

### Buscar Imagens do Dinossauro
- **Descrição:** Retorna exclusivamente os registros de mídia (imagens e
  créditos) vinculados a um dinossauro.
- **Método:** `GET`
- **URL:** `/api/dinosaurs/:id/images`
- **Parâmetros de Rota:** `id` (inteiro positivo).
- **Resposta Esperada:** Array de imagens com `meta.dinosaurId` e `meta.total`.
  Retorna **404** se o dinossauro não existir.

### Listar Todas as Imagens
- **Descrição:** Retorna todos os registros de mídia da base.
- **Método:** `GET`
- **URL:** `/api/images`
- **Resposta Esperada:** Array de imagens com `meta.total`.
  > Não existe rota `/api/images/:id`.

---

## 🌍 Atlas Geográfico e Descobertas

Estes endpoints permitem navegar pela base de dados através de relações
geográficas e históricas, incluindo a listagem de dinossauros associados a uma
localização.

### Continentes
| Descrição | Método | URL | Resposta Esperada |
| :--- | :---: | :--- | :--- |
| Lista todos os continentes | `GET` | `/api/continents` | Array de objetos de continentes |
| Busca continente por ID | `GET` | `/api/continents/:id` | Objeto JSON do continente |
| **Lista dinossauros do continente** | `GET` | `/api/continents/:id/dinosaurs` | Array de dinossauros encontrados nesta região |

### Países
| Descrição | Método | URL | Resposta Esperada |
| :--- | :---: | :--- | :--- |
| Lista todos os países | `GET` | `/api/countries` | Array de objetos de países |
| Busca país por ID | `GET` | `/api/countries/:id` | Objeto JSON do país |
| **Lista dinossauros do país** | `GET` | `/api/countries/:id/dinosaurs` | Array de dinossauros encontrados neste país |

> `countryId`, nos dinossauros, representa o(s) país(es) onde o fóssil foi
> descoberto.

### Formações Geológicas
| Descrição | Método | URL | Resposta Esperada |
| :--- | :---: | :--- | :--- |
| Lista todas as formações geológicas | `GET` | `/api/formations` | Array de objetos de formações |
| Busca formação por ID | `GET` | `/api/formations/:id` | Objeto JSON da formação |
| **Lista dinossauros da formação** | `GET` | `/api/formations/:id/dinosaurs` | Array de dinossauros encontrados nesta formação |

> Consulte [Integridade dos Dados](data-integrity.md) para as pendências
> conhecidas de associação entre dinossauros e formações.

### Descobertas e Museus
| Descrição | Método | URL | Resposta Esperada |
| :--- | :---: | :--- | :--- |
| Lista todos os registros de descobertas | `GET` | `/api/discoveries` | Array de objetos de descobertas |
| Busca descoberta por ID | `GET` | `/api/discoveries/:id` | Objeto JSON da descoberta |
| Lista todos os museus parceiros | `GET` | `/api/museums` | Array de objetos de museus |
| Busca museu por ID | `GET` | `/api/museums/:id` | Objeto JSON do museu |

### Períodos e Épocas
| Descrição | Método | URL | Resposta Esperada |
| :--- | :---: | :--- | :--- |
| Lista todos os períodos | `GET` | `/api/periods` | Array de períodos geológicos |
| Busca período por ID | `GET` | `/api/periods/:id` | Objeto JSON do período |
| Lista todas as épocas | `GET` | `/api/epochs` | Array de épocas geológicas |
| Busca época por ID | `GET` | `/api/epochs/:id` | Objeto JSON da época |

---

## 🏷️ Entidades Relacionadas (Filtros)

Estes endpoints retornam as listas de categorias disponíveis que podem ser
utilizadas como filtros na rota principal `/api/dinosaurs`. Todos utilizam o
método `GET` e não exigem parâmetros adicionais.

| Endpoint | Descrição | URL Exemplo |
| :--- | :--- | :--- |
| **Períodos** | Lista todos os períodos geológicos (ex: Jurássico). | `/api/periods` |
| **Épocas** | Lista as épocas geológicas. | `/api/epochs` |
| **Dietas** | Lista os tipos de dieta (ex: Carnívoro, Herbívoro). | `/api/diets` |
| **Clados** | Lista as classificações de clado. | `/api/clades` |
| **Famílias** | Lista as famílias taxonômicas. | `/api/families` |
| **Habitats** | Lista os tipos de ambientes (ex: Terrestre, Aquático). | `/api/habitats` |
| **Classificações** | Lista as classificações gerais. | `/api/classifications` |
| **Museus** | Lista os museus parceiros. | `/api/museums` |
| **Imagens** | Lista todos os registros de mídia. | `/api/images` |

Cada entidade com rota `/:id` aceita somente IDs inteiros positivos, seguindo as
regras gerais desta página.

### Consulta por ID das entidades relacionadas

| Descrição | Método | URL | Resposta Esperada |
| :--- | :---: | :--- | :--- |
| Busca dieta por ID | `GET` | `/api/diets/:id` | Objeto JSON da dieta |
| Busca clado por ID | `GET` | `/api/clades/:id` | Objeto JSON do clado |
| Busca família por ID | `GET` | `/api/families/:id` | Objeto JSON da família |
| Busca habitat por ID | `GET` | `/api/habitats/:id` | Objeto JSON do habitat |
| Busca classificação por ID | `GET` | `/api/classifications/:id` | Objeto JSON da classificação |
