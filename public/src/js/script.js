const API_URL = "/api";
const PLACEHOLDER_IMAGE = "/src/img/dino-placeholder.svg";
const ALLOWED_IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

document.addEventListener("DOMContentLoaded", () => {
  iniciarMenuMobile();
  iniciarBusca();
  carregarResumoApi();
  carregarDinossauros();
  iniciarModal();
  iniciarScrollSpyDocumentacao();
});

/* ==========================================================================
   Menu mobile (drawer)
   ========================================================================== */
function iniciarMenuMobile() {
  const botaoMenu = document.getElementById("botaoMenu");
  const navegacao = document.getElementById("navegacao");
  const sobreposicao = document.getElementById("sobreposicaoMenu");
  if (!botaoMenu || !navegacao || !sobreposicao) return;

  const abrirMenu = () => {
    navegacao.classList.add("navegacao--aberta");
    sobreposicao.classList.add("sobreposicao-menu--visivel");
    botaoMenu.setAttribute("aria-expanded", "true");
    document.body.classList.add("body--sem-scroll");
  };

  const fecharMenu = () => {
    navegacao.classList.remove("navegacao--aberta");
    sobreposicao.classList.remove("sobreposicao-menu--visivel");
    botaoMenu.setAttribute("aria-expanded", "false");
    document.body.classList.remove("body--sem-scroll");
  };

  const alternarMenu = () => {
    const aberto = botaoMenu.getAttribute("aria-expanded") === "true";
    aberto ? fecharMenu() : abrirMenu();
  };

  botaoMenu.addEventListener("click", alternarMenu);
  sobreposicao.addEventListener("click", fecharMenu);

  navegacao.querySelectorAll(".navegacao__link, .navegacao__acoes-mobile .botao")
    .forEach((link) => link.addEventListener("click", fecharMenu));

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fecharMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) fecharMenu();
  });
}

/* ==========================================================================
   Busca (abre/fecha no mobile + filtra a lista de endpoints)
   ========================================================================== */
function iniciarBusca() {
  const botaoBusca = document.getElementById("botaoBusca");
  const campoBusca = document.getElementById("campoBusca");
  const containerBusca = botaoBusca ? botaoBusca.closest(".busca") : null;
  const listaEndpoints = document.getElementById("listaEndpoints");
  const mensagemVazia = document.getElementById("endpointsVazio");

  if (!campoBusca) return;

  if (botaoBusca && containerBusca) {
    botaoBusca.addEventListener("click", () => {
      const aberta = containerBusca.classList.toggle("busca--aberta");
      botaoBusca.setAttribute("aria-expanded", String(aberta));
      if (aberta) campoBusca.focus();
    });

    document.addEventListener("click", (evento) => {
      if (!containerBusca.contains(evento.target)) {
        containerBusca.classList.remove("busca--aberta");
        botaoBusca.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") {
        containerBusca.classList.remove("busca--aberta");
        botaoBusca.setAttribute("aria-expanded", "false");
        campoBusca.blur();
      }
    });
  }

  if (!listaEndpoints) return;
  const itens = Array.from(listaEndpoints.querySelectorAll(".endpoint"));

  campoBusca.addEventListener("input", () => {
    const termo = normalizarTexto(campoBusca.value.trim());
    let visiveis = 0;
    itens.forEach((item) => {
      const rota = normalizarTexto(item.querySelector(".endpoint__rota")?.textContent || "");
      const descricao = normalizarTexto(item.querySelector(".endpoint__descricao")?.textContent || "");
      const extra = normalizarTexto(item.dataset.busca || "");
      const corresponde = !termo || rota.includes(termo) || descricao.includes(termo) || extra.includes(termo);
      item.hidden = !corresponde;
      if (corresponde) visiveis += 1;
    });
    if (mensagemVazia) mensagemVazia.hidden = visiveis !== 0;
  });
}

function normalizarTexto(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* ==========================================================================
   Resumo da API (estatísticas sem valores fixos de fallback)
   ========================================================================== */
async function carregarResumoApi() {
  try {
    const [infoResposta, estatisticasResposta] = await Promise.all([
      fetch(API_URL),
      fetch(`${API_URL}/statistics`)
    ]);

    if (!infoResposta.ok || !estatisticasResposta.ok) {
      throw new Error(`HTTP ${infoResposta.status}/${estatisticasResposta.status}`);
    }

    const info = await infoResposta.json();
    const estatisticas = await estatisticasResposta.json();
    const infoData = info && info.data ? info.data : {};
    const dados = estatisticas && estatisticas.data ? estatisticas.data : {};

    definirEstatistica("totalDinossauros", dados.totalDinosaurs ?? infoData.totalDinosaurs);
    definirEstatistica("totalContinentes", dados.totalContinents);
    definirEstatistica("totalDescobertas", dados.totalDiscoveries);
    definirEstatistica("totalEndpoints", infoData.totalEndpoints);

    console.log("API funcionando:", infoData);
  } catch (erro) {
    ["totalDinossauros", "totalContinentes", "totalDescobertas", "totalEndpoints"]
      .forEach((id) => definirEstatistica(id, null));
    console.error("Erro ao carregar o resumo da API:", erro);
  }
}

function definirEstatistica(id, valor) {
  const elemento = document.getElementById(id);
  if (!elemento) return;

  elemento.textContent = typeof valor === "number" && Number.isFinite(valor)
    ? String(valor)
    : "—";
}

/* ==========================================================================
   Dinossauros
   ========================================================================== */
async function carregarDinossauros() {
  try {
    const resposta = await fetch(`${API_URL}/dinosaurs?limit=12`);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const dados = await resposta.json();
    if (!dados || !Array.isArray(dados.data)) {
      throw new Error("Resposta inválida ao listar dinossauros.");
    }

    renderizarDinossauros(dados.data);
  } catch (erro) {
    console.error("Erro ao carregar dinossauros:", erro);
  }
}

function renderizarDinossauros(dinossauros) {
  const lista = document.getElementById("listaDinossauros");
  if (!lista) return;

  lista.replaceChildren();

  dinossauros.forEach((dino) => {
    const card = document.createElement("article");
    card.classList.add("dino-card");
    card.dataset.id = String(dino.id);
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.addEventListener("click", () => buscarDetalhesDino(dino.id));
    card.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        buscarDetalhesDino(dino.id);
      }
    });

    const imagemContainer = document.createElement("div");
    imagemContainer.classList.add("dino-card__imagem");
    imagemContainer.appendChild(criarImagem(dino.imagem, dino.name));

    const cabecalho = document.createElement("header");
    cabecalho.classList.add("dino-card__header");
    cabecalho.appendChild(criarTexto("h3", dino.name));
    cabecalho.appendChild(criarTexto("p", dino.scientificName));

    const info = document.createElement("div");
    info.classList.add("dino-card__info");
    info.appendChild(criarInfo("Tamanho", formatarNumero(dino.length), "metros"));
    info.appendChild(criarInfo("Altura", formatarNumero(dino.height), "metros"));
    info.appendChild(criarInfo("Peso", formatarNumero(dino.weight), "kg"));
    info.appendChild(criarInfo("Velocidade", formatarNumero(dino.estimatedSpeed), "km/h"));

    const descricao = criarTexto("p", dino.description);
    descricao.classList.add("dino-card__description");

    const status = criarTexto("span", dino.status);
    status.classList.add("dino-card__status");

    card.append(imagemContainer, cabecalho, info, descricao, status);
    lista.appendChild(card);
  });
}

async function buscarDetalhesDino(id) {
  try {
    const resposta = await fetch(`${API_URL}/dinosaurs/${encodeURIComponent(id)}`);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const dados = await resposta.json();
    if (!dados || !dados.data || typeof dados.data !== "object") {
      throw new Error("Resposta inválida ao buscar detalhes do dinossauro.");
    }

    abrirModal(dados.data);
  } catch (erro) {
    console.error("Erro ao buscar detalhes:", erro);
  }
}

function abrirModal(dino) {
  const modal = document.getElementById("modalDino");
  const detalhes = document.getElementById("detalhesDino");
  if (!modal || !detalhes) return;

  detalhes.replaceChildren();

  const imagemContainer = document.createElement("div");
  imagemContainer.classList.add("modal__imagem");
  imagemContainer.appendChild(criarImagem(dino.imagem, dino.name));
  detalhes.appendChild(imagemContainer);

  detalhes.appendChild(criarTexto("h2", dino.name));

  const subtitulo = criarTexto("h3", dino.scientificName);
  subtitulo.classList.add("modal__subtitulo");
  detalhes.appendChild(subtitulo);

  const periodo = dino.periodName || (dino.periodId ? `Período ID: ${dino.periodId}` : "Desconhecido");
  const continente = dino.continentName || (dino.continentId ? `Continente ID: ${dino.continentId}` : "Desconhecido");
  const pais = dino.countryName || (dino.countryId ? `País ID: ${formatarIds(dino.countryId)}` : "Desconhecido");
  const formacao = dino.formationName || (dino.formationId ? `Formação ID: ${formatarIds(dino.formationId)}` : "Desconhecido");

  const grid = document.createElement("div");
  grid.classList.add("modal__grid-info");
  grid.appendChild(criarInfoModal("Comprimento", `${formatarNumero(dino.length)} m`));
  grid.appendChild(criarInfoModal("Altura", `${formatarNumero(dino.height)} m`));
  grid.appendChild(criarInfoModal("Peso", `${formatarNumero(dino.weight)} kg`));
  grid.appendChild(criarInfoModal("Velocidade", `${formatarNumero(dino.estimatedSpeed)} km/h`));
  grid.appendChild(criarInfoModal("Período", periodo));
  grid.appendChild(criarInfoModal("Continente", continente));
  grid.appendChild(criarInfoModal("País", pais));
  grid.appendChild(criarInfoModal("Formação", formacao));
  detalhes.appendChild(grid);

  detalhes.appendChild(criarTexto("h3", "Descrição"));
  detalhes.appendChild(criarTexto("p", dino.description));

  detalhes.appendChild(criarTexto("h3", "Características"));
  detalhes.appendChild(criarLista(dino.characteristics));

  detalhes.appendChild(criarTexto("h3", "Curiosidades"));
  detalhes.appendChild(criarLista(dino.curiosities));

  detalhes.appendChild(criarTexto("h3", "Fontes"));
  detalhes.appendChild(criarLista(dino.sources));

  modal.classList.add("modal--ativo");
}

function iniciarModal() {
  const modal = document.getElementById("modalDino");
  const fechar = document.getElementById("fecharModal");
  if (!modal || !fechar) return;

  fechar.addEventListener("click", () => modal.classList.remove("modal--ativo"));
  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) modal.classList.remove("modal--ativo");
  });
}

/* ==========================================================================
   Helpers de DOM seguro
   ========================================================================== */
function criarTexto(tag, texto) {
  const elemento = document.createElement(tag);
  elemento.textContent = texto === undefined || texto === null ? "" : String(texto);
  return elemento;
}

function criarInfo(rotulo, valor, unidade) {
  const paragrafo = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = `${rotulo}:`;
  paragrafo.appendChild(strong);
  paragrafo.appendChild(document.createTextNode(` ${valor} ${unidade}`));
  return paragrafo;
}

function criarInfoModal(rotulo, valor) {
  const item = document.createElement("div");
  item.classList.add("modal__info-item");
  const strong = document.createElement("strong");
  strong.textContent = `${rotulo}:`;
  item.appendChild(strong);
  item.appendChild(document.createTextNode(` ${valor}`));
  return item;
}

function criarLista(itens) {
  const lista = document.createElement("ul");
  if (!Array.isArray(itens)) return lista;

  itens.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = String(item);
    lista.appendChild(li);
  });

  return lista;
}

function criarImagem(origem, textoAlternativo) {
  const imagem = document.createElement("img");
  const fallbackUrl = new URL(PLACEHOLDER_IMAGE, window.location.href).href;

  imagem.src = resolverImagem(origem);
  imagem.alt = typeof textoAlternativo === "string" && textoAlternativo.trim()
    ? textoAlternativo
    : "Dinossauro";
  imagem.loading = "lazy";

  imagem.addEventListener("error", () => {
    if (imagem.src !== fallbackUrl) {
      imagem.src = fallbackUrl;
    }
  }, { once: true });

  return imagem;
}

function resolverImagem(valor) {
  if (typeof valor !== "string" || valor.trim() === "") {
    return PLACEHOLDER_IMAGE;
  }

  try {
    const url = new URL(valor, window.location.href);
    return ALLOWED_IMAGE_PROTOCOLS.has(url.protocol) ? url.href : PLACEHOLDER_IMAGE;
  } catch (erro) {
    return PLACEHOLDER_IMAGE;
  }
}

function formatarNumero(valor) {
  return typeof valor === "number" && Number.isFinite(valor)
    ? valor.toLocaleString("pt-BR")
    : "—";
}

function formatarIds(valor) {
  return Array.isArray(valor) ? valor.join(", ") : String(valor);
}

/* ==========================================================================
   Scroll Spy para Sidebar da Documentação
   ========================================================================== */
function iniciarScrollSpyDocumentacao() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.doc-nav-link');

  // Segurança: Se não houver seções ou links (ex: está na index.html), interrompe a execução
  if (sections.length === 0 || navLinks.length === 0) return;

  function updateActiveLink() {
    let currentSectionId = '';
    // Offset de 150px para ativar o link um pouco antes do título chegar no topo
    const scrollPosition = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('doc-nav-link--ativo');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('doc-nav-link--ativo');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}
