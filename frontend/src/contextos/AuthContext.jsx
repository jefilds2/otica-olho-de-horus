/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { criarSessao, obterMensagemErroUsuario } from '../servicos/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem('usuario_otica')
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null
  })

  function atualizarUsuario(dados) {
    setUsuario((atual) => {
      const proximo = { ...(atual || {}), ...(dados || {}) }
      localStorage.setItem('usuario_otica', JSON.stringify(proximo))
      return proximo
    })
  }

  async function entrar(email, password) {
    try {
      const dados = await criarSessao({ email, password })
      localStorage.setItem('token_otica', dados.token)
      localStorage.setItem('usuario_otica', JSON.stringify(dados))
      setUsuario(dados)
      toast.success('Login realizado com sucesso.')
      return true
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
      return false
    }
  }

  function sair() {
    localStorage.removeItem('token_otica')
    localStorage.removeItem('usuario_otica')
    setUsuario(null)
    toast.info('Você saiu da sua conta.')
    window.location.assign('/')
  }

  const valor = useMemo(() => ({ usuario, entrar, sair, atualizarUsuario }), [usuario])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
