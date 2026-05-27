import styled from 'styled-components'

export const ContatoPage = styled.section`
  p {
    color: var(--cor-texto-suave);
  }

  .cards-contato {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
    margin-top: 24px;
  }

  .cards-contato > * {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 22px;
    font-weight: 800;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-card);
  }

  .mapa-contato {
    min-height: 360px;
    margin-top: 28px;
    overflow: hidden;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-muted);
    box-shadow: var(--sombra);
  }

  .mapa-contato iframe {
    width: 100%;
    height: 100%;
    min-height: inherit;
    border: 0;
  }

  @media (max-width: 1024px) {
    .cards-contato {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .cards-contato {
      grid-template-columns: 1fr;
    }

    .cards-contato > * {
      align-items: flex-start;
      word-break: break-word;
    }
  }
`
