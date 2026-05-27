import styled from 'styled-components'

export const ProdutosPage = styled.section`
  .catalogo-layout {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 28px;
    align-items: start;
  }

  .filtros {
    position: sticky;
    top: 100px;
    padding: 22px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: #fff;
  }

  .filtros h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
  }

  .catalogo-produtos .grade-produtos {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
  }

  @media (max-width: 1024px) {
    .catalogo-layout {
      grid-template-columns: 1fr;
    }

    .filtros {
      position: static;
      padding: 18px;
    }

    .catalogo-produtos .grade-produtos {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .catalogo-produtos .grade-produtos {
      grid-template-columns: 1fr;
    }
  }
`
