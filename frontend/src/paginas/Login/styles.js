import styled from 'styled-components'

export const LoginPage = styled.section`
  &.autenticacao {
    min-height: calc(100vh - 120px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 36px 20px 48px;
    background:
      radial-gradient(circle at top center, rgba(216, 167, 66, 0.14), transparent 24%),
      linear-gradient(180deg, #f7f9fc 0%, #fbfcfd 100%);
  }

  .card-acesso {
    width: min(100%, 520px);
    padding: 30px 28px 26px;
    border: 1px solid rgba(34, 55, 88, 0.08);
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 20px 42px rgba(22, 31, 49, 0.08);
  }

  .logo-acesso {
    width: 168px;
    margin: 0 auto 20px;
  }

  .cabecalho-formulario {
    text-align: center;
    margin-bottom: 20px;
  }

  .subtitulo-formulario {
    display: inline-flex;
    margin-bottom: 8px;
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(34, 55, 88, 0.08);
    color: var(--cor-primaria);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .cabecalho-formulario h2 {
    margin: 0;
    color: var(--cor-primaria);
    font-size: clamp(24px, 2.4vw, 34px);
    line-height: 1.08;
  }

  .card-acesso label {
    margin-bottom: 0;
    gap: 7px;
    font-size: 13px;
  }

  .card-acesso input {
    min-height: 48px;
    padding: 0 14px;
    border-radius: 12px;
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
    gap: 14px;
    margin-bottom: 16px;
  }

  .form-grid-acesso {
    margin-bottom: 0;
  }

  .campos-acesso {
    display: grid;
    gap: 14px;
  }

  .acoes-acesso {
    display: grid;
    gap: 10px;
    margin-top: 20px;
  }

  .acoes-acesso .botao {
    min-height: 50px;
    border-radius: 12px;
    font-size: 15px;
  }

  .acoes-acesso .link-botao {
    margin-top: 0;
    justify-self: center;
    color: var(--cor-primaria);
  }

  @media (max-width: 640px) {
    &.autenticacao {
      min-height: auto;
      padding-top: 24px;
      padding-bottom: 28px;
    }

    .card-acesso {
      width: min(100%, 460px);
      padding: 24px 18px 22px;
      border-radius: 18px;
    }

    .logo-acesso {
      width: 152px;
      margin-bottom: 18px;
    }

    .cabecalho-formulario h2 {
      font-size: 26px;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }
  }
`
