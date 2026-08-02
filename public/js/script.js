const API_URL = "/api";

document.addEventListener("DOMContentLoaded", () => {
    iniciarMenuMobile();
    iniciarBusca();
    testarAPI();
    carregarDinossauros();
    iniciarModal();
    carregarEstatisticas();
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

    // Fecha o menu ao clicar em algum link de navegação
    navegacao.querySelectorAll(".navegacao__link, .navegacao__acoes-mobile .botao")
        .forEach((link) => link.addEventListener("click", fecharMenu));

    // Fecha com a tecla Esc
    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") fecharMenu();
    });

    // Se a tela for redimensionada para desktop, garante que o menu feche
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

    // Abrir/fechar o campo de busca no mobile
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

    // Filtro em tempo real dos endpoints listados na seção "Endpoints Populares"
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
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

async function testarAPI() {
    try {
        const res = await fetch(API_URL);

        const dados = await res.json();

        console.log("API funcionando:", dados)

    } catch (erro) {
        console.error("Erro ao testar a API:", erro);
    }
}

async function carregarDinossauros() {
    try {
        const resposta = await fetch(`${API_URL}/dinosaurs`);

        const dados = await resposta.json();

        console.log("Dinossauros carregados:", dados);

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

        card.innerHTML = `

<!--
<div class="dino-card__imagem">
    <img 
      src="${dino.imagem || './img/dino-placeholder.png'}"
      alt="${dino.name}"
    >
</div>
-->


<header class="dino-card__header">
    <h3>${dino.name}</h3>
    <p>${dino.scientificName}</p>
</header>

<div class="dino-card__info">

<p>
<strong>📏 Tamanho:</strong>
${dino.length} metros
</p>

<p>
<strong>📐 Altura:</strong>
${dino.height} metros
</p>

<p>
<strong>⚖️ Peso:</strong>
${dino.weight.toLocaleString()} kg
</p>

<p>
<strong>⚡ Velocidade:</strong>
${dino.estimatedSpeed} km/h
</p>

</div>


<p class="dino-card__description">
${dino.description}
</p>


<span class="dino-card__status">
${dino.status}
</span>

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

        console.error(
            "Erro ao buscar detalhes:",
            erro
        );

    }

}

function abrirModal(dino) {

    const modal = document.getElementById("modalDino");
    const detalhes = document.getElementById("detalhesDino");

    detalhes.innerHTML = `

    <h2>${dino.name}</h2>

    <h3>${dino.scientificName}</h3>

    <p>
      <strong>Significado:</strong>
      ${dino.meaning}
    </p>

    <p>
      <strong>Descrição:</strong>
      ${dino.description}
    </p>


    <h3>Características</h3>

    <ul>
      ${dino.characteristics
            .map(item => `<li>${item}</li>`)
            .join("")}
    </ul>


    <h3>Curiosidades</h3>

    <ul>
      ${dino.curiosities
            .map(item => `<li>${item}</li>`)
            .join("")}
    </ul>


    <h3>Fontes</h3>

    <ul>
      ${dino.sources
            .map(item => `<li>${item}</li>`)
            .join("")}
    </ul>

  `;


    modal.classList.add("modal--ativo");

}

function iniciarModal() {

    const modal = document.getElementById("modalDino");
    const fechar = document.getElementById("fecharModal");


    if (!modal || !fechar) return;


    fechar.addEventListener(
        "click",
        () => {
            modal.classList.remove("modal--ativo");
        }
    );


    modal.addEventListener(
        "click",
        (evento) => {

            if (evento.target === modal) {

                modal.classList.remove(
                    "modal--ativo"
                );

            }

        }
    );

}

async function carregarEstatisticas() {

    try {

        const [
            dinossauros,
            continentes,
            descobertas
        ] = await Promise.all([

            fetch(`${API_URL}/dinosaurs`).then(res => res.json()),

            fetch(`${API_URL}/continents`).then(res => res.json()),

            fetch(`${API_URL}/discoveries`).then(res => res.json())

        ]);


        document.getElementById("totalDinossauros").textContent =
            dinossauros.meta.total;


        document.getElementById("totalContinentes").textContent =
            continentes.data.length;


        document.getElementById("totalDescobertas").textContent =
            descobertas.data.length;


        document.getElementById("totalEndpoints").textContent =
            15;


    } catch (erro) {

        console.error(
            "Erro ao carregar estatísticas:",
            erro
        );

    }

}