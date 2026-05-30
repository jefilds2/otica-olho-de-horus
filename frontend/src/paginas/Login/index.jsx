import { LoginPage } from './styles'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../contextos/AuthContext'
import {
  cadastrarUsuario,
  obterMensagemErroUsuario,
  redefinirSenha,
  solicitarRecuperacaoSenha,
} from '../../servicos/api'

function aplicarMascaraCpf(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 11)

  return digitos
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

function aplicarMascaraData(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 8)

  if (digitos.length <= 2) return digitos
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`
}

function normalizarDataParaApi(valor) {
  const digitos = String(valor || '').replace(/\D/g, '')

  if (digitos.length !== 8) return null

  const dia = digitos.slice(0, 2)
  const mes = digitos.slice(2, 4)
  const ano = digitos.slice(4, 8)

  return `${ano}-${mes}-${dia}`
}

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { entrar } = useAuth()
  const [modoCadastro, setModoCadastro] = useState(false)
  const [modoRecuperacao, setModoRecuperacao] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', cpf: '', birth_date: '', phone: '', whatsapp: '' })
  const [recuperacaoForm, setRecuperacaoForm] = useState({ email: '', token: '', new_password: '', confirm_password: '' })
  const tokenRecuperacao = searchParams.get('token') || ''
  const emailRecuperacao = searchParams.get('email') || ''
  const recuperacaoComToken = modoRecuperacao && Boolean(tokenRecuperacao)

  useEffect(() => {
    const modo = searchParams.get('modo')
    setModoCadastro(modo === 'cadastro')
    setModoRecuperacao(
      location.pathname === '/recuperar-senha'
      || modo === 'recuperar'
      || Boolean(searchParams.get('token'))
    )
  }, [location.pathname, searchParams])

  useEffect(() => {
    if (!modoRecuperacao) return

    setRecuperacaoForm((atual) => ({
      ...atual,
      email: emailRecuperacao || atual.email,
      token: tokenRecuperacao || atual.token,
    }))
  }, [modoRecuperacao, emailRecuperacao, tokenRecuperacao])

  function alterarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function alterarCampoRecuperacao(campo, valor) {
    setRecuperacaoForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function enviarFormulario(evento) {
    evento.preventDefault()

    try {
      if (modoRecuperacao) {
        if (recuperacaoComToken) {
          await redefinirSenha({
            email: recuperacaoForm.email,
            token: recuperacaoForm.token,
            new_password: recuperacaoForm.new_password,
            confirm_password: recuperacaoForm.confirm_password,
          })
          toast.success('Senha redefinida. Faça login com a nova senha.')
          setRecuperacaoForm({ email: '', token: '', new_password: '', confirm_password: '' })
          navigate('/login', { replace: true })
          return
        }

        const resposta = await solicitarRecuperacaoSenha({ email: recuperacaoForm.email })
        setRecuperacaoForm({ email: '', token: '', new_password: '', confirm_password: '' })
        toast.success(resposta?.message || 'Se o e-mail estiver cadastrado, você receberá o link de recuperação.')
        return
      }

      if (modoCadastro) {
        await cadastrarUsuario({
          ...form,
          cpf: String(form.cpf || '').replace(/\D/g, ''),
          birth_date: normalizarDataParaApi(form.birth_date),
        })
        toast.success('Cadastro criado. Agora faça login.')
        setSearchParams({})
        return
      }

      const sucesso = await entrar(form.email, form.password)
      if (sucesso) navigate('/cliente')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  return (
    <LoginPage className="secao autenticacao">
      <form className="form-card card-acesso" onSubmit={enviarFormulario}>
        <img className="logo-acesso" src="/logo-completa.png" alt="Ótica Olho de Hórus" />

        <div className="cabecalho-formulario">
          <span className="subtitulo-formulario">
            {modoCadastro ? 'Criar conta' : modoRecuperacao ? 'Recuperar acesso' : 'Entrar'}
          </span>
          <h2>
            {modoCadastro
              ? 'Cadastre sua conta'
              : modoRecuperacao
                ? recuperacaoComToken ? 'Defina sua nova senha' : 'Recupere sua senha'
                : 'Acesse sua conta'}
          </h2>
        </div>

        {modoCadastro && (
          <div className="form-grid">
            <label className="campo-inteiro">
              Nome
              <input value={form.name} onChange={(e) => alterarCampo('name', e.target.value)} required />
            </label>
            <label className="campo-meio">
              CPF
              <input
                value={form.cpf}
                onChange={(e) => alterarCampo('cpf', aplicarMascaraCpf(e.target.value))}
                inputMode="numeric"
                placeholder="000.000.000-00"
                required
              />
            </label>
            <label className="campo-meio">
              Data de nascimento
              <input
                value={form.birth_date}
                onChange={(e) => alterarCampo('birth_date', aplicarMascaraData(e.target.value))}
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
              />
            </label>
            <label className="campo-meio">
              Telefone
              <input value={form.phone} onChange={(e) => alterarCampo('phone', e.target.value)} />
            </label>
            <label className="campo-meio">
              WhatsApp
              <input value={form.whatsapp} onChange={(e) => alterarCampo('whatsapp', e.target.value)} />
            </label>
          </div>
        )}

        {modoRecuperacao ? (
          <div className="campos-acesso">
            <label>
              E-mail
              <input
                type="email"
                value={recuperacaoForm.email}
                onChange={(e) => alterarCampoRecuperacao('email', e.target.value)}
                required
                readOnly={recuperacaoComToken && Boolean(emailRecuperacao)}
              />
            </label>
            {recuperacaoComToken ? (
              <>
                <label>
                  Nova senha
                  <input
                    type="password"
                    value={recuperacaoForm.new_password}
                    onChange={(e) => alterarCampoRecuperacao('new_password', e.target.value)}
                    minLength={6}
                    required
                  />
                </label>
                <label>
                  Confirmar nova senha
                  <input
                    type="password"
                    value={recuperacaoForm.confirm_password}
                    onChange={(e) => alterarCampoRecuperacao('confirm_password', e.target.value)}
                    minLength={6}
                    required
                  />
                </label>
                <p className="texto-apoio-formulario">
                  O link de recuperação é válido por 1 hora. Após salvar, use a nova senha para entrar.
                </p>
              </>
            ) : (
              <p className="texto-apoio-formulario">
                Informe o e-mail da conta e enviaremos um link para você cadastrar uma nova senha.
              </p>
            )}
          </div>
        ) : (
          <div className={modoCadastro ? 'form-grid form-grid-acesso' : 'campos-acesso'}>
            <label className={modoCadastro ? 'campo-inteiro' : ''}>
              E-mail
              <input type="email" value={form.email} onChange={(e) => alterarCampo('email', e.target.value)} required />
            </label>
            <label className={modoCadastro ? 'campo-inteiro' : ''}>
              Senha
              <input type="password" value={form.password} onChange={(e) => alterarCampo('password', e.target.value)} required minLength={6} />
            </label>
          </div>
        )}

        <div className="acoes-acesso">
          <button className="botao destaque largura-total" type="submit">
            {modoCadastro
              ? 'Cadastrar conta'
              : modoRecuperacao
                ? recuperacaoComToken ? 'Salvar nova senha' : 'Enviar link de recuperação'
                : 'Entrar na conta'}
          </button>
          {!modoRecuperacao ? (
            <>
              <button
                className="link-botao"
                type="button"
                onClick={() => setSearchParams(modoCadastro ? {} : { modo: 'cadastro' })}
              >
                {modoCadastro ? 'Já tenho conta' : 'Criar nova conta'}
              </button>
              {!modoCadastro ? (
                <button
                  className="link-botao"
                  type="button"
                  onClick={() => setSearchParams({ modo: 'recuperar' })}
                >
                  Esqueci minha senha
                </button>
              ) : null}
            </>
          ) : (
            <button
              className="link-botao"
              type="button"
              onClick={() => navigate('/login')}
            >
              Voltar para o login
            </button>
          )}
        </div>
      </form>
    </LoginPage>
  )
}
