import styled from 'styled-components'

export const LayoutShell = styled.div`
  min-height: 100vh;
  background: var(--cor-fundo);

  .barra-topo {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: center;
    min-height: 36px;
    padding: 7px clamp(16px, 5vw, 72px);
    background: var(--cor-primaria);
    color: rgba(255, 255, 255, 0.88);
    font-size: 13px;
    line-height: 1.3;
  }

  .barra-topo p {
    margin: 0;
    font-weight: 500;
  }

  .barra-topo div {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .barra-topo a:hover {
    color: var(--cor-dourada);
    text-decoration: underline;
  }

  .cabecalho {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 24px;
    min-height: 68px;
    padding: 10px clamp(16px, 5vw, 72px);
    border-bottom: 1px solid var(--cor-borda);
    background: rgba(251, 252, 253, 0.96);
    backdrop-filter: blur(14px);
  }

  .marca img {
    width: 180px;
  }

  .navegacao {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-left: auto;
    font-size: 14px;
    font-weight: 700;
    color: var(--cor-texto-suave);
  }

  .navegacao a.active,
  .navegacao a:hover,
  .gatilho-menu:hover {
    color: var(--cor-primaria);
  }

  .navegacao a[href*="promocoes"],
  .navegacao a[href*="promocoes"].active {
    color: #c83b3b;
  }

  .busca-cabecalho {
    display: flex;
    align-items: center;
    gap: 9px;
    width: min(340px, 24vw);
    min-height: 38px;
    margin-left: 8px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: #fff;
    color: var(--cor-texto-suave);
    padding: 0 12px;
    font-size: 14px;
  }

  .busca-cabecalho:hover {
    border-color: #cbd3df;
    color: var(--cor-primaria);
  }

  .menu-dropdown,
  .menu-conta {
    position: relative;
  }

  .gatilho-menu {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 0;
    background: transparent;
    color: var(--cor-texto-suave);
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    font-weight: 700;
  }

  .conteudo-dropdown,
  .conteudo-conta {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 40;
    min-width: 248px;
    border: 1px solid rgba(34, 55, 88, 0.12);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 1));
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
    padding: 10px;
    opacity: 0;
    pointer-events: none;
    transform: translateY(8px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .menu-dropdown .conteudo-dropdown {
    left: 0;
    right: auto;
  }

  .menu-dropdown::after,
  .menu-conta::after {
    content: '';
    position: absolute;
    top: 100%;
    left: -8px;
    right: -8px;
    height: 12px;
  }

  .menu-dropdown:hover .conteudo-dropdown,
  .menu-dropdown:focus-within .conteudo-dropdown,
  .menu-conta:hover .conteudo-conta,
  .menu-conta:focus-within .conteudo-conta {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .conteudo-dropdown a,
  .conteudo-dropdown span,
  .conteudo-conta a,
  .conteudo-conta button,
  .conteudo-conta strong {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 42px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--cor-texto);
    padding: 8px 12px;
    text-align: left;
    font-size: 14px;
    font-weight: 700;
  }

  .conteudo-dropdown span,
  .conteudo-conta strong {
    color: var(--cor-texto-suave);
    cursor: default;
  }

  .conteudo-dropdown a:hover,
  .conteudo-conta a:hover,
  .conteudo-conta button:hover {
    background: var(--cor-muted);
    color: var(--cor-primaria);
  }

  .conteudo-dropdown .item-destaque {
    border-top: 1px solid var(--cor-borda);
    margin-top: 6px;
    color: var(--cor-primaria);
    font-weight: 800;
  }

  .conteudo-conta button {
    cursor: pointer;
    color: #b91c1c;
  }

  .conta-cabecalho {
    display: grid;
    gap: 2px;
    padding: 8px 12px 10px;
    border-bottom: 1px solid rgba(34, 55, 88, 0.08);
    margin-bottom: 6px;
  }

  .conta-cabecalho strong {
    min-height: auto;
    padding: 0;
    color: #223758;
    font-size: 16px;
    font-weight: 800;
  }

  .conta-cabecalho small {
    color: var(--cor-texto-suave);
    font-size: 12px;
    font-weight: 600;
  }

  .conta-links {
    display: grid;
    gap: 2px;
    margin-bottom: 6px;
  }

  .conteudo-conta button {
    border-top: 1px solid rgba(34, 55, 88, 0.08);
    margin-top: 4px;
    padding-top: 10px;
    border-radius: 0 0 10px 10px;
  }

  .acoes-cabecalho {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cabecalho .botao-icone {
    width: 40px;
    min-height: 40px;
    border-radius: 8px;
    background: transparent;
    color: var(--cor-texto);
    box-shadow: none;
  }

  .cabecalho .botao-icone:hover {
    background: var(--cor-muted);
    color: var(--cor-primaria);
    box-shadow: none;
    transform: none;
  }

  .busca-mobile {
    display: none;
  }

  .contador {
    position: absolute;
    top: -2px;
    right: -3px;
    min-width: 18px;
    height: 18px;
    border-radius: 999px;
    background: var(--cor-dourada);
    color: #20304d;
    border: 1px solid #fff;
    font-size: 11px;
    font-weight: 800;
    line-height: 17px;
    text-align: center;
  }

  .botao-conta {
    position: relative;
  }

  .contador-conta {
    top: 1px;
    right: -7px;
    min-width: 24px;
    height: 15px;
    padding: 0 5px;
    background: #22c55e;
    color: #f8fff9;
    border-color: rgba(255, 255, 255, 0.95);
    font-size: 9px;
    line-height: 13px;
    letter-spacing: 0.08em;
    box-shadow: 0 4px 10px rgba(34, 197, 94, 0.22);
  }

  .menu-mobile {
    display: none;
  }

  .rodape {
    background: var(--cor-primaria);
    color: rgba(255, 255, 255, 0.78);
  }

  .rodape .cta-whatsapp {
    border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  }

  .rodape-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr 1fr 1fr;
    gap: 36px;
    padding: 48px clamp(16px, 5vw, 72px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  }

  .rodape img {
    width: 150px;
    margin-bottom: 10px;
    filter: brightness(0) invert(1);
  }

  .rodape h3 {
    margin: 0 0 14px;
    color: #fff;
  }

  .rodape-links,
  .rodape-contato,
  .rodape-badges {
    display: grid;
    gap: 10px;
  }

  .rodape-links a,
  .rodape-contato p,
  .rodape-badges span {
    margin: 0;
  }

  .rodape a {
    display: block;
  }

  .rodape a:hover {
    color: var(--cor-dourada);
  }

  .rodape-sociais {
    display: flex;
    gap: 10px;
    margin-top: 18px;
  }

  .rodape-sociais a {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    color: #fff;
  }

  .rodape-sociais a:hover {
    border-color: var(--cor-dourada);
    background: rgba(255, 255, 255, 0.08);
  }

  .rodape-badges span {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: rgba(255, 255, 255, 0.82);
  }

  .rodape-base {
    padding: 16px clamp(16px, 5vw, 72px);
    color: rgba(255, 255, 255, 0.58);
  }

  .rodape-base p {
    margin: 0;
    line-height: 1.7;
    word-break: break-word;
  }

  .marca-rodape {
    color: #33A8B1;
    font-weight: 700;
  }

  .rodape-base a {
    display: inline;
    color: #e3b56a;
    font-weight: 700;
  }

  .rodape-base a:hover {
    color: #f0c987;
  }

  @media (max-width: 1024px) {
    .menu-mobile {
      display: inline-flex;
      margin-left: auto;
    }

    .navegacao {
      position: absolute;
      top: 68px;
      left: 0;
      right: 0;
      display: none;
      flex-direction: column;
      align-items: flex-start;
      padding: 18px;
      background: #fff;
      border-bottom: 1px solid var(--cor-borda);
    }

    .busca-cabecalho {
      display: none;
    }

    .busca-cabecalho.aberta {
      position: absolute;
      top: 68px;
      left: 16px;
      right: 16px;
      z-index: 35;
      display: flex;
      width: auto;
      margin: 0;
      box-shadow: var(--sombra);
    }

    .busca-mobile {
      display: inline-flex;
    }

    .favoritos-atalho {
      display: none;
    }

    .navegacao .menu-dropdown {
      width: 100%;
    }

    .gatilho-menu {
      width: 100%;
      justify-content: space-between;
      color: var(--cor-texto-suave);
    }

    .conteudo-dropdown {
      position: static;
      display: grid;
      min-width: 100%;
      margin-top: 8px;
      box-shadow: none;
      opacity: 1;
      pointer-events: auto;
      transform: none;
    }

    .navegacao.aberta {
      display: flex;
    }

    .rodape-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .cabecalho {
      gap: 10px;
    }

    .marca img {
      width: 132px;
    }

    .acoes-cabecalho {
      gap: 6px;
    }

    .barra-topo {
      display: none;
    }

    .conteudo-conta,
    .conteudo-dropdown {
      min-width: 0;
      width: min(280px, calc(100vw - 32px));
    }

    .rodape .cta-whatsapp .botao {
      width: 100%;
    }

    .rodape-grid {
      grid-template-columns: 1fr;
    }
  }
`
