# 🗄️ Banco de Dados

Para garantir alta performance e manter os custos do projeto nulos, a DinoAPI utiliza arquivos `.json` estáticos como seu banco de dados primário. Estes arquivos são carregados em memória pela aplicação, garantindo respostas instantâneas.

## Estrutura dos Arquivos JSON

Os arquivos de dados residem no diretório correspondente ao banco de dados (geralmente `data/` ou `db/`). Cada arquivo representa uma "tabela" ou entidade.

### Arquivos Previstos

* **`dinosaurs.json`**
  * *Responsabilidade:* Arquivo principal. Contém o registro completo de cada dinossauro (nome, peso, tamanho, imagem, descrições). Ele cruza referências com as outras entidades.

* **`periods.json`**
  * *Responsabilidade:* Armazena as eras geológicas (Triássico, Jurássico, Cretáceo) com suas respectivas datas de início e fim.

* **`formations.json`**
  * *Responsabilidade:* Lista as formações geológicas globais onde os fósseis foram mapeados.

* **`families.json`**
  * *Responsabilidade:* Dados taxonômicos detalhados sobre as famílias (ex: Tyrannosauridae).

* **`clades.json`**
  * *Responsabilidade:* Classificação de clados (ex: Theropoda, Sauropoda) e suas características evolutivas.

* **`continents.json`**
  * *Responsabilidade:* Mapeamento moderno da localização dos achados arqueológicos em relação aos continentes atuais.

* **`habitats.json`**
  * *Responsabilidade:* Descrição dos biomas onde os dinossauros viviam (ex: Pântanos, Planícies áridas).

* **`diets.json`**
  * *Responsabilidade:* Definição dos tipos de alimentação (ex: Carnívoro, Piscívoro, Onívoro).

## Relações
Os dados no `dinosaurs.json` relacionam-se com as entidades auxiliares através de chaves exatas em formato *String* ou identificadores, mantendo a integridade referencial mesmo sem um banco de dados relacional (SQL).