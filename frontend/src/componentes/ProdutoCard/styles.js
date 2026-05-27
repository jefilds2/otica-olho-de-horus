import styled from 'styled-components'

export const ProductCardContainer = styled.article`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
  overflow: hidden;
  border: 1px solid var(--cor-borda);
  padding: 24px 0;
  border-radius: 12px;
  background: var(--cor-card);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;

  &:hover {
    border-color: rgba(34, 55, 88, 0.14);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
    transform: translateY(-3px);
  }

  .produto-imagem {
    position: relative;
    display: block;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background: #f3f3f1;
  }

  .produto-imagem a {
    display: block;
    width: 100%;
    height: 100%;
  }

  .produto-imagem img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: transform 0.5s ease;
  }

  &:hover .produto-imagem img {
    transform: scale(1.02);
  }

  .selo {
    position: absolute;
    top: 16px;
    left: 16px;
    border-radius: 8px;
    background: #dfb54a;
    color: #14253d;
    padding: 5px 11px;
    font-size: 12px;
    font-weight: 800;
  }

  .acao-favorito,
  .acao-carrinho {
    position: absolute;
    z-index: 2;
    border: 0;
    cursor: pointer;
    transition: transform 0.3s ease, opacity 0.3s ease, background 0.25s ease;
  }

  .acao-favorito {
    top: 16px;
    right: 16px;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.96);
    color: #334155;
    opacity: 0;
    transform: translateX(10px);
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  }

  .acao-favorito:hover {
    background: #fff;
    color: #c83b3b;
  }

  .acao-favorito.ativo {
    opacity: 1;
    transform: translate(0);
    background: #fff1f2;
    color: #c83b3b;
    box-shadow: 0 12px 24px rgba(200, 59, 59, 0.18);
  }

  .acao-favorito.ativo:hover {
    background: #ffe4e6;
    color: #b91c1c;
  }

  .acao-carrinho {
    left: 14px;
    right: 14px;
    bottom: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    border-radius: 8px;
    background: rgba(34, 55, 88, 0.94);
    color: #fff;
    font-weight: 800;
    opacity: 0;
    transform: translateY(12px);
    backdrop-filter: blur(8px);
  }

  .acao-carrinho:hover {
    background: var(--cor-primaria);
  }

  &:hover .acao-favorito,
  &:hover .acao-carrinho {
    opacity: 1;
    transform: translate(0);
  }

  .produto-conteudo {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    padding: 0 16px;
  }

  .produto-marca {
    color: #5b6f8a;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
  }

  h3 {
    min-height: 52px;
    margin: 0;
    color: #071a34;
    font-size: 17px;
    line-height: 1.3;
    font-weight: 500;
    transition: color 0.25s ease;
  }

  h3 a {
    color: inherit;
    text-decoration: none;
  }

  &:hover h3 {
    color: var(--cor-primaria);
  }

  .precos {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: auto;
  }

  .precos strong {
    color: #071a34;
    font-size: 21px;
    line-height: 1;
  }

  .precos span {
    color: #6b7b93;
    font-size: 14px;
    text-decoration: line-through;
  }

  .produto-conteudo small {
    color: #51627a;
    font-size: 13px;
    line-height: 1.4;
  }

  @media (max-width: 640px) {
    .acao-favorito,
    .acao-carrinho {
      opacity: 1;
      transform: none;
    }
  }
`
