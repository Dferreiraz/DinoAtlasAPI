# 📂 Estrutura do Projeto

A organização de pastas da DinoAtlas API foca na modularidade e na separação de
responsabilidades. Isso garante que o projeto seja fácil de navegar para novos
contribuidores.

## Árvore de Diretórios

```text
DinoAtlasAPI/
├── docs/                    # Documentação em Markdown
├── public/                  # Interface pública e arquivos estáticos
│   └── src/
│       ├── css/             # Estilos
│       ├── js/              # Scripts do frontend
│       ├── img/             # Imagens locais
│       └── page/            # Páginas adicionais (documentação)
├── server/
│   ├── controllers/         # Processamento e resposta das requisições
│   ├── database/            # Arquivos JSON atuando como banco de dados
│   ├── middleware/          # Logger, erros, validação e 404
│   ├── repositories/        # Cache e acesso centralizado aos JSONs
│   ├── routes/              # Definição dos endpoints da API
│   ├── utils/               # Funções auxiliares e formatação
│   ├── app.js               # Instância padrão da aplicação
│   └── createApp.js         # Fábrica da aplicação Express
├── tests/
│   ├── data/                # Integridade dos dados JSON
│   ├── helpers/             # Fixtures e criação de apps de teste
│   ├── integration/         # Testes de integração HTTP
│   └── unit/                # Testes unitários
├── .gitignore               # Arquivos ignorados pelo Git
├── package.json             # Dependências e scripts do projeto
├── README.md                # Apresentação do projeto no GitHub
└── server.js                # Ponto de entrada e encerramento gracioso
```

## Responsabilidades

| Diretório | Responsabilidade |
| --------- | ---------------- |
| `server/controllers` | Receber a requisição, aplicar filtros/paginação e montar a resposta. |
| `server/repositories` | Ler e cachear os JSONs, expor índices por ID e agrupados. |
| `server/routes` | Declarar as rotas e vincular middlewares de validação. |
| `server/middleware` | Logger, `X-Request-Id`, validação de parâmetros, 404 e erros. |
| `server/utils` | Respostas padronizadas, erros, caminhos, versão e contagem de endpoints. |
| `server/database` | Dados paleontológicos e metadados públicos. |
| `tests` | Garantia de contrato, integridade de dados e segurança. |