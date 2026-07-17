import { ContatoPage } from './styles'
import { Clock3, MapPin, MessageCircle, Phone } from 'lucide-react'
import { SeoHead, seoDefaults } from '../../componentes/SeoHead'

export function Contato() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'A Ótica Olho de Hórus atende presencialmente em Guanhães-MG?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim. A Ótica Olho de Hórus realiza atendimento presencial em Guanhães-MG, na Praça JK, 317 - Centro.',
        },
      },
      {
        '@type': 'Question',
        name: 'Posso pedir orçamento pelo WhatsApp?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim. O WhatsApp informado pela Ótica Olho de Hórus pode ser usado para tirar dúvidas e solicitar orçamento.',
        },
      },
      {
        '@type': 'Question',
        name: 'A loja atende quem procura óculos de grau?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim. O projeto apresenta a Ótica Olho de Hórus com foco em óculos de grau, armações e lentes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Onde fica a Ótica Olho de Hórus?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A loja fica na Praça JK, 317 - Centro, em Guanhães-MG.',
        },
      },
    ],
  }

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Ótica Olho de Hórus',
    url: `${seoDefaults.siteUrl}/contato`,
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
  }

  return (
    <ContatoPage className="secao contato">
      <SeoHead
        title="Contato da Ótica Olho de Hórus | Guanhães-MG"
        description="Fale com a Ótica Olho de Hórus em Guanhães-MG. Atendimento presencial, WhatsApp, endereço e informações para óculos de grau, armações e lentes."
        canonical="/contato"
        image={`${seoDefaults.siteUrl}/logo-completa.png`}
        schema={[localBusinessSchema, faqSchema]}
      />
      <div className="hero-contato">
        <div className="hero-texto">
          <span className="etiqueta etiqueta-suave">Contato local</span>
          <h1>Fale com a Ótica Olho de Hórus em Guanhães-MG</h1>
          <p>
            A Ótica Olho de Hórus realiza atendimento presencial em Guanhães-MG para quem
            busca apoio com óculos de grau, armações, lentes e retirada na loja.
          </p>
          <div className="grupo-botoes">
            <a
              className="botao destaque"
              href="https://wa.me/553398602063"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={18} />
              Chamar no WhatsApp
            </a>
            <a className="botao" href="tel:+553398602063">
              <Phone size={18} />
              Ligar agora
            </a>
          </div>
        </div>
        <div className="resumo-contato">
          <div className="info-card">
            <MessageCircle />
            <div>
              <strong>WhatsApp</strong>
              <a href="https://wa.me/553398602063" target="_blank" rel="noopener noreferrer">
                +55 33 9860-2063
              </a>
            </div>
          </div>
          <div className="info-card">
            <Phone />
            <div>
              <strong>Telefone</strong>
              <a href="tel:+553398602063">+55 33 9860-2063</a>
            </div>
          </div>
          <div className="info-card">
            <MapPin />
            <div>
              <strong>Endereço</strong>
              <p>Praça JK, 317 - Centro, Guanhães - MG, 39740-000</p>
            </div>
          </div>
          <div className="info-card info-card-suave">
            <Clock3 />
            <div>
              <strong>Atendimento</strong>
              <p>Presencial na loja e suporte online pelo WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="conteudo-contato">
        <div className="texto-local">
          <h2>Atendimento presencial em Guanhães</h2>
          <p>
            Se você prefere visitar a loja, a Ótica Olho de Hórus atende no centro de
            Guanhães-MG. Também é possível iniciar o contato pelo WhatsApp para tirar dúvidas
            sobre óculos de grau, armações e lentes antes de ir até a unidade.
          </p>
          <div className="grupo-botoes">
            <a
              className="botao"
              href="https://maps.app.goo.gl/mu5gf4YAdFpBCMEfA"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={18} />
              Abrir rota no Google Maps
            </a>
          </div>
        </div>

        <div className="mapa-contato">
          <iframe
            title="Mapa da Ótica Olho de Hórus"
            src="https://www.google.com/maps?q=Pra%C3%A7a%20JK%20317%20Centro%20Guanh%C3%A3es%20MG%2039740-000&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="faq-contato">
        <div className="titulo-secao">
          <div>
            <h2>Perguntas frequentes</h2>
            <p>Informações rápidas sobre atendimento, orçamento e localização.</p>
          </div>
        </div>

        <div className="faq-lista">
          <details>
            <summary>A Ótica Olho de Hórus atende presencialmente?</summary>
            <p>Sim. O atendimento presencial acontece em Guanhães-MG, na Praça JK, 317 - Centro.</p>
          </details>
          <details>
            <summary>Posso pedir orçamento pelo WhatsApp?</summary>
            <p>Sim. O WhatsApp da loja pode ser usado para dúvidas e orçamento.</p>
          </details>
          <details>
            <summary>A loja atende quem procura óculos de grau?</summary>
            <p>Sim. O site apresenta atendimento para óculos de grau, armações e lentes.</p>
          </details>
          <details>
            <summary>Como chegar à Ótica Olho de Hórus?</summary>
            <p>A loja fica na Praça JK, 317 - Centro, em Guanhães-MG, com link direto para rota no Google Maps.</p>
          </details>
        </div>
      </section>
    </ContatoPage>
  )
}
