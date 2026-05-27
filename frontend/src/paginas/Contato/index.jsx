import { ContatoPage } from './styles'
import { MessageCircle, MapPin, Phone } from 'lucide-react'
import { SeoHead } from '../../componentes/SeoHead'

export function Contato() {
  return (
    <ContatoPage className="secao contato">
      <SeoHead
        title="Contato da Ótica Olho de Hórus | Guanhães - MG"
        description="Entre em contato com a Ótica Olho de Hórus em Guanhães - MG pelo WhatsApp, telefone ou localização da loja."
        canonical="/contato"
      />
      <div>
        <h1>Contato</h1>
        <p>Atendimento da Ótica Olho de Hórus em Guanhães - MG para dúvidas, compras e retirada na loja.</p>
      </div>
      <div className="cards-contato">
        <a href="https://wa.me/553398602063" target="_blank" rel="noreferrer">
          <MessageCircle />
          WhatsApp: +55 33 9860-2063
        </a>
        <div>
          <Phone />
          Telefone: +55 33 9860-2063
        </div>
        <a href="https://maps.app.goo.gl/mu5gf4YAdFpBCMEfA" target="_blank" rel="noreferrer">
          <MapPin />
          Praça JK, 317 - Centro, Guanhães - MG
        </a>
      </div>
      <div className="mapa-contato">
        <iframe
          title="Mapa da Ótica Olho de Hórus"
          src="https://www.google.com/maps?q=Pra%C3%A7a%20JK%20317%20Centro%20Guanh%C3%A3es%20MG%2039740-000&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </ContatoPage>
  )
}
