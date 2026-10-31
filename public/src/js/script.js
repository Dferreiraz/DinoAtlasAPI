const API_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
  iniciarMenuMobile();
  iniciarBusca();
  testarAPI();
  carregarDinossauros();
  iniciarModal();
  carregarEstatisticas();
  iniciarScrollSpyDocumentacao(); // <-- Chamada da nova função
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
    document.body.style.overflow = "hidden";
  };

  const fecharMenu = () => {
    navegacao.classList.remove("navegacao--aberta");
    sobreposicao.classList.remove("sobreposicao-menu--visivel");
    botaoMenu.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
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

async function testarAPI() {
  try {
    const res = await fetch(API_URL);
    const dados = await res.json();
    console.log("API funcionando:", dados);
  } catch (erro) {
    console.error("Erro ao testar a API:", erro);
  }
}

async function carregarDinossauros() {
  try {
    const resposta = await fetch(`${API_URL}/dinosaurs?limit=12`);
    const dados = await resposta.json();
    renderizarDinossauros(dados.data);
  } catch (erro) {
    console.error("Erro ao carregar dinossauros:", erro);
  }
}

function renderizarDinossauros(dinossauros) {
  const lista = document.getElementById("listaDinossauros");
  if (!lista) return;

  lista.innerHTML = "";
  dinossauros.forEach((dino) => {
    const card = document.createElement("article");
    card.classList.add("dino-card");
    card.dataset.id = dino.id;
    card.addEventListener("click", () => {
      buscarDetalhesDino(dino.id);
    });

    const imagemSrc = dino.imagem || './img/dino-placeholder.svg';
    
    card.innerHTML = `
      <div class="dino-card__imagem">
        <img src="${imagemSrc}" alt="${dino.name}" onerror="this.src='./img/dino-placeholder.svg'">
      </div>
      <header class="dino-card__header">
        <h3>${dino.name}</h3>
        <p>${dino.scientificName}</p>
      </header>
      <div class="dino-card__info">
        <p><strong>Tamanho:</strong> ${dino.length} metros</p>
        <p><strong>Altura:</strong> ${dino.height} metros</p>
        <p><strong>Peso:</strong> ${dino.weight.toLocaleString()} kg</p>
        <p><strong>Velocidade:</strong> ${dino.estimatedSpeed} km/h</p>
      </div>
      <p class="dino-card__description">${dino.description}</p>
      <span class="dino-card__status">${dino.status}</span>
    `;
    lista.appendChild(card);
  });
}

async function buscarDetalhesDino(id) {
  try {
    const resposta = await fetch(`${API_URL}/dinosaurs/${id}`);
    const dados = await resposta.json();
    abrirModal(dados.data);
  } catch (erro) {
    console.error("Erro ao buscar detalhes:", erro);
  }
}

function abrirModal(dino) {
  const modal = document.getElementById("modalDino");
  const detalhes = document.getElementById("detalhesDino");
  const imagemSrc = dino.imagem || './img/dino-placeholder.png';

  const periodo = dino.periodName || (dino.periodId ? `Período ID: ${dino.periodId}` : 'Desconhecido');
  const continente = dino.continentName || (dino.continentId ? `Continente ID: ${dino.continentId}` : 'Desconhecido');
  const pais = dino.countryName || (dino.countryId ? `País ID: ${Array.isArray(dino.countryId) ? dino.countryId.join(', ') : dino.countryId}` : 'Desconhecido');
  const formacao = dino.formationName || (dino.formationId ? `Formação ID: ${Array.isArray(dino.formationId) ? dino.formationId.join(', ') : dino.formationId}` : 'Desconhecido');

  detalhes.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="${imagemSrc}" alt="${dino.name}" style="max-height: 250px; width: 100%; object-fit: contain; border-radius: 10px;" onerror="this.src='./img/dino-placeholder.png'">
    </div>
    <h2>${dino.name}</h2>
    <h3 style="color: var(--cor-texto-suave); font-weight: 400; margin-bottom: 20px;">${dino.scientificName}</h3>
    
    <div class="modal__grid-info">
      <div class="modal__info-item"><strong>Comprimento:</strong> ${dino.length} m</div>
      <div class="modal__info-item"><strong>Altura:</strong> ${dino.height} m</div>
      <div class="modal__info-item"><strong>Peso:</strong> ${dino.weight.toLocaleString()} kg</div>
      <div class="modal__info-item"><strong>Velocidade:</strong> ${dino.estimatedSpeed} km/h</div>
      <div class="modal__info-item"><strong>Período:</strong> ${periodo}</div>
      <div class="modal__info-item"><strong>Continente:</strong> ${continente}</div>
      <div class="modal__info-item"><strong>País:</strong> ${pais}</div>
      <div class="modal__info-item"><strong>Formação:</strong> ${formacao}</div>
    </div>

    <h3>Descrição</h3>
    <p>${dino.description}</p>

    <h3>Características</h3>
    <ul>${dino.characteristics.map(item => `<li>${item}</li>`).join("")}</ul>

    <h3>Curiosidades</h3>
    <ul>${dino.curiosities.map(item => `<li>${item}</li>`).join("")}</ul>

    <h3>Fontes</h3>
    <ul>${dino.sources.map(item => `<li>${item}</li>`).join("")}</ul>
  `;
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

async function carregarEstatisticas() {
  try {
    const [dinossauros, continentes, descobertas] = await Promise.all([
      fetch(`${API_URL}/dinosaurs?limit=1`).then(res => res.json()),
      fetch(`${API_URL}/continents`).then(res => res.json()),
      fetch(`${API_URL}/discoveries`).then(res => res.json())
    ]);
    
    document.getElementById("totalDinossauros").textContent = dinossauros.meta?.total || 50;
    document.getElementById("totalContinentes").textContent = continentes.data?.length || 7;
    document.getElementById("totalDescobertas").textContent = descobertas.data?.length || 50;
    document.getElementById("totalEndpoints").textContent = 18;
  } catch (erro) {
    console.error("Erro ao carregar estatísticas:", erro);
  }
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