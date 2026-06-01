import { LayoutShell } from './styles'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  CreditCard,
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  X,
  LayoutDashboard,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contextos/AuthContext'
import { useCarrinho } from '../../contextos/CarrinhoContext'
import { listarCategorias } from '../../servicos/api'

export function Layout() {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [termoBusca, setTermoBusca] = useState('')
  const [categorias, setCategorias] = useState([])
  const { usuario, sair } = useAuth()
  const { quantidade } = useCarrinho()

  useEffect(() => {
    async function carregarCategorias() {
      try {
        setCategorias(await listarCategorias())
      } catch {
        setCategorias([])
      }
    }

    carregarCategorias()
  }, [])

  useEffect(() => {
    if (usuario?.admin) {
      return undefined
    }

    function handleKeyDown(evento) {
      const tecla = String(evento.key || '').toLowerCase()
      const modificador = evento.ctrlKey || evento.metaKey

      const bloquearAtalho =
        tecla === 'f12'
        || (modificador && evento.shiftKey && ['i', 'j', 'c'].includes(tecla))
        || (modificador && tecla === 'u')

      if (bloquearAtalho) {
        evento.preventDefault()
        evento.stopPropagation()
      }
    }

    function handleContextMenu(evento) {
      evento.preventDefault()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [usuario?.admin])

  function enviarBusca(evento) {
    evento.preventDefault()
    const termo = String(termoBusca || '').trim()
    navigate(termo ? `/produtos?q=${encodeURIComponent(termo)}` : '/produtos')
    setBuscaAberta(false)
    setMenuAberto(false)
  }

  return (
    <LayoutShell className="pagina">
      <div className="barra-topo">
        <p>Atendimento em Guanhães, retirada na loja e suporte para compras online</p>
        <div>
          <Link to="/contato">Atendimento: +55 33 9860-2063</Link>
        </div>
      </div>

      <header className="cabecalho">
        <Link to="/" className="marca" aria-label="Página inicial">
          <img src="/logo-completa.png" alt="Ótica Olho de Hórus" />
        </Link>

        <button className="botao-icone menu-mobile" onClick={() => setMenuAberto(!menuAberto)}>
          <Menu size={22} />
        </button>

        <nav className={`navegacao ${menuAberto ? 'aberta' : ''}`}>
          <NavLink to="/">Início</NavLink>
          <div className="menu-dropdown">
            <button type="button" className="gatilho-menu">
              Categorias
              <ChevronDown size={15} />
            </button>
            <div className="conteudo-dropdown">
              {categorias.length > 0 ? (
                categorias.slice(0, 6).map((categoria) => (
                  <Link to={`/produtos?categoria=${categoria.slug}`} key={categoria.id}>
                    {categoria.name}
                  </Link>
                ))
              ) : (
                <span>Nenhuma categoria cadastrada</span>
              )}
              <Link className="item-destaque" to="/produtos">Ver todas</Link>
            </div>
          </div>
          <NavLink to="/produtos">Produtos</NavLink>
          <NavLink to="/produtos?promocoes=true">Promoções</NavLink>
        </nav>

        <form className={`busca-cabecalho ${buscaAberta ? 'aberta' : ''}`} onSubmit={enviarBusca}>
          <Search size={16} />
          <input
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Buscar produtos..."
            aria-label="Buscar produtos"
          />
        </form>

        <div className="acoes-cabecalho">
          <button
            className="botao-icone busca-mobile"
            type="button"
            onClick={() => setBuscaAberta(!buscaAberta)}
            aria-label="Buscar"
          >
            {buscaAberta ? <X size={20} /> : <Search size={20} />}
          </button>

          <Link className="botao-icone favoritos-atalho" to="/produtos?favoritos=true" aria-label="Favoritos">
            <Heart size={20} />
          </Link>

          <div className="menu-conta">
            <button className="botao-icone botao-conta" type="button" aria-label={usuario ? 'Conta conectada' : 'Conta'}>
              <UserRound size={21} />
              {usuario && <span className="contador contador-conta">ON</span>}
            </button>
            <div className="conteudo-conta">
              {usuario ? (
                <>
                  <div className="conta-cabecalho">
                    <strong>{usuario.name}</strong>
                    <small>{usuario.admin ? 'Conta administrativa' : 'Área do cliente'}</small>
                  </div>
                  <div className="conta-links">
                    <Link to="/cliente">
                      <UserRound size={16} />
                      Minha conta
                    </Link>
                    <Link to="/produtos?favoritos=true">
                      <Heart size={16} />
                      Favoritos
                    </Link>
                    {usuario.admin && (
                      <Link to="/admin">
                        <LayoutDashboard size={16} />
                        Painel admin
                      </Link>
                    )}
                  </div>
                  <button type="button" onClick={sair}>
                    <LogOut size={16} />
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Entrar</Link>
                  <Link to="/login?modo=cadastro">Criar conta</Link>
                </>
              )}
            </div>
          </div>

          <Link className="botao-icone" to="/carrinho" aria-label="Carrinho">
            <ShoppingBag size={21} />
            {quantidade > 0 && <span className="contador">{quantidade}</span>}
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="rodape">
        <div className="rodape-grid">
          <div>
            <img src="/nome-da-logo.png" alt="Ótica Olho de Hórus" />
            <p>
              Atendimento especializado em armações, lentes e acessórios para quem
              busca conforto, estilo e confiança.
            </p>
            <div className="rodape-sociais">
              <a href="https://wa.me/553398602063" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <MessageCircle size={16} />
              </a>
              <a href="tel:+553398602063" aria-label="Telefone">
                <UserRound size={16} />
              </a>
            </div>
          </div>
          <div>
            <h3>Institucional</h3>
            <div className="rodape-links">
              <Link to="/sobre">Sobre nós</Link>
              <Link to="/contato">Contato</Link>
              <Link to="/produtos">Produtos</Link>
              <Link to="/cliente">Minha conta</Link>
            </div>
          </div>
          <div>
            <h3>Contato</h3>
            <div className="rodape-contato">
              <p>WhatsApp: +55 33 9860-2063</p>
              <p>Praça JK, 317 - Centro, Guanhães - MG</p>
              <p>Atendimento presencial e online</p>
            </div>
          </div>
          <div>
            <h3>Compra segura</h3>
            <div className="rodape-badges">
              <span><CreditCard size={15} /> Cartão e PIX</span>
              <span><Truck size={15} /> Entregas para todo o Brasil</span>
              <span><ShieldCheck size={15} /> Estrutura segura para pedidos</span>
            </div>
          </div>
        </div>
        <div className="rodape-base">
          <p>
            © {new Date().getFullYear()} <span className="marca-rodape">Ótica Olho de Hórus</span>. Todos os direitos reservados.
            {' '}Desenvolvido por{' '}
            <a
              href="https://www.linkedin.com/in/jefferson-miranda-dfs"
              target="_blank"
              rel="noreferrer"
            >
              Jefferson Miranda
            </a>
            /Contato/WhatsApp:{' '}
            <a
              href="https://wa.me/5533987494050"
              target="_blank"
              rel="noreferrer"
            >
              +55 (33) 98749-4050
            </a>
          </p>
        </div>
      </footer>
    </LayoutShell>
  )
}
