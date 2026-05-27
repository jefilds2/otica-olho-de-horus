import { LoginPage } from './styles'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../contextos/AuthContext'
import { cadastrarUsuario, obterMensagemErroUsuario } from '../../servicos/api'

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
        await cadastrarUsuario(form)
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
            <label>Nome<input value={form.name} onChange={(e) => alterarCampo('name', e.target.value)} required /></label>
            <label>CPF<input value={form.cpf} onChange={(e) => alterarCampo('cpf', e.target.value)} required /></label>
            <label>Data de nascimento<input type="date" value={form.birth_date} onChange={(e) => alterarCampo('birth_date', e.target.value)} /></label>
            <label>Telefone<input value={form.phone} onChange={(e) => alterarCampo('phone', e.target.value)} /></label>
            <label>WhatsApp<input value={form.whatsapp} onChange={(e) => alterarCampo('whatsapp', e.target.value)} /></label>
          </div>
        )}

        <div className={modoCadastro ? 'form-grid form-grid-acesso' : 'campos-acesso'}>
          <label>E-mail<input type="email" value={form.email} onChange={(e) => alterarCampo('email', e.target.value)} required /></label>
          <label>Senha<input type="password" value={form.password} onChange={(e) => alterarCampo('password', e.target.value)} required minLength={6} /></label>
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
