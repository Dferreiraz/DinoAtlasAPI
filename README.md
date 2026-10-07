<h1 align="center">
  🦖 DinoAtlas API
</h1>

<p align="center">
  <strong>Uma API REST para dados paleontológicos</strong><br>
  <em>Back-End • Open Source • Em evolução</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.4.0-blue" alt="Version 2.4.0">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-4.x-black" alt="Express">
  <img src="https://img.shields.io/badge/Status-Em%20desenvolvimento-orange" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

<p align="center">
  •
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

---

## 💻 Sobre o projeto

A **DinoAtlas API**, anteriormente conhecida como **DinoAPI** em sua V1.0, evoluiu para se tornar a base de dados central de um futuro ecossistema paleontológico.

Inspirada em APIs públicas como a **PokeAPI**, a DinoAtlas tem como objetivo disponibilizar dados estruturados sobre dinossauros e outros elementos relacionados à paleontologia através de uma **API REST**.

O projeto foi desenvolvido utilizando **Node.js** e **Express**, seguindo uma arquitetura modular com separação entre controllers, routes, middleware, database e utilities.

Atualmente, os dados são armazenados em arquivos **JSON**, permitindo uma estrutura simples, organizada e de fácil manutenção.

A V2.4.0 conta atualmente com **50 dinossauros cadastrados, todos com imagens associadas**.

### 🎯 Objetivos do projeto

A DinoAtlas foi criada com os seguintes objetivos:

* Fornecer dados paleontológicos estruturados para aplicações externas;
* Praticar desenvolvimento Back-End e arquitetura de APIs REST;
* Trabalhar com filtros, paginação e ordenação de dados;
* Desenvolver uma estrutura modular e escalável;
* Criar um projeto Open Source para portfólio;
* Servir futuramente como base para outros projetos do ecossistema DinoAtlas;
* Continuar expandindo a base de dados paleontológica.

---

## ⚙️ Funcionalidades

### API

* [x] API REST utilizando Node.js e Express
* [x] Estrutura modular com Controllers, Routes e Middleware
* [x] Base de dados utilizando arquivos JSON
* [x] Consulta de dinossauros
* [x] Busca por ID
* [x] Busca por nome
* [x] Busca por nome sem diferenciação entre maiúsculas e minúsculas
* [x] Filtros por características
* [x] Filtros por período
* [x] Filtros por dieta
* [x] Filtros por clado
* [x] Paginação de resultados
* [x] Ordenação de resultados
* [x] Respostas padronizadas em JSON
* [x] Tratamento global de erros
* [x] Tratamento de rotas inexistentes (404)
* [x] Documentação da API
* [x] Rate Limiting
* [x] Front-end integrado

### Imagens

* [x] Sistema de imagens
* [x] Imagem principal das espécies
* [x] Thumbnails
* [x] Créditos das imagens
* [x] Informações de licença
* [x] Endpoint específico para imagens
* [x] Associação de imagens aos dinossauros
* [x] 50 dinossauros com imagens cadastradas

---

## 🌐 API Online

A DinoAtlas API está disponível para consulta online.

**URL Base:**

```text
https://dinoapi-swg8.onrender.com/api
```

### 📚 Documentação

```text
https://dinoapi-swg8.onrender.com
```

A documentação apresenta os endpoints disponíveis, parâmetros, filtros e informações relacionadas aos recursos da API.

---

## 🗺️ Roadmap

O desenvolvimento da DinoAtlas é dividido em versões, permitindo que a API evolua gradualmente.

### ✅ V2.0 — DinoAtlas

* Nova identidade do projeto
* Nova organização da API
* Reestruturação da arquitetura
* Expansão da base de dados

### ✅ V2.1 — API Estruturada

* Melhorias nos endpoints
* Filtros
* Paginação
* Ordenação
* Tratamento de erros
* Melhor organização dos dados

### ✅ V2.2 — Sistema de Imagens

* Sistema de imagens
* Imagem principal
* Thumbnails
* Créditos
* Licenças
* Relacionamento entre dinossauros e imagens

### ✅ V2.3 — Expansão da API

* Melhorias nos recursos existentes
* Expansão dos endpoints
* Melhorias na estrutura dos dados
* Evolução da documentação

### ✅ V2.4 — Base Expandida

* 50 dinossauros cadastrados
* Imagens para todas as espécies cadastradas
* Sistema de Rate Limiting
* Melhorias gerais na API
* Evolução da documentação

### 🔜 Próximas versões

Os próximos passos planejados incluem:

* [ ] Adicionar mais espécies
* [ ] Integração com o ecossistema DinoDex
* [ ] Criar relacionamentos mais complexos entre os dados
* [ ] Expandir informações paleontológicas
* [ ] Melhorar os recursos de busca e consulta
* [ ] Evoluir a estrutura da API para suportar uma base de dados cada vez maior

---

## 🚀 Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Dferreiraz/DinoAtlasAPI.git
```

### 2. Entre na pasta

```bash
cd DinoAtlasAPI
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute o projeto

Para executar em ambiente de produção:

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

### Imagens de um dinossauro

```http
GET /api/dinosaurs/:id/images
```

### Imagens

```http
GET /api/images
```

### Documentação completa

A documentação detalhada dos endpoints está disponível em:

```text
/docs
```

Também é possível acessar a documentação online através do deploy da API:

```text
https://dinoapi-swg8.onrender.com
```

---

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Visual Studio Code](https://code.visualstudio.com/)

---

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
│   ├── routes/            # Definição dos endpoints
│   ├── utils/             # Funções auxiliares
│   └── app.js             # Configuração da aplicação Express
│
├── package.json
├── README.md
└── server.js              # Ponto de entrada da aplicação
```

---

## 💪 Como contribuir

Contribuições são bem-vindas!

### 1. Faça um fork do projeto

### 2. Crie uma nova branch

```bash
git checkout -b minha-feature
```

### 3. Faça suas alterações

Implemente sua melhoria, correção ou nova funcionalidade.

### 4. Crie um commit

```bash
git commit -m "feat: nova funcionalidade"
```

### 5. Envie sua branch

```bash
git push origin minha-feature
```

Depois, abra um **Pull Request** para o repositório principal.

---

## 🦸 Autor

Desenvolvido por **Davi Ferreira**.

<a href="https://br.linkedin.com/in/davirobertoferreira">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
</a>

<a href="https://github.com/Dferreiraz">
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
</a>

---

## 📄 Licença

Este projeto está sob a licença **MIT**.

Veja o arquivo [LICENSE](./LICENSE) para mais informações.
