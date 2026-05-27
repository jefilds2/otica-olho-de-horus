import { HomePage } from './styles'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, Headphones, MapPin, MessageCircle, Shield, Sparkles, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { EstadoVazio } from '../../componentes/EstadoVazio'
import { ProdutoCard } from '../../componentes/ProdutoCard'
import { SeoHead, seoDefaults } from '../../componentes/SeoHead'
import { listarCategorias, listarProdutos, montarUrlImagem, obterMensagemErroUsuario } from '../../servicos/api'

export function Home() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      try {
        const [produtosApi, categoriasApi] = await Promise.all([listarProdutos(), listarCategorias()])
        setProdutos(produtosApi)
        setCategorias(categoriasApi)
      } catch (error) {
        toast.error(obterMensagemErroUsuario(error))
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [])

  const produtosOferta = produtos.filter((produto) => produto.old_price).slice(0, 4)
  const produtosDestaque = produtos.slice(0, 4)
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Ótica Olho de Hórus',
    url: seoDefaults.siteUrl,
    image: `${seoDefaults.siteUrl}/logo-completa.png`,
    telephone: '+55 33 9860-2063',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Praça JK, 317 - Centro',
      addressLocality: 'Guanhães',
      addressRegion: 'MG',
      postalCode: '39740-000',
      addressCountry: 'BR',
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Guanhães',
      },
    ],
  }

  return (
    <HomePage>
      <SeoHead
        title="Ótica Olho de Hórus | Ótica em Guanhães - MG"
        description="Ótica em Guanhães - MG com óculos de grau, óculos de sol, armações e atendimento local com apoio online na Ótica Olho de Hórus."
        canonical="/"
        image={`${seoDefaults.siteUrl}/modelo-oculos.jpg`}
        schema={localBusinessSchema}
      />
      <section className="hero">
        <div className="hero-texto">
          <span className="etiqueta">Nova vitrine digital da Ótica Olho de Hórus</span>
          <h1>Enxergue com <span>clareza</span>, escolha com estilo</h1>
          <p>
            Óculos de grau, óculos de sol e armações com atendimento próximo em Guanhães
            para orientar sua escolha e acompanhar cada etapa da compra.
          </p>
          <div className="grupo-botoes">
            <Link className="botao destaque" to="/produtos">
              Ver coleção
              <ArrowRight size={18} />
            </Link>
            <Link className="botao secundario" to="/produtos?promocoes=true">Ver ofertas</Link>
          </div>
          <div className="hero-detalhes">
            <div>
              <strong>Atendimento real</strong>
              <span>Loja física em Guanhães com apoio digital</span>
            </div>
            <div>
              <strong>Curadoria da ótica</strong>
              <span>Armações e lentes escolhidas para o dia a dia</span>
            </div>
          </div>
        </div>
        <div className="hero-imagem">
          <img src="/modelo-oculos.jpg" alt="Modelo usando óculos da Ótica Olho de Hórus" />
          <div className="hero-card-flutuante">
            <Sparkles size={16} />
            <div>
              <strong>Seleção premium</strong>
              <span>Modelos com conforto, presença e boa leitura visual</span>
            </div>
          </div>
        </div>
      </section>

      <section className="faixa-confianca">
        <div><strong>Retirada na loja</strong><span>Praça JK, 317 - Centro - Guanhães/MG</span></div>
        <div><strong>Atendimento no WhatsApp</strong><span>Suporte rápido para orçamento e dúvidas</span></div>
        <div><strong>Catálogo em expansão</strong><span>Base pronta para produtos, promoções e pedidos</span></div>
      </section>

      <section className="secao">
        <div className="titulo-secao">
          <div>
            <h2>Categorias em destaque</h2>
            <p>Linhas organizadas para navegar como em uma vitrine de ótica moderna.</p>
          </div>
          <Link to="/produtos">Ver catálogo</Link>
        </div>

        {categorias.length > 0 ? (
          <div className="grade-categorias">
            {categorias.slice(0, 6).map((categoria) => (
              <Link className="categoria-card" to={`/produtos?categoria=${categoria.slug}`} key={categoria.id}>
                <img src={montarUrlImagem(categoria.path)} alt={categoria.name} />
                <strong>{categoria.name}</strong>
              </Link>
            ))}
          </div>
        ) : (
          !carregando && (
            <EstadoVazio
              titulo="Nenhuma categoria cadastrada"
              texto="Cadastre categorias no painel administrativo para montar a vitrine pública."
              acao={<Link className="botao" to="/admin">Ir para admin</Link>}
            />
          )
        )}
      </section>

      <section className="secao fundo-suave">
        <div className="titulo-secao">
          <div>
            <h2>Produtos em promoção</h2>
            <p>Ofertas com destaque visual para reforçar o apelo comercial da home.</p>
          </div>
        </div>
        {produtosOferta.length > 0 ? (
          <div className="grade-produtos">
            {produtosOferta.map((produto) => <ProdutoCard produto={produto} key={produto.id} />)}
          </div>
        ) : (
          !carregando && <EstadoVazio titulo="Sem ofertas no momento" texto="Cadastre um preço antigo no produto para ativar a promoção." />
        )}
      </section>

      <section className="secao">
        <div className="titulo-secao">
          <div>
            <h2>Seleção da Ótica Olho de Hórus</h2>
            <p>Uma curadoria pensada para apresentar o catálogo com mais valor percebido.</p>
          </div>
        </div>
        {produtosDestaque.length > 0 ? (
          <div className="grade-produtos">
            {produtosDestaque.map((produto) => <ProdutoCard produto={produto} key={produto.id} />)}
          </div>
        ) : (
          !carregando && <EstadoVazio titulo="Nenhum produto cadastrado" texto="Quando houver produtos no banco, eles aparecerão automaticamente aqui." />
        )}
      </section>

      <section className="beneficios">
        {[
          [Headphones, 'Atendimento especializado', 'Orientação para armações, lentes e compra online.'],
          [Shield, 'Compra segura', 'Autenticação, validações e estrutura preparada para operação real.'],
          [Truck, 'Entrega e retirada', 'Base preparada para frete e retirada na loja.'],
          [Award, 'Curadoria da ótica', 'Catálogo organizado pela equipe da Ótica Olho de Hórus.'],
        ].map(([Icone, titulo, texto]) => (
          <div className="beneficio" key={titulo}>
            <Icone size={28} />
            <h3>{titulo}</h3>
            <p>{texto}</p>
          </div>
        ))}
      </section>

      <section className="secao localizacao">
        <div className="localizacao-texto">
          <span className="etiqueta etiqueta-suave">Localização</span>
          <h2>Visite a Ótica Olho de Hórus em Guanhães</h2>
          <p>
            Atendimento presencial na Praça JK, 317 - Centro, Guanhães - MG. A loja online
            nasce integrada ao atendimento real da ótica.
          </p>
          <a className="botao" href="https://maps.app.goo.gl/mu5gf4YAdFpBCMEfA" target="_blank" rel="noreferrer">
            <MapPin size={18} />
            Abrir no Google Maps
          </a>
        </div>
        <div className="mapa-card">
          <iframe
            title="Mapa da Ótica Olho de Hórus"
            src="https://www.google.com/maps?q=Pra%C3%A7a%20JK%20317%20Centro%20Guanh%C3%A3es%20MG%2039740-000&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="cta-whatsapp">
        <div>
          <h2>Precisa de ajuda para escolher?</h2>
          <p>Fale com nossos especialistas pelo WhatsApp.</p>
        </div>
        <a className="botao whatsapp" href="https://wa.me/553398602063" target="_blank" rel="noreferrer">
          <MessageCircle size={20} />
          Chamar no WhatsApp
        </a>
      </section>
    </HomePage>
  )
}
