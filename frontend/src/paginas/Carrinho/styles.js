import styled from 'styled-components'

export const CarrinhoPage = styled.section`
  h1 {
    margin-bottom: 30px;
  }

  .carrinho-layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
    gap: 32px;
    align-items: start;
  }

  .lista-carrinho {
    display: grid;
    gap: 16px;
  }

  .item-carrinho,
  .resumo {
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-card);
  }

  .item-carrinho {
    display: grid;
    grid-template-columns: 128px minmax(0, 1fr);
    gap: 16px;
    align-items: stretch;
    padding: 16px;
    overflow: hidden;
  }

  .item-carrinho-imagem {
    position: relative;
    min-height: 128px;
    overflow: hidden;
    border-radius: 8px;
    background: var(--cor-muted);
  }

  .item-carrinho-imagem img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .item-carrinho-imagem span {
    position: absolute;
    top: 6px;
    left: 6px;
    border-radius: 6px;
    background: #dc2626;
    color: #fff;
    padding: 3px 7px;
    font-size: 11px;
    font-weight: 800;
  }

  .item-carrinho-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  .item-carrinho-topo,
  .item-carrinho-rodape {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .item-carrinho-topo p {
    margin: 0 0 5px;
    color: var(--cor-texto-suave);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .item-carrinho-topo a {
    color: var(--cor-texto);
    font-weight: 700;
  }

  .item-carrinho-topo a:hover {
    color: var(--cor-primaria);
  }

  .botao-remover {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex: 0 0 auto;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--cor-texto-suave);
    cursor: pointer;
  }

  .botao-remover:hover {
    background: var(--cor-muted);
    color: #dc2626;
  }

  .controle-quantidade {
    display: inline-flex;
    overflow: hidden;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: #fff;
  }

  .controle-quantidade button,
  .controle-quantidade span {
    display: grid;
    place-items: center;
    width: 36px;
    height: 34px;
    border: 0;
    background: transparent;
    color: var(--cor-texto);
    font-weight: 800;
  }

  .controle-quantidade button {
    cursor: pointer;
  }

  .controle-quantidade button:hover:not(:disabled) {
    background: var(--cor-muted);
  }

  .controle-quantidade button:disabled {
    color: #c5ccd6;
    cursor: not-allowed;
  }

  .item-carrinho-preco {
    text-align: right;
  }

  .item-carrinho-preco span {
    display: block;
    color: var(--cor-texto-suave);
    font-size: 14px;
    text-decoration: line-through;
  }

  .item-carrinho-preco strong {
    font-size: 18px;
  }

  .continuar-comprando {
    width: fit-content;
    color: var(--cor-primaria);
    font-size: 14px;
    font-weight: 800;
  }

  .continuar-comprando:hover {
    text-decoration: underline;
  }

  .resumo {
    padding: 22px;
  }

  .resumo-carrinho {
    position: sticky;
    top: 104px;
  }

  .resumo-carrinho h2 {
    margin-top: 0;
  }

  .cupom-box {
    display: grid;
    gap: 8px;
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--cor-borda);
  }

  .cupom-box label {
    margin: 0;
    font-size: 14px;
  }

  .cupom-box div {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
  }

  .cupom-box svg {
    position: absolute;
    top: 50%;
    left: 11px;
    transform: translateY(-50%);
    color: var(--cor-texto-suave);
  }

  .cupom-box input {
    padding-left: 36px;
  }

  .cupom-box button {
    border: 1px solid var(--cor-borda);
    border-radius: 6px;
    background: var(--cor-primaria);
    color: #fff;
    padding: 0 14px;
    font-weight: 800;
    cursor: pointer;
  }

  .cupom-box button:hover:not(:disabled) {
    filter: brightness(0.96);
  }

  .cupom-box button:disabled {
    cursor: wait;
    opacity: 0.72;
  }

  .cupom-aplicado {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 12px 14px;
    border: 1px solid rgba(34, 197, 94, 0.18);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(240, 253, 244, 0.95), rgba(255, 255, 255, 1));
  }

  .cupom-aplicado strong,
  .cupom-aplicado span,
  .cupom-aplicado em {
    display: block;
  }

  .cupom-aplicado strong {
    color: #166534;
  }

  .cupom-aplicado span {
    margin-top: 4px;
    color: var(--cor-texto-suave);
    font-size: 12px;
  }

  .cupom-aplicado-acoes {
    display: grid;
    justify-items: end;
    gap: 6px;
    flex-shrink: 0;
  }

  .cupom-aplicado em {
    color: #166534;
    font-style: normal;
    font-weight: 900;
  }

  .cupom-aplicado-acoes button {
    padding: 0;
    border: 0;
    background: transparent;
    color: #b91c1c;
    font-size: 12px;
    font-weight: 800;
  }

  .cupom-aplicado-acoes button:hover {
    text-decoration: underline;
  }

  .cupom-box small,
  .parcelamento {
    color: var(--cor-texto-suave);
    font-size: 12px;
  }

  .bloco-frete {
    display: grid;
    gap: 12px;
    margin-bottom: 18px;
    padding: 16px;
    border: 1px solid rgba(47, 94, 164, 0.16);
    border-radius: 18px;
    background:
      radial-gradient(circle at top right, rgba(51, 168, 177, 0.12), transparent 38%),
      linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
  }

  .bloco-frete label {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
    color: #173966;
  }

  .bloco-frete-topo {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    align-items: start;
  }

  .bloco-frete-topo small {
    display: block;
    margin-top: 4px;
    color: var(--cor-texto-suave);
    font-size: 12px;
    line-height: 1.5;
  }

  .bloco-frete-icone {
    width: 40px;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: rgba(47, 94, 164, 0.1);
    color: #244b82;
  }

  .secundario-frete {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--cor-borda);
    background: #fff;
    color: var(--cor-texto);
  }

  .estado-frete {
    display: grid;
    gap: 10px;
    border: 1px dashed var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-fundo);
    padding: 14px;
  }

  .bloco-receita-checkout {
    display: grid;
    gap: 10px;
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--cor-borda);
  }

  .bloco-receita-checkout label {
    margin: 0;
    font-size: 14px;
  }

  .bloco-receita-checkout small {
    color: #7a5607;
    font-size: 12px;
    line-height: 1.5;
  }

  .opcao-receita {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    align-items: start;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: #fff;
    padding: 12px;
  }

  .opcao-receita.ativa {
    border-color: rgba(12, 47, 74, 0.38);
    background: linear-gradient(180deg, rgba(232, 240, 248, 0.72), rgba(255, 255, 255, 0.98));
  }

  .opcao-receita input {
    margin-top: 4px;
  }

  .opcao-receita strong,
  .opcao-receita span {
    display: block;
  }

  .opcao-receita span {
    color: var(--cor-texto-suave);
    font-size: 13px;
    line-height: 1.5;
  }

  .estado-frete p {
    margin: 0;
    color: var(--cor-texto-suave);
    font-size: 14px;
  }

  .opcoes-frete {
    display: grid;
    gap: 10px;
    margin-top: 2px;
  }

  .opcao-frete {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
    border: 1px solid rgba(47, 94, 164, 0.14);
    border-radius: 14px;
    background: #fff;
    padding: 14px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .opcao-frete:hover {
    transform: translateY(-1px);
    border-color: rgba(47, 94, 164, 0.24);
    box-shadow: 0 14px 28px rgba(47, 94, 164, 0.08);
  }

  .opcao-frete.ativa {
    border-color: rgba(51, 168, 177, 0.6);
    box-shadow: 0 14px 28px rgba(51, 168, 177, 0.12);
    background: linear-gradient(180deg, rgba(240, 252, 255, 0.96), rgba(255, 255, 255, 1));
  }

  .opcao-frete input {
    margin: 0;
  }

  .opcao-frete strong,
  .opcao-frete span {
    display: block;
  }

  .opcao-frete strong {
    color: var(--cor-texto);
  }

  .opcao-frete span {
    color: var(--cor-texto-suave);
    font-size: 12px;
  }

  .opcao-frete div:last-child {
    text-align: right;
  }

  .linha-resumo {
    display: flex;
    justify-content: space-between;
    margin: 12px 0;
    color: var(--cor-texto-suave);
    font-size: 14px;
  }

  .linha-resumo strong {
    color: var(--cor-texto);
  }

  .linha-resumo.desconto strong {
    color: #166534;
  }

  .linha-resumo.total {
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid var(--cor-borda);
    color: var(--cor-texto);
    font-size: 18px;
    font-weight: 800;
  }

  .parcelamento {
    margin: -4px 0 18px;
    text-align: center;
  }

  .limpar-carrinho {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: 38px;
    margin-top: 10px;
    border: 0;
    background: transparent;
    color: #b91c1c;
    cursor: pointer;
    font-weight: 800;
  }

  .selos-carrinho {
    display: grid;
    gap: 10px;
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid var(--cor-borda);
  }

  .selos-carrinho p {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0;
    color: var(--cor-texto-suave);
    font-size: 14px;
  }

  .selos-carrinho svg {
    color: var(--cor-primaria);
    flex: 0 0 auto;
  }

  @media (max-width: 1024px) {
    .carrinho-layout {
      grid-template-columns: 1fr;
    }

    .resumo-carrinho {
      position: static;
    }
  }

  @media (max-width: 640px) {
    .item-carrinho {
      grid-template-columns: 92px 1fr;
      padding: 12px;
    }

    .item-carrinho-imagem {
      min-height: 92px;
    }

    .item-carrinho-topo,
    .item-carrinho-rodape {
      flex-direction: column;
      gap: 10px;
    }

    .bloco-frete-topo,
    .opcao-frete {
      grid-template-columns: 1fr;
    }

    .cupom-box div {
      grid-template-columns: 1fr;
    }

    .cupom-aplicado {
      flex-direction: column;
      align-items: stretch;
    }

    .cupom-aplicado-acoes {
      justify-items: start;
    }

    .cupom-box button {
      min-height: 44px;
    }

    .opcao-frete div:last-child {
      text-align: left;
    }

    .item-carrinho-preco {
      text-align: left;
    }
  }
`
