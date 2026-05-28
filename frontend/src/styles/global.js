import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  :root {
    --cor-fundo: #fbfcfd;
    --cor-texto: #1b2435;
    --cor-texto-suave: #677386;
    --cor-primaria: #223758;
    --cor-primaria-clara: #304b73;
    --cor-dourada: #d8a742;
    --cor-borda: #e7ebf0;
    --cor-card: #ffffff;
    --cor-sucesso: #16a34a;
    --cor-muted: #f1f3f6;
    --sombra: 0 18px 40px rgba(22, 31, 49, 0.12);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: var(--cor-texto);
    background: var(--cor-fundo);
  }

  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: var(--cor-fundo);
    color: var(--cor-texto);
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  img {
    display: block;
    max-width: 100%;
  }

  .secao {
    padding: 64px clamp(16px, 5vw, 72px);
  }

  .fundo-suave {
    background: rgba(241, 243, 246, 0.68);
  }

  .titulo-secao {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    align-items: end;
    margin-bottom: 28px;
  }

  .titulo-secao h1,
  .titulo-secao h2 {
    margin: 0 0 8px;
    font-family: "Playfair Display", Georgia, "Times New Roman", serif;
    font-size: clamp(28px, 3vw, 36px);
    line-height: 1.16;
  }

  .titulo-secao > a {
    display: inline-flex;
    align-items: center;
    color: var(--cor-primaria);
    font-weight: 800;
  }

  .titulo-secao > a:hover {
    color: var(--cor-dourada);
  }

  .titulo-secao p,
  .aviso {
    color: var(--cor-texto-suave);
  }

  .botao,
  .botao-icone {
    border: 0;
    border-radius: 6px;
    background: var(--cor-primaria);
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 18px;
    font-weight: 800;
    transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  }

  .botao:hover,
  .botao-icone:hover {
    background: var(--cor-primaria-clara);
    transform: translateY(-1px);
    box-shadow: 0 12px 26px rgba(22, 31, 49, 0.14);
  }

  .botao.destaque {
    background: var(--cor-dourada);
    color: #172033;
  }

  .botao.destaque:hover {
    background: #e4b652;
  }

  .botao.secundario {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: #fff;
  }

  .botao.secundario:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.72);
    box-shadow: none;
  }

  .botao.pequeno {
    min-height: 36px;
    padding: 0 14px;
  }

  .botao-icone {
    position: relative;
    width: 42px;
    padding: 0;
    background: #eef3f8;
    color: var(--cor-primaria);
  }

  .etiqueta {
    display: inline-flex;
    width: fit-content;
    margin-bottom: 16px;
    border-radius: 6px;
    background: var(--cor-dourada);
    color: #20304d;
    padding: 6px 11px;
    font-weight: 800;
    font-size: 13px;
  }

  .etiqueta-suave {
    background: rgba(216, 167, 66, 0.16);
    color: var(--cor-primaria);
  }

  .grupo-botoes {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .precos {
    display: flex;
    align-items: baseline;
    gap: 9px;
    margin: 14px 0;
  }

  .precos strong {
    font-size: 20px;
  }

  .precos span {
    color: var(--cor-texto-suave);
    text-decoration: line-through;
  }

  .precos.grande strong {
    font-size: 32px;
  }

  .largura-total {
    width: 100%;
  }

  label {
    display: grid;
    gap: 7px;
    margin-bottom: 14px;
    color: var(--cor-texto);
    font-weight: 800;
  }

  input,
  select,
  textarea {
    width: 100%;
    border: 1px solid var(--cor-borda);
    border-radius: 6px;
    background: var(--cor-fundo);
    color: var(--cor-texto);
    padding: 11px 12px;
    outline: none;
  }

  textarea {
    min-height: 92px;
    resize: vertical;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: var(--cor-primaria);
    box-shadow: 0 0 0 3px rgba(23, 43, 77, 0.12);
  }

  .campo-com-icone {
    position: relative;
  }

  .campo-com-icone svg {
    position: absolute;
    top: 50%;
    left: 11px;
    transform: translateY(-50%);
    color: var(--cor-texto-suave);
  }

  .campo-com-icone input {
    padding-left: 38px;
  }

  .checkbox-linha {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
  }

  .checkbox-linha input {
    width: 18px;
    height: 18px;
    accent-color: var(--cor-primaria);
  }

  .form-card,
  .aviso {
    border: 1px solid var(--cor-borda);
    border-radius: 8px;
    background: var(--cor-card);
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  }

  .form-card {
    padding: 22px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .form-grid button {
    align-self: end;
  }

  .resultado-contagem {
    margin-bottom: 16px;
    color: var(--cor-texto-suave);
    font-weight: 800;
  }

  .aviso {
    margin-top: 24px;
    padding: 18px;
  }

  .link-perigo,
  .link-botao {
    border: 0;
    background: transparent;
    color: #b91c1c;
    cursor: pointer;
    font-weight: 800;
  }

  .link-botao {
    color: var(--cor-primaria);
    margin-top: 10px;
  }

  @media (max-width: 1024px) {
    .form-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .titulo-secao {
      flex-direction: column;
      align-items: flex-start;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }
  }
`
