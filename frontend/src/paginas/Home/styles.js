import styled from 'styled-components'

export const HomePage = styled.div`
  .hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: 44px;
    align-items: center;
    min-height: 600px;
    padding: 48px clamp(16px, 5vw, 72px);
    background: var(--cor-primaria);
    color: #fff;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    inset: auto auto -18% -10%;
    width: 380px;
    height: 380px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(216, 167, 66, 0.18) 0%, rgba(216, 167, 66, 0) 72%);
  }

  .hero::after {
    content: '';
    position: absolute;
    top: 0;
    right: -8%;
    width: 58%;
    height: 100%;
    background: rgba(48, 75, 115, 0.46);
    transform: skewX(-12deg);
    transform-origin: top right;
  }

  .hero-texto,
  .hero-imagem {
    position: relative;
    z-index: 1;
  }

  .hero h1 {
    margin: 0;
    font-family: "Playfair Display", Georgia, "Times New Roman", serif;
    font-size: clamp(34px, 4.2vw, 56px);
    line-height: 1.08;
  }

  .hero p {
    max-width: 560px;
    margin: 22px 0 30px;
    color: rgba(255, 255, 255, 0.78);
    font-size: clamp(17px, 2vw, 20px);
    line-height: 1.55;
  }

  .hero-imagem {
    justify-self: center;
    width: min(420px, 100%);
    aspect-ratio: 1;
    overflow: visible;
    border-radius: 999px;
    border: 0;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05), 0 30px 80px rgba(0, 0, 0, 0.2);
  }

  .hero-imagem::before {
    content: '';
    position: absolute;
    inset: -10%;
    border-radius: inherit;
    background: rgba(216, 167, 66, 0.18);
    filter: blur(32px);
  }

  .hero-imagem img {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }

  .hero-detalhes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    max-width: 620px;
    margin-top: 30px;
  }

  .hero-detalhes div {
    display: grid;
    gap: 6px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }

  .hero-detalhes strong {
    font-size: 14px;
  }

  .hero-detalhes span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    line-height: 1.5;
  }

  .hero-card-flutuante {
    position: absolute;
    left: 50%;
    right: auto;
    bottom: -18px;
    z-index: 2;
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 10px;
    width: min(320px, 82%);
    transform: translateX(-50%);
    padding: 14px 16px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 10px;
    background: rgba(18, 27, 43, 0.78);
    backdrop-filter: blur(14px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.22);
  }

  .hero-card-flutuante svg {
    color: var(--cor-dourada);
  }

  .hero-card-flutuante strong,
  .hero-card-flutuante span {
    display: block;
  }

  .hero-card-flutuante strong {
    color: #fff;
    font-size: 14px;
    line-height: 1.3;
  }

  .hero-card-flutuante span {
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    line-height: 1.45;
  }

  .faixa-confianca {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    background: rgba(34, 55, 88, 0.1);
  }

  .faixa-confianca div {
    display: grid;
    gap: 6px;
    padding: 22px clamp(16px, 4vw, 36px);
    background: #fff;
  }

  .faixa-confianca strong {
    color: var(--cor-primaria);
    font-size: 14px;
  }

  .faixa-confianca span {
    color: var(--cor-texto-suave);
    font-size: 14px;
    line-height: 1.55;
  }

  .seo-local {
    padding-top: 40px;
    padding-bottom: 24px;
  }

  .seo-local-card {
    padding: 28px;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(241, 243, 246, 0.72));
    box-shadow: var(--sombra);
  }

  .seo-local-card .titulo-secao {
    margin-bottom: 18px;
  }

  .seo-local-card .titulo-secao p {
    max-width: 74ch;
    margin: 0;
    line-height: 1.75;
  }

  .seo-local-topicos {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .seo-local-topicos span {
    display: inline-flex;
    align-items: center;
    min-height: 38px;
    padding: 0 14px;
    border: 1px solid rgba(34, 55, 88, 0.12);
    border-radius: 999px;
    background: #fff;
    color: var(--cor-primaria);
    font-weight: 700;
  }

  .grade-produtos,
  .grade-categorias {
    display: grid;
  }

  .grade-produtos {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px;
  }

  .grade-categorias {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 16px;
  }

  .categoria-card {
    position: relative;
    overflow: hidden;
    min-height: 150px;
    aspect-ratio: 1;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-card);
    box-shadow: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }

  .categoria-card:hover {
    border-color: rgba(34, 55, 88, 0.18);
    box-shadow: var(--sombra);
    transform: translateY(-4px);
  }

  .categoria-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(27, 36, 53, 0.64), transparent 65%);
  }

  .categoria-card img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    transition: transform 0.5s ease;
  }

  .categoria-card:hover img {
    transform: scale(1.02);
  }

  .categoria-card strong {
    position: absolute;
    z-index: 1;
    left: 14px;
    right: 14px;
    bottom: 14px;
    color: #fff;
  }

  .beneficios {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    padding: 56px clamp(16px, 5vw, 72px);
    background: var(--cor-muted);
  }

  .beneficio {
    padding: 30px 22px;
    text-align: center;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-card);
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }

  .beneficio:hover {
    border-color: rgba(34, 55, 88, 0.18);
    box-shadow: var(--sombra);
    transform: translateY(-4px);
  }

  .beneficio svg {
    color: var(--cor-primaria);
    width: 56px;
    height: 56px;
    padding: 14px;
    border-radius: 999px;
    background: rgba(34, 55, 88, 0.08);
  }

  .localizacao {
    display: grid;
    grid-template-columns: minmax(280px, 0.8fr) minmax(320px, 1.2fr);
    gap: 32px;
    align-items: center;
    background: #fff;
  }

  .localizacao h2 {
    margin: 0 0 14px;
    font-family: "Playfair Display", Georgia, "Times New Roman", serif;
    font-size: clamp(30px, 3vw, 42px);
    line-height: 1.12;
  }

  .localizacao p {
    margin: 0 0 24px;
    color: var(--cor-texto-suave);
    line-height: 1.7;
  }

  .mapa-card {
    min-height: 360px;
    overflow: hidden;
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-muted);
    box-shadow: var(--sombra);
  }

  .mapa-card iframe {
    width: 100%;
    height: 100%;
    min-height: inherit;
    border: 0;
  }

  .faq-home {
    padding-top: 8px;
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
    color: var(--cor-texto-suave);
    line-height: 1.7;
  }

  .cta-whatsapp {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 56px clamp(16px, 5vw, 72px);
    background: var(--cor-primaria);
    color: #fff;
    border-bottom: 1px solid rgba(255, 255, 255, 0.16);
  }

  .cta-whatsapp h2 {
    margin: 0 0 8px;
    font-family: "Playfair Display", Georgia, "Times New Roman", serif;
    font-size: clamp(28px, 3vw, 36px);
  }

  .cta-whatsapp p {
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
  }

  .botao.whatsapp {
    background: var(--cor-sucesso);
    color: #fff;
  }

  .botao.whatsapp:hover {
    background: #15803d;
  }

  @media (max-width: 1024px) {
    .hero,
    .localizacao {
      grid-template-columns: 1fr;
    }

    .hero {
      min-height: auto;
    }

    .grade-produtos {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .grade-categorias,
    .beneficios,
    .faixa-confianca {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .hero {
      gap: 28px;
      padding: 36px 16px;
    }

    .hero::after {
      display: none;
    }

    .hero-imagem {
      display: none;
    }

    .hero-detalhes,
    .faixa-confianca,
    .grade-produtos,
    .grade-categorias,
    .beneficios {
      grid-template-columns: 1fr;
    }

    .cta-whatsapp {
      flex-direction: column;
      align-items: flex-start;
    }

    .cta-whatsapp .botao {
      width: 100%;
      justify-content: center;
    }

    .seo-local-card,
    .faq-lista details {
      padding: 18px;
    }

    .newsletter form {
      flex-direction: column;
    }
  }
`
