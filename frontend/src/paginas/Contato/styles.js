import styled from 'styled-components'

export const ContatoPage = styled.section`
  p {
    color: var(--cor-texto-suave);
  }

  h1,
  h2 {
    margin: 0 0 12px;
    font-family: "Playfair Display", Georgia, "Times New Roman", serif;
    line-height: 1.16;
  }

  h1 {
    font-size: clamp(32px, 4vw, 48px);
  }

  h2 {
    font-size: clamp(24px, 3vw, 32px);
  }

  .hero-contato,
  .conteudo-contato {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
    gap: 24px;
    align-items: start;
  }

  .hero-texto p {
    max-width: 60ch;
    font-size: 17px;
  }

  .resumo-contato {
    display: grid;
    gap: 14px;
  }

  .info-card {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 22px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-card);
    box-shadow: var(--sombra);
  }

  .info-card svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--cor-primaria);
  }

  .info-card strong {
    display: block;
    margin-bottom: 6px;
  }

  .info-card a,
  .info-card p {
    margin: 0;
  }

  .info-card-suave {
    background: rgba(241, 243, 246, 0.72);
  }

  .conteudo-contato {
    margin-top: 36px;
  }

  .texto-local {
    padding: 28px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-card);
    box-shadow: var(--sombra);
  }

  .mapa-contato {
    min-height: 360px;
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

  .faq-contato {
    margin-top: 40px;
  }

  .faq-lista {
    display: grid;
    gap: 14px;
  }

  .faq-lista details {
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-card);
    padding: 18px 20px;
  }

  .faq-lista summary {
    cursor: pointer;
    font-weight: 800;
    list-style: none;
  }

  .faq-lista summary::-webkit-details-marker {
    display: none;
  }

  .faq-lista p {
    margin: 12px 0 0;
  }

  @media (max-width: 1024px) {
    .hero-contato,
    .conteudo-contato {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .texto-local,
    .info-card {
      padding: 18px;
    }
  }
`
