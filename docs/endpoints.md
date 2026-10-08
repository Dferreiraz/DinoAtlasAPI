# 🛣️ Endpoints

A DinoAtlas API possui rotas intuitivas para facilitar a busca de dados. Todas as rotas baseiam-se no método `GET`.

## Saúde e Estatísticas

### Raiz
- **Descrição:** Retorna o status de funcionamento básico.
- **Método:** `GET`
- **URL:** `/`
- **Resposta Esperada:** Mensagem de boas-vindas e status da API.

### Informações da API
- **Descrição:** Retorna a documentação raiz ou metadados da API.
- **Método:** `GET`
- **URL:** `/api`
- **Resposta Esperada:** Informações da API, versão atual e links úteis.

### Status da API
- **Descrição:** Retorna o status de saúde, tempo de atividade (uptime) e versão atual.
- **Método:** `GET`
- **URL:** `/api/status`
- **Resposta Esperada:** Objeto JSON com dados de saúde do servidor.

### Estatísticas Globais
- **Descrição:** Retorna as contagens dinâmicas reais sobre a base de dados (total de dinossauros, famílias, períodos, continentes, etc.).
- **Método:** `GET`
- **URL:** `/api/statistics`
- **Resposta Esperada:** Objeto JSON com os totais calculados.

---

## 🦖 Dinossauros

### Listar Todos os Dinossauros
- **Descrição:** Retorna a lista completa de dinossauros. Suporta busca textual, ordenação, paginação e filtros numéricos/exatos. Imagens são injetadas automaticamente caso existam.
- **Método:** `GET`
- **URL:** `/api/dinosaurs`
- **Parâmetros:** Veja a seção de [Filtros](filters.md) para opções suportadas.
- **Resposta Esperada:** Array de objetos JSON contendo os dados dos dinossauros e metadados de paginação.

### Buscar Dinossauros Aleatórios
- **Descrição:** Retorna um ou mais dinossauros de forma aleatória, excelente para recursos de "Você sabia?" no Front-end.
- **Método:** `GET`
- **URL:** `/api/dinosaurs/random`
- **Parâmetros de Query:** `limit` (Número entre 1 e 50. Padrão: 1).
- **Resposta Esperada:** Objeto JSON único (se limit=1) ou Array de objetos JSON (se limit > 1).

### Buscar Dinossauro por ID
- **Descrição:** Retorna os dados de um dinossauro específico baseado no identificador único, incluindo dados de imagem injetados.
- **Método:** `GET`
- **URL:** `/api/dinosaurs/:id`
- **Parâmetros de Rota:** `id` (Inteiro).
- **Resposta Esperada:** Objeto JSON único do dinossauro.

### Buscar Dinossauro por Nome
- **Descrição:** Retorna dados de um dinossauro a partir do seu nome exato ou parcial (case-insensitive).
- **Método:** `GET`
- **URL:** `/api/dinosaurs/name/:name`
- **Parâmetros de Rota:** `name` (String).
- **Resposta Esperada:** Array de objetos correspondentes.

### Buscar Imagens do Dinossauro
- **Descrição:** Retorna exclusivamente os dados de mídia (imagens e créditos) vinculados a um dinossauro.
- **Método:** `GET`
- **URL:** `/api/dinosaurs/:id/images`
- **Parâmetros de Rota:** `id` (Inteiro).
- **Resposta Esperada:** Objeto JSON contendo thumbnail, imagem em alta resolução, autor e licença.

---

## 🌍 Atlas Geográfico e Descobertas

Estes endpoints permitem navegar pela base de dados através de relações geográficas e históricas, incluindo a funcionalidade poderosa de listar todos os dinossauros associados a uma determinada localização.

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

### Formações Geológicas
| Descrição | Método | URL | Resposta Esperada |
| :--- | :---: | :--- | :--- |
| Lista todas as formações geológicas | `GET` | `/api/formations` | Array de objetos de formações |
| Busca formação por ID | `GET` | `/api/formations/:id` | Objeto JSON da formação |
| **Lista dinossauros da formação** | `GET` | `/api/formations/:id/dinosaurs` | Array de dinossauros encontrados nesta formação |

### Descobertas e Museus
| Descrição | Método | URL | Resposta Esperada |
| :--- | :---: | :--- | :--- |
| Lista todos os registros de descobertas | `GET` | `/api/discoveries` | Array de objetos de descobertas |
| Busca descoberta por ID | `GET` | `/api/discoveries/:id` | Objeto JSON da descoberta |
| Lista todos os museus parceiros | `GET` | `/api/museums` | Array de objetos de museus |
| Busca museu por ID | `GET` | `/api/museums/:id` | Objeto JSON do museu |

---

## 🏷️ Entidades Relacionadas (Filtros)

Estes endpoints retornam as listas de categorias disponíveis que podem ser utilizadas como filtros na rota principal `/api/dinosaurs`. Todos utilizam o método `GET` e não exigem parâmetros adicionais por padrão.

| Endpoint | Descrição | URL Exemplo |
| :--- | :--- | :--- |
| **Períodos** | Lista todos os períodos geológicos (Ex: Jurássico). | `/api/periods` |
| **Dietas** | Lista os tipos de dieta (Ex: Carnívoro, Herbívoro). | `/api/diets` |
| **Clados** | Lista as classificações de clado. | `/api/clades` |
| **Famílias** | Lista as famílias taxonômicas. | `/api/families` |
| **Habitats** | Lista os tipos de ambientes (Ex: Terrestre, Aquático). | `/api/habitats` |
| **Classificações** | Lista as classificações gerais (Ex: Theropoda, Sauropodomorpha). | `/api/classifications` |