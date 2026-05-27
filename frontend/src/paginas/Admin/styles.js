import styled from 'styled-components'

export const AdminPage = styled.section`
  .metricas {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .metricas div {
    border-radius: 8px;
    background: var(--cor-primaria);
    color: #fff;
    padding: 22px;
  }

  .metricas strong {
    display: block;
    font-size: 34px;
  }

  &.admin-shell {
    min-height: 100vh;
    background: #f3f5f8;
  }

  .admin-sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 60;
    display: flex;
    flex-direction: column;
    width: 256px;
    border-right: 1px solid var(--cor-borda);
    background: #fff;
  }

  .admin-marca {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 72px;
    padding: 16px;
    border-bottom: 1px solid var(--cor-borda);
  }

  .admin-marca img {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: var(--cor-primaria);
    padding: 5px;
  }

  .admin-marca strong,
  .admin-marca span {
    display: block;
  }

  .admin-marca span {
    color: var(--cor-texto-suave);
    font-size: 12px;
  }

  .admin-sidebar nav {
    display: grid;
    gap: 4px;
    padding: 16px;
  }

  .admin-sidebar nav button {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 42px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--cor-texto-suave);
    cursor: pointer;
    padding: 0 12px;
    font-weight: 800;
    text-align: left;
  }

  .admin-sidebar nav button:hover {
    background: var(--cor-muted);
    color: var(--cor-texto);
  }

  .admin-sidebar nav button.ativo {
    background: var(--cor-primaria);
    color: #fff;
  }

  .admin-conteudo {
    min-height: 100vh;
    padding-left: 256px;
  }

  .admin-topo {
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 64px;
    border-bottom: 1px solid var(--cor-borda);
    background: rgba(255, 255, 255, 0.95);
    padding: 0 24px;
    backdrop-filter: blur(12px);
  }

  .campo-com-icone svg,
  .campo-select-admin svg {
    position: absolute;
    top: 50%;
    left: 11px;
    transform: translateY(-50%);
    color: var(--cor-texto-suave);
  }

  .campo-com-icone input,
  .campo-select-admin select {
    padding-left: 38px;
    background: var(--cor-muted);
  }

  .admin-acoes {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .admin-menu-notificacoes,
  .admin-menu-conta {
    position: relative;
  }

  .admin-botao-notificacoes.ativo {
    background: #e7eef7;
    border-color: rgba(34, 55, 88, 0.16);
  }

  .admin-notificacao-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 18px;
    height: 18px;
    border-radius: 999px;
    background: #b91c1c;
    color: #fff;
    display: grid;
    place-items: center;
    padding: 0 4px;
    font-size: 11px;
    font-weight: 800;
    line-height: 1;
  }

  .admin-usuario {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    border: 1px solid rgba(34, 55, 88, 0.1);
    border-radius: 14px;
    background: #fff;
    color: var(--cor-texto);
    cursor: pointer;
    padding: 7px 10px;
    font-weight: 800;
    box-shadow: 0 10px 24px rgba(23, 43, 77, 0.05);
  }

  .admin-usuario:hover,
  .admin-usuario.ativo {
    background: #f8fbff;
    border-color: rgba(34, 55, 88, 0.16);
  }

  .admin-usuario span {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: rgba(34, 55, 88, 0.1);
    color: var(--cor-primaria);
  }

  .admin-usuario-texto {
    display: grid;
    gap: 2px;
    text-align: left;
  }

  .admin-usuario-texto strong,
  .admin-usuario-texto small {
    display: block;
  }

  .admin-usuario-texto small {
    color: var(--cor-texto-suave);
    font-size: 12px;
    font-weight: 600;
  }

  .admin-dropdown-conta {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    z-index: 40;
    display: grid;
    min-width: 220px;
    padding: 10px;
    border: 1px solid rgba(34, 55, 88, 0.1);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 18px 40px rgba(23, 43, 77, 0.12);
  }

  .admin-dropdown-notificacoes {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    z-index: 40;
    width: min(360px, calc(100vw - 32px));
    padding: 10px;
    border: 1px solid rgba(34, 55, 88, 0.1);
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 18px 40px rgba(23, 43, 77, 0.12);
  }

  .admin-dropdown-notificacoes-topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 6px 12px;
  }

  .admin-dropdown-notificacoes-topo strong {
    font-size: 14px;
  }

  .admin-dropdown-notificacoes-topo span {
    border-radius: 999px;
    background: var(--cor-muted);
    color: var(--cor-texto-suave);
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 700;
  }

  .admin-lista-notificacoes {
    display: grid;
    gap: 8px;
  }

  .admin-item-notificacao {
    width: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    border: 1px solid var(--cor-borda);
    border-radius: 12px;
    background: #fff;
    padding: 8px;
  }

  .admin-item-notificacao:hover {
    background: #f8fbff;
    border-color: rgba(34, 55, 88, 0.16);
  }

  .admin-item-notificacao.alerta {
    border-color: rgba(185, 28, 28, 0.16);
    background: #fff8f8;
  }

  .admin-item-notificacao-conteudo,
  .admin-item-notificacao-excluir {
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .admin-item-notificacao-conteudo {
    display: grid;
    gap: 4px;
    min-width: 0;
    padding: 4px;
    text-align: left;
  }

  .admin-item-notificacao-excluir {
    align-self: start;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    color: var(--cor-texto-suave);
  }

  .admin-item-notificacao-excluir:hover {
    background: rgba(34, 55, 88, 0.08);
    color: #b91c1c;
  }

  .admin-item-notificacao strong {
    font-size: 14px;
    color: var(--cor-texto);
  }

  .admin-item-notificacao span,
  .admin-notificacoes-vazio {
    color: var(--cor-texto-suave);
    font-size: 13px;
    line-height: 1.45;
  }

  .admin-notificacoes-vazio {
    margin: 0;
    padding: 6px;
  }

  .admin-dropdown-conta a,
  .admin-dropdown-conta button {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 42px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--cor-texto);
    cursor: pointer;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 700;
    text-align: left;
  }

  .admin-dropdown-conta a:hover,
  .admin-dropdown-conta button:hover {
    background: #f8fbff;
  }

  .admin-dropdown-conta button {
    color: #b91c1c;
  }

  .admin-main {
    display: grid;
    gap: 24px;
    padding: 24px;
  }

  .admin-titulo h1 {
    margin: 0;
    font-size: 28px;
  }

  .admin-titulo p {
    margin: 6px 0 0;
    color: var(--cor-texto-suave);
  }

  .admin-titulo.linha {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
  }

  .admin-metricas {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .admin-metricas div,
  .admin-card,
  .status-card {
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 10px 25px rgba(23, 43, 77, 0.04);
  }

  .admin-metricas div {
    padding: 22px;
  }

  .admin-metricas svg {
    color: var(--cor-primaria);
  }

  .icone-metrica {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 8px;
    background: rgba(34, 55, 88, 0.08);
  }

  .icone-metrica svg {
    width: 21px;
    height: 21px;
  }

  .admin-metricas strong {
    display: block;
    margin-top: 12px;
    color: var(--cor-texto);
    font-size: 30px;
  }

  .admin-metricas span {
    color: var(--cor-texto-suave);
  }

  .admin-duas-colunas {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .admin-duas-colunas-categorias {
    grid-template-columns: minmax(320px, 0.88fr) minmax(560px, 1.12fr);
    align-items: start;
  }

  .lista-categorias-card.largura-total {
    width: 100%;
  }

  .admin-graficos {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 20px;
  }

  .admin-card {
    padding: 22px;
  }

  .admin-card h2 {
    margin-top: 0;
  }

  .admin-subtopo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .admin-subtopo h2 {
    margin-bottom: 0;
  }

  .grafico-card {
    min-height: 330px;
  }

  .grafico-topo {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }

  .grafico-topo p {
    margin: 6px 0 0;
    color: var(--cor-texto-suave);
  }

  .grafico-filtros {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .grafico-filtros button {
    min-height: 42px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(34, 55, 88, 0.12);
    background: linear-gradient(180deg, #ffffff, #f7faff);
    color: #4f6481;
    font-size: 13px;
    font-weight: 700;
    box-shadow: 0 8px 22px rgba(23, 43, 77, 0.04);
    transition: 0.2s ease;
  }

  .grafico-filtros button.ativo {
    border-color: transparent;
    background: var(--cor-primaria);
    color: #fff;
    box-shadow: 0 10px 24px rgba(34, 55, 88, 0.16);
  }

  .grafico-resumo-periodo {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .grafico-resumo-periodo div {
    padding: 14px;
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(34, 55, 88, 0.05), rgba(255, 255, 255, 0.98));
    border: 1px solid rgba(34, 55, 88, 0.08);
  }

  .grafico-resumo-periodo span {
    display: block;
    color: var(--cor-texto-suave);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .grafico-resumo-periodo strong {
    display: block;
    margin-top: 8px;
    color: var(--cor-texto);
    font-size: 24px;
    line-height: 1.1;
  }

  .grafico-barras-vendas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(36px, 1fr));
    align-items: end;
    gap: 10px;
    min-height: 250px;
    padding: 18px 14px 8px;
    border: 1px dashed var(--cor-borda);
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(255, 255, 255, 1));
  }

  .grafico-barra-dia {
    display: grid;
    justify-items: center;
    align-content: end;
    gap: 8px;
    min-width: 0;
  }

  .grafico-barra-dia small {
    color: var(--cor-texto-suave);
    font-size: 11px;
    font-weight: 700;
  }

  .grafico-barra-dia div {
    display: flex;
    align-items: end;
    justify-content: center;
    width: 100%;
    min-height: 156px;
    padding: 8px 0;
    border-radius: 12px;
    background: rgba(34, 55, 88, 0.04);
  }

  .grafico-barra-dia i {
    display: block;
    width: 18px;
    min-height: 10px;
    border-radius: 999px;
    background: linear-gradient(180deg, #33a8b1, #223758);
    box-shadow: 0 8px 20px rgba(34, 55, 88, 0.18);
  }

  .grafico-barra-dia span {
    color: var(--cor-texto-suave);
    font-size: 11px;
    font-weight: 700;
    text-align: center;
    text-transform: capitalize;
  }

  .relatorios-topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .relatorios-topo p {
    margin: 6px 0 0;
    color: var(--cor-texto-suave);
  }

  .relatorios-metricas {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .relatorio-barras .grafico-barra-dia small {
    font-size: 10px;
    text-align: center;
    line-height: 1.3;
  }

  .ranking-relatorio {
    display: grid;
    gap: 12px;
    padding-top: 14px;
  }

  .ranking-relatorio-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(34, 55, 88, 0.08);
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(255, 255, 255, 1));
  }

  .ranking-relatorio-esquerda {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .ranking-posicao {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: rgba(34, 55, 88, 0.1);
    color: var(--cor-primaria);
    font-size: 13px;
    font-weight: 800;
    flex-shrink: 0;
  }

  .ranking-relatorio-esquerda img,
  .avatar-ranking-cliente {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: cover;
    background: var(--cor-muted);
    flex-shrink: 0;
  }

  .avatar-ranking-cliente {
    display: grid;
    place-items: center;
    color: var(--cor-primaria);
    font-weight: 800;
    background: rgba(34, 55, 88, 0.08);
  }

  .ranking-relatorio-esquerda strong,
  .ranking-relatorio-esquerda small,
  .ranking-relatorio-direita b,
  .ranking-relatorio-direita span {
    display: block;
  }

  .ranking-relatorio-esquerda small {
    color: var(--cor-texto-suave);
    margin-top: 4px;
  }

  .ranking-relatorio-direita {
    text-align: right;
    flex-shrink: 0;
  }

  .ranking-relatorio-direita b {
    color: var(--cor-texto);
  }

  .ranking-relatorio-direita span {
    margin-top: 4px;
    color: var(--cor-texto-suave);
  }

  .barras-relatorio small {
    display: block;
    margin-bottom: 7px;
    color: var(--cor-texto-suave);
    font-size: 12px;
  }

  .grafico-vazio {
    display: grid;
    place-items: center;
    align-content: center;
    min-height: 250px;
    border: 1px dashed var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-fundo);
    color: var(--cor-texto-suave);
    text-align: center;
  }

  .grafico-vazio svg {
    color: var(--cor-primaria);
  }

  .barras-categorias {
    display: grid;
    gap: 14px;
    padding-top: 14px;
  }

  .grafico-categorias-legenda {
    margin: 8px 0 0;
    color: var(--cor-texto-suave);
    font-size: 14px;
  }

  .categoria-dashboard-item {
    display: grid;
    gap: 10px;
    padding: 14px 16px;
    border: 1px solid rgba(34, 55, 88, 0.08);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(255, 255, 255, 1));
  }

  .categoria-dashboard-topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .categoria-dashboard-nome {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  .categoria-dashboard-nome b {
    color: var(--cor-texto);
    font-size: 16px;
  }

  .categoria-dashboard-nome small,
  .categoria-dashboard-resumo span {
    color: var(--cor-texto-suave);
  }

  .categoria-dashboard-resumo {
    display: grid;
    justify-items: end;
    gap: 2px;
    flex-shrink: 0;
  }

  .categoria-dashboard-resumo strong {
    color: var(--cor-primaria);
    font-size: 18px;
  }

  .categoria-dashboard-trilha {
    height: 12px;
    overflow: hidden;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(226, 232, 240, 0.9), rgba(236, 242, 248, 1));
  }

  .categoria-dashboard-trilha i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #223758, #4079bf);
    box-shadow: 0 8px 18px rgba(64, 121, 191, 0.24);
  }

  .admin-lista-item {
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--cor-borda);
  }

  .admin-lista-item:last-child {
    border-bottom: 0;
  }

  .admin-lista-item img {
    width: 46px;
    height: 46px;
    border-radius: 8px;
    object-fit: cover;
    background: var(--cor-muted);
  }

  .admin-lista-icone {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 8px;
    background: rgba(34, 55, 88, 0.08);
    color: var(--cor-primaria);
  }

  .admin-lista-item strong,
  .admin-lista-item span {
    display: block;
  }

  .admin-lista-item small {
    display: block;
    margin-top: 6px;
    color: var(--cor-texto-suave);
    text-align: right;
  }

  .admin-lista-item-pedido {
    padding: 14px 0;
  }

  .admin-lista-pedido-conteudo {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .admin-lista-pedido-topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .admin-lista-pedido-topo strong {
    color: var(--cor-texto);
    font-size: 16px;
  }

  .admin-lista-pedido-topo small {
    margin-top: 0;
    text-align: left;
    font-size: 12px;
    white-space: nowrap;
  }

  .admin-lista-pedido-resumo {
    display: grid;
    justify-items: end;
    gap: 8px;
    min-width: 110px;
  }

  .admin-lista-pedido-resumo .badge {
    display: inline-flex;
  }

  .admin-lista-pedido-resumo small {
    margin-top: 0;
    font-size: 15px;
    font-weight: 800;
    color: var(--cor-texto);
  }

  .admin-lista-item span,
  .admin-texto-vazio {
    color: var(--cor-texto-suave);
  }

  .admin-lista-item em {
    border-radius: 999px;
    background: #fee2e2;
    color: #b91c1c;
    padding: 4px 8px;
    font-style: normal;
    font-weight: 800;
  }

  .admin-filtros {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    padding: 12px;
    border: 1px solid rgba(34, 55, 88, 0.08);
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(255, 255, 255, 1));
    flex-wrap: wrap;
  }

  .admin-filtros .campo-com-icone {
    flex: 1 1 360px;
    min-width: 260px;
  }

  .admin-filtros .campo-com-icone,
  .campo-select-admin,
  .admin-calendario {
    min-height: 46px;
    border-radius: 14px;
    border: 1px solid rgba(34, 55, 88, 0.12);
    background: linear-gradient(180deg, #ffffff, #f8fbff);
    box-shadow: 0 8px 22px rgba(23, 43, 77, 0.04);
    transition: 0.2s ease;
  }

  .admin-filtros .campo-com-icone:hover,
  .campo-select-admin:hover,
  .admin-calendario:hover,
  .grafico-filtros button:hover {
    border-color: rgba(34, 55, 88, 0.2);
    background: linear-gradient(180deg, #ffffff, #f3f8ff);
  }

  .admin-filtros .campo-com-icone:focus-within,
  .campo-select-admin:focus-within {
    border-color: rgba(34, 55, 88, 0.28);
    box-shadow: 0 0 0 4px rgba(34, 55, 88, 0.08);
  }

  .admin-filtros .campo-com-icone {
    position: relative;
    display: flex;
    align-items: center;
  }

  .admin-filtros .campo-com-icone svg,
  .campo-select-admin svg {
    left: 14px;
    color: #6b7f98;
  }

  .admin-filtros .campo-com-icone input,
  .campo-select-admin select,
  .admin-filtros-data input[type='date'] {
    width: 100%;
    min-height: 46px;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--cor-texto);
    font-size: 14px;
    font-weight: 600;
  }

  .admin-filtros .campo-com-icone input,
  .campo-select-admin select {
    padding: 0 14px 0 42px;
  }

  .admin-filtros .campo-com-icone input::placeholder {
    color: #72859d;
    font-weight: 500;
  }

  .admin-filtros-data {
    display: grid;
    grid-template-columns: repeat(2, minmax(220px, 260px)) minmax(220px, 1fr);
    align-items: start;
    gap: 16px;
    margin: -4px 0 18px;
    padding: 18px;
    border: 1px solid rgba(34, 55, 88, 0.1);
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(238, 246, 255, 0.96), rgba(255, 251, 239, 0.94));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .admin-filtros-data label {
    display: grid;
    gap: 8px;
  }

  .filtro-data-campo {
    display: grid !important;
    grid-template-rows: auto 50px;
    align-content: end;
    gap: 8px;
  }

  .filtro-data-campo > span {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #5f7490;
  }

  .admin-filtros-data input[type='date'] {
    min-height: 50px;
    padding: 0 14px;
    border: 1px solid rgba(34, 55, 88, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 8px 22px rgba(23, 43, 77, 0.04);
  }

  .admin-filtros-data input[type='date']:focus {
    border-color: rgba(34, 55, 88, 0.28);
    box-shadow: 0 0 0 4px rgba(34, 55, 88, 0.08);
  }

  .admin-filtros-data-acoes {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 50px;
    margin-top: 24px;
    padding: 0 16px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px dashed rgba(223, 182, 81, 0.45);
  }

  .admin-filtros-data-acoes small {
    color: #7b6a38;
    font-size: 13px;
    line-height: 1.4;
    margin: 0;
  }

  .campo-select-admin {
    position: relative;
    flex: 0 0 240px;
    min-width: 220px;
  }

  .campo-select-admin select {
    appearance: none;
    cursor: pointer;
    padding-right: 38px;
  }

  .admin-calendario {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: auto;
    min-width: 168px;
    padding: 0 16px;
    color: var(--cor-primaria);
    font-weight: 700;
    white-space: nowrap;
  }

  .admin-calendario span {
    font-size: 14px;
  }

  .admin-calendario.ativo {
    border-color: rgba(34, 55, 88, 0.22);
    background: linear-gradient(180deg, #ffffff, #eef5ff);
    box-shadow: 0 0 0 4px rgba(34, 55, 88, 0.06);
  }

  .tabela-admin {
    overflow-x: auto;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
  }

  .tabela-admin table {
    width: 100%;
    border-collapse: collapse;
    min-width: 760px;
    table-layout: fixed;
  }

  .tabela-admin th,
  .tabela-admin td {
    border-bottom: 1px solid var(--cor-borda);
    padding: 12px;
    text-align: left;
    vertical-align: middle;
  }

  .tabela-admin th {
    color: var(--cor-texto-suave);
    font-size: 13px;
  }

  .tabela-admin tr:last-child td {
    border-bottom: 0;
  }

  .tabela-admin td img {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    object-fit: cover;
    background: var(--cor-muted);
  }

  .produto-admin-identificacao {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 2px;
  }

  .tabela-admin td strong,
  .tabela-admin td span {
    display: block;
  }

  .produto-admin-identificacao .badge {
    display: inline-flex;
  }

  .tabela-admin td span {
    color: var(--cor-texto-suave);
    font-size: 13px;
  }

  .tabela-admin .coluna-pagamento,
  .tabela-admin .coluna-pagamento strong,
  .tabela-admin .coluna-pagamento span {
    min-width: 0;
  }

  .tabela-admin .referencia-pagamento {
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .tabela-admin td em {
    border: 1px solid var(--cor-borda);
    border-radius: 999px;
    padding: 4px 8px;
    color: var(--cor-texto-suave);
    font-style: normal;
    font-size: 13px;
  }

  .tabela-vazia {
    height: 150px;
    color: var(--cor-texto-suave);
    text-align: center !important;
  }

  .acoes-tabela {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
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

  .botao-acao.editar {
    border-color: #bfdbfe;
    background: #eff6ff;
    color: #1d4ed8;
  }

  .botao-acao.excluir {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b91c1c;
  }

  .botao-acao.editar:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
  }

  .botao-acao.excluir:hover {
    background: #fef2f2;
    border-color: #fecaca;
    color: #b91c1c;
  }

  .badge {
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    border: 1px solid var(--cor-borda);
    background: #fff;
    color: var(--cor-texto-suave);
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 800;
  }

  .badge.sucesso {
    background: #dcfce7;
    color: #166534;
  }

  .badge.alerta {
    background: #fef3c7;
    color: #92400e;
  }

  .badge.perigo {
    background: #fee2e2;
    color: #991b1b;
  }

  .badge-estoque-editavel {
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .badge-estoque-editavel:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(34, 55, 88, 0.1);
  }

  .estoque-edicao-rapida {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .estoque-edicao-rapida input {
    width: 72px;
    min-height: 34px;
    border: 1px solid rgba(34, 55, 88, 0.16);
    border-radius: 8px;
    background: #fff;
    color: var(--cor-texto);
    padding: 0 10px;
    font-size: 13px;
    font-weight: 700;
  }

  .estoque-edicao-rapida .botao-acao {
    min-width: 34px;
    min-height: 34px;
    justify-content: center;
    padding: 0;
  }

  .estoque-edicao-rapida .botao-acao.salvar {
    border-color: #bbf7d0;
    background: #dcfce7;
    color: #166534;
  }

  .estoque-edicao-rapida .botao-acao.cancelar {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b91c1c;
  }

  .admin-form-amplo {
    width: 100%;
  }

  .roteiro-form-produto {
    display: grid;
    gap: 4px;
    margin-bottom: 16px;
    border: 1px solid rgba(34, 55, 88, 0.12);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(223, 182, 81, 0.18), rgba(255, 255, 255, 0.98));
    padding: 16px 18px;
  }

  .roteiro-form-produto strong {
    color: #16253b;
    font-size: 15px;
  }

  .roteiro-form-produto span {
    color: #42526b;
    font-size: 13px;
    line-height: 1.5;
  }

  .admin-form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .campo-admin {
    display: grid;
    gap: 8px;
    align-content: start;
    padding: 14px;
    border: 1px solid rgba(34, 55, 88, 0.1);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 8px 20px rgba(23, 43, 77, 0.03);
  }

  .campo-admin.destaque {
    border-color: rgba(223, 182, 81, 0.44);
    box-shadow: 0 10px 24px rgba(223, 182, 81, 0.08);
  }

  .campo-admin > span {
    color: #16253b;
    font-size: 14px;
    font-weight: 800;
  }

  .campo-admin > small {
    color: var(--cor-texto-suave);
    font-size: 12px;
    line-height: 1.5;
  }

  .campo-admin input,
  .campo-admin select,
  .campo-admin textarea {
    border-width: 1px;
    border-color: rgba(34, 55, 88, 0.16);
    background: #fff;
  }

  .campo-admin textarea {
    min-height: 220px;
    resize: vertical;
  }

  .campo-admin input:focus,
  .campo-admin select:focus,
  .campo-admin textarea:focus {
    outline: none;
    border-color: rgba(223, 182, 81, 0.72);
    box-shadow: 0 0 0 4px rgba(223, 182, 81, 0.12);
  }

  .bloco-imagens-produto {
    grid-column: 1 / -1;
    display: grid;
    gap: 14px;
    border: 1px solid rgba(34, 55, 88, 0.14);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(34, 55, 88, 0.04), rgba(255, 255, 255, 0.99));
    padding: 16px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  .bloco-pedido-admin {
    display: grid;
    gap: 14px;
    margin-bottom: 16px;
    padding: 18px;
    border-radius: 16px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.74);
  }

  .bloco-pedido-admin-status {
    border: 1px solid rgba(34, 55, 88, 0.14);
    background: linear-gradient(180deg, rgba(34, 55, 88, 0.05), rgba(255, 255, 255, 0.98));
  }

  .bloco-pedido-admin-rastreio {
    border: 1px solid rgba(51, 168, 177, 0.26);
    background: linear-gradient(180deg, rgba(51, 168, 177, 0.1), rgba(255, 255, 255, 0.98));
  }

  .bloco-pedido-admin-destino {
    border: 1px solid rgba(223, 182, 81, 0.38);
    background: linear-gradient(180deg, rgba(250, 223, 143, 0.24), rgba(255, 255, 255, 0.98));
  }

  .acoes-melhor-envio {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
    gap: 14px;
    align-items: start;
  }

  .acoes-melhor-envio-esquerda {
    display: grid;
    gap: 10px;
    align-content: start;
  }

  .acoes-melhor-envio-botoes {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .acao-fluxo-wrapper {
    display: grid;
  }

  .acoes-melhor-envio-botoes .botao {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
  }

  .acoes-melhor-envio-botoes .botao-fluxo.disponivel {
    border-color: rgba(51, 168, 177, 0.34);
    background: linear-gradient(180deg, #ffffff, #eefbfd);
    color: #155d63;
  }

  .acoes-melhor-envio-botoes .botao-fluxo.disponivel:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(51, 168, 177, 0.12);
  }

  .acoes-melhor-envio-botoes .botao-fluxo.concluida {
    border-color: rgba(34, 197, 94, 0.3);
    background: linear-gradient(180deg, #f0fdf4, #dcfce7);
    color: #166534;
  }

  .acoes-melhor-envio-botoes .botao-fluxo.concluida-permissiva {
    border-color: rgba(59, 130, 246, 0.3);
    background: linear-gradient(180deg, #eff6ff, #dbeafe);
    color: #1d4ed8;
  }

  .acoes-melhor-envio-botoes .botao-fluxo.bloqueada,
  .acoes-melhor-envio-botoes .botao-fluxo:disabled {
    border-color: rgba(148, 163, 184, 0.24);
    background: linear-gradient(180deg, #f8fafc, #eef2f7);
    color: #7a8da8;
    cursor: not-allowed;
    opacity: 0.88;
  }

  .resumo-melhor-envio-admin {
    display: grid;
    gap: 4px;
    padding: 14px 16px;
    border: 1px dashed rgba(51, 168, 177, 0.4);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.72);
  }

  .resumo-melhor-envio-admin strong {
    color: #155d63;
  }

  .resumo-melhor-envio-admin span,
  .resumo-melhor-envio-admin small {
    color: var(--cor-texto-suave);
    word-break: break-word;
  }

  .reset-melhor-envio-admin {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid rgba(220, 38, 38, 0.18);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(254, 242, 242, 0.96), rgba(255, 255, 255, 0.98));
  }

  .reset-melhor-envio-admin strong {
    display: block;
    margin-bottom: 2px;
    color: #b91c1c;
    font-size: 14px;
  }

  .reset-melhor-envio-admin p {
    margin: 0;
    color: #7f1d1d;
    font-size: 12px;
    line-height: 1.35;
  }

  .resetar-processo-melhor-envio {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 168px;
    min-height: 38px;
    padding: 0 14px;
    font-size: 13px;
    border-color: rgba(220, 38, 38, 0.34) !important;
    background: linear-gradient(180deg, #fef2f2, #fee2e2) !important;
    color: #b91c1c !important;
  }

  .resetar-processo-melhor-envio:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(220, 38, 38, 0.14);
    border-color: rgba(220, 38, 38, 0.48) !important;
    background: linear-gradient(180deg, #fee2e2, #fecaca) !important;
  }

  .upload-imagens-admin {
    display: grid;
    gap: 10px;
  }

  .upload-imagens-admin.destaque-upload {
    grid-template-columns: minmax(0, 1fr);
  }

  .upload-imagens-admin input[type='file'] {
    display: none;
  }

  .campo-upload-imagens {
    display: grid;
    gap: 8px;
    place-items: center;
    min-height: 160px;
    border: 2px dashed rgba(34, 55, 88, 0.34);
    border-radius: 12px;
    background:
      radial-gradient(circle at top, rgba(223, 182, 81, 0.16), transparent 38%),
      linear-gradient(180deg, rgba(34, 55, 88, 0.06), rgba(255, 255, 255, 0.98));
    cursor: pointer;
    padding: 22px;
    text-align: center;
    transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  }

  .campo-upload-imagens:hover {
    border-color: rgba(223, 182, 81, 0.8);
    background: #fff;
    transform: translateY(-1px);
    box-shadow: 0 14px 32px rgba(34, 55, 88, 0.08);
  }

  .campo-upload-icone {
    display: grid;
    place-items: center;
    width: 54px;
    height: 54px;
    border-radius: 14px;
    background: rgba(34, 55, 88, 0.1);
    color: var(--cor-primaria);
  }

  .campo-upload-imagens strong {
    color: var(--cor-texto);
    font-size: 20px;
  }

  .campo-upload-imagens span,
  .upload-imagens-admin small {
    color: var(--cor-texto-suave);
    font-size: 14px;
    line-height: 1.5;
  }


  .grade-imagens-admin {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .card-imagem-admin,
  .estado-imagens-admin {
    display: grid;
    gap: 10px;
    border: 1px solid var(--cor-borda);
    border-radius: 12px;
    background: #fff;
    padding: 12px;
  }

  .card-imagem-admin.principal {
    border-color: rgba(34, 55, 88, 0.34);
    box-shadow: 0 10px 24px rgba(34, 55, 88, 0.08);
  }

  .card-imagem-admin.nova {
    border-style: dashed;
  }

  .card-imagem-admin img {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    object-fit: cover;
    background: var(--cor-muted);
  }

  .card-imagem-admin-info {
    display: grid;
    gap: 4px;
  }

  .card-imagem-admin-info strong {
    color: var(--cor-texto);
    font-size: 14px;
  }

  .card-imagem-admin-info span {
    color: var(--cor-texto-suave);
    font-size: 12px;
    line-height: 1.4;
    word-break: break-word;
  }

  .card-imagem-admin-acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .estado-imagens-admin {
    place-items: center;
    align-content: center;
    min-height: 180px;
    border-style: dashed;
    text-align: center;
  }

  .estado-imagens-admin strong {
    color: var(--cor-texto);
  }

  .estado-imagens-admin span {
    color: var(--cor-texto-suave);
    font-size: 13px;
    line-height: 1.5;
  }

  .preview-categoria-admin {
    margin-top: 14px;
  }

  .editor-recorte-overlay {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: grid;
    place-items: center;
    background: rgba(15, 23, 42, 0.6);
    padding: 24px;
  }

  .editor-recorte-modal {
    width: min(720px, 100%);
    display: grid;
    gap: 18px;
    border-radius: 18px;
    border: 1px solid rgba(34, 55, 88, 0.12);
    background: #fff;
    padding: 22px;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.28);
  }

  .editor-recorte-topo {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .editor-recorte-topo div {
    display: grid;
    gap: 6px;
  }

  .editor-recorte-topo strong {
    color: var(--cor-texto);
    font-size: 18px;
  }

  .editor-recorte-topo span,
  .editor-recorte-ajustes small {
    color: var(--cor-texto-suave);
    font-size: 13px;
    line-height: 1.5;
  }

  .editor-recorte-corpo {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 20px;
    align-items: start;
  }

  .editor-recorte-preview {
    position: relative;
    width: min(100%, 360px);
    aspect-ratio: 1 / 1;
    justify-self: center;
    overflow: hidden;
    border-radius: 18px;
    border: 1px solid rgba(34, 55, 88, 0.1);
    background: linear-gradient(180deg, #edf2f7, #f8fbff);
    cursor: grab;
    user-select: none;
  }

  .editor-recorte-preview:active {
    cursor: grabbing;
  }

  .editor-recorte-preview img {
    position: absolute;
    transform-origin: center center;
    pointer-events: none;
    user-select: none;
    -webkit-user-drag: none;
    max-width: none;
    max-height: none;
  }

  .editor-recorte-mascara {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    box-shadow: inset 0 0 0 999px rgba(15, 23, 42, 0.06);
    pointer-events: none;
  }

  .editor-recorte-ajustes {
    display: grid;
    gap: 12px;
  }

  .editor-recorte-ajustes label {
    display: grid;
    gap: 10px;
    color: var(--cor-texto);
    font-size: 13px;
    font-weight: 800;
  }

  .editor-recorte-ajustes input[type='range'] {
    width: 100%;
  }

  .editor-recorte-acoes {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .campo-sufixo {
    position: relative;
  }

  .campo-sufixo input {
    padding-right: 38px;
  }

  .campo-sufixo span {
    position: absolute;
    top: 50%;
    right: 14px;
    transform: translateY(-50%);
    color: var(--cor-texto-suave);
    font-size: 13px;
    font-weight: 800;
    pointer-events: none;
  }

  .bloco-parcelamento {
    grid-column: 1 / -1;
    display: grid;
    gap: 14px;
    border: 1px solid rgba(51, 168, 177, 0.28);
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(51, 168, 177, 0.1), rgba(255, 255, 255, 0.96));
    padding: 16px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  .bloco-precificacao-produto,
  .bloco-frete-produto,
  .bloco-especificacoes-produto {
    grid-column: 1 / -1;
    display: grid;
    gap: 14px;
    border-radius: 12px;
    padding: 16px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
  }

  .bloco-precificacao-produto {
    border: 1px solid rgba(34, 55, 88, 0.16);
    background: linear-gradient(180deg, rgba(34, 55, 88, 0.05), rgba(255, 255, 255, 0.98));
  }

  .bloco-frete-produto {
    border: 1px solid rgba(223, 182, 81, 0.45);
    background: linear-gradient(180deg, rgba(250, 223, 143, 0.38), rgba(255, 248, 220, 0.94));
  }

  .bloco-frete-produto .bloco-parcelamento-topo strong {
    color: #8b6408;
  }

  .bloco-especificacoes-produto {
    border: 1px solid rgba(34, 55, 88, 0.12);
    background: linear-gradient(180deg, rgba(34, 55, 88, 0.04), rgba(255, 255, 255, 0.98));
  }

  .bloco-frete-grid,
  .bloco-precificacao-grid,
  .bloco-especificacoes-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .acoes-medidas-padrao {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .acoes-medidas-padrao small {
    color: var(--cor-texto-suave);
    font-size: 12px;
    line-height: 1.5;
  }

  .resumo-precificacao-admin {
    display: grid;
    align-content: center;
    gap: 4px;
    border: 1px solid rgba(34, 55, 88, 0.1);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.82);
    padding: 14px;
  }

  .resumo-precificacao-admin span {
    color: var(--cor-texto-suave);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .resumo-precificacao-admin strong {
    color: var(--cor-texto);
    font-size: 24px;
    line-height: 1;
  }

  .resumo-precificacao-admin small {
    color: var(--cor-texto-suave);
    font-size: 12px;
    line-height: 1.5;
  }

  .cores-disponiveis-admin {
    display: grid;
    gap: 12px;
  }

  .cores-disponiveis-topo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .cores-disponiveis-topo span {
    flex: 1;
    color: var(--cor-texto-suave);
    font-size: 13px;
    line-height: 1.4;
  }

  .cores-disponiveis-lista {
    display: grid;
    gap: 10px;
  }

  .linha-cor-admin {
    display: grid;
    grid-template-columns: 68px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
  }

  .linha-cor-admin input[type='color'] {
    width: 100%;
    min-height: 44px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: #fff;
    padding: 4px;
  }

  .bloco-parcelamento-topo {
    display: grid;
    gap: 4px;
  }

  .bloco-parcelamento-topo strong {
    color: var(--cor-primaria);
    font-size: 15px;
  }

  .bloco-parcelamento-topo span {
    color: var(--cor-texto-suave);
    font-size: 13px;
    line-height: 1.5;
  }

  .bloco-parcelamento-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    align-items: end;
  }

  .checkbox-linha {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    border: 1px solid rgba(34, 55, 88, 0.08);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.8);
    padding: 0 14px;
    font-weight: 700;
  }

  .checkbox-linha input {
    width: 16px;
    height: 16px;
    margin: 0;
  }

  .campo-descricao {
    grid-column: 1 / -1;
  }

  .acoes-form-produto {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
    padding-top: 18px;
    border-top: 1px solid rgba(34, 55, 88, 0.08);
  }

  .pedido-admin-ajuda {
    display: grid;
    gap: 6px;
    margin-top: 18px;
    border: 1px solid rgba(214, 164, 47, 0.28);
    border-radius: 12px;
    background: linear-gradient(180deg, #fff8df 0%, #fffdf4 100%);
    padding: 16px 18px;
  }

  .pedido-admin-ajuda strong {
    color: #7a5800;
  }

  .pedido-admin-ajuda-info {
    border-color: rgba(34, 55, 88, 0.14);
    background: linear-gradient(180deg, #eef7ff 0%, #fbfdff 100%);
  }

  .pedido-admin-ajuda-info strong,
  .pedido-admin-ajuda-info span {
    color: #173966;
  }

  .pedido-admin-ajuda span {
    color: #6b4f00;
    font-size: 13px;
    line-height: 1.5;
  }

  .detalhe-pedido-admin {
    display: grid;
    gap: 18px;
  }

  .detalhe-pedido-admin-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .detalhe-pedido-admin-bloco {
    display: grid;
    gap: 12px;
    padding: 18px;
    border: 1px solid rgba(34, 55, 88, 0.1);
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.9), rgba(255, 255, 255, 1));
  }

  .detalhe-pedido-admin-bloco.amplo {
    grid-column: 1 / -1;
  }

  .detalhe-pedido-admin-bloco > strong {
    color: #173966;
    font-size: 16px;
  }

  .detalhe-pedido-admin-linhas,
  .detalhe-pedido-admin-checklist {
    display: grid;
    gap: 10px;
  }

  .detalhe-pedido-admin-linhas p {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    margin: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(34, 55, 88, 0.08);
  }

  .detalhe-pedido-admin-linhas p:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  .detalhe-pedido-admin-linhas span,
  .detalhe-endereco-destino,
  .detalhe-item-admin span {
    color: var(--cor-texto-suave);
  }

  .detalhe-endereco-destino {
    margin: 0;
    line-height: 1.7;
  }

  .detalhe-itens-admin-lista {
    display: grid;
    gap: 14px;
  }

  .detalhe-item-admin {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 170px;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 20px;
    border-radius: 18px;
    border: 1px solid rgba(34, 55, 88, 0.08);
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(240, 245, 251, 0.88));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
  }

  .detalhe-item-admin div {
    display: grid;
    gap: 4px;
  }

  .detalhe-item-admin-meta {
    min-width: 0;
    gap: 6px !important;
  }

  .detalhe-item-admin-meta b {
    font-size: 18px;
    line-height: 1.2;
    color: #173966;
  }

  .detalhe-item-admin-auxiliar {
    color: #6a7f99;
    font-size: 13px;
    line-height: 1.4;
  }

  .detalhe-item-admin-tags {
    display: flex !important;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 2px;
  }

  .detalhe-item-admin-tag {
    display: inline-flex !important;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 6px 10px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid rgba(34, 55, 88, 0.12);
    color: #4f6481 !important;
    font-size: 13px;
    line-height: 1.2;
  }

  .detalhe-item-admin-tag.cor {
    color: #173966 !important;
    font-weight: 600;
    background: rgba(223, 182, 81, 0.14);
    border-color: rgba(223, 182, 81, 0.32);
  }

  .detalhe-item-admin-tag i {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 1px solid rgba(23, 57, 102, 0.18);
    flex-shrink: 0;
  }

  .detalhe-item-admin-produto {
    display: flex !important;
    align-items: center;
    gap: 14px;
  }

  .detalhe-item-admin-produto img {
    width: 72px;
    height: 72px;
    border-radius: 14px;
    object-fit: cover;
    border: 1px solid rgba(34, 55, 88, 0.08);
    background: var(--cor-muted);
    flex-shrink: 0;
  }

  .detalhe-item-admin-resumo {
    justify-self: end;
    min-width: 156px;
    padding: 12px 14px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(34, 55, 88, 0.08);
    text-align: right;
    gap: 2px !important;
  }

  .detalhe-item-admin-resumo small {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #7488a2;
  }

  .detalhe-item-admin-resumo b {
    font-size: 15px;
    line-height: 1.1;
    color: #173966;
    margin-bottom: 6px;
  }

  .detalhe-item-admin-resumo span {
    font-size: 18px;
    font-weight: 700;
    color: #173966 !important;
    line-height: 1.1;
  }

  .detalhe-item-admin:last-child {
    margin-bottom: 0;
  }

  .detalhe-pedido-admin-checklist span {
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(223, 182, 81, 0.12);
    color: #7a5800;
    line-height: 1.5;
  }

  .admin-status-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 14px;
  }

  .admin-status-grid.tres {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .status-card {
    padding: 18px;
  }

  .status-card strong,
  .status-card span {
    display: block;
  }

  .status-card strong {
    color: var(--cor-texto);
    font-size: 28px;
  }

  .status-card span {
    color: var(--cor-texto-suave);
  }

  .status-card.icone {
    display: grid;
    grid-template-columns: 52px 1fr;
    column-gap: 12px;
    align-items: center;
  }

  .status-card.icone svg {
    grid-row: span 2;
    width: 48px;
    height: 48px;
    padding: 12px;
    border-radius: 8px;
    background: rgba(34, 55, 88, 0.08);
    color: var(--cor-primaria);
  }

  .botao.secundario-admin {
    border: 1px solid var(--cor-borda);
    background: #fff;
    color: var(--cor-texto);
  }

  .botao.secundario-admin:hover {
    background: var(--cor-muted);
    box-shadow: none;
  }

  .config-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .config-card {
    display: grid;
    align-content: start;
    gap: 12px;
  }

  .config-card:not(.config-card-melhor-envio) {
    border: 1px solid rgba(34, 55, 88, 0.1);
    background: linear-gradient(180deg, rgba(248, 251, 255, 0.96), rgba(255, 255, 255, 0.99));
  }

  .config-card-amplo {
    grid-column: 1 / -1;
  }

  .configuracoes-loja-form {
    display: grid;
    gap: 20px;
  }

  .config-card > svg {
    color: var(--cor-primaria);
  }

  .config-card h2 {
    margin-bottom: 0;
  }

  .config-card p {
    margin: 0;
    color: var(--cor-texto-suave);
  }

  .config-card label:not(.checkbox-linha) {
    display: grid;
    gap: 8px;
    padding: 14px;
    border: 1px solid rgba(34, 55, 88, 0.08);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.78);
    color: #173966;
    font-size: 13px;
    font-weight: 800;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .config-card label:not(.checkbox-linha):focus-within {
    border-color: rgba(34, 55, 88, 0.22);
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 0 0 4px rgba(34, 55, 88, 0.08);
  }

  .campo-admin-preco-atual {
    border-color: rgba(34, 197, 94, 0.28) !important;
    background: linear-gradient(180deg, rgba(236, 253, 245, 0.92), rgba(255, 255, 255, 0.98)) !important;
    box-shadow: 0 12px 24px rgba(34, 197, 94, 0.08);
  }

  .campo-admin-preco-atual:focus-within {
    border-color: rgba(34, 197, 94, 0.42) !important;
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
  }

  .campo-admin-preco-atual > span,
  .campo-admin-preco-atual small {
    color: #166534;
  }

  .config-card input,
  .config-card select,
  .config-card textarea {
    min-height: 46px;
    border: 1px solid rgba(34, 55, 88, 0.16);
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff, #f7fbff);
    color: var(--cor-texto);
    font-size: 15px;
    font-weight: 700;
    padding: 0 14px;
  }

  .config-card textarea {
    min-height: 120px;
    padding: 14px;
  }

  .config-card input:focus,
  .config-card select:focus,
  .config-card textarea:focus {
    outline: none;
    border-color: rgba(64, 121, 191, 0.42);
    background: #fff;
    box-shadow: 0 0 0 4px rgba(64, 121, 191, 0.1);
  }

  .config-card input::placeholder,
  .config-card textarea::placeholder {
    color: #7a8da8;
    font-weight: 600;
  }

  .config-card:nth-child(1) label:not(.checkbox-linha),
  .config-card:nth-child(2) label:not(.checkbox-linha) {
    background: linear-gradient(180deg, rgba(239, 246, 255, 0.86), rgba(255, 255, 255, 0.92));
    border-color: rgba(96, 165, 250, 0.2);
  }

  .config-card:nth-child(3) label:not(.checkbox-linha) {
    background: linear-gradient(180deg, rgba(236, 253, 245, 0.88), rgba(255, 255, 255, 0.94));
    border-color: rgba(52, 211, 153, 0.18);
  }

  .config-card:nth-child(4) label:not(.checkbox-linha) {
    background: linear-gradient(180deg, rgba(255, 251, 235, 0.9), rgba(255, 255, 255, 0.94));
    border-color: rgba(245, 158, 11, 0.18);
  }

  .config-card:nth-child(5) label:not(.checkbox-linha) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.9), rgba(255, 255, 255, 0.94));
    border-color: rgba(251, 146, 60, 0.18);
  }

  .config-card:nth-child(6) label:not(.checkbox-linha) {
    background: linear-gradient(180deg, rgba(245, 243, 255, 0.9), rgba(255, 255, 255, 0.94));
    border-color: rgba(129, 140, 248, 0.18);
  }

  .config-card-melhor-envio {
    border: 1px solid rgba(51, 168, 177, 0.22);
    background: linear-gradient(180deg, rgba(240, 252, 253, 0.95), rgba(255, 255, 255, 0.98));
  }

  .config-melhor-envio-toggle {
    width: 100%;
    border: 0;
    padding: 0;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    text-align: left;
    cursor: pointer;
    color: inherit;
  }

  .config-melhor-envio-topo {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .config-melhor-envio-topo > div {
    display: grid;
    gap: 6px;
  }

  .config-melhor-envio-toggle svg:last-child {
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .config-melhor-envio-toggle.aberto svg:last-child {
    transform: rotate(180deg);
  }

  .config-card-melhor-envio label:not(.checkbox-linha) {
    background: linear-gradient(180deg, rgba(237, 254, 255, 0.92), rgba(255, 255, 255, 0.96));
    border-color: rgba(51, 168, 177, 0.2);
  }

  .config-melhor-envio-acoes {
    display: grid;
    gap: 12px;
  }

  .config-melhor-envio-acoes .botao {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .config-melhor-envio-resumo {
    display: grid;
    gap: 4px;
    padding: 14px 16px;
    border: 1px dashed rgba(51, 168, 177, 0.36);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.78);
  }

  .config-melhor-envio-resumo strong {
    color: #155d63;
  }

  .config-melhor-envio-resumo span,
  .config-melhor-envio-resumo small {
    color: var(--cor-texto-suave);
    word-break: break-word;
  }

  .configuracao-cupom-form {
    display: grid;
    gap: 14px;
  }

  .configuracao-cupom-acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .configuracao-cupom-lista {
    display: grid;
    gap: 4px;
  }

  .admin-lista-item-cupom {
    grid-template-columns: 46px minmax(0, 1fr) auto;
  }

  .admin-lista-item-cupom .admin-lista-acoes {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
  }

  .admin-lista-item-cupom .badge {
    align-self: center;
  }

  .admin-overlay,
  .admin-menu-mobile {
    display: none;
    margin-right: auto;
  }

  @media (max-width: 1024px) {
    .admin-sidebar {
      transform: translateX(-100%);
      transition: transform 0.2s ease;
    }

    .admin-sidebar.aberta {
      transform: translateX(0);
    }

    .admin-conteudo {
      padding-left: 0;
    }

    .acoes-melhor-envio {
      grid-template-columns: 1fr;
    }

    .reset-melhor-envio-admin {
      flex-direction: column;
      align-items: stretch;
    }

    .config-melhor-envio-acoes .botao {
      justify-self: stretch;
      justify-content: center;
    }

    .admin-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: block;
      border: 0;
      background: rgba(0, 0, 0, 0.48);
    }

    .admin-menu-mobile {
      display: inline-flex;
    }

    .admin-duas-colunas,
    .admin-graficos,
    .admin-metricas,
    .admin-form-grid,
    .detalhe-pedido-admin-grid,
    .grade-imagens-admin,
    .bloco-frete-grid,
    .bloco-precificacao-grid,
    .bloco-especificacoes-grid,
    .admin-status-grid,
    .admin-status-grid.tres,
    .config-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bloco-parcelamento,
    .campo-descricao {
      grid-column: 1 / -1;
    }

    .bloco-parcelamento-grid {
      grid-template-columns: 1fr;
    }

    .acoes-medidas-padrao {
      flex-direction: column;
      align-items: stretch;
    }

    .linha-cor-admin {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .admin-topo {
      padding: 0 12px;
    }

    .admin-usuario strong {
      display: none;
    }

    .admin-usuario-texto small,
    .admin-usuario svg:last-child {
      display: none;
    }

    .admin-main {
      padding: 16px;
    }

    .admin-titulo.linha,
    .admin-filtros,
    .admin-subtopo {
      flex-direction: column;
      align-items: stretch;
    }

    .admin-filtros .campo-com-icone,
    .campo-select-admin {
      width: 100%;
    }

    .admin-duas-colunas,
    .admin-graficos,
    .admin-metricas,
    .admin-form-grid,
    .detalhe-pedido-admin-grid,
    .grade-imagens-admin,
    .admin-status-grid,
    .admin-status-grid.tres,
    .config-grid,
    .metricas {
      grid-template-columns: 1fr;
    }

    .bloco-parcelamento,
    .campo-descricao {
      grid-column: 1 / -1;
    }

    .editor-recorte-corpo {
      grid-template-columns: 1fr;
    }

    .editor-recorte-preview {
      width: 100%;
    }
  }
`
