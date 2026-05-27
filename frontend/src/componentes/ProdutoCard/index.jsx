import { ProductCardContainer } from './styles'
import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useCarrinho } from '../../contextos/CarrinhoContext'
import { obterImagensProduto } from '../../servicos/api'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const CHAVE_FAVORITOS = 'favoritos_otica'

function lerFavoritos() {
  try {
    const favoritos = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS) || '[]')
    return Array.isArray(favoritos) ? favoritos : []
  } catch {
    return []
  }
}

export function ProdutoCard({ produto }) {
  const { adicionarProduto } = useCarrinho()
  const [favoritado, setFavoritado] = useState(false)
  const precoAntigo = produto.old_price ? Number(produto.old_price) : null
  const precoAtual = Number(produto.price)
  const installmentsCount = Math.max(1, Number(produto.installments_count || 10))
  const exibirParcelamento = produto.installments_enabled !== false
  const imagemPrincipal = obterImagensProduto(produto)[0]

  useEffect(() => {
    setFavoritado(lerFavoritos().includes(produto.id))
  }, [produto.id])

  function alternarFavorito() {
    const favoritos = lerFavoritos()
    const jaFavoritado = favoritos.includes(produto.id)
    const atualizados = jaFavoritado
      ? favoritos.filter((id) => id !== produto.id)
      : [...favoritos, produto.id]

    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(atualizados))
    setFavoritado(!jaFavoritado)
    toast.success(jaFavoritado ? 'Produto removido dos favoritos.' : 'Produto adicionado aos favoritos.')
  }

  return (
    <ProductCardContainer>
      <div className="produto-imagem">
        <Link to={`/produto/${produto.slug}`} aria-label={`Ver detalhes de ${produto.name}`}>
          <img src={imagemPrincipal} alt={`${produto.name}${produto.brand ? ` da marca ${produto.brand}` : ''}`} />
          {precoAntigo && <span className="selo">Oferta</span>}
        </Link>
        <button
          className={`acao-favorito ${favoritado ? 'ativo' : ''}`}
          type="button"
          aria-label={favoritado ? 'Remover dos favoritos' : 'Favoritar produto'}
          title={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={alternarFavorito}
        >
          <Heart size={17} fill={favoritado ? 'currentColor' : 'none'} />
        </button>
        <button
          className="acao-carrinho"
          type="button"
          onClick={() => adicionarProduto(produto, {
            selected_color_name: produto.color || null,
          })}
        >
          <ShoppingBag size={17} />
          Adicionar
        </button>
      </div>
      <div className="produto-conteudo">
        <span className="produto-marca">{produto.brand}</span>
        <h3>
          <Link to={`/produto/${produto.slug}`}>{produto.name}</Link>
        </h3>
        <div className="precos">
          <strong>{moeda.format(precoAtual)}</strong>
          {precoAntigo && <span>{moeda.format(precoAntigo)}</span>}
        </div>
        {exibirParcelamento && <small>ou {installmentsCount}x de {moeda.format(precoAtual / installmentsCount)} sem juros</small>}
      </div>
    </ProductCardContainer>
  )
}
