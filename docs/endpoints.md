# 🛣️ Endpoints

A DinoAtlasAPI possui rotas intuitivas para facilitar a busca de dados. Todas as rotas baseiam-se no método `GET`.

## Saúde e Estatísticas

### Raiz
* **Descrição:** Retorna o status de funcionamento básico.
* **Método:** `GET`
* **URL:** `/`
* **Resposta Esperada:** Mensagem de boas-vindas.

### Informações da API
* **Descrição:** Retorna a documentação raiz ou metadados da API.
* **Método:** `GET`
* **URL:** `/api`
* **Resposta Esperada:** Informações da API e versão.

### Status da API (Novo V2.3)
* **Descrição:** Retorna o status de saúde, tempo de atividade (uptime) e versão atual.
* **Método:** `GET`
* **URL:** `/api/status`
* **Resposta Esperada:** Objeto JSON com dados de saúde do servidor.

### Estatísticas Globais (Novo V2.3)
* **Descrição:** Retorna as contagens dinâmicas reais sobre a base de dados (total de dinossauros, famílias, períodos, continentes, etc.).
* **Método:** `GET`
* **URL:** `/api/statistics`
* **Resposta Esperada:** Objeto JSON com os totais calculados.

## Dinossauros

### Listar Todos os Dinossauros
* **Descrição:** Retorna a lista completa de dinossauros. Suporta busca textual, ordenação, paginação e filtros numéricos/exatos. Imagens são injetadas automaticamente caso existam.
* **Método:** `GET`
* **URL:** `/api/dinosaurs`
* **Parâmetros:** Veja a seção de [Filtros](filters.md) para opções suportadas.
* **Resposta Esperada:** Array de objetos JSON contendo os dados dos dinossauros.

### Buscar Dinossauros Aleatórios (Novo V2.3)
* **Descrição:** Retorna um ou mais dinossauros de forma aleatória, excelente para recursos de "Você sabia?" no Front-end.
* **Método:** `GET`
* **URL:** `/api/dinosaurs/random`
* **Parâmetros de Query:** `limit` (Número entre 1 e 50. Padrão: 1).
* **Resposta Esperada:** Objeto JSON único (se limit=1) ou Array de objetos JSON (se limit > 1).

### Buscar Dinossauro por ID
* **Descrição:** Retorna os dados de um dinossauro específico baseado no identificador único.
* **Método:** `GET`
* **URL:** `/api/dinosaurs/:id`
* **Parâmetros de Rota:** `id` (Inteiro).
* **Resposta Esperada:** Objeto JSON único do dinossauro.

### Buscar Dinossauro por Nome
* **Descrição:** Retorna dados de um dinossauro a partir do seu nome exato ou parcial.
* **Método:** `GET`
* **URL:** `/api/dinosaurs/name/:name`
* **Parâmetros de Rota:** `name` (String).
* **Resposta Esperada:** Array de objetos correspondentes.

### Buscar Imagens do Dinossauro (Novo V2.2)
* **Descrição:** Retorna exclusivamente os dados de mídia (imagens e créditos) vinculados a um dinossauro.
* **Método:** `GET`
* **URL:** `/api/dinosaurs/:id/images`
* **Parâmetros de Rota:** `id` (Inteiro).
* **Resposta Esperada:** Objeto JSON contendo thumbnail, imagem em alta resolução, autor e licença.

## Entidades Relacionadas

Estes endpoints retornam as listas de categorias disponíveis que podem ser utilizadas como filtros na rota principal. Todos utilizam o método `GET` e não exigem parâmetros adicionais por padrão.

| Endpoint | Descrição | URL Exemplo |
|----------|-------------|-------------|
| **Períodos** | Lista todos os períodos geológicos (Ex: Jurássico). | `/api/periods` |
| **Dietas** | Lista os tipos de dieta (Ex: Carnívoro, Herbívoro). | `/api/diets` |
| **Clados** | Lista as classificações de clado. | `/api/clades` |
| **Famílias** | Lista as famílias taxonômicas. | `/api/families` |
| **Formações** | Lista formações geológicas onde fósseis foram achados. | `/api/formations` |
| **Continentes** | Lista os continentes modernos onde fósseis existem. | `/api/continents` |
| **Habitats** | Lista os tipos de ambientes (Ex: Terrestre, Aquático). | `/api/habitats` |