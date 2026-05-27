import { ProdutosPage } from './styles'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { EstadoVazio } from '../../componentes/EstadoVazio'
import { ProdutoCard } from '../../componentes/ProdutoCard'
import { SeoHead } from '../../componentes/SeoHead'
import { listarCategorias, listarProdutos, obterMensagemErroUsuario } from '../../servicos/api'

function lerFavoritos() {
  try {
    const favoritos = JSON.parse(localStorage.getItem('favoritos_otica') || '[]')
    return Array.isArray(favoritos) ? favoritos : []
  } catch {
    return []
  }
}

export function Produtos() {
  const [params] = useSearchParams()
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [busca, setBusca] = useState(params.get('q') || '')
  const [categoria, setCategoria] = useState(params.get('categoria') || '')
  const [marca, setMarca] = useState('')
  const [somentePromocoes, setSomentePromocoes] = useState(params.get('promocoes') === 'true')
  const [somenteFavoritos, setSomenteFavoritos] = useState(params.get('favoritos') === 'true')
  const [ordenacao, setOrdenacao] = useState('recentes')

  useEffect(() => {
    async function carregarCatalogo() {
      try {
        const [produtosApi, categoriasApi] = await Promise.all([listarProdutos(), listarCategorias()])
        setProdutos(produtosApi)
        setCategorias(categoriasApi)
      } catch (error) {
        toast.error(obterMensagemErroUsuario(error))
      }
    }

    carregarCatalogo()
  }, [])

  useEffect(() => {
    setBusca(params.get('q') || '')
    setCategoria(params.get('categoria') || '')
    setSomentePromocoes(params.get('promocoes') === 'true')
    setSomenteFavoritos(params.get('favoritos') === 'true')
  }, [params])

  const marcas = [...new Set(produtos.map((produto) => produto.brand).filter(Boolean))]
  const categoriaAtual = categorias.find((item) => item.slug === categoria)

  const produtosFiltrados = useMemo(() => {
    const favoritos = lerFavoritos()

    return produtos
      .filter((produto) => {
        const texto = `${produto.name} ${produto.brand} ${produto.color}`.toLowerCase()
        const bateBusca = texto.includes(busca.toLowerCase())
        const bateCategoria = !categoria || produto.category?.slug === categoria
        const bateMarca = !marca || produto.brand === marca
        const batePromocao = !somentePromocoes || produto.old_price
        const bateFavoritos = !somenteFavoritos || favoritos.includes(produto.id)
        return bateBusca && bateCategoria && bateMarca && batePromocao && bateFavoritos
      })
      .sort((a, b) => {
        if (ordenacao === 'menor-preco') return Number(a.price) - Number(b.price)
        if (ordenacao === 'maior-preco') return Number(b.price) - Number(a.price)
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
  }, [produtos, busca, categoria, marca, somentePromocoes, somenteFavoritos, ordenacao])

  const canonical = categoria
    ? `/produtos?categoria=${encodeURIComponent(categoria)}`
    : (somentePromocoes ? '/produtos?promocoes=true' : '/produtos')

  const noindex = Boolean(busca.trim()) || somenteFavoritos

  const seoTitle = categoriaAtual
    ? `${categoriaAtual.name} em Guanhães | Ótica Olho de Hórus`
    : (somentePromocoes
      ? 'Promoções de óculos em Guanhães | Ótica Olho de Hórus'
      : 'Óculos e armações em Guanhães | Ótica Olho de Hórus')

  const seoDescription = categoriaAtual
    ? `Veja ${categoriaAtual.name.toLowerCase()} da Ótica Olho de Hórus em Guanhães - MG, com catálogo online e apoio no atendimento local.`
    : (somentePromocoes
      ? 'Confira promoções de óculos e armações da Ótica Olho de Hórus em Guanhães - MG.'
      : 'Catálogo online da Ótica Olho de Hórus com óculos, armações e ofertas para Guanhães - MG.')

  return (
    <ProdutosPage className="secao catalogo">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        noindex={noindex}
      />
      <div className="titulo-secao">
        <div>
          <h1>Óculos e armações em Guanhães</h1>
          <p>Catálogo online da Ótica Olho de Hórus com armações, óculos e ofertas.</p>
        </div>
      </div>

      <div className="catalogo-layout">
        <aside className="filtros">
          <h2><SlidersHorizontal size={18} /> Filtros</h2>
          <label>
            Buscar
            <div className="campo-com-icone">
              <Search size={18} />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, marca ou cor" />
            </div>
          </label>
          <label>
            Categoria
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas</option>
              {categorias.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>
            Marca
            <select value={marca} onChange={(e) => setMarca(e.target.value)}>
              <option value="">Todas</option>
              {marcas.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </label>
          <label className="checkbox-linha">
            <input type="checkbox" checked={somentePromocoes} onChange={(e) => setSomentePromocoes(e.target.checked)} />
            Apenas promoções
          </label>
          <label className="checkbox-linha">
            <input type="checkbox" checked={somenteFavoritos} onChange={(e) => setSomenteFavoritos(e.target.checked)} />
            Apenas favoritos
          </label>
          <label>
            Ordenar
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
              <option value="recentes">Mais recentes</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>
          </label>
        </aside>

        <div className="catalogo-produtos">
          <div className="resultado-contagem">{produtosFiltrados.length} produto(s)</div>
          {produtosFiltrados.length > 0 ? (
            <div className="grade-produtos">
              {produtosFiltrados.map((produto) => <ProdutoCard produto={produto} key={produto.id} />)}
            </div>
          ) : (
            <EstadoVazio titulo="Nenhum produto encontrado" texto="Cadastre produtos no admin ou ajuste os filtros do catálogo." />
          )}
        </div>
      </div>
    </ProdutosPage>
  )
}
