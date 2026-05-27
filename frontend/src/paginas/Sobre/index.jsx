import { SobrePage } from './styles'
import { SeoHead } from '../../componentes/SeoHead'

export function Sobre() {
  return (
    <SobrePage className="secao texto-institucional">
      <SeoHead
        title="Sobre a Ótica Olho de Hórus | Guanhães - MG"
        description="Conheça a Ótica Olho de Hórus em Guanhães - MG e veja como a loja une atendimento local e catálogo online."
        canonical="/sobre"
      />
      <h1>Ótica Olho de Hórus</h1>
      <p>
        A Ótica Olho de Hórus atende em Guanhães - MG com catálogo online de armações,
        óculos e produtos selecionados para facilitar sua compra.
      </p>
      <p>
        A loja física fica na Praça JK, 317 - Centro, Guanhães - MG, 39740-000.
      </p>
    </SobrePage>
  )
}
