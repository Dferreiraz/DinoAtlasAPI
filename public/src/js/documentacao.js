/**
 * documentacao.js
 * Navegação, scrollspy e cópia de exemplos da página de documentação.
 * Não usa APIs de inserção de HTML: todo conteúdo dinâmico é definido por
 * classes, atributos e textContent.
 */
(function () {
  "use strict";

  const LIMITE_MOBILE = 1024;
  const SELETOR_LINK = ".doc-indice__link";
  const SELETOR_SECAO = ".doc-secao";
  const TEXTO_COPIA = "Copiar";
  const TEXTO_COPIADO = "Copiado!";
  const TEXTO_ERRO = "Falhou";
  const DURACAO_FEEDBACK = 1800;

  document.addEventListener("DOMContentLoaded", () => {
    iniciarMenuMobile();
    iniciarScrollSpy();
    iniciarBotoesCopiar();
  });

  /* ==========================================================================
     Menu mobile
     ========================================================================== */
  function iniciarMenuMobile() {
    const botao = document.getElementById("docMenuBotao");
    const sidebar = document.getElementById("docSidebar");
    const backdrop = document.getElementById("docBackdrop");

    if (!botao || !sidebar || !backdrop) return;

    let aberto = false;

    const ehMobile = () => window.matchMedia(`(max-width: ${LIMITE_MOBILE}px)`).matches;

    const sincronizarInercia = () => {
      // Em desktop o índice é sempre visível e não deve ficar inerte.
      sidebar.inert = ehMobile() && !aberto;
    };

    const abrir = () => {
      if (aberto) return;
      aberto = true;
      sidebar.classList.add("doc-sidebar--aberta");
      backdrop.classList.add("doc-backdrop--visivel");
      botao.setAttribute("aria-expanded", "true");
      document.body.classList.add("doc-menu-aberto");
      sincronizarInercia();

      const primeiroLink = sidebar.querySelector(SELETOR_LINK);
      if (primeiroLink) primeiroLink.focus();
    };

    const fechar = ({ restaurarFoco = false } = {}) => {
      if (!aberto) {
        sincronizarInercia();
        return;
      }

      aberto = false;
      sidebar.classList.remove("doc-sidebar--aberta");
      backdrop.classList.remove("doc-backdrop--visivel");
      botao.setAttribute("aria-expanded", "false");
      document.body.classList.remove("doc-menu-aberto");
      sincronizarInercia();

      if (restaurarFoco) botao.focus();
    };

    botao.addEventListener("click", () => {
      if (aberto) {
        fechar({ restaurarFoco: true });
      } else {
        abrir();
      }
    });

    backdrop.addEventListener("click", () => fechar({ restaurarFoco: true }));

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && aberto) {
        evento.preventDefault();
        fechar({ restaurarFoco: true });
      }
    });

    sidebar.addEventListener("click", (evento) => {
      const link = evento.target.closest("a[href^='#']");
      if (!link) return;

      const id = link.getAttribute("href").slice(1);
      fechar();
      focarDestino(id);
    });

    window.addEventListener("resize", () => {
      if (!ehMobile()) {
        fechar();
      }
      sincronizarInercia();
    });

    sincronizarInercia();
  }

  function focarDestino(id) {
    if (!id) return;

    const destino = document.getElementById(id);
    if (!destino) return;

    const titulo = destino.querySelector("h2") || destino;
    if (!titulo.hasAttribute("tabindex")) {
      titulo.setAttribute("tabindex", "-1");
    }
    titulo.focus({ preventScroll: true });
  }

  /* ==========================================================================
     Scrollspy
     ========================================================================== */
  function iniciarScrollSpy() {
    const links = Array.from(document.querySelectorAll(SELETOR_LINK));
    const secoes = Array.from(document.querySelectorAll(SELETOR_SECAO));

    if (links.length === 0 || secoes.length === 0) return;

    const linksPorId = new Map();
    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("#")) linksPorId.set(href.slice(1), link);
    });

    const visiveis = new Set();
    let ativoId = null;

    const ativar = (id) => {
      if (!linksPorId.has(id) || id === ativoId) return;

      ativoId = id;
      links.forEach((link) => {
        const ehAtual = link === linksPorId.get(id);
        link.classList.toggle("doc-indice__link--ativo", ehAtual);

        if (ehAtual) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    const observarSecoes = () => {
      if (!("IntersectionObserver" in window)) return null;

      const topbar = document.querySelector(".doc-topbar");
      const alturaTopo = (topbar ? topbar.offsetHeight : 64) + 24;

      const observer = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            visiveis.add(entrada.target.id);
          } else {
            visiveis.delete(entrada.target.id);
          }
        });

        if (visiveis.size === 0) return;

        const primeiraVisivel = secoes.find((secao) => visiveis.has(secao.id));
        if (primeiraVisivel) ativar(primeiraVisivel.id);
      }, {
        rootMargin: `-${alturaTopo}px 0px -55% 0px`,
        threshold: 0
      });

      secoes.forEach((secao) => observer.observe(secao));
      return observer;
    };

    const observer = observarSecoes();

    const atualizarPorRolagem = () => {
      const topbar = document.querySelector(".doc-topbar");
      const alturaTopo = (topbar ? topbar.offsetHeight : 64) + 32;
      const limite = window.scrollY + alturaTopo;

      let atual = secoes[0].id;
      for (const secao of secoes) {
        if (secao.offsetTop <= limite) {
          atual = secao.id;
        } else {
          break;
        }
      }

      const noFim = window.innerHeight + window.scrollY
        >= document.documentElement.scrollHeight - 4;

      if (noFim) atual = secoes[secoes.length - 1].id;

      // A rolagem é a fonte determinística quando o observer ainda não
      // classificou nenhuma seção (carregamento inicial, fim da página ou
      // navegador sem IntersectionObserver).
      if (!observer || visiveis.size === 0 || noFim) {
        ativar(atual);
      }
    };

    let agendado = false;
    const aoRolar = () => {
      if (agendado) return;
      agendado = true;

      window.requestAnimationFrame(() => {
        agendado = false;
        atualizarPorRolagem();
      });
    };

    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    window.addEventListener("hashchange", () => {
      const id = window.location.hash.slice(1);
      if (linksPorId.has(id)) ativar(id);
    });

    atualizarPorRolagem();

    const idInicial = window.location.hash.slice(1);
    if (idInicial && linksPorId.has(idInicial)) {
      ativar(idInicial);
    }
  }

  /* ==========================================================================
     Copiar blocos de código
     ========================================================================== */
  function iniciarBotoesCopiar() {
    const botoes = document.querySelectorAll(".doc-copy");
    if (botoes.length === 0) return;

    botoes.forEach((botao) => {
      botao.addEventListener("click", async () => {
        const bloco = botao.closest(".doc-code");
        const codigo = bloco ? bloco.querySelector("code") : null;
        if (!codigo) return;

        const texto = codigo.textContent;
        const copiou = await copiarTexto(texto);

        botao.textContent = copiou ? TEXTO_COPIADO : TEXTO_ERRO;
        botao.setAttribute("data-estado", copiou ? "copiado" : "erro");

        const timerAnterior = Number(botao.dataset.timer);
        if (timerAnterior) window.clearTimeout(timerAnterior);

        const timer = window.setTimeout(() => {
          botao.textContent = TEXTO_COPIA;
          botao.removeAttribute("data-estado");
          delete botao.dataset.timer;
        }, DURACAO_FEEDBACK);

        botao.dataset.timer = String(timer);
      });
    });
  }

  async function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(texto);
        return true;
      } catch (erro) {
        // Prossegue para a alternativa baseada em seleção.
      }
    }

    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.className = "doc-copia-area";
    document.body.appendChild(area);

    let copiou = false;
    try {
      area.select();
      area.setSelectionRange(0, area.value.length);
      copiou = document.execCommand("copy");
    } catch (erro) {
      copiou = false;
    } finally {
      area.remove();
    }

    return copiou;
  }
})();
