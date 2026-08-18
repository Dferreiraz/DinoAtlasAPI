# 🤝 Contribuição

A DinoAtlasAPI é um projeto colaborativo e todas as contribuições são bem-vindas! Seja adicionando um novo dinossauro, corrigindo um erro ortográfico ou melhorando o código da aplicação.

## Como Contribuir

1. Faça um **Fork** do repositório.
2. Crie uma branch para a sua feature (`git checkout -b feature/novo-recurso`).
3. Faça o commit das suas alterações (`git commit -m 'Feat: Adiciona recurso X'`).
4. Faça o push para a branch (`git push origin feature/novo-recurso`).
5. Abra um **Pull Request**.

## Padrão de Código e Boas Práticas
* Siga o padrão arquitetural do projeto.
* O código-fonte deve ser escrito em inglês (variáveis, funções), porém a documentação e os dados retornados nos JSONs devem estar em português.
* Mantenha o código limpo, comentado onde necessário e execute os testes antes de realizar o commit.

## Como Adicionar Novos Dinossauros
1. Navegue até a pasta `data/` e abra o arquivo `dinosaurs.json`.
2. Adicione o novo objeto JSON seguindo estritamente a estrutura existente, sem pular chaves obrigatórias.
3. Verifique se os campos de categoria (período, dieta) coincidem com os dados cadastrados nos outros arquivos JSON.
4. Teste localmente garantindo que o novo dinossauro é retornado no endpoint `/api/dinosaurs`.

## Reportando Problemas (Issues)
Se você encontrou um erro na API, dados inconsistentes ou links quebrados:
* Utilize a aba **Issues** do GitHub.
* Descreva o problema detalhadamente.
* Forneça a URL utilizada e a resposta recebida.

## Sugerindo Melhorias
Possui uma ideia legal para filtros, rotas ou dados extras? Abra uma **Issue** com a tag `enhancement` (melhoria) explicando sua sugestão antes de iniciar o desenvolvimento. Isso garante que nossa comunidade discuta a ideia antes do seu esforço.