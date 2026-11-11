# ⚖️ Licenciamento

Este documento descreve a política de licenciamento da DinoAtlas API, o escopo de aplicação da licença por componente e a transição da MIT License para a PolyForm Noncommercial License 1.0.0.

> Este documento é técnico e informativo. Ele não constitui parecer jurídico e não substitui aconselhamento especializado.

---

## Modelo adotado

| Item | Definição |
|---|---|
| Licença do snapshot publicado na tag `2.5.0` e das versões futuras | PolyForm Noncommercial License 1.0.0 |
| Identificador SPDX | `PolyForm-Noncommercial-1.0.0` |
| Modelo | **Source-available não comercial** |
| Código aberto segundo a OSI | **Não** |
| Texto oficial | [polyformproject.org/licenses/noncommercial/1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) |

O texto oficial integral, sem modificações, está em [`LICENSE`](../LICENSE). A licença não foi adaptada, resumida ou complementada com cláusulas personalizadas. A linha `Required Notice:` e os avisos de terceiros ficam em [`NOTICE`](../NOTICE), que é o mecanismo previsto pela própria licença para atribuição.

A PolyForm Noncommercial **não é uma licença de código aberto** segundo a Open Source Initiative, pois restringe o uso a finalidades não comerciais.

---

## O que a licença concede

Conforme o texto oficial:

- **Licença de copyright** — fazer tudo o que, de outra forma, infringiria o copyright do licenciante, para qualquer finalidade permitida.
- **Licença de distribuição** — distribuir cópias do software, inclusive com alterações e novas obras permitidas.
- **Licença de alterações e novas obras** — criar alterações e obras derivadas para qualquer finalidade permitida.
- **Licença de patente** — para reivindicações de patente que o licenciante possa licenciar e que seriam infringidas pelo uso do software.

### Finalidades permitidas

- Qualquer finalidade **não comercial**.
- **Usos pessoais**: pesquisa, experimentos, testes em benefício do conhecimento público, estudo pessoal, entretenimento privado, projetos de hobby, atividades amadoras ou observância religiosa, sem aplicação comercial prevista.
- **Organizações não comerciais**: uso por organizações de caridade, instituições de ensino, organizações de pesquisa pública, organizações de segurança ou saúde pública, organizações de proteção ambiental ou instituições governamentais, independentemente da origem do financiamento.
- **Fair use** — os direitos de fair use previstos em lei não são limitados.

### Condições

- **Avisos**: quem recebe uma cópia deve receber também os termos da licença (ou a URL oficial) e as linhas `Required Notice:` fornecidas pelo licenciante.
- **Sem sublicenciamento ou transferência** das licenças concedidas.
- **Defesa de patente**: uma reivindicação escrita de que o software infringe patente encerra imediatamente a licença de patente.
- **Violações**: na primeira notificação escrita, as licenças continuam se o infrator entrar em conformidade e corrigir as violações em até 32 dias; caso contrário, encerram-se imediatamente.
- **Sem garantias**: o software é fornecido "como está", sem garantia ou condição, e o licenciante não responde por danos, na medida permitida pela lei.

---

## O que a licença não permite

A licença concede direitos apenas para **finalidades não comerciais**. Usos com finalidade comercial não estão licenciados por estes termos e dependem de autorização expressa do titular.

| Atividade | Situação |
|---|---|
| Estudar o código | Permitido |
| Utilização para aprendizado | Permitido |
| Modificar o projeto | Permitido |
| Criar forks independentes | Permitido |
| Desenvolver versões derivadas | Permitido |
| Redistribuir gratuitamente | Permitido, respeitadas as condições da licença |
| Compartilhar modificações gratuitamente | Permitido, respeitadas as condições da licença |
| Vender cópias do DinoAtlas | Requer autorização comercial |
| Cobrar pelo acesso à API | Requer autorização comercial |
| Revender versões modificadas | Requer autorização comercial |
| Comercializar a API como serviço | Requer autorização comercial |
| Incorporar o DinoAtlas a produtos comerciais | Requer autorização comercial |

### Limitação importante

A PolyForm Noncommercial 1.0.0 **não define "comercial" em detalhe**. Ela delimita o que é permitido por meio da definição de *finalidade não comercial* e das hipóteses expressas de usos pessoais e organizações não comerciais.

Diante disso:

- A tabela acima descreve a intenção do titular e a leitura direta dos termos, não uma lista exaustiva criada pela licença.
- Atividades híbridas — por exemplo, uso profissional interno, prestação de serviços ou desenvolvimento financiado por terceiros — podem exigir interpretação jurídica caso a caso.
- Não há cláusula adicional no `LICENSE` restringindo ou ampliando esses limites. Qualquer necessidade não coberta deve ser tratada por autorização comercial separada.

---

## Escopo por componente

A PolyForm Noncommercial aplica-se ao **código e à documentação originais do titular**. Ela não relicencia materiais de terceiros.

| Componente | Licenciamento |
|---|---|
| `server/`, `tests/`, `scripts/` e demais arquivos de código originais | PolyForm Noncommercial 1.0.0 |
| `public/` — arquivos originais, **exceto** os quatro assets listados abaixo | PolyForm Noncommercial 1.0.0 |
| `README.md`, `docs/` e demais documentação original | PolyForm Noncommercial 1.0.0 |
| `LICENSE` | Texto oficial da PolyForm Noncommercial 1.0.0 |
| `NOTICE` | Avisos de copyright, `Required Notice:` e avisos de terceiros |
| Fatos e informações paleontológicas | Não são objeto de relicenciamento |
| Compilação, seleção, organização e estrutura original da base JSON | PolyForm Noncommercial 1.0.0 |
| Imagens paleontológicas (hospedadas externamente) | Licenças originais registradas em `server/database/images.json` |
| `public/src/img/dinosaur.svg` | **Excluído do escopo da PolyForm** até confirmação de origem e licença |
| `public/src/img/dinoatlasapi_logo.png` | **Excluído do escopo da PolyForm** até confirmação de origem e licença |
| `public/src/img/hero-skull.png` | **Excluído do escopo da PolyForm** até confirmação de origem e licença |
| `public/src/img/dino-placeholder.svg` | **Excluído do escopo da PolyForm** até confirmação de origem e licença |
| Dependências JavaScript | Licenças originais de cada pacote |

Os quatro assets de `public/src/img/` permanecem **fora do escopo da PolyForm** até que sua origem e licença sejam confirmadas. Esta documentação **não declara** titularidade ou autoria desses arquivos.

### Base de dados paleontológica

- Fatos científicos e informações paleontológicas **não são propriedade exclusiva** do desenvolvedor e não são relicenciados por este projeto.
- As referências bibliográficas e institucionais citadas no campo `sources` de `server/database/dinosaurs.json` são **indicações de fonte**, não conteúdo copiado de terceiros.
- O que pertence ao titular é a **organização original** da base: seleção de registros, estrutura dos JSONs, modelagem dos relacionamentos, nomenclatura dos campos e coordenação do conjunto. Essa camada está coberta pela PolyForm Noncommercial.
- Nenhum dado de terceiro foi relicenciado ou teve sua atribuição removida.

### Imagens

- As 100 imagens paleontológicas são hospedadas externamente (Cloudinary) e cada registro em `server/database/images.json` traz `author`, `license` e, quando aplicável, `modified`/`modification`.
- Licenças registradas: Creative Commons Attribution 4.0, Attribution 3.0, Attribution 2.5, Attribution-ShareAlike 4.0, 3.0 e 2.5, CC0 e domínio público.
- Essas imagens **permanecem sob suas licenças originais** e não são relicenciadas pela PolyForm. Obrigações de atribuição e compartilhamento pela mesma licença (ShareAlike) continuam válidas para cada imagem.
- As imagens locais em `public/src/img/` não possuem autoria documentada e estão **excluídas do escopo da PolyForm** até que origem e licença sejam confirmadas:
  - `dinosaur.svg` contém o comentário `Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools`, indicando origem em repositório de terceiros; a licença aplicável precisa ser verificada na fonte.
  - `dinoatlasapi_logo.png` contém um chunk PNG `tEXt` com metadados `AIGC` (`ContentProducer`, `ProduceID` e `PropagateID`), rótulo de conteúdo gerado por IA que não comprova autoria humana nem titularidade.
  - `hero-skull.png` contém perfil APP1/EXIF com referência a `Picasa`, indicando processamento por ferramenta de terceiros; a origem não está documentada.
  - `dino-placeholder.svg` não contém metadados de autoria; a origem não está documentada.
- Nenhum desses arquivos foi removido, substituído ou modificado por esta auditoria.

### Dependências

O `package-lock.json` registra 442 pacotes: 75 de produção e 367 de desenvolvimento. Nenhuma dependência usa licença copyleft.

| Licença | Pacotes |
|---|---:|
| MIT | 379 |
| ISC | 36 |
| BSD-3-Clause | 10 |
| BlueOak-1.0.0 | 8 |
| Apache-2.0 | 5 |
| CC-BY-4.0 | 1 |
| BSD-2-Clause | 1 |
| 0BSD | 1 |
| MIT OR CC0-1.0 | 1 |

- As dependências **mantêm suas próprias licenças** e não são relicenciadas.
- Obrigações de distribuição: preservar avisos de copyright e textos de licença dos pacotes MIT, ISC, BSD e Apache-2.0; o Apache-2.0 também exige a preservação de arquivos `NOTICE`, quando existirem no pacote.
- A dependência de produção `qs` é BSD-3-Clause; as demais dependências de produção são MIT ou ISC.
- Nenhuma incompatibilidade conhecida entre as licenças das dependências e a PolyForm Noncommercial foi identificada nesta auditoria.

---

## Transição MIT → PolyForm

A transição de licença foi efetivada no histórico do repositório. As distribuições anteriores permanecem sob a MIT License. A alteração do arquivo `LICENSE` não revoga nem modifica retroativamente as permissões já concedidas.

| Versão / estado | Licença |
|---|---|
| Cópias da versão 2.5.0 distribuídas anteriormente, correspondentes ao estado funcional `a9cde67` | MIT License |
| Versões anteriores a 2.5.0, nos respectivos snapshots distribuídos sob MIT | MIT License |
| Snapshot publicado na tag Git `2.5.0` | PolyForm Noncommercial 1.0.0 |
| Versões futuras derivadas do estado publicado sob PolyForm | PolyForm Noncommercial 1.0.0, conforme o respectivo snapshot |

Pontos relevantes:

- As permissões concedidas sob a **MIT License às cópias anteriormente distribuídas não são revogadas** pela mudança posterior de licença. Quem obteve uma cópia sob MIT pode continuar usando aquela cópia nos termos da licença aplicável.
- O commit `a9cde675870cff57632ee5af4b0c09081c53f625` (`a9cde67`) representa o estado funcional anterior da versão 2.5.0, incluindo a correção de privacidade do logger, ainda sob **MIT License**.
- A migração foi efetivada posteriormente, e a tag Git `2.5.0` aponta para o commit `fb0cd705d274ae24b1d3e1904eaf499ceddc40f4`, que contém o snapshot sob **PolyForm Noncommercial 1.0.0**.
- A release `2.5.0` foi publicada no GitHub em **11 de novembro de 2026**.
- A existência de snapshots diferentes associados ao número `2.5.0` deve ser entendida pelo respectivo commit e pela licença que acompanhava cada distribuição.
- A tag identifica o snapshot publicado sob PolyForm; ela **não revoga** nem altera retroativamente os direitos concedidos pela MIT às cópias distribuídas anteriormente.

---

## Atribuição e projetos derivados

A seção **Notices** da PolyForm exige que quem redistribui o software entregue junto uma cópia dos termos (ou a URL oficial) e as linhas `Required Notice:` fornecidas pelo licenciante.

O projeto usa esse mecanismo nativo, sem alterar o texto da licença:

```text
Required Notice: Copyright (c) 2026 Davi Ferreira — Original project: DinoAtlas API — https://github.com/Dferreiraz/DinoAtlasAPI
```

- Projetos derivados devem manter essa linha e a referência ao repositório oficial: <https://github.com/Dferreiraz/DinoAtlasAPI>.
- O nome pessoal do titular não precisa aparecer em destaque; a referência ao repositório oficial é a forma de atribuição desejada.
- Como a exigência está na seção *Notices* e é cumprida por uma linha `Required Notice:`, **a licença continua sendo a PolyForm padrão**, e não uma licença personalizada.
- A obrigação de repasse existe, mas a licença não impõe copyleft: obras derivadas não são obrigadas a adotar a mesma licença.

---

## Autorização comercial

Usos comerciais exigem autorização separada, expressa e por escrito do titular. A autorização comercial é um acordo à parte e não altera o `LICENSE` público.

Contato: [github.com/Dferreiraz](https://github.com/Dferreiraz) — repositório oficial <https://github.com/Dferreiraz/DinoAtlasAPI>.

---

## Pendências que exigem decisão do titular

1. **Titularidade das imagens locais** — `public/src/img/` não possui autoria documentada; `dinosaur.svg` aponta para o SVG Repo e `dinoatlasapi_logo.png` contém metadados `AIGC`. Confirmar origem e licença antes de incluí-las no escopo da PolyForm.
2. **Autorização comercial** — definir o canal, as condições e o modelo de contratação para usos comerciais.
3. **Avisos de terceiros** — manter `NOTICE` e `images.json` atualizados quando novas imagens ou dependências forem adicionadas.
4. **Revisão jurídica** — a auditoria é técnica; a interpretação de casos híbridos de uso comercial não foi validada por profissional do Direito.
