# 🛣️ Endpoints

A DinoAPI possui rotas intuitivas para facilitar a busca de dados. Todas as rotas baseiam-se no método `GET`.

## Saúde e Status

### Raiz
* **Descrição:** Retorna o status de funcionamento básico.
* **Método:** `GET`
* **URL:** `/`
* **Resposta Esperada:** Mensagem de boas-vindas e versão da API.

### Status da API
* **Descrição:** Retorna a documentação raiz ou metadados da API.
* **Método:** `GET`
* **URL:** `/api`
* **Resposta Esperada:** Informações de disponibilidade e links úteis.

## Dinossauros

### Listar Todos os Dinossauros
* **Descrição:** Retorna a lista completa de dinossauros. Suporta paginação e filtros.
* **Método:** `GET`
* **URL:** `/api/dinosaurs`
* **Parâmetros:** Veja a seção de [Filtros](filters.md) para opções suportadas.
* **Resposta Esperada:** Array de objetos JSON contendo dados dos dinossauros.

### Buscar Dinossauro por ID
* **Descrição:** Retorna os dados de um dinossauro específico baseado no identificador único.
* **Método:** `GET`
* **URL:** `/api/dinosaurs/:id`
* **Parâmetros de Rota:** `id` (String ou Inteiro).
* **Resposta Esperada:** Objeto JSON único do dinossauro.

### Buscar Dinossauro por Nome
* **Descrição:** Retorna dados de um dinossauro a partir do seu nome exato ou parcial.
* **Método:** `GET`
* **URL:** `/api/dinosaurs/name/:name`
* **Parâmetros de Rota:** `name` (String).
* **Resposta Esperada:** Objeto ou Array de objetos correspondentes.

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