import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { GlobalStyles } from './styles/global'
import { Layout } from './componentes/Layout'
import { AuthProvider } from './contextos/AuthContext'
import { CarrinhoProvider } from './contextos/CarrinhoContext'
import { Admin } from './paginas/Admin'
import { Carrinho } from './paginas/Carrinho'
import { Cliente } from './paginas/Cliente'
import { Contato } from './paginas/Contato'
import { Home } from './paginas/Home'
import { Login } from './paginas/Login'
import { ProdutoDetalhe } from './paginas/ProdutoDetalhe'
import { Produtos } from './paginas/Produtos'
import { Sobre } from './paginas/Sobre'
import { SeoHead } from './componentes/SeoHead'

function RouteSeoRules() {
  const location = useLocation()
  const path = location.pathname

  if (path.startsWith('/admin')) {
    return <SeoHead title="Painel administrativo | Ótica Olho de Hórus" canonical="/admin" noindex />
  }

  if (path.startsWith('/cliente')) {
    return <SeoHead title="Minha conta | Ótica Olho de Hórus" canonical="/cliente" noindex />
  }

  if (path === '/carrinho') {
    return <SeoHead title="Carrinho | Ótica Olho de Hórus" canonical="/carrinho" noindex />
  }

  if (path === '/login') {
    return <SeoHead title="Login | Ótica Olho de Hórus" canonical="/login" noindex />
  }

  if (path === '/recuperar-senha') {
    return <SeoHead title="Recuperação de senha | Ótica Olho de Hórus" canonical="/recuperar-senha" noindex />
  }

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteSeoRules />
      <GlobalStyles />
      <AuthProvider>
        <CarrinhoProvider>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/produto/:slug" element={<ProdutoDetalhe />} />
              <Route path="/carrinho" element={<Carrinho />} />
              <Route path="/login" element={<Login />} />
              <Route path="/recuperar-senha" element={<Login />} />
              <Route path="/cliente" element={<Cliente />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/contato" element={<Contato />} />
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={3500} theme="colored" />
        </CarrinhoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
