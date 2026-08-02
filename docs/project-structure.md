# 📂 Estrutura do Projeto

A organização de pastas da DinoAPI foca na modularidade e na separação de responsabilidades. Isso garante que o projeto seja fácil de navegar para novos contribuidores.

## Árvore de Diretórios

```text
dinoapi/
├── data/              # Arquivos JSON atuando como banco de dados
├── docs/              # Arquivos de documentação em Markdown
├── src/               # Código-fonte principal da API
│   ├── controllers/   # Lógica de processamento e resposta das requisições
│   ├── routes/        # Definição dos endpoints da API
│   ├── services/      # Lógica de negócios, filtros e buscas
│   ├── utils/         # Funções auxiliares e formatação
│   └── app.js         # Configuração principal do Express (ou similar)
├── tests/             # Suíte de testes automatizados
├── .gitignore         # Arquivos ignorados pelo Git
├── package.json       # Dependências e scripts do projeto
├── README.md          # Apresentação do projeto no GitHub
└── server.js          # Ponto de entrada da aplicação (Entrypoint)