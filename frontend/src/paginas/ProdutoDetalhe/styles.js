import styled from 'styled-components'

export const ProdutoDetalhePage = styled.section`
  .detalhe-header {
    display: grid;
    gap: 28px;
  }

  .breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    color: var(--cor-texto-suave);
    font-size: 14px;
  }

  .breadcrumb a,
  .breadcrumb span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .produto-detalhe-grid {
    display: grid;
    grid-template-columns: minmax(480px, 1.05fr) minmax(360px, 0.95fr);
    gap: 30px;
    align-items: start;
  }

  .galeria-produto {
    display: grid;
    gap: 16px;
  }

  .imagem-principal {
    position: relative;
    min-height: 680px;
    overflow: hidden;
    border-radius: 10px;
    background: #f3f4f6;
    border: 1px solid var(--cor-borda);
  }

  .imagem-principal-media {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
  }

  .imagem-principal img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .imagem-principal.com-lupa {
    cursor: crosshair;
  }

  .botao-lupa {
    position: absolute;
    bottom: 18px;
    right: 18px;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 58px;
    height: 58px;
    padding: 0;
    border: 1px solid rgba(12, 47, 74, 0.16);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.96);
    color: #0c2f4a;
    cursor: pointer;
    box-shadow: 0 18px 34px rgba(15, 23, 42, 0.16);
    backdrop-filter: blur(8px);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  }

  .botao-lupa:hover {
    transform: translateY(-1px);
    box-shadow: 0 22px 38px rgba(15, 23, 42, 0.2);
  }

  .botao-lupa svg {
    stroke-width: 2.2;
  }

  .botao-lupa.ativa {
    border-color: #0c2f4a;
    background: #0c2f4a;
    color: #fff;
    box-shadow: 0 0 0 6px rgba(12, 47, 74, 0.12), 0 22px 38px rgba(15, 23, 42, 0.24);
  }

  .lupa-imagem {
    position: absolute;
    z-index: 3;
    width: 320px;
    height: 320px;
    border: 4px solid rgba(255, 255, 255, 0.94);
    border-radius: 999px;
    box-shadow: 0 22px 42px rgba(15, 23, 42, 0.26);
    background-color: #fff;
    background-repeat: no-repeat;
    background-size: 440%;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .tag {
    position: absolute;
    left: 16px;
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    padding: 5px 11px;
    font-size: 13px;
    font-weight: 700;
  }

  .tag-oferta {
    top: 16px;
    background: #e11d2e;
    color: #fff;
  }

  .tag-destaque {
    top: 48px;
    background: #dfb651;
    color: #172033;
  }

  .miniaturas {
    display: flex;
    gap: 10px;
  }

  .miniatura {
    width: 78px;
    height: 78px;
    border: 1px solid var(--cor-borda);
    border-radius: 10px;
    background: #f3f4f6;
    padding: 8px;
    cursor: pointer;
  }

  .miniatura.ativa {
    border-color: var(--cor-primaria);
    box-shadow: inset 0 0 0 1px var(--cor-primaria);
  }

  .miniatura img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .conteudo-detalhe {
    display: grid;
    gap: 18px;
    padding-top: 6px;
  }

  .marca-produto {
    color: var(--cor-primaria);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .conteudo-detalhe h1,
  .relacionados h2 {
    margin: 0;
    font-family: "Playfair Display", Georgia, "Times New Roman", serif;
    font-size: clamp(40px, 4vw, 56px);
    line-height: 1.02;
  }

  .bloco-preco {
    display: grid;
    gap: 6px;
  }

  .bloco-preco .precos {
    margin: 0;
  }

  .bloco-preco .precos strong {
    font-size: clamp(34px, 3vw, 46px);
  }

  .parcelado {
    margin: 0;
    color: #31435f;
    font-size: 17px;
  }

  .pix {
    margin: 0;
    color: #16a34a;
    font-size: 15px;
    font-weight: 600;
  }

  .descricao-resumida {
    margin: 0;
    color: #31435f;
    font-size: 18px;
    line-height: 1.6;
  }

  .estoque {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    color: #16a34a;
    font-size: 16px;
    font-weight: 600;
  }

  .estoque small {
    color: var(--cor-texto-suave);
    font-size: 15px;
    font-weight: 500;
  }

  .acoes-compra {
    display: grid;
    grid-template-columns: 148px 1fr;
    gap: 14px;
  }

  .controle-quantidade {
    display: grid;
    grid-template-columns: 42px 1fr 42px;
    align-items: center;
    min-height: 48px;
    border: 1px solid var(--cor-borda);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }

  .controle-quantidade button,
  .controle-quantidade span {
    display: grid;
    place-items: center;
    height: 100%;
    border: 0;
    background: transparent;
    color: var(--cor-texto);
    font-size: 18px;
  }

  .controle-quantidade button {
    cursor: pointer;
  }

  .controle-quantidade button:hover {
    background: var(--cor-muted);
  }

  .botao-carrinho,
  .botao-comprar {
    min-height: 48px;
    border-radius: 8px;
    font-size: 18px;
  }

  .botao-carrinho {
    background: #0c2f4a;
  }

  .botao-carrinho:hover {
    background: #15405f;
  }

  .botao-comprar {
    width: 100%;
    background: #dfb651;
    color: #16253b;
  }

  .botao-comprar:hover {
    background: #e8c164;
  }

  .card-receita {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 14px;
    padding: 22px;
    border: 1px solid rgba(223, 182, 81, 0.42);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(255, 249, 229, 0.96), rgba(255, 255, 255, 1));
    box-shadow: 0 14px 28px rgba(223, 182, 81, 0.12);
  }

  .icone-receita {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(223, 182, 81, 0.18);
    color: #8b6408;
  }

  .card-receita strong {
    display: block;
    margin-bottom: 6px;
    color: #16253b;
    font-size: 17px;
  }

  .card-receita p {
    margin: 0 0 12px;
    color: #31435f;
    font-size: 15px;
    line-height: 1.6;
  }

  .card-receita small {
    display: block;
    margin-top: 12px;
    color: #8b6408;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.5;
  }

  .card-receita button {
    min-height: 34px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: #fff;
    padding: 0 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .card-receita button:disabled {
    cursor: default;
    opacity: 0.9;
  }

  .acoes-secundarias {
    display: flex;
    gap: 16px;
    padding-top: 6px;
    border-top: 1px solid var(--cor-borda);
  }

  .acoes-secundarias button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 0;
    background: transparent;
    color: #14263f;
    font-size: 16px;
    cursor: pointer;
  }

  .acoes-secundarias button.ativo {
    color: #b91c1c;
  }

  .beneficios-detalhe {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    padding-top: 16px;
  }

  .beneficios-detalhe div {
    display: grid;
    gap: 4px;
  }

  .beneficios-detalhe svg {
    color: #0c2f4a;
  }

  .beneficios-detalhe strong {
    font-size: 16px;
  }

  .beneficios-detalhe span {
    color: var(--cor-texto-suave);
  }

  .abas-detalhe {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 8px;
  }

  .abas-detalhe button {
    min-height: 54px;
    border: 1px solid rgba(12, 47, 74, 0.14);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(232, 240, 248, 0.75), rgba(255, 255, 255, 0.98));
    color: #26415d;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }

  .abas-detalhe button:hover {
    border-color: rgba(12, 47, 74, 0.35);
    background: linear-gradient(180deg, rgba(214, 229, 243, 0.92), rgba(237, 245, 252, 1));
    color: #0c2f4a;
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(12, 47, 74, 0.08);
  }

  .abas-detalhe .ativa {
    border-color: #0c2f4a;
    background: linear-gradient(180deg, #0f3a5a, #154a70);
    box-shadow: 0 14px 28px rgba(12, 47, 74, 0.18);
    color: #fff;
  }

  .bloco-cores {
    display: grid;
    gap: 10px;
    padding: 14px 16px;
    border: 1px solid var(--cor-borda);
    border-radius: 12px;
    background: #fff;
  }

  .bloco-cores strong {
    font-size: 15px;
  }

  .bloco-cores small {
    color: var(--cor-texto-suave);
    font-size: 14px;
  }

  .cores-produto-lista {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .cores-produto-lista button {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid var(--cor-borda);
    border-radius: 999px;
    background: #fff;
    cursor: pointer;
    padding: 0;
  }

  .cores-produto-lista button.ativa {
    border-color: var(--cor-primaria);
    box-shadow: 0 0 0 2px rgba(34, 55, 88, 0.12);
  }

  .cores-produto-lista button span {
    width: 20px;
    height: 20px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 999px;
  }

  .grade-especificacoes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .painel-especificacoes,
  .bloco-descricao {
    display: grid;
    gap: 14px;
    width: 100%;
    max-width: 100%;
    padding: 16px;
    border: 1px solid rgba(12, 47, 74, 0.12);
    border-radius: 18px;
    background:
      radial-gradient(circle at top right, rgba(223, 182, 81, 0.12), transparent 24%),
      linear-gradient(180deg, rgba(247, 250, 253, 0.96), rgba(255, 255, 255, 1));
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
  }

  .cabecalho-aba {
    display: grid;
    gap: 4px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(12, 47, 74, 0.08);
  }

  .cabecalho-aba strong {
    color: #10253d;
    font-size: 18px;
  }

  .cabecalho-aba span {
    color: #61758d;
    font-size: 12px;
    line-height: 1.4;
  }

  .grade-especificacoes div {
    display: grid;
    gap: 4px;
    padding: 10px 14px;
    border: 1px solid rgba(12, 47, 74, 0.08);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.92);
  }

  .grade-especificacoes span,
  .bloco-aba p {
    color: var(--cor-texto-suave);
  }

  .grade-especificacoes span {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6b7f98;
  }

  .grade-especificacoes strong {
    color: #111827;
    font-size: 14px;
    line-height: 1.2;
  }

  .bloco-aba p {
    font-size: 16px;
    line-height: 1.7;
  }

  .descricao-editorial {
    width: 100%;
    padding: 16px 18px;
    border-left: 4px solid rgba(223, 182, 81, 0.68);
    border-radius: 0 14px 14px 0;
    background: rgba(255, 255, 255, 0.88);
  }

  .descricao-editorial p {
    margin: 0;
    color: #31435f;
    font-size: 16px;
    line-height: 1.75;
  }

  .relacionados {
    display: grid;
    gap: 24px;
  }

  .relacionados h2 {
    font-size: clamp(36px, 3vw, 44px);
  }

  .grade-relacionados {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
  }

  @media (max-width: 1200px) {
    .produto-detalhe-grid {
      grid-template-columns: 1fr;
    }

    .imagem-principal {
      min-height: 520px;
    }
  }

  @media (max-width: 1024px) {
    .acoes-compra,
    .beneficios-detalhe,
    .grade-especificacoes,
    .grade-relacionados {
      grid-template-columns: 1fr;
    }

    .painel-especificacoes,
    .bloco-descricao {
      padding: 16px;
    }

    .abas-detalhe {
      grid-template-columns: 1fr;
    }

    .botao-lupa,
    .lupa-imagem {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .imagem-principal {
      min-height: 360px;
    }

    .imagem-principal-media {
      padding: 18px;
    }

    .miniaturas {
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .acoes-secundarias {
      flex-direction: column;
      align-items: stretch;
    }

    .acoes-secundarias button {
      justify-content: flex-start;
    }

    .conteudo-detalhe h1,
    .relacionados h2 {
      font-size: 34px;
    }

    .cabecalho-aba strong {
      font-size: 17px;
    }

    .cabecalho-aba span,
    .grade-especificacoes span {
      font-size: 12px;
    }

    .grade-especificacoes div,
    .descricao-editorial {
      padding: 14px;
    }

    .grade-especificacoes strong,
    .descricao-editorial p,
    .bloco-aba p {
      font-size: 15px;
    }
  }
`
