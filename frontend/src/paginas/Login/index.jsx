import { LoginPage } from './styles'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../contextos/AuthContext'
import { cadastrarUsuario, obterMensagemErroUsuario } from '../../servicos/api'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const { entrar } = useAuth()
  const [modoCadastro, setModoCadastro] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', cpf: '', birth_date: '', phone: '', whatsapp: '' })

  useEffect(() => {
    setModoCadastro(searchParams.get('modo') === 'cadastro')
  }, [searchParams])

  function alterarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function enviarFormulario(evento) {
    evento.preventDefault()

    try {
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
          <span className="subtitulo-formulario">{modoCadastro ? 'Criar conta' : 'Entrar'}</span>
          <h2>{modoCadastro ? 'Cadastre sua conta' : 'Acesse sua conta'}</h2>
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

        <div className="acoes-acesso">
          <button className="botao destaque largura-total" type="submit">
            {modoCadastro ? 'Cadastrar conta' : 'Entrar na conta'}
          </button>
          <button
            className="link-botao"
            type="button"
            onClick={() => setSearchParams(modoCadastro ? {} : { modo: 'cadastro' })}
          >
            {modoCadastro ? 'Já tenho conta' : 'Criar nova conta'}
          </button>
        </div>
      </form>
    </LoginPage>
  )
}
