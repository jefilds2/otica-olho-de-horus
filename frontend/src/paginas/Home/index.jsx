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
  const faqItems = [
    {
      question: 'A Ótica Olho de Hórus atende em Guanhães-MG?',
      answer: 'Sim. A Ótica Olho de Hórus realiza atendimento em Guanhães-MG com loja física na Praça JK, 317 - Centro.',
    },
    {
      question: 'A ótica trabalha com óculos de grau?',
      answer: 'Sim. O atendimento da ótica inclui óculos de grau, armações e lentes.',
    },
    {
      question: 'A ótica possui óculos de sol?',
      answer: 'Sim. A vitrine online apresenta opções de óculos de sol e outros modelos.',
    },
    {
      question: 'Posso tirar dúvidas pelo WhatsApp?',
      answer: 'Sim. O WhatsApp da loja está disponível para dúvidas antes da visita presencial.',
    },
    {
      question: 'Onde fica a Ótica Olho de Hórus?',
      answer: 'A loja fica na Praça JK, 317 - Centro, em Guanhães-MG.',
    },
  ]

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
    '@type': 'Optician',
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
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <HomePage>
      <SeoHead
        title="Ótica em Guanhães-MG | Ótica Olho de Hórus"
        description="Conheça a Ótica Olho de Hórus em Guanhães-MG. Atendimento para óculos de grau, óculos de sol, armações e lentes, com contato pelo WhatsApp e atendimento presencial."
        canonical="/"
        image={`${seoDefaults.siteUrl}/modelo-oculos.jpg`}
        schema={[localBusinessSchema, faqSchema]}
      />
      <section className="hero">
        <div className="hero-texto">
          <span className="etiqueta">Nova vitrine digital da Ótica Olho de Hórus</span>
          <h1>Ótica Olho de Hórus em Guanhães-MG</h1>
          <p>
            Ótica em Guanhães-MG com atendimento para óculos de grau, óculos de sol,
            armações e lentes, unindo loja física e contato pelo WhatsApp para orientar
            sua escolha.
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

      <section className="secao seo-local">
        <div className="seo-local-card">
          <div className="titulo-secao">
            <div>
              <h2>Ótica em Guanhães para óculos de grau, óculos de sol e armações</h2>
              <p>
                A Ótica Olho de Hórus atende em Guanhães-MG com opções em óculos de grau,
                óculos de sol, armações e lentes para diferentes estilos e necessidades.
                Pelo WhatsApp, o cliente pode tirar dúvidas antes de visitar a loja.
              </p>
            </div>
          </div>
          <div className="seo-local-topicos">
            <span>Óculos de grau em Guanhães-MG</span>
            <span>Óculos de sol em Guanhães-MG</span>
            <span>Armações e lentes em Guanhães-MG</span>
          </div>
        </div>
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
              titulo="Categorias em breve"
              texto="Novas coleções e estilos serão adicionados em breve para facilitar sua navegação."
            />
          )
        )}
      </section>

      <section className="secao fundo-suave">
        <div className="titulo-secao">
          <div>
            <h2>Produtos em promoção</h2>
            <p>Selecionamos aqui as melhores oportunidades para você aproveitar.</p>
          </div>
        </div>
        {produtosOferta.length > 0 ? (
          <div className="grade-produtos">
            {produtosOferta.map((produto) => <ProdutoCard produto={produto} key={produto.id} />)}
          </div>
        ) : (
          !carregando && <EstadoVazio titulo="Sem ofertas no momento" texto="No momento não há promoções ativas, mas você pode conferir nossa seleção completa." />
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
          !carregando && <EstadoVazio titulo="Catálogo em atualização" texto="Estamos preparando novos produtos para você conhecer em breve." />
        )}
      </section>

      <section className="beneficios">
        {[
          [Headphones, 'Atendimento especializado', 'Orientação para armações, lentes e compra online.'],
          [Shield, 'Compra segura', 'Navegação protegida e atendimento confiável do começo ao fim.'],
          [Truck, 'Entrega e retirada', 'Receba em casa ou escolha a retirada na loja, como preferir.'],
          [Award, 'Curadoria da ótica', 'Modelos selecionados para unir conforto, estilo e qualidade visual.'],
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

      <section className="secao faq-home">
        <div className="titulo-secao">
          <div>
            <h2>Perguntas frequentes</h2>
            <p>Respostas rápidas sobre atendimento, WhatsApp e localização da ótica.</p>
          </div>
        </div>

        <div className="faq-lista">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
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
