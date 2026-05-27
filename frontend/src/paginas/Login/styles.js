import styled from 'styled-components'

export const LoginPage = styled.section`
  &.autenticacao {
    min-height: calc(100vh - 120px);
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at top center, rgba(216, 167, 66, 0.14), transparent 24%),
      linear-gradient(180deg, #f7f9fc 0%, #fbfcfd 100%);
  }

  .card-acesso {
    width: min(100%, 560px);
    padding: 34px 32px 30px;
    border: 1px solid rgba(34, 55, 88, 0.08);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 26px 54px rgba(22, 31, 49, 0.1);
  }

  .logo-acesso {
    width: 190px;
    margin: 0 auto 24px;
  }

  .cabecalho-formulario {
    text-align: center;
    margin-bottom: 24px;
  }

  .subtitulo-formulario {
    display: inline-flex;
    margin-bottom: 10px;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(34, 55, 88, 0.08);
    color: var(--cor-primaria);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .cabecalho-formulario h2 {
    margin: 0;
    color: var(--cor-primaria);
    font-size: clamp(30px, 3vw, 38px);
    line-height: 1.05;
  }

  .card-acesso label {
    margin-bottom: 0;
    gap: 8px;
    font-size: 14px;
  }

  .card-acesso input {
    min-height: 54px;
    padding: 0 16px;
    border-radius: 14px;
    border-color: #dce5ef;
    background: #fff;
  }

  .card-acesso input:focus {
    border-color: rgba(34, 55, 88, 0.5);
    box-shadow: 0 0 0 4px rgba(34, 55, 88, 0.1);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 18px;
  }

  .form-grid-acesso {
    margin-bottom: 0;
  }

  .campos-acesso {
    display: grid;
    gap: 16px;
  }

  .acoes-acesso {
    display: grid;
    gap: 12px;
    margin-top: 24px;
  }

  .acoes-acesso .botao {
    min-height: 54px;
    border-radius: 14px;
    font-size: 16px;
  }

  .acoes-acesso .link-botao {
    margin-top: 0;
    justify-self: center;
    color: var(--cor-primaria);
  }

  @media (max-width: 640px) {
    &.autenticacao {
      min-height: auto;
      padding-top: 28px;
      padding-bottom: 28px;
    }

    .card-acesso {
      padding: 26px 20px 24px;
      border-radius: 20px;
    }

    .logo-acesso {
      width: 168px;
      margin-bottom: 20px;
    }

    .cabecalho-formulario h2 {
      font-size: 28px;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }
  }
`
