
<h1 align="center">
  🦖 DinoAtlas API
</h1>

<p align="center">
  <strong>Version 2.0.0</strong>
</p>

<!-- ---------------------------------------------------------------------- -->

<p align="center">
  •
  <a href="#-descrição-do-projeto">Descrição</a> •
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-deploy">Deploy</a> •
  <a href="#-como-executar-o-projeto">Como executar</a> •
  <a href="#-exemplos-de-endpoints">Endpoints</a> •
<br>
  •
  <a href="#-pré-requisitos">Pré-requisitos</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-estrutura-do-projeto">Estrutura</a> •
  <a href="#-como-contribuir">Contribuir</a> •
  <a href="#-autor">Autor</a> 
  •
</p>

<!-- ---------------------------------------------------------------------- -->

## 📄 Descrição do projeto

## 🌐 API Online

https://dinoapi-swg8.onrender.com/api

## 📚 Documentação

https://dinoapi-swg8.onrender.com

---

<!-- ---------------------------------------------------------------------- -->

## 💻 Sobre o projeto

A **DinoAtlas API**, anteriormente conhecida como **DinoAPI** em sua V1.0, evoluiu para se tornar a base de dados central de um ecossistema paleontológico.

O projeto foi inspirado em APIs públicas como a **PokeAPI**, porém com foco no universo da paleontologia.

A API foi desenvolvida utilizando **Node.js** e **Express**, seguindo uma estrutura modular composta por controllers, routes, middleware, database e utilities.

Os dados são armazenados em arquivos **JSON**, permitindo uma estrutura simples, rápida e de fácil manutenção para consultas de leitura e expansão da base de dados.

A DinoAtlas foi criada pensando em:

* Fornecer dados paleontológicos estruturados para a comunidade desenvolvedora;
* Praticar desenvolvimento Back-End e arquitetura de APIs REST;
* Construir um projeto open source profissional;
* Servir como projeto de portfólio;
* Futuramente integrar diferentes aplicações do ecossistema DinoAtlas.

---

<!-- ---------------------------------------------------------------------- -->

## 🌍 Deploy

A **DinoAtlas API** está disponível publicamente para consumo:

**URL Base:**

```text
https://dinoapi-swg8.onrender.com/api
```

A API pode ser utilizada por aplicações externas através dos endpoints disponíveis.

---

<!-- ---------------------------------------------------------------------- -->

## ⚙️ Funcionalidades

* [x] API REST utilizando Node.js e Express
* [x] Estrutura modular com Controllers, Routes e Middleware
* [x] Base de dados utilizando arquivos JSON
* [x] Consulta de dinossauros
* [x] Busca por ID
* [x] Busca por nome
* [x] Busca por nome sem diferenciação entre maiúsculas e minúsculas
* [x] Filtros por características
* [x] Filtros por período, dieta, clado e outros atributos
* [x] Paginação de resultados
* [x] Ordenação de resultados
* [x] Respostas padronizadas em JSON
* [x] Tratamento global de erros
* [x] Tratamento de rotas inexistentes (404)
* [x] Documentação da API
* [x] Front-end integrado
* [x] Nova identidade e estrutura **DinoAtlas V2.0**

### Próximos passos

* [ ] Integração com o ecossistema DinoDex
* [ ] Adicionar mais espécies
* [ ] Adicionar imagens das espécies
* [ ] Criar relacionamentos mais complexos entre dados
* [ ] Implementar Rate Limiting
* [ ] Novos recursos paleontológicos

---

<!-- ---------------------------------------------------------------------- -->

## 🚀 Como executar o projeto

### 1 - Clonar o projeto

```bash
git clone https://github.com/Dferreiraz/DinoAtlasAPI.git

### 2 - Entrar na pasta

```bash
cd DinoAtlasAPI
```

### 3 - Instalar as dependências

```bash
npm install
```

### 4 - Executar o projeto

```bash
npm start
```

Para executar em ambiente de desenvolvimento:

```bash
npm run dev
```

A API estará disponível localmente em:

```text
http://localhost:3000
```

---

<!-- ---------------------------------------------------------------------- -->

## 📌 Exemplos de Endpoints

### Informações e metadados da API

```http
GET /api
```

### Listar dinossauros

```http
GET /api/dinosaurs
```

O endpoint suporta recursos como paginação, filtros e ordenação.

### Buscar dinossauro por ID

```http
GET /api/dinosaurs/1
```

### Buscar dinossauro por nome

```http
GET /api/dinosaurs/name/Tyrannosaurus
```

### Documentação completa

A documentação detalhada dos endpoints está disponível na pasta:

```text
/docs
```

Nela estão documentados os recursos disponíveis na API, incluindo informações relacionadas a períodos, dietas, famílias e outros dados paleontológicos.

---

<!-- ---------------------------------------------------------------------- -->

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Visual Studio Code](https://code.visualstudio.com/)

---

<!-- ---------------------------------------------------------------------- -->

## 🛠 Tecnologias

As seguintes tecnologias e ferramentas foram utilizadas no desenvolvimento do projeto:

### Back-End

* **Node.js**
* **Express**
* **JavaScript**
* **CommonJS**
* **JSON Database**
* **REST API**

### Ferramentas

* **Git**
* **GitHub**
* **Visual Studio Code**
* **NPM**
* **Nodemon**

---

<!-- ---------------------------------------------------------------------- -->

## 📂 Estrutura do projeto

```text
DinoAtlas API
│
├── docs/                  # Documentação detalhada da API
│
├── public/                # Arquivos estáticos e front-end
│
├── server/
│   ├── controllers/       # Lógica de processamento e respostas
│   ├── database/          # Arquivos JSON com dados paleontológicos
│   ├── middleware/        # Middlewares, erros e rotas não encontradas
│   ├── routes/            # Definição dos endpoints da API
│   ├── utils/             # Funções auxiliares
│   └── app.js             # Configuração da aplicação Express
│
├── package.json
├── README.md
└── server.js              # Ponto de entrada da aplicação
```

---

<!-- ---------------------------------------------------------------------- -->

## 💪 Como contribuir

Contribuições são bem-vindas!

### 1 - Faça um fork do projeto

### 2 - Crie uma nova branch

```bash
git checkout -b minha-feature
```

### 3 - Faça suas alterações

Implemente a melhoria, correção ou nova funcionalidade.

### 4 - Crie um commit

```bash
git commit -m "feat: nova funcionalidade"
```

### 5 - Envie sua branch

```bash
git push origin minha-feature
```

Depois, abra um **Pull Request** para o repositório principal.

---

<!-- ---------------------------------------------------------------------- -->

## 🦸 Autor

<a href="https://br.linkedin.com/in/davirobertoferreira">
  Davi Ferreira
</a>

[![LinkedIn](https://img.shields.io/badge/-LinkedIn-blue?style=flat-square\&logo=linkedin)](https://br.linkedin.com/in/davirobertoferreira)

---

<!-- ---------------------------------------------------------------------- -->

<!--
## 📝 Licença

Este projeto está sob a licença [MIT](./LICENSE).

Feito por **Davi Ferreira** 👋🏽
