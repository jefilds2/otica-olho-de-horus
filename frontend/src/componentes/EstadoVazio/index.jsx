import { EstadoVazioContainer } from './styles'

export function EstadoVazio({ titulo, texto, acao }) {
  return (
    <EstadoVazioContainer>
      <img src="/logo-icone-olho.png" alt="" />
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {acao}
    </EstadoVazioContainer>
  )
}
