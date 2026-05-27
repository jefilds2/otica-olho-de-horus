import { ProdutoDetalhePage } from './styles'
import {
  Check,
  ChevronRight,
  Heart,
  Info,
  Minus,
  Plus,
  Search,
  Share2,
  Shield,
  ShoppingBag,
  Truck,
  RotateCcw,
  House,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { EstadoVazio } from '../../componentes/EstadoVazio'
import { ProdutoCard } from '../../componentes/ProdutoCard'
import { SeoHead, seoDefaults } from '../../componentes/SeoHead'
import { useCarrinho } from '../../contextos/CarrinhoContext'
import { buscarConfiguracoesPublicasLoja, listarProdutos, obterImagensProduto, obterMensagemErroUsuario } from '../../servicos/api'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const TAMANHO_LUPA = 320
const CHAVE_FAVORITOS = 'favoritos_otica'

function lerFavoritos() {
  try {
    const favoritos = JSON.parse(localStorage.getItem(CHAVE_FAVORITOS) || '[]')
    return Array.isArray(favoritos) ? favoritos : []
  } catch {
    return []
  }
}

function salvarFavoritos(favoritos) {
  localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(favoritos))
}

function parseAvailableColors(value, fallbackColor) {
  if (!value) return fallbackColor ? [fallbackColor] : []

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (Array.isArray(parsed)) return parsed
  } catch {
    return fallbackColor ? [fallbackColor] : []
  }

  return fallbackColor ? [fallbackColor] : []
}

export function ProdutoDetalhe() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const { adicionarProduto } = useCarrinho()
  const [produtos, setProdutos] = useState([])
  const [configLojaPublica, setConfigLojaPublica] = useState({
    free_shipping_enabled: false,
    free_shipping_min_amount: null,
    warranty_months: null,
    return_days: null,
  })
  const [carregando, setCarregando] = useState(true)
  const [quantidade, setQuantidade] = useState(1)
  const [abaAtiva, setAbaAtiva] = useState('especificacoes')
  const [corSelecionadaIndex, setCorSelecionadaIndex] = useState(0)
  const [imagemSelecionadaIndex, setImagemSelecionadaIndex] = useState(0)
  const [favoritado, setFavoritado] = useState(false)
  const [lupaAtiva, setLupaAtiva] = useState(false)
  const [lupaVisivel, setLupaVisivel] = useState(false)
  const [posicaoLupa, setPosicaoLupa] = useState({ left: 160, top: 160, x: 50, y: 50 })
  const imagemPrincipalRef = useRef(null)
  const imagemRenderizadaRef = useRef(null)

  useEffect(() => {
    async function carregarProduto() {
      try {
        const [produtosApi, configuracoesPublicas] = await Promise.all([
          listarProdutos(),
          buscarConfiguracoesPublicasLoja(),
        ])
        setProdutos(produtosApi)
        setConfigLojaPublica({
          free_shipping_enabled: Boolean(configuracoesPublicas?.free_shipping_enabled),
          free_shipping_min_amount: configuracoesPublicas?.free_shipping_min_amount == null
            ? null
            : Number(configuracoesPublicas.free_shipping_min_amount),
          warranty_months: configuracoesPublicas?.warranty_months == null
            ? null
            : Number(configuracoesPublicas.warranty_months),
          return_days: configuracoesPublicas?.return_days == null
            ? null
            : Number(configuracoesPublicas.return_days),
        })
      } catch (error) {
        toast.error(obterMensagemErroUsuario(error))
      } finally {
        setCarregando(false)
      }
    }

    carregarProduto()
  }, [])

  const produto = useMemo(() => produtos.find((item) => item.slug === slug), [produtos, slug])
  const relacionados = useMemo(() => {
    if (!produto) return []

    return produtos
      .filter((item) => item.id !== produto.id && item.category_id === produto.category_id)
      .slice(0, 4)
  }, [produtos, produto])

  const imagensProduto = produto ? obterImagensProduto(produto) : []
  const imagemProduto = imagensProduto[imagemSelecionadaIndex] || imagensProduto[0] || ''
  const precoAtual = produto ? Number(produto.price) : 0
  const precoAntigo = produto?.old_price ? Number(produto.old_price) : null
  const precoPix = precoAtual * 0.95
  const estoqueDisponivel = Number(produto?.stock_quantity || 0)
  const installmentsCount = Math.max(1, Number(produto?.installments_count || 10))
  const exibirParcelamento = produto?.installments_enabled !== false
  const coresDisponiveis = produto ? parseAvailableColors(produto.available_colors, produto.color ? { name: produto.color, hex: '#223758' } : null) : []
  const canonical = produto ? `/produto/${produto.slug}` : '/produtos'
  const productSchema = produto ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: produto.name,
    image: imagensProduto.map((imagem) => (
      imagem.startsWith('http') ? imagem : `${seoDefaults.siteUrl}${imagem}`
    )),
    description: produto.description,
    sku: String(produto.id),
    brand: produto.brand ? {
      '@type': 'Brand',
      name: produto.brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: Number(precoAtual).toFixed(2),
      availability: estoqueDisponivel > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${seoDefaults.siteUrl}/produto/${produto.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Ótica Olho de Hórus',
      },
    },
  } : null
  const breadcrumbSchema = produto ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: `${seoDefaults.siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Produtos',
        item: `${seoDefaults.siteUrl}/produtos`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: produto.name,
        item: `${seoDefaults.siteUrl}/produto/${produto.slug}`,
      },
    ],
  } : null

  useEffect(() => {
    setCorSelecionadaIndex(0)
    setImagemSelecionadaIndex(0)
    setFavoritado(produto ? lerFavoritos().includes(produto.id) : false)
    setLupaAtiva(false)
    setLupaVisivel(false)
  }, [produto?.id])

  useEffect(() => {
    function handleClickFora(evento) {
      if (!imagemPrincipalRef.current) return
      if (!imagemPrincipalRef.current.contains(evento.target)) {
        setLupaAtiva(false)
        setLupaVisivel(false)
      }
    }

    if (lupaAtiva) {
      document.addEventListener('mousedown', handleClickFora)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickFora)
    }
  }, [lupaAtiva])

  function atualizarLupa(evento) {
    const containerRect = imagemPrincipalRef.current?.getBoundingClientRect()
    const imagemEl = imagemRenderizadaRef.current
    if (!containerRect || !imagemEl) return

    const naturalWidth = imagemEl.naturalWidth || 1
    const naturalHeight = imagemEl.naturalHeight || 1
    const escala = Math.min(
      containerRect.width / naturalWidth,
      containerRect.height / naturalHeight,
    )
    const larguraRenderizada = naturalWidth * escala
    const alturaRenderizada = naturalHeight * escala
    const imageRect = {
      left: containerRect.left + (containerRect.width - larguraRenderizada) / 2,
      top: containerRect.top + (containerRect.height - alturaRenderizada) / 2,
      right: containerRect.left + (containerRect.width + larguraRenderizada) / 2,
      bottom: containerRect.top + (containerRect.height + alturaRenderizada) / 2,
      width: larguraRenderizada,
      height: alturaRenderizada,
    }

    const { clientX, clientY } = evento
    const cursorDentroDaImagem =
      clientX >= imageRect.left &&
      clientX <= imageRect.right &&
      clientY >= imageRect.top &&
      clientY <= imageRect.bottom

    if (!cursorDentroDaImagem) {
      setLupaVisivel(false)
      return
    }

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
    const x = ((clientX - imageRect.left) / imageRect.width) * 100
    const y = ((clientY - imageRect.top) / imageRect.height) * 100
    const raioLupa = TAMANHO_LUPA / 2
    const left = clamp(
      clientX - containerRect.left,
      imageRect.left - containerRect.left + raioLupa,
      imageRect.right - containerRect.left - raioLupa,
    )
    const top = clamp(
      clientY - containerRect.top,
      imageRect.top - containerRect.top + raioLupa,
      imageRect.bottom - containerRect.top - raioLupa,
    )

    setPosicaoLupa({
      left,
      top,
      x: clamp(x, 0, 100),
      y: clamp(y, 0, 100),
    })
    setLupaVisivel(true)
  }

  function alternarLupa(evento) {
    evento.stopPropagation()
    setLupaAtiva((atual) => {
      if (atual) {
        setLupaVisivel(false)
      }

      return !atual
    })
  }

  function desativarLupaNaImagem() {
    if (!lupaAtiva) return
    setLupaAtiva(false)
    setLupaVisivel(false)
  }

  function adicionarAoCarrinho() {
    const corSelecionada = coresDisponiveis[corSelecionadaIndex] || null

    for (let index = 0; index < quantidade; index += 1) {
      adicionarProduto(produto, {
        selected_color_name: corSelecionada?.name || produto.color || null,
        selected_color_hex: corSelecionada?.hex || null,
      })
    }
  }

  function comprarAgora() {
    adicionarAoCarrinho()
    navigate('/carrinho')
  }

  function alternarFavorito() {
    if (!produto) return

    const favoritos = lerFavoritos()
    const jaFavoritado = favoritos.includes(produto.id)
    const atualizados = jaFavoritado
      ? favoritos.filter((id) => id !== produto.id)
      : [...favoritos, produto.id]

    salvarFavoritos(atualizados)
    setFavoritado(!jaFavoritado)
    toast.success(jaFavoritado ? 'Produto removido dos favoritos.' : 'Produto adicionado aos favoritos.')
  }

  async function compartilharProduto() {
    const url = window.location.href
    const titulo = produto?.name || 'Produto'

    if (navigator.share) {
      try {
        await navigator.share({
          title: titulo,
          text: `Confira este produto: ${titulo}`,
          url,
        })
        return
      } catch (error) {
        if (error?.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link do anúncio copiado.')
    } catch {
      toast.error('Não foi possível copiar o link do anúncio.')
    }
  }

  if (carregando) {
    return <section className="secao"><p>Carregando produto...</p></section>
  }

  if (!produto) {
    return (
      <section className="secao">
        <EstadoVazio
          titulo="Produto não encontrado"
          texto="O produto pode ter sido removido ou ainda não foi cadastrado."
          acao={<Link className="botao" to="/produtos">Voltar ao catálogo</Link>}
        />
      </section>
    )
  }

  return (
    <ProdutoDetalhePage>
      <SeoHead
        title={produto ? `${produto.name} | Ótica Olho de Hórus` : 'Produto | Ótica Olho de Hórus'}
        description={produto ? `${produto.name}${produto.brand ? ` da marca ${produto.brand}` : ''} na Ótica Olho de Hórus em Guanhães - MG.` : 'Produto da Ótica Olho de Hórus.'}
        canonical={canonical}
        ogType="product"
        image={imagemProduto || seoDefaults.defaultImage}
        noindex={!produto}
        schema={[productSchema, breadcrumbSchema]}
      />
      <section className="secao detalhe-header">
        <div className="breadcrumb">
          <Link to="/"><House size={14} /> Início</Link>
          <ChevronRight size={14} />
          <Link to={`/produtos?categoria=${produto.category?.slug || ''}`}>{produto.category?.name || 'Produtos'}</Link>
          <ChevronRight size={14} />
          <span>{produto.name}</span>
        </div>

        <div className="produto-detalhe-grid">
          <div className="galeria-produto">
            <div
              className={`imagem-principal ${lupaAtiva ? 'com-lupa' : ''}`}
              onMouseMove={lupaAtiva ? atualizarLupa : undefined}
              onMouseEnter={lupaAtiva ? atualizarLupa : undefined}
              onMouseLeave={lupaAtiva ? () => setLupaVisivel(false) : undefined}
              onClick={lupaAtiva ? desativarLupaNaImagem : undefined}
              ref={imagemPrincipalRef}
            >
              <div className="imagem-principal-media">
                <img ref={imagemRenderizadaRef} src={imagemProduto} alt={produto.name} />
              </div>
              <button
                className={`botao-lupa ${lupaAtiva ? 'ativa' : ''}`}
                type="button"
                onClick={alternarLupa}
                aria-label={lupaAtiva ? 'Desativar lupa' : 'Ativar lupa'}
                title={lupaAtiva ? 'Clique fora da imagem para desativar' : 'Ative e passe o mouse sobre a foto'}
              >
                <Search size={22} />
              </button>
              {lupaAtiva && lupaVisivel && (
                <div
                  className="lupa-imagem"
                  style={{
                    left: `${posicaoLupa.left}px`,
                    top: `${posicaoLupa.top}px`,
                    backgroundImage: `url(${imagemProduto})`,
                    backgroundPosition: `${posicaoLupa.x}% ${posicaoLupa.y}%`,
                  }}
                />
              )}
            </div>

            <div className="miniaturas">
              {imagensProduto.map((imagem, index) => (
                <button
                  className={`miniatura ${index === imagemSelecionadaIndex ? 'ativa' : ''}`}
                  key={`${imagem}-${index}`}
                  type="button"
                  onClick={() => setImagemSelecionadaIndex(index)}
                >
                  <img src={imagem} alt={`${produto.name} miniatura ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

            <div className="conteudo-detalhe">
            <span className="marca-produto">{produto.brand}</span>
            <h1>{produto.name}</h1>

            <div className="bloco-preco">
              <div className="precos grande">
                <strong>{moeda.format(precoAtual)}</strong>
                {precoAntigo && <span>{moeda.format(precoAntigo)}</span>}
              </div>
              {exibirParcelamento && <p className="parcelado">ou {installmentsCount}x de {moeda.format(precoAtual / installmentsCount)} sem juros no cartão</p>}
              <p className="pix">{moeda.format(precoPix)} à vista no PIX (5% off)</p>
            </div>

            <p className="descricao-resumida">{produto.description}</p>

            {coresDisponiveis.length > 0 && (
              <div className="bloco-cores">
                <strong>Cores disponíveis</strong>
                <div className="cores-produto-lista">
                  {coresDisponiveis.map((cor, index) => (
                    <button
                      className={corSelecionadaIndex === index ? 'ativa' : ''}
                      key={`${cor.name}-${cor.hex}-${index}`}
                      type="button"
                      title={cor.name}
                      aria-label={`Selecionar cor ${cor.name}`}
                      onClick={() => setCorSelecionadaIndex(index)}
                    >
                      <span style={{ background: cor.hex }} />
                    </button>
                  ))}
                </div>
                <small>{coresDisponiveis[corSelecionadaIndex]?.name || produto.color}</small>
              </div>
            )}

            <p className="estoque">
              <Check size={16} />
              <span>Em estoque</span>
              <small>({estoqueDisponivel} unidades disponíveis)</small>
            </p>

            <div className="acoes-compra">
              <div className="controle-quantidade">
                <button
                  type="button"
                  onClick={() => setQuantidade((atual) => Math.max(1, atual - 1))}
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={16} />
                </button>
                <span>{quantidade}</span>
                <button
                  type="button"
                  onClick={() => setQuantidade((atual) => Math.min(estoqueDisponivel || 1, atual + 1))}
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button className="botao botao-carrinho" type="button" onClick={adicionarAoCarrinho}>
                <ShoppingBag size={18} />
                Adicionar ao Carrinho
              </button>
            </div>

            <button className="botao botao-comprar" type="button" onClick={comprarAgora}>
              <Zap size={18} />
              Comprar Agora
            </button>

            <div className="card-receita">
              <div className="icone-receita">
                <Info size={18} />
              </div>
              <div>
                <strong>Personalização de lentes</strong>
                <p>Este site trabalha com venda direta de óculos e armações. Se você precisar de lentes com grau ou ajustes personalizados, procure uma ótica próxima ou fale com a nossa equipe para orientação.</p>
              </div>
            </div>

            <div className="acoes-secundarias">
              <button className={favoritado ? 'ativo' : ''} type="button" onClick={alternarFavorito}>
                <Heart size={16} fill={favoritado ? 'currentColor' : 'none'} /> {favoritado ? 'Favoritado' : 'Favoritar'}
              </button>
              <button type="button" onClick={compartilharProduto}><Share2 size={16} /> Compartilhar</button>
            </div>

            <div className="beneficios-detalhe">
              {configLojaPublica.free_shipping_enabled && Number.isFinite(configLojaPublica.free_shipping_min_amount) ? (
                <div>
                  <Truck size={18} />
                  <strong>Frete Grátis</strong>
                  <span>Acima de {moeda.format(configLojaPublica.free_shipping_min_amount)}</span>
                </div>
              ) : null}
              {Number.isFinite(configLojaPublica.warranty_months) && configLojaPublica.warranty_months > 0 ? (
                <div>
                  <Shield size={18} />
                  <strong>Garantia</strong>
                  <span>{configLojaPublica.warranty_months} meses</span>
                </div>
              ) : null}
              {Number.isFinite(configLojaPublica.return_days) && configLojaPublica.return_days > 0 ? (
                <div>
                  <RotateCcw size={18} />
                  <strong>Devolução</strong>
                  <span>{configLojaPublica.return_days} dias</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="abas-detalhe">
          <button
            className={abaAtiva === 'especificacoes' ? 'ativa' : ''}
            type="button"
            onClick={() => setAbaAtiva('especificacoes')}
          >
            Especificações
          </button>
          <button
            className={abaAtiva === 'descricao' ? 'ativa' : ''}
            type="button"
            onClick={() => setAbaAtiva('descricao')}
          >
            Descrição
          </button>
        </div>

        {abaAtiva === 'especificacoes' && (
          <div className="painel-especificacoes">
            <div className="cabecalho-aba">
              <strong>Ficha técnica</strong>
              <span>Dados objetivos para ajudar na escolha do modelo e no encaixe.</span>
            </div>
            <div className="grade-especificacoes">
              <div><span>Material da armação</span><strong>{produto.frame_material || 'Não informado'}</strong></div>
              <div><span>Cor principal</span><strong>{produto.color}</strong></div>
              <div><span>Tamanho</span><strong>{produto.size_label || 'Não informado'}</strong></div>
              <div><span>Peso</span><strong>{Number(produto.weight || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg</strong></div>
              <div><span>Largura do pacote</span><strong>{Number(produto.width || 0).toLocaleString('pt-BR')} cm</strong></div>
              <div><span>Altura do pacote</span><strong>{Number(produto.height || 0).toLocaleString('pt-BR')} cm</strong></div>
              <div><span>Comprimento do pacote</span><strong>{Number(produto.length || 0).toLocaleString('pt-BR')} cm</strong></div>
              <div><span>Largura da lente</span><strong>{produto.lens_width_mm ? `${produto.lens_width_mm} mm` : 'Não informado'}</strong></div>
              <div><span>Ponte</span><strong>{produto.bridge_mm ? `${produto.bridge_mm} mm` : 'Não informado'}</strong></div>
              <div><span>Comprimento da haste</span><strong>{produto.temple_length_mm ? `${produto.temple_length_mm} mm` : 'Não informado'}</strong></div>
              <div><span>Gênero</span><strong>{produto.gender || 'Não informado'}</strong></div>
              <div><span>Tipo de lente</span><strong>{produto.category?.name || 'Não informado'}</strong></div>
            </div>
          </div>
        )}

        {abaAtiva === 'descricao' && (
          <div className="bloco-aba bloco-descricao">
            <div className="cabecalho-aba">
              <strong>Descrição do produto</strong>
              <span>Resumo direto das informações principais cadastradas para este item.</span>
            </div>
            <div className="descricao-editorial">
              <p>{produto.description}</p>
            </div>
          </div>
        )}

      </section>

      {relacionados.length > 0 && (
        <section className="secao relacionados">
          <h2>Produtos Relacionados</h2>
          <div className="grade-relacionados">
            {relacionados.map((item) => (
              <ProdutoCard produto={item} key={item.id} />
            ))}
          </div>
        </section>
      )}
    </ProdutoDetalhePage>
  )
}
