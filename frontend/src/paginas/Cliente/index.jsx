import { ClientePage } from './styles'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CreditCard, LockKeyhole, MapPin, Package, Pencil, Plus, ShoppingBag, Trash2, UserRound } from 'lucide-react'
import { EstadoVazio } from '../../componentes/EstadoVazio'
import { useAuth } from '../../contextos/AuthContext'
import {
  alterarMinhaSenha,
  atualizarEndereco,
  atualizarMeuCadastro,
  buscarMeuCadastro,
  cadastrarEndereco,
  excluirEndereco,
  listarMeusEnderecos,
  listarMeusPedidos,
  obterMensagemErroUsuario,
  pagarPedidoNovamente,
} from '../../servicos/api'

const enderecoInicial = {
  label: '',
  recipient_name: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  reference: '',
  is_default: false,
}

const senhaInicial = {
  current_password: '',
  new_password: '',
  confirm_password: '',
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const abasConta = [
  { id: 'dados', titulo: 'Dados pessoais', descricao: 'Mantenha seu cadastro sempre atualizado.', icone: UserRound },
  { id: 'pedidos', titulo: 'Meus pedidos', descricao: 'Acompanhe status, pagamento e entrega.', icone: Package },
  { id: 'enderecos', titulo: 'Endereços de entrega', descricao: 'Gerencie seus endereços salvos.', icone: MapPin },
  { id: 'senha', titulo: 'Alterar senha', descricao: 'Atualize sua senha de acesso.', icone: LockKeyhole },
]

const statusPedidoMap = {
  aguardando_pagamento: { label: 'Aguardando pagamento', className: 'badge' },
  processando: { label: 'Processando', className: 'badge' },
  pago: { label: 'Pago', className: 'badge sucesso' },
  expirado: { label: 'Expirado', className: 'badge perigo' },
  cancelado: { label: 'Cancelado', className: 'badge perigo' },
}

const statusEnvioMap = {
  em_preparacao: { label: 'Em preparação', className: 'badge alerta' },
  em_transporte: { label: 'Em transporte', className: 'badge' },
  entregue: { label: 'Entregue', className: 'badge sucesso' },
}

function obterResumoPagamento(pedido) {
  const detalhes = pedido?.payment_details
  if (!detalhes) return 'Forma não informada'

  return detalhes.method_label || 'Forma não informada'
}

function obterDetalhesPagamentoSecundarios(pedido) {
  const detalhes = pedido?.payment_details
  if (!detalhes) return []

  const linhas = []
  if (detalhes.installments && detalhes.installments > 1 && detalhes.installment_amount) {
    linhas.push(`${detalhes.installments}x de ${moeda.format(Number(detalhes.installment_amount))}`)
  }

  if (detalhes.card_last_four_digits) {
    linhas.push(`Final ${detalhes.card_last_four_digits}`)
  }

  if (detalhes.issuer_name) {
    linhas.push(detalhes.issuer_name)
  }

  return linhas
}

function formatarData(data) {
  if (!data) return 'Sem data'
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarEndereco(endereco) {
  if (!endereco) return 'Endereço não informado'

  const linha1 = [endereco.street, endereco.number].filter(Boolean).join(', ')
  const linha2 = [endereco.neighborhood, `${endereco.city || ''}/${endereco.state || ''}`.replace(/^\/|\/$/g, '')]
    .filter(Boolean)
    .join(' • ')

  return [linha1, linha2, endereco.cep ? `CEP ${endereco.cep}` : '', endereco.reference ? `Ref.: ${endereco.reference}` : '']
    .filter(Boolean)
    .join(' | ')
}

function somenteDigitos(valor) {
  return String(valor || '').replace(/\D/g, '')
}

function formatarCep(valor) {
  const digitos = somenteDigitos(valor).slice(0, 8)
  if (digitos.length <= 5) return digitos
  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`
}

function formatarTelefone(valor) {
  const digitos = somenteDigitos(valor).slice(0, 11)

  if (!digitos) return ''
  if (digitos.length <= 2) return `(${digitos}`
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

function obterStatusEnvioPedido(pedido) {
  if (pedido?.fulfillment_status) {
    return statusEnvioMap[pedido.fulfillment_status] || { label: pedido.fulfillment_status, className: 'badge' }
  }

  if (pedido?.status === 'cancelado') {
    return { label: 'Pedido cancelado', className: 'badge perigo' }
  }

  if (['aguardando_pagamento', 'expirado'].includes(pedido?.status)) {
    return { label: 'Aguardando pagamento', className: 'badge' }
  }

  return statusEnvioMap.em_preparacao
}

export function Cliente() {
  const navigate = useNavigate()
  const { usuario, atualizarUsuario } = useAuth()
  const [form, setForm] = useState(null)
  const [enderecos, setEnderecos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [enderecoForm, setEnderecoForm] = useState(enderecoInicial)
  const [senhaForm, setSenhaForm] = useState(senhaInicial)
  const [enderecoEditandoId, setEnderecoEditandoId] = useState(null)
  const [mostrarFormularioEndereco, setMostrarFormularioEndereco] = useState(false)
  const [pedidoAbertoId, setPedidoAbertoId] = useState(null)
  const [abaAtiva, setAbaAtiva] = useState('dados')
  const formularioEnderecoRef = useRef(null)

  useEffect(() => {
    async function carregarPainel() {
      if (!usuario) return
      try {
        const [cadastro, enderecosApi, pedidosApi] = await Promise.all([
          buscarMeuCadastro(),
          listarMeusEnderecos(),
          listarMeusPedidos(),
        ])
        setForm(cadastro)
        setEnderecos(enderecosApi)
        setPedidos(pedidosApi)
      } catch (error) {
        toast.error(obterMensagemErroUsuario(error))
      }
    }

    carregarPainel()
  }, [usuario])

  useEffect(() => {
    if (!form) return
    setEnderecoForm((atual) => ({
      ...atual,
      recipient_name: atual.recipient_name || form.name || '',
      phone: atual.phone || formatarTelefone(form.phone || form.whatsapp || ''),
    }))
  }, [form])

  useEffect(() => {
    if (abaAtiva !== 'enderecos' || !mostrarFormularioEndereco) return

    formularioEnderecoRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [abaAtiva, mostrarFormularioEndereco])

  const resumo = useMemo(() => ({
    pedidos: pedidos.length,
    enderecos: enderecos.length,
    valorTotal: pedidos.reduce((total, pedido) => total + Number(pedido.total_amount || 0), 0),
  }), [pedidos, enderecos])

  async function recarregarEnderecos() {
    const enderecosApi = await listarMeusEnderecos()
    setEnderecos(enderecosApi)
  }

  async function recarregarPedidos() {
    const pedidosApi = await listarMeusPedidos()
    setPedidos(pedidosApi)
  }

  async function copiarCodigoRastreio(codigo) {
    if (!codigo) return

    try {
      await navigator.clipboard.writeText(codigo)
      toast.success('Código de rastreio copiado.')
    } catch {
      toast.error('Não foi possível copiar o código de rastreio.')
    }
  }

  function alterarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function alterarEndereco(campo, valor) {
    let valorFormatado = valor

    if (campo === 'cep') {
      valorFormatado = formatarCep(valor)
    } else if (campo === 'phone') {
      valorFormatado = formatarTelefone(valor)
    }

    setEnderecoForm((atual) => ({ ...atual, [campo]: valorFormatado }))
  }

  function abrirNovoEndereco() {
    setAbaAtiva('enderecos')
    setEnderecoEditandoId(null)
    setEnderecoForm({
      ...enderecoInicial,
      recipient_name: form.name || '',
      phone: formatarTelefone(form.phone || form.whatsapp || ''),
    })
    setMostrarFormularioEndereco(true)
  }

  async function salvar(evento) {
    evento.preventDefault()
    try {
      const atualizado = await atualizarMeuCadastro({
        name: form.name || '',
        email: form.email || '',
        birth_date: form.birth_date || null,
        phone: form.phone || '',
        whatsapp: form.whatsapp || '',
      })
      setForm(atualizado)
      atualizarUsuario({
        name: atualizado.name,
        email: atualizado.email,
      })
      toast.success('Cadastro atualizado.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  function alterarSenhaCampo(campo, valor) {
    setSenhaForm((atual) => ({ ...atual, [campo]: valor }))
  }

  async function salvarSenha(evento) {
    evento.preventDefault()
    try {
      await alterarMinhaSenha(senhaForm)
      setSenhaForm(senhaInicial)
      toast.success('Senha atualizada com sucesso.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function salvarEndereco(evento) {
    evento.preventDefault()
    try {
      const payloadEndereco = {
        ...enderecoForm,
        phone: somenteDigitos(enderecoForm.phone || ''),
        cep: somenteDigitos(enderecoForm.cep || ''),
      }

      if (enderecoEditandoId) {
        await atualizarEndereco(enderecoEditandoId, payloadEndereco)
        toast.success('Endereço atualizado.')
      } else {
        await cadastrarEndereco(payloadEndereco)
        toast.success('Endereço cadastrado.')
      }

      await recarregarEnderecos()

      setEnderecoForm({
        ...enderecoInicial,
        recipient_name: form.name || '',
        phone: formatarTelefone(form.phone || form.whatsapp || ''),
      })
      setEnderecoEditandoId(null)
      setMostrarFormularioEndereco(false)
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  function editarEndereco(endereco) {
    setEnderecoEditandoId(endereco.id)
    setMostrarFormularioEndereco(true)
    setEnderecoForm({
      label: endereco.label || '',
      recipient_name: endereco.recipient_name || '',
      phone: formatarTelefone(endereco.phone || ''),
      cep: formatarCep(endereco.cep || ''),
      street: endereco.street || '',
      number: endereco.number || '',
      complement: endereco.complement || '',
      neighborhood: endereco.neighborhood || '',
      city: endereco.city || '',
      state: endereco.state || '',
      reference: endereco.reference || '',
      is_default: Boolean(endereco.is_default),
    })
  }

  function usarNoCheckout(endereco) {
    navigate(`/carrinho?address=${endereco.id}`)
  }

  async function removerEndereco(id) {
    if (!window.confirm('Excluir este endereço?')) return

    try {
      await excluirEndereco(id)
      await recarregarEnderecos()
      if (enderecoEditandoId === id) {
        setEnderecoEditandoId(null)
        setEnderecoForm({
          ...enderecoInicial,
          recipient_name: form.name || '',
          phone: formatarTelefone(form.phone || form.whatsapp || ''),
        })
      }
      toast.success('Endereço removido.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function tentarNovoPagamento(pedidoId) {
    try {
      const resposta = await pagarPedidoNovamente(pedidoId)
      await recarregarPedidos()

      if (resposta?.url) {
        window.location.href = resposta.url
        return
      }

      toast.error('Não foi possível abrir o novo pagamento.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  if (!usuario) {
    return (
      <section className="secao">
        <EstadoVazio
          titulo="Acesse sua conta"
          texto="Faça login para visualizar dados, pedidos e informações de entrega."
          acao={<Link className="botao" to="/login">Entrar</Link>}
        />
      </section>
    )
  }

  if (!form) return <section className="secao"><p>Carregando painel do cliente...</p></section>

  return (
    <ClientePage className="secao painel-cliente">
      <div className="cliente-hero">
        <div>
          <p className="cliente-eyebrow">Área do cliente</p>
          <h1>Minha conta</h1>
          <span>Gerencie seus dados, acompanhe pedidos e organize os endereços de entrega.</span>
        </div>
        <div className="cliente-avatar">
          <UserRound size={30} />
          <strong>{form.name}</strong>
          <small>{form.email}</small>
        </div>
      </div>

      <div className="cliente-resumo">
        <article className="resumo-card">
          <div className="resumo-icone"><Package size={18} /></div>
          <strong>{resumo.pedidos}</strong>
          <span>Pedidos realizados</span>
        </article>
        <article className="resumo-card">
          <div className="resumo-icone"><MapPin size={18} /></div>
          <strong>{resumo.enderecos}</strong>
          <span>Endereços salvos</span>
        </article>
        <article className="resumo-card">
          <div className="resumo-icone"><CreditCard size={18} /></div>
          <strong>{moeda.format(resumo.valorTotal)}</strong>
          <span>Total em compras</span>
        </article>
        <article className="resumo-card destaque">
          <div className="resumo-icone"><ShoppingBag size={18} /></div>
          <strong>{resumo.pedidos}</strong>
          <span>Pedidos acompanhados</span>
        </article>
      </div>

      <div className="conta-layout">
        <aside className="conta-menu">
          <div className="conta-menu-topo">
            <span className="conta-menu-etiqueta">Navegação</span>
            <strong>Minha conta</strong>
            <p>Escolha uma área para gerenciar seus dados.</p>
          </div>

          <nav className="conta-menu-lista" aria-label="Seções da conta">
            {abasConta.map((aba) => {
              const Icone = aba.icone
              const ativa = abaAtiva === aba.id

              return (
                <button
                  key={aba.id}
                  className={`conta-menu-botao ${ativa ? 'ativo' : ''}`}
                  type="button"
                  onClick={() => setAbaAtiva(aba.id)}
                >
                  <span className="conta-menu-icone"><Icone size={18} /></span>
                  <span>
                    <strong>{aba.titulo}</strong>
                    <small>{aba.descricao}</small>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className={`conta-painel aba-${abaAtiva}`}>
          {abaAtiva === 'dados' ? (
            <section className="painel-card painel-card-dados conta-conteudo">
              <div className="painel-card-topo">
                <div>
                  <h2>Dados pessoais</h2>
                  <p>Atualize seus dados para manter suas compras e comunicações em dia.</p>
                </div>
              </div>

              <form className="form-grid conteudo-secao form-dados-pessoais" onSubmit={salvar}>
                <label className="campo-largo">Nome<input value={form.name || ''} onChange={(e) => alterarCampo('name', e.target.value)} /></label>
                <label className="campo-largo">E-mail<input type="email" value={form.email || ''} onChange={(e) => alterarCampo('email', e.target.value)} /></label>
                <label>Data de nascimento<input type="date" value={form.birth_date || ''} onChange={(e) => alterarCampo('birth_date', e.target.value)} /></label>
                <label>Telefone<input value={form.phone || ''} onChange={(e) => alterarCampo('phone', e.target.value)} /></label>
                <label>WhatsApp<input value={form.whatsapp || ''} onChange={(e) => alterarCampo('whatsapp', e.target.value)} /></label>
                <div className="form-acoes">
                  <button className="botao destaque" type="submit">Salvar dados</button>
                </div>
              </form>
            </section>
          ) : null}

          {abaAtiva === 'pedidos' ? (
            <section className="painel-card painel-card-pedidos conta-conteudo">
              <div className="painel-card-topo">
                <div>
                  <h2>Meus pedidos</h2>
                  <p>Acompanhe o status da compra, entrega e pagamento.</p>
                </div>
              </div>

              {pedidos.length > 0 ? (
                <div className="lista-pedidos conteudo-secao">
                {pedidos.map((pedido) => {
                  const statusPedido = statusPedidoMap[pedido.status] || { label: pedido.status, className: 'badge' }
                  const statusEnvio = obterStatusEnvioPedido(pedido)
                  const pedidoAberto = pedidoAbertoId === pedido.id
                  const subtotal = Number(pedido.subtotal_amount || 0)
                  const frete = Number(pedido.shipping_price || 0)
                  const total = Number(pedido.total_amount || 0)
                  const podePagarNovamente = ['aguardando_pagamento', 'expirado'].includes(pedido.status)

                  return (
                    <article className={`card-pedido ${pedidoAberto ? 'aberto' : ''}`} key={pedido.id}>
                      <div className="card-pedido-topo">
                        <div>
                          <strong>Pedido #{pedido.id}</strong>
                          <span>{formatarData(pedido.paid_at || pedido.created_at)}</span>
                        </div>
                        <span className={statusEnvio.className}>{statusEnvio.label}</span>
                      </div>
                      <div className="pedido-metricas">
                        <p><span>Total</span><b>{moeda.format(Number(pedido.total_amount || 0))}</b></p>
                        <p><span>Frete</span><b>{pedido.shipping_service_name || 'Não informado'}</b></p>
                        <p><span>Pagamento</span><b>{statusPedido.label}</b><small>{obterResumoPagamento(pedido)}</small></p>
                      </div>
                      <button
                        className={`botao-detalhe-pedido ${pedidoAberto ? 'aberto' : ''}`}
                        type="button"
                        onClick={() => setPedidoAbertoId((atual) => (atual === pedido.id ? null : pedido.id))}
                      >
                        <span>{pedidoAberto ? 'Ocultar detalhes' : 'Ver detalhes do pedido'}</span>
                        <span className="indicador-detalhe">{pedidoAberto ? '−' : '+'}</span>
                      </button>

                      {pedidoAberto ? (
                        <div className="detalhe-pedido">
                          <div className="detalhe-pedido-topo">
                            <div>
                              <strong>Detalhes do pedido #{pedido.id}</strong>
                              <span>Confira os itens, pagamento e entrega deste pedido.</span>
                            </div>
                            <span className={statusPedido.className}>{statusPedido.label}</span>
                          </div>

                          <div className="detalhe-pedido-grid">
                            <div className="detalhe-bloco">
                              <strong>Itens do pedido</strong>
                              <div className="detalhe-itens">
                                {(pedido.items || []).map((item) => (
                                  <article key={item.id} className="detalhe-item">
                                    <div>
                                      <b>{item.product_name}</b>
                                      <span>{item.quantity} unidade(s)</span>
                                      {item.selected_color_name ? <span>Cor: {item.selected_color_name}</span> : null}
                                    </div>
                                    <strong>{moeda.format(Number(item.total_price || 0))}</strong>
                                  </article>
                                ))}
                              </div>
                            </div>

                            <div className="detalhe-bloco">
                              <strong>Resumo financeiro</strong>
                              <div className="detalhe-linhas">
                                <p><span>Forma de pagamento</span><b>{obterResumoPagamento(pedido)}</b></p>
                                {obterDetalhesPagamentoSecundarios(pedido).map((linha) => (
                                  <p key={`pagamento-${pedido.id}-${linha}`}><span>Detalhe</span><b>{linha}</b></p>
                                ))}
                                <p><span>Subtotal</span><b>{moeda.format(subtotal)}</b></p>
                                <p><span>Frete</span><b>{moeda.format(frete)}</b></p>
                                <p className="total"><span>Total pago</span><b>{moeda.format(total)}</b></p>
                              </div>
                              {podePagarNovamente ? (
                                <button className="botao destaque botao-repagar" type="button" onClick={() => tentarNovoPagamento(pedido.id)}>
                                  Efetuar pagamento novamente
                                </button>
                              ) : null}
                            </div>
                          </div>

                          <div className="detalhe-pedido-grid detalhe-pedido-grid-unico">
                            <div className="detalhe-bloco">
                              <strong>Entrega</strong>
                              <p>{formatarEndereco(pedido.shipping_address)}</p>
                              {pedido.tracking_code ? (
                                <div className="rastreamento-destaque">
                                  <span className="rastreamento-legenda">Acompanhe sua entrega</span>
                                  <div className="rastreamento-codigo">
                                    <strong>{pedido.tracking_code}</strong>
                                    <button type="button" onClick={() => copiarCodigoRastreio(pedido.tracking_code)}>
                                      Copiar código
                                    </button>
                                  </div>
                                  {pedido.tracking_url ? (
                                    <a href={pedido.tracking_url} target="_blank" rel="noreferrer">
                                      Abrir rastreio da transportadora
                                    </a>
                                  ) : null}
                                </div>
                              ) : null}
                              <div className="detalhe-linhas">
                                <p><span>Transportadora</span><b>{pedido.shipping_company_name || 'Correios'}</b></p>
                                <p><span>Status do envio</span><b>{statusEnvio.label}</b></p>
                                <p><span>Serviço</span><b>{pedido.shipping_service_name || 'Não informado'}</b></p>
                                <p><span>Prazo estimado</span><b>{pedido.shipping_service_id === 'retirada_loja' ? 'Retirada gratuita na loja' : pedido.shipping_delivery_time ? `${pedido.shipping_delivery_time} dia(s)` : 'Não informado'}</b></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
                </div>
              ) : (
                <div className="conteudo-secao">
                  <EstadoVazio
                    titulo="Nenhum pedido realizado"
                    texto="Quando você finalizar uma compra, seus pedidos aparecerão aqui."
                    acao={<Link className="botao" to="/produtos">Explorar produtos</Link>}
                  />
                </div>
              )}
            </section>
          ) : null}

          {abaAtiva === 'enderecos' ? (
            <section className="painel-card painel-card-enderecos conta-conteudo">
              <div className="painel-card-topo">
                <div>
                  <h2>Endereços de entrega</h2>
                  <p>Cadastre quantos endereços quiser e defina um padrão para o checkout.</p>
                </div>
              </div>

              <div className="enderecos-grid conteudo-secao">
                <div className="lista-enderecos">
                  {enderecos.length > 0 ? enderecos.map((endereco) => (
                    <article className={`card-endereco ${endereco.is_default ? 'padrao' : ''}`} key={endereco.id}>
                      <div className="card-endereco-topo">
                        <div>
                          <strong>{endereco.label}</strong>
                          <span>{endereco.is_default ? 'Endereço padrão' : 'Endereço salvo'}</span>
                        </div>
                        <MapPin size={18} />
                      </div>
                      <p>{endereco.recipient_name}</p>
                      <p>{endereco.street}, {endereco.number}{endereco.complement ? ` • ${endereco.complement}` : ''}</p>
                      <p>{endereco.neighborhood} • {endereco.city}/{endereco.state}</p>
                      <p>CEP {endereco.cep}</p>
                      {endereco.reference && <p>Referência: {endereco.reference}</p>}
                      <div className="acoes-endereco">
                        <button className="botao-acao destaque-checkout" type="button" onClick={() => usarNoCheckout(endereco)}>
                          Usar no checkout
                        </button>
                        <button className="botao-acao editar" type="button" onClick={() => editarEndereco(endereco)}>
                          <Pencil size={15} />
                          Editar
                        </button>
                        <button className="botao-acao excluir" type="button" onClick={() => removerEndereco(endereco.id)}>
                          <Trash2 size={15} />
                          Excluir
                        </button>
                      </div>
                    </article>
                  )) : (
                    <EstadoVazio
                      titulo="Nenhum endereço salvo"
                      texto="Cadastre um endereço abaixo para liberar cálculo de frete e checkout."
                    />
                  )}
                </div>

                <div className="bloco-form-endereco">
                  <div className={`chamada-endereco ${mostrarFormularioEndereco ? 'ativa' : ''}`}>
                    <div>
                      <span className="chamada-endereco-etiqueta">Próximo passo</span>
                      <strong>Cadastre um novo endereço de entrega</strong>
                      <p>Salve um endereço para agilizar suas próximas compras e a escolha da entrega.</p>
                    </div>
                    {!mostrarFormularioEndereco ? (
                      <button className="botao destaque" type="button" onClick={abrirNovoEndereco}>
                        <Plus size={16} />
                        Cadastrar endereço agora
                      </button>
                    ) : null}
                  </div>

                  {mostrarFormularioEndereco ? (
                    <form className="form-grid form-endereco" onSubmit={salvarEndereco} ref={formularioEnderecoRef}>
                      <div className="form-endereco-topo">
                        <h3>{enderecoEditandoId ? 'Editar endereço' : 'Novo endereço'}</h3>
                        <div className="acoes-form-endereco">
                          <button className="botao secundario" type="button" onClick={() => {
                            setEnderecoEditandoId(null)
                            setEnderecoForm({
                              ...enderecoInicial,
                              recipient_name: form.name || '',
                              phone: formatarTelefone(form.phone || form.whatsapp || ''),
                            })
                          }}>
                            <Plus size={16} />
                            Limpar
                          </button>
                          <button
                            className="botao secundario"
                            type="button"
                            onClick={() => setMostrarFormularioEndereco(false)}
                          >
                            Ocultar formulário
                          </button>
                        </div>
                      </div>
                      <label>Identificação<input value={enderecoForm.label} onChange={(e) => alterarEndereco('label', e.target.value)} placeholder="Casa, trabalho, consultório..." required /></label>
                      <label>Destinatário<input value={enderecoForm.recipient_name} onChange={(e) => alterarEndereco('recipient_name', e.target.value)} required /></label>
                      <label>Telefone<input value={enderecoForm.phone} onChange={(e) => alterarEndereco('phone', e.target.value)} placeholder="(00) 00000-0000" /></label>
                      <label>CEP<input value={enderecoForm.cep} onChange={(e) => alterarEndereco('cep', e.target.value)} placeholder="00000-000" required /></label>
                      <label>Rua<input value={enderecoForm.street} onChange={(e) => alterarEndereco('street', e.target.value)} required /></label>
                      <label>Número<input value={enderecoForm.number} onChange={(e) => alterarEndereco('number', e.target.value)} required /></label>
                      <label>Complemento<input value={enderecoForm.complement} onChange={(e) => alterarEndereco('complement', e.target.value)} /></label>
                      <label>Bairro<input value={enderecoForm.neighborhood} onChange={(e) => alterarEndereco('neighborhood', e.target.value)} required /></label>
                      <label>Cidade<input value={enderecoForm.city} onChange={(e) => alterarEndereco('city', e.target.value)} required /></label>
                      <label>UF<input maxLength={2} value={enderecoForm.state} onChange={(e) => alterarEndereco('state', e.target.value.toUpperCase())} required /></label>
                      <label>Referência<input value={enderecoForm.reference} onChange={(e) => alterarEndereco('reference', e.target.value)} /></label>
                      <label className="checkbox-endereco">
                        <input type="checkbox" checked={enderecoForm.is_default} onChange={(e) => alterarEndereco('is_default', e.target.checked)} />
                        <span>Definir como endereço padrão</span>
                      </label>
                      <button className="botao destaque" type="submit">{enderecoEditandoId ? 'Salvar endereço' : 'Cadastrar endereço'}</button>
                    </form>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {abaAtiva === 'senha' ? (
            <section className="painel-card painel-card-senha conta-conteudo">
              <div className="painel-card-topo">
                <div>
                  <h2>Alterar senha</h2>
                  <p>Atualize sua senha de acesso para manter sua conta protegida.</p>
                </div>
              </div>

              <form className="form-grid conteudo-secao form-senha" onSubmit={salvarSenha}>
                <label>Senha atual<input type="password" value={senhaForm.current_password} onChange={(e) => alterarSenhaCampo('current_password', e.target.value)} required /></label>
                <label>Nova senha<input type="password" value={senhaForm.new_password} onChange={(e) => alterarSenhaCampo('new_password', e.target.value)} minLength={6} required /></label>
                <label>Confirmar nova senha<input type="password" value={senhaForm.confirm_password} onChange={(e) => alterarSenhaCampo('confirm_password', e.target.value)} minLength={6} required /></label>
                <div className="senha-dicas">
                  <strong>Recomendação</strong>
                  <p>Use pelo menos 6 caracteres e evite repetir a senha atual.</p>
                </div>
                <button className="botao destaque" type="submit">Salvar nova senha</button>
              </form>
            </section>
          ) : null}
        </div>
      </div>

      <div className="aviso">
        <strong>Finalização da compra:</strong> antes de pagar, selecione um endereço no carrinho para calcular o frete pelos Correios e então seguir para o pagamento.
      </div>
    </ClientePage>
  )
}
