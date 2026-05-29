import styled from 'styled-components'

export const ClientePage = styled.section`
  .cliente-hero {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 26px 28px;
    border: 1px solid rgba(47, 94, 164, 0.12);
    border-radius: 20px;
    background:
      radial-gradient(circle at top right, rgba(51, 168, 177, 0.16), transparent 34%),
      linear-gradient(135deg, #f7fbff 0%, #ffffff 62%);
    box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
  }

  .cliente-eyebrow {
    margin: 0 0 10px;
    color: #2f5ea4;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .cliente-hero h1 {
    margin: 0;
  }

  .cliente-hero span {
    display: block;
    max-width: 620px;
    margin-top: 10px;
    color: var(--cor-texto-suave);
  }

  .cliente-avatar {
    min-width: 260px;
    display: grid;
    align-content: center;
    justify-items: start;
    gap: 8px;
    padding: 22px;
    border-radius: 18px;
    background: linear-gradient(180deg, #173966 0%, #214d86 100%);
    color: #fff;
  }

  .cliente-avatar svg {
    color: #7ae1ea;
  }

  .cliente-avatar strong {
    font-size: 18px;
  }

  .cliente-avatar small {
    color: rgba(255, 255, 255, 0.74);
  }

  .cliente-resumo {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
    margin-top: 22px;
  }

  .resumo-card {
    display: grid;
    gap: 10px;
    padding: 20px;
    border: 1px solid rgba(47, 94, 164, 0.12);
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
  }

  .resumo-card strong {
    font-size: 28px;
    line-height: 1;
    color: var(--cor-texto);
  }

  .resumo-card span {
    color: var(--cor-texto-suave);
    font-weight: 600;
  }

  .resumo-card.destaque {
    background: linear-gradient(135deg, #fff8dd 0%, #ffffff 100%);
    border-color: rgba(214, 164, 47, 0.34);
  }

  .resumo-icone {
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: rgba(47, 94, 164, 0.08);
    color: #2f5ea4;
  }

  .painel-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    margin-top: 26px;
    align-items: start;
  }

  .conta-layout {
    display: grid;
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
    gap: 24px;
    margin-top: 26px;
    align-items: start;
  }

  .conta-menu {
    position: sticky;
    top: 24px;
    display: grid;
    gap: 18px;
    padding: 22px;
    border: 1px solid rgba(47, 94, 164, 0.14);
    border-radius: 20px;
    background:
      radial-gradient(circle at top right, rgba(51, 168, 177, 0.14), transparent 32%),
      linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.05);
  }

  .conta-menu-topo strong {
    display: block;
    margin-top: 10px;
    color: #173966;
    font-size: 24px;
  }

  .conta-menu-topo p {
    margin: 8px 0 0;
    color: var(--cor-texto-suave);
    line-height: 1.6;
  }

  .conta-menu-etiqueta {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(47, 94, 164, 0.1);
    color: #244b82;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .conta-menu-lista {
    display: grid;
    gap: 10px;
  }

  .conta-menu-botao {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    align-items: start;
    gap: 14px;
    width: 100%;
    padding: 14px;
    border: 1px solid rgba(47, 94, 164, 0.1);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.76);
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }

  .conta-menu-botao:hover {
    transform: translateY(-1px);
    border-color: rgba(47, 94, 164, 0.2);
    box-shadow: 0 14px 28px rgba(47, 94, 164, 0.08);
    background: #fff;
  }

  .conta-menu-botao.ativo {
    border-color: rgba(47, 94, 164, 0.24);
    background: linear-gradient(135deg, #173966 0%, #214d86 100%);
    box-shadow: 0 18px 32px rgba(23, 57, 102, 0.22);
  }

  .conta-menu-botao strong,
  .conta-menu-botao small {
    display: block;
  }

  .conta-menu-botao strong {
    color: #173966;
    font-size: 15px;
  }

  .conta-menu-botao small {
    margin-top: 4px;
    color: var(--cor-texto-suave);
    line-height: 1.45;
  }

  .conta-menu-botao.ativo strong,
  .conta-menu-botao.ativo small {
    color: #fff;
  }

  .conta-menu-icone {
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    background: rgba(47, 94, 164, 0.08);
    color: #244b82;
  }

  .conta-menu-botao.ativo .conta-menu-icone {
    background: rgba(255, 255, 255, 0.14);
    color: #7ae1ea;
  }

  .conta-painel {
    min-width: 0;
  }

  .conta-conteudo {
    min-width: 0;
  }

  .conta-painel .painel-card {
    padding: 28px;
  }

  .painel-card {
    border: 1px solid var(--cor-borda);
    border-radius: 20px;
    background: var(--cor-card);
    padding: 24px;
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.05);
  }

  .painel-card-dados {
    border-color: rgba(47, 94, 164, 0.18);
    background:
      linear-gradient(180deg, rgba(240, 247, 255, 0.9) 0%, rgba(255, 255, 255, 0.98) 22%),
      var(--cor-card);
  }

  .painel-card-pedidos {
    border-color: rgba(36, 75, 130, 0.16);
    background:
      linear-gradient(180deg, rgba(243, 248, 255, 0.92) 0%, rgba(255, 255, 255, 0.98) 20%),
      var(--cor-card);
  }

  .painel-card-enderecos {
    border-color: rgba(51, 168, 177, 0.2);
    background:
      linear-gradient(180deg, rgba(240, 252, 253, 0.94) 0%, rgba(255, 255, 255, 0.98) 20%),
      var(--cor-card);
  }

  .painel-card-senha {
    border-color: rgba(93, 63, 211, 0.18);
    background:
      linear-gradient(180deg, rgba(247, 245, 255, 0.94) 0%, rgba(255, 255, 255, 0.98) 20%),
      var(--cor-card);
  }

  .painel-card-dados .botao-secao h2 {
    color: #173966;
  }

  .painel-card-pedidos .botao-secao h2 {
    color: #173966;
  }

  .painel-card-enderecos .botao-secao h2 {
    color: #155d63;
  }

  .painel-card-senha h2 {
    color: #34206f;
  }

  .painel-card-dados .botao-secao svg {
    color: #2f5ea4;
  }

  .painel-card-pedidos .botao-secao svg {
    color: #244b82;
  }

  .painel-card-enderecos .botao-secao svg {
    color: #1b7d85;
  }

  .botao-secao {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 0;
    border: 0;
    background: transparent;
    text-align: left;
    cursor: pointer;
    color: inherit;
  }

  .botao-secao svg {
    color: #244b82;
    transition: transform 0.2s ease;
  }

  .botao-secao.aberto svg {
    transform: rotate(180deg);
  }

  .botao-secao h2 {
    margin: 0;
  }

  .botao-secao p {
    margin: 6px 0 0;
    color: var(--cor-texto-suave);
  }

  .conteudo-secao {
    margin-top: 18px;
  }

  .painel-card-topo {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 16px;
    margin-bottom: 18px;
  }

  .painel-card-topo h2,
  .titulo-secao h2,
  .form-endereco h3 {
    margin: 0;
  }

  .painel-card-topo p,
  .titulo-secao p {
    margin: 6px 0 0;
    color: var(--cor-texto-suave);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .form-dados-pessoais {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 16px;
    align-items: start;
  }

  .form-dados-pessoais .campo-largo,
  .form-dados-pessoais .form-acoes {
    grid-column: 1 / -1;
  }

  .form-dados-pessoais .campo-largo input {
    min-height: 54px;
  }

  .form-acoes {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid rgba(47, 94, 164, 0.1);
    margin-top: 6px;
  }

  .form-acoes .botao {
    min-width: 190px;
    justify-content: center;
  }

  .form-grid label,
  .form-endereco label {
    display: grid;
    gap: 8px;
    font-weight: 700;
    color: var(--cor-texto);
  }

  .lista-pedidos {
    display: grid;
    gap: 18px;
  }

  .lista-pedidos::-webkit-scrollbar {
    width: 8px;
  }

  .lista-pedidos::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(47, 94, 164, 0.24);
  }

  .card-pedido {
    display: grid;
    gap: 16px;
    padding: 20px;
    border: 1px solid rgba(47, 94, 164, 0.14);
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(247, 251, 255, 0.94), rgba(255, 255, 255, 0.98));
    scroll-margin-top: 120px;
  }

  .card-pedido.aberto {
    border-color: rgba(47, 94, 164, 0.3);
    box-shadow: 0 22px 42px rgba(47, 94, 164, 0.12);
    background:
      linear-gradient(180deg, rgba(241, 247, 255, 0.98), rgba(255, 255, 255, 1));
  }

  .card-pedido-topo {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 12px;
  }

  .card-pedido-topo strong,
  .pedido-itens p {
    display: block;
  }

  .card-pedido-topo span {
    color: var(--cor-texto-suave);
    font-size: 14px;
  }

  .pedido-metricas {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .pedido-metricas p {
    margin: 0;
    display: grid;
    gap: 5px;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(47, 94, 164, 0.05);
  }

  .pedido-metricas span {
    color: var(--cor-texto-suave);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pedido-metricas b {
    color: var(--cor-texto);
    font-size: 15px;
  }

  .pedido-metricas small {
    color: #244b82;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.4;
  }

  .pedido-itens {
    display: grid;
    gap: 6px;
  }

  .pedido-itens p {
    margin: 0;
    color: var(--cor-texto-suave);
  }

  .botao-detalhe-pedido {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    min-height: 46px;
    padding: 0 14px;
    border: 1px solid rgba(47, 94, 164, 0.14);
    border-radius: 14px;
    background: #fff;
    color: #244b82;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
  }

  .botao-detalhe-pedido svg {
    transition: transform 0.2s ease;
  }

  .botao-detalhe-pedido.aberto svg {
    transform: rotate(180deg);
  }

  .indicador-detalhe {
    min-width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: rgba(47, 94, 164, 0.08);
    color: #244b82;
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
  }

  .botao-detalhe-pedido:hover {
    border-color: rgba(47, 94, 164, 0.28);
    background: #f8fbff;
  }

  .detalhe-pedido {
    display: grid;
    gap: 14px;
    padding-top: 18px;
    padding: 18px;
    margin-top: 4px;
    border: 2px solid rgba(47, 94, 164, 0.32);
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(245, 250, 255, 1), rgba(236, 244, 255, 0.98));
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.78),
      0 16px 28px rgba(47, 94, 164, 0.08);
  }

  .detalhe-pedido-topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 18px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(23, 57, 102, 0.96) 0%, rgba(33, 77, 134, 0.94) 100%);
    box-shadow: 0 16px 30px rgba(23, 57, 102, 0.18);
  }

  .detalhe-pedido-topo strong,
  .detalhe-pedido-topo span {
    display: block;
  }

  .detalhe-pedido-topo strong {
    color: #fff;
    font-size: 17px;
  }

  .detalhe-pedido-topo span {
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.76);
    font-size: 13px;
  }

  .detalhe-pedido-topo .badge {
    margin-top: 0;
    min-width: 54px;
    min-height: 22px;
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
    line-height: 1;
    text-align: center;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.01em;
  }

  .detalhe-pedido-topo .badge:not(.sucesso):not(.alerta):not(.perigo) {
    background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
    color: #ffffff;
  }

  .detalhe-pedido-topo .badge.sucesso {
    background: linear-gradient(180deg, #34d399 0%, #22c55e 100%);
    color: #ffffff;
  }

  .detalhe-pedido-topo .badge.alerta {
    background: linear-gradient(180deg, #f6c453 0%, #e8ad22 100%);
    color: #5f3f00;
  }

  .detalhe-pedido-topo .badge.perigo {
    background: linear-gradient(180deg, #fb7185 0%, #ef4444 100%);
    color: #ffffff;
  }

  .detalhe-pedido-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .detalhe-pedido-grid-unico {
    grid-template-columns: minmax(0, 1fr);
  }

  .detalhe-bloco {
    display: grid;
    gap: 12px;
    padding: 16px;
    border: 1px solid rgba(47, 94, 164, 0.1);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.84);
  }

  .detalhe-bloco > strong {
    color: #173966;
  }

  .detalhe-bloco > p {
    margin: 0;
    color: var(--cor-texto-suave);
    line-height: 1.6;
  }

  .rastreamento-destaque {
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 1px solid rgba(47, 94, 164, 0.14);
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(47, 94, 164, 0.07), rgba(255, 255, 255, 0.94));
  }

  .rastreamento-legenda {
    color: #244b82;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .rastreamento-codigo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .rastreamento-codigo strong {
    color: #173966;
    font-size: 22px;
    letter-spacing: 0.03em;
  }

  .rastreamento-codigo button,
  .rastreamento-destaque a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 0 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
  }

  .rastreamento-codigo button {
    border: 1px solid rgba(47, 94, 164, 0.16);
    background: #fff;
    color: #244b82;
    cursor: pointer;
  }

  .rastreamento-destaque a {
    width: fit-content;
    color: #fff;
    background: #2f5ea4;
  }

  .detalhe-itens {
    display: grid;
    gap: 10px;
  }

  .detalhe-item,
  .detalhe-linhas p {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .detalhe-item {
    align-items: center;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(47, 94, 164, 0.05);
  }

  .detalhe-item div,
  .detalhe-linhas {
    display: grid;
    gap: 4px;
  }

  .detalhe-item span {
    color: var(--cor-texto-suave);
    font-size: 13px;
  }

  .detalhe-linhas p {
    margin: 0;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid rgba(47, 94, 164, 0.08);
  }

  .detalhe-linhas p:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .detalhe-linhas span {
    color: var(--cor-texto-suave);
  }

  .detalhe-linhas .total b {
    color: #173966;
    font-size: 18px;
  }

  .botao-repagar {
    width: 100%;
    margin-top: 10px;
    justify-content: center;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(47, 94, 164, 0.1);
    color: #244b82;
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
  }

  .badge.sucesso {
    background: rgba(22, 163, 74, 0.12);
    color: #166534;
  }

  .badge.alerta {
    background: rgba(214, 164, 47, 0.16);
    color: #9a6700;
  }

  .badge.perigo {
    background: rgba(220, 38, 38, 0.12);
    color: #b91c1c;
  }

  .bloco-enderecos {
    margin-top: 36px;
  }

  .form-senha {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .senha-dicas,
  .form-senha .botao.destaque {
    grid-column: 1 / -1;
  }

  .senha-dicas {
    padding: 18px 20px;
    border: 1px solid rgba(93, 63, 211, 0.14);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(247, 245, 255, 0.9) 0%, #ffffff 100%);
  }

  .senha-dicas strong {
    display: block;
    color: #34206f;
  }

  .senha-dicas p {
    margin: 8px 0 0;
    color: var(--cor-texto-suave);
  }

  .titulo-secao {
    margin-bottom: 18px;
  }

  .enderecos-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 22px;
    align-items: start;
  }

  .lista-enderecos {
    display: grid;
    gap: 16px;
  }

  .card-endereco,
  .form-endereco {
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-card);
    padding: 18px;
  }

  .card-endereco.padrao {
    border-color: rgba(51, 168, 177, 0.45);
    box-shadow: 0 10px 24px rgba(51, 168, 177, 0.08);
  }

  .card-endereco-topo,
  .form-endereco-topo,
  .acoes-endereco {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .card-endereco-topo svg {
    color: var(--cor-primaria);
  }

  .card-endereco strong,
  .card-endereco span {
    display: block;
  }

  .card-endereco span,
  .card-endereco p {
    color: var(--cor-texto-suave);
  }

  .card-endereco p {
    margin: 8px 0 0;
  }

  .acoes-endereco {
    margin-top: 18px;
    justify-content: flex-end;
  }

  .botao-acao {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: #fff;
    color: var(--cor-texto);
    cursor: pointer;
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 800;
  }

  .botao-acao.editar:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
  }

  .botao-acao.destaque-checkout {
    background: var(--cor-primaria);
    border-color: var(--cor-primaria);
    color: #fff;
  }

  .botao-acao.destaque-checkout:hover {
    filter: brightness(1.05);
  }

  .botao-acao.excluir:hover {
    background: #fef2f2;
    border-color: #fecaca;
    color: #b91c1c;
  }

  .form-endereco {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bloco-form-endereco {
    display: grid;
    gap: 14px;
    align-content: start;
  }

  .bloco-form-endereco .chamada-endereco,
  .bloco-form-endereco .form-endereco {
    width: 100%;
  }

  .chamada-endereco {
    display: grid;
    gap: 16px;
    padding: 20px;
    border: 1px solid rgba(47, 94, 164, 0.16);
    border-radius: 18px;
    background:
      radial-gradient(circle at top right, rgba(51, 168, 177, 0.14), transparent 34%),
      linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
    box-shadow: 0 16px 32px rgba(47, 94, 164, 0.08);
  }

  .chamada-endereco.ativa {
    border-color: rgba(51, 168, 177, 0.42);
    box-shadow: 0 20px 36px rgba(51, 168, 177, 0.14);
  }

  .chamada-endereco-etiqueta {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(47, 94, 164, 0.1);
    color: #244b82;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .chamada-endereco strong {
    display: block;
    margin-top: 12px;
    color: #173966;
    font-size: 24px;
    line-height: 1.2;
  }

  .chamada-endereco p {
    margin: 10px 0 0;
    color: var(--cor-texto-suave);
    line-height: 1.6;
  }

  .chamada-endereco .botao {
    width: 100%;
    justify-content: center;
    min-height: 50px;
  }

  .botao-toggle-endereco {
    min-height: 54px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px dashed rgba(47, 94, 164, 0.3);
    border-radius: 14px;
    background: linear-gradient(180deg, #f7fbff 0%, #eef5ff 100%);
    color: #244b82;
    font-size: 15px;
    font-weight: 900;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .botao-toggle-endereco:hover {
    transform: translateY(-1px);
    border-color: rgba(47, 94, 164, 0.42);
    box-shadow: 0 14px 28px rgba(47, 94, 164, 0.12);
  }

  .estado-form-endereco {
    padding: 18px 20px;
    border: 1px solid var(--cor-borda);
    border-radius: 16px;
    background: #fff;
  }

  .estado-form-endereco strong {
    display: block;
    margin-bottom: 6px;
  }

  .estado-form-endereco p {
    margin: 0;
    color: var(--cor-texto-suave);
  }

  .form-endereco h3 {
    margin: 0;
  }

  .form-endereco {
    border-color: rgba(47, 94, 164, 0.18);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
    padding: 24px;
  }

  .acoes-form-endereco {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .form-endereco-topo,
  .checkbox-endereco,
  .form-endereco .botao.destaque {
    grid-column: 1 / -1;
  }

  .checkbox-endereco {
    display: flex !important;
    align-items: center;
    gap: 12px;
    min-height: 52px;
    border: 1px solid rgba(47, 94, 164, 0.18);
    border-radius: 12px;
    background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
    padding: 0 16px;
    cursor: pointer;
    line-height: 1;
    grid-template-columns: none;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .checkbox-endereco:hover {
    border-color: rgba(47, 94, 164, 0.32);
    background: linear-gradient(180deg, #f3f8ff 0%, #ffffff 100%);
    box-shadow: 0 10px 24px rgba(47, 94, 164, 0.08);
  }

  .checkbox-endereco input {
    width: 18px;
    height: 18px;
    margin: 0;
    flex-shrink: 0;
  }

  .checkbox-endereco span {
    display: inline-block;
    color: #173966;
    font-weight: 700;
    line-height: 1.3;
  }

  .botao.secundario {
    border: 1px solid var(--cor-borda);
    background: #fff;
    color: var(--cor-texto);
  }

  .aviso {
    margin-top: 28px;
    padding: 18px 20px;
    border: 1px solid rgba(214, 164, 47, 0.24);
    border-radius: 16px;
    background: linear-gradient(180deg, #fff8df 0%, #fffdf4 100%);
    color: #6b4f00;
  }

  .aviso strong {
    color: #7a5800;
  }

  @media (max-width: 1080px) {
    .cliente-resumo,
    .painel-grid,
    .enderecos-grid,
    .conta-layout {
      grid-template-columns: 1fr;
    }

    .cliente-avatar {
      min-width: 0;
    }

    .conta-menu {
      position: static;
    }

    .form-endereco {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 780px) {
    .cliente-hero,
    .card-pedido-topo,
    .card-endereco-topo,
    .form-endereco-topo,
    .acoes-endereco,
    .acoes-form-endereco {
      flex-direction: column;
      align-items: stretch;
    }

    .conta-menu-botao {
      grid-template-columns: 1fr;
    }

    .cliente-resumo,
    .pedido-metricas,
    .form-grid,
    .form-senha {
      grid-template-columns: 1fr 1fr;
    }

    .form-dados-pessoais,
    .form-endereco {
      grid-template-columns: 1fr 1fr;
    }

    .detalhe-pedido-grid {
      grid-template-columns: 1fr;
    }

    .detalhe-item,
    .detalhe-linhas p,
    .botao-secao,
    .detalhe-pedido-topo {
      flex-direction: column;
      align-items: stretch;
    }

    .botao-secao svg,
    .card-pedido-topo .badge {
      align-self: flex-start;
    }
  }

  @media (max-width: 640px) {
    .form-grid,
    .form-endereco,
    .form-senha,
    .form-dados-pessoais,
    .cliente-resumo,
    .pedido-metricas,
    .enderecos-grid {
      grid-template-columns: 1fr;
    }

    .cliente-hero,
    .conta-menu,
    .painel-card,
    .card-endereco,
    .form-endereco {
      padding: 18px;
    }

    .conta-painel .painel-card {
      padding: 20px;
    }

    .cliente-avatar {
      width: 100%;
      min-width: 0;
    }

    .resumo-card strong {
      font-size: 24px;
    }

    .botao-acao,
    .botao-toggle-endereco,
    .botao-detalhe-pedido,
    .botao-repagar,
    .botao,
    .form-acoes .botao {
      width: 100%;
      justify-content: center;
    }

    .acoes-endereco {
      margin-top: 14px;
    }

    .detalhe-item strong,
    .detalhe-linhas b {
      word-break: break-word;
    }

    .rastreamento-codigo strong {
      font-size: 18px;
      word-break: break-all;
    }

    .card-endereco p,
    .detalhe-bloco > p {
      word-break: break-word;
    }

    .detalhe-bloco,
    .estado-form-endereco,
    .aviso {
      padding: 16px;
    }
  }
`
