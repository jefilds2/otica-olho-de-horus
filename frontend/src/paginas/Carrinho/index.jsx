import { CarrinhoPage } from './styles'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { ArrowRight, MapPin, Minus, Plus, RotateCcw, ShieldCheck, Tag, Trash2, Truck } from 'lucide-react'
import { EstadoVazio } from '../../componentes/EstadoVazio'
import { useAuth } from '../../contextos/AuthContext'
import { useCarrinho } from '../../contextos/CarrinhoContext'
import {
  calcularFrete,
  confirmarCheckoutPagamento,
  criarSessaoCheckout,
  listarMeusEnderecos,
  obterMensagemErroUsuario,
  obterImagensProduto,
  validarCupom,
} from '../../servicos/api'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const RETIRADA_LOJA_ID = 'retirada_loja'

export function Carrinho() {
  const { usuario } = useAuth()
  const { itens, total, removerProduto, atualizarQuantidade, limparCarrinho } = useCarrinho()
  const [checkoutCarregando, setCheckoutCarregando] = useState(false)
  const [freteCarregando, setFreteCarregando] = useState(false)
  const [enderecos, setEnderecos] = useState([])
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState('')
  const [opcoesFrete, setOpcoesFrete] = useState([])
  const [freteSelecionadoId, setFreteSelecionadoId] = useState('')
  const [cupomCodigo, setCupomCodigo] = useState('')
  const [cupomAplicado, setCupomAplicado] = useState(null)
  const [cupomCarregando, setCupomCarregando] = useState(false)
  const exibirParcelamento = itens.length > 0 && itens.every((item) => item.installments_enabled !== false)
  const freteSelecionado = opcoesFrete.find((opcao) => opcao.service_id === freteSelecionadoId) || null
  const descontoCupom = Number(cupomAplicado?.discount_amount || 0)
  const totalComFrete = Math.max(0, total + Number(freteSelecionado?.price || 0) - descontoCupom)
  const installmentsCount = exibirParcelamento
    ? Math.max(1, ...itens.map((item) => Number(item.installments_count || 1)))
    : 1
  const assinaturaItens = JSON.stringify(itens.map((item) => ({
    id: item.id,
    quantidade: item.quantidade,
    cor: item.selected_color_name || '',
  })))

  useEffect(() => {
    async function carregarEnderecos() {
      if (!usuario) {
        setEnderecos([])
        setEnderecoSelecionadoId('')
        return
      }

      try {
        const enderecosApi = await listarMeusEnderecos()
        setEnderecos(enderecosApi)
        const params = new URLSearchParams(window.location.search)
        const enderecoQuery = params.get('address')
        const enderecoViaQuery = enderecosApi.find((item) => String(item.id) === String(enderecoQuery || ''))
        const enderecoPadrao = enderecoViaQuery || enderecosApi.find((item) => item.is_default) || enderecosApi[0]
        setEnderecoSelecionadoId(enderecoPadrao ? String(enderecoPadrao.id) : '')
      } catch (error) {
        toast.error(obterMensagemErroUsuario(error))
      }
    }

    carregarEnderecos()
  }, [usuario])

  useEffect(() => {
    let ativo = true
    const params = new URLSearchParams(window.location.search)
    const status = params.get('checkout')
    const paymentId = params.get('payment_id')
    const externalReference = params.get('external_reference')

    if (!status) return () => {}

    async function processarRetornoCheckout() {
      if (['approved', 'pending', 'rejected'].includes(status) && (paymentId || externalReference)) {
        try {
          await confirmarCheckoutPagamento({
            paymentId: paymentId || null,
            externalReference: externalReference || null,
          })
          if (!ativo) return

          if (status === 'approved') {
            limparCarrinho()
            toast.success('Pagamento aprovado com sucesso.')
          } else if (status === 'pending') {
            limparCarrinho()
            toast.info('Pagamento iniciado e aguardando confirmação do Mercado Pago.')
          } else {
            toast.error('Pagamento não foi aprovado. Você pode tentar novamente.')
          }
        } catch (error) {
          if (!ativo) return
          toast.error(obterMensagemErroUsuario(error))
          return
        }
      } else if (status === 'approved') {
        limparCarrinho()
        toast.success('Pagamento aprovado com sucesso.')
      } else if (status === 'pending') {
        limparCarrinho()
        toast.info('Pagamento iniciado e aguardando confirmação do Mercado Pago.')
      } else if (status === 'rejected') {
        toast.info('Pagamento não aprovado. Seus itens continuam no carrinho.')
      }

      params.delete('checkout')
      params.delete('payment_id')
      params.delete('status')
      params.delete('external_reference')
      params.delete('merchant_order_id')
      params.delete('preference_id')
      params.delete('payment_type')
      params.delete('collection_id')
      params.delete('collection_status')
      params.delete('site_id')
      params.delete('processing_mode')
      params.delete('merchant_account_id')
      const query = params.toString()
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
      window.history.replaceState({}, '', nextUrl)
    }

    processarRetornoCheckout()

    return () => {
      ativo = false
    }
  }, [limparCarrinho])

  useEffect(() => {
    setOpcoesFrete([])
    setFreteSelecionadoId('')
  }, [enderecoSelecionadoId, itens])

  useEffect(() => {
    setCupomAplicado(null)
  }, [assinaturaItens])

  async function buscarFrete() {
    if (!enderecoSelecionadoId) {
      toast.info('Selecione um endereço antes de calcular o frete.')
      return
    }

    try {
      setFreteCarregando(true)
      const resposta = await calcularFrete({
        address_id: Number(enderecoSelecionadoId),
        items: itens.map((item) => ({
          id: item.id,
          quantity: item.quantidade,
        })),
      })

      setOpcoesFrete(resposta.quotes || [])
      setFreteSelecionadoId(resposta.quotes?.[0]?.service_id || '')
      const aviso = resposta.quotes?.find((quote) => quote.raw?.warning)?.raw?.warning
      if (aviso) {
        toast.info(aviso)
      } else {
        toast.success('Frete calculado com sucesso.')
      }
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    } finally {
      setFreteCarregando(false)
    }
  }

  async function aplicarCupom() {
    const codigo = cupomCodigo.trim()

    if (!codigo) {
      toast.info('Digite um código de cupom para aplicar.')
      return
    }

    try {
      setCupomCarregando(true)
      const resposta = await validarCupom({
        code: codigo,
        items: itens.map((item) => ({
          id: item.id,
          quantity: item.quantidade,
        })),
      })

      setCupomAplicado(resposta)
      setCupomCodigo(resposta.coupon?.code || codigo.toUpperCase())
      toast.success(`Cupom ${resposta.coupon?.code || codigo.toUpperCase()} aplicado com sucesso.`)
    } catch (error) {
      setCupomAplicado(null)
      toast.error(obterMensagemErroUsuario(error))
    } finally {
      setCupomCarregando(false)
    }
  }

  function removerCupom() {
    setCupomAplicado(null)
    setCupomCodigo('')
  }

  async function finalizarPedido() {
    if (!usuario) {
      toast.info('Faça login para continuar o checkout.')
      return
    }

    if (!enderecoSelecionadoId) {
      toast.info('Selecione um endereço de entrega.')
      return
    }

    if (!freteSelecionadoId) {
      toast.info('Calcule e selecione um frete antes de pagar.')
      return
    }

    try {
      setCheckoutCarregando(true)

      const resposta = await criarSessaoCheckout({
        items: itens.map((item) => ({
          id: item.id,
          quantity: item.quantidade,
          selected_color_name: item.selected_color_name || null,
          selected_color_hex: item.selected_color_hex || null,
        })),
        customerEmail: usuario?.email || null,
        address_id: Number(enderecoSelecionadoId),
        shipping_service_id: freteSelecionadoId,
        coupon_code: cupomAplicado?.coupon?.code || null,
      })

      if (!resposta.url) {
        throw new Error('O gateway de pagamento não retornou a URL de finalização.')
      }

      window.location.assign(resposta.url)
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
      setCheckoutCarregando(false)
    }
  }

  if (itens.length === 0) {
    return (
      <section className="secao">
        <EstadoVazio
          titulo="Seu carrinho está vazio"
          texto="Adicione produtos ao carrinho para continuar comprando."
          acao={<Link className="botao" to="/produtos">Ver produtos <ArrowRight size={16} /></Link>}
        />
      </section>
    )
  }

  return (
    <CarrinhoPage className="secao pagina-carrinho">
      <h1>Carrinho de Compras</h1>

      <div className="carrinho-layout">
        <div className="lista-carrinho">
          {itens.map((item) => {
            const imagemPrincipal = obterImagensProduto(item)[0]

            return (
            <article className="item-carrinho" key={item.cart_key || item.id}>
              <Link className="item-carrinho-imagem" to={`/produto/${item.slug}`}>
                <img src={imagemPrincipal} alt={item.name} />
                {item.old_price && <span>Oferta</span>}
              </Link>

              <div className="item-carrinho-info">
                <div className="item-carrinho-topo">
                  <div>
                    <p>{item.brand}</p>
                    <Link to={`/produto/${item.slug}`}>{item.name}</Link>
                  </div>
                  <button className="botao-remover" onClick={() => removerProduto(item.cart_key || item.id)} aria-label="Remover produto">
                    <Trash2 size={17} />
                  </button>
                </div>

                {item.selected_color_name ? <p>Cor: {item.selected_color_name}</p> : null}

                <div className="item-carrinho-rodape">
                  <div className="controle-quantidade">
                    <button
                      onClick={() => atualizarQuantidade(item.cart_key || item.id, item.quantidade - 1)}
                      disabled={item.quantidade <= 1}
                      aria-label="Diminuir quantidade"
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantidade}</span>
                    <button
                      onClick={() => atualizarQuantidade(item.cart_key || item.id, item.quantidade + 1)}
                      disabled={item.quantidade >= Number(item.stock_quantity)}
                      aria-label="Aumentar quantidade"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="item-carrinho-preco">
                    {item.old_price && <span>{moeda.format(Number(item.old_price) * item.quantidade)}</span>}
                    <strong>{moeda.format(Number(item.price) * item.quantidade)}</strong>
                  </div>
                </div>
              </div>
            </article>
            )
          })}

          <Link className="continuar-comprando" to="/produtos">Continuar comprando</Link>
        </div>

        <aside className="resumo resumo-carrinho">
          <h2>Resumo do Pedido</h2>

          <div className="cupom-box">
            <label>Cupom de desconto</label>
            <div>
              <Tag size={17} />
              <input
                placeholder="Digite o código"
                value={cupomCodigo}
                onChange={(e) => setCupomCodigo(e.target.value.toUpperCase())}
              />
              <button type="button" onClick={aplicarCupom} disabled={cupomCarregando}>
                {cupomCarregando ? 'Aplicando...' : 'Aplicar'}
              </button>
            </div>
            {cupomAplicado ? (
              <div className="cupom-aplicado">
                <div>
                  <strong>{cupomAplicado.coupon?.code}</strong>
                  <span>{cupomAplicado.coupon?.description || 'Cupom aplicado ao pedido.'}</span>
                </div>
                <div className="cupom-aplicado-acoes">
                  <em>- {moeda.format(descontoCupom)}</em>
                  <button type="button" onClick={removerCupom}>Remover</button>
                </div>
              </div>
            ) : (
              <small>Cupons válidos reduzem o subtotal antes do frete.</small>
            )}
          </div>

          <div className="linha-resumo">
            <span>Subtotal</span>
            <strong>{moeda.format(total)}</strong>
          </div>
          {descontoCupom > 0 ? (
            <div className="linha-resumo desconto">
              <span>Desconto</span>
              <strong>- {moeda.format(descontoCupom)}</strong>
            </div>
          ) : null}
          {usuario ? (
            <div className="bloco-frete">
              <div className="bloco-frete-topo">
                <div className="bloco-frete-icone">
                  <Truck size={18} />
                </div>
                <div>
                  <label>Entrega e retirada</label>
                  <small>Escolha um endereço e veja as opções de envio ou retirada gratuita.</small>
                </div>
              </div>
              {enderecos.length > 0 ? (
                <>
                  <select value={enderecoSelecionadoId} onChange={(e) => setEnderecoSelecionadoId(e.target.value)}>
                    {enderecos.map((endereco) => (
                      <option value={endereco.id} key={endereco.id}>
                        {endereco.label} • {endereco.city}/{endereco.state} • {endereco.cep}
                      </option>
                    ))}
                  </select>
                  <button className="botao largura-total secundario-frete" type="button" onClick={buscarFrete} disabled={freteCarregando}>
                    <Truck size={16} />
                    {freteCarregando ? 'Calculando frete...' : 'Calcular frete'}
                  </button>
                </>
              ) : (
                <div className="estado-frete">
                  <p>Nenhum endereço cadastrado para calcular frete.</p>
                  <Link className="botao secundario-frete" to="/cliente">
                    <MapPin size={16} />
                    Cadastrar endereço
                  </Link>
                </div>
              )}

              {opcoesFrete.length > 0 && (
                <div className="opcoes-frete">
                  {opcoesFrete.map((opcao) => (
                    <label className={`opcao-frete ${freteSelecionadoId === opcao.service_id ? 'ativa' : ''}`} key={opcao.service_id}>
                      <input
                        type="radio"
                        name="frete"
                        value={opcao.service_id}
                        checked={freteSelecionadoId === opcao.service_id}
                        onChange={(e) => setFreteSelecionadoId(e.target.value)}
                      />
                      <div>
                        <strong>{opcao.company_name}</strong>
                        <span>{opcao.service_name}</span>
                      </div>
                      <div>
                        <strong>{Number(opcao.price) === 0 ? 'Grátis' : moeda.format(Number(opcao.price))}</strong>
                        <span>{opcao.service_id === RETIRADA_LOJA_ID ? 'Disponível para retirada' : `${opcao.delivery_time} dia(s) úteis`}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="estado-frete">
              <p>Entre na sua conta para escolher o endereço e calcular o frete.</p>
              <Link className="botao secundario-frete" to="/login">Fazer login</Link>
            </div>
          )}
          <div className="linha-resumo">
            <span>Frete</span>
            <strong>{freteSelecionado ? moeda.format(Number(freteSelecionado.price)) : 'A calcular'}</strong>
          </div>
          <div className="linha-resumo total">
            <span>Total</span>
            <strong>{moeda.format(totalComFrete)}</strong>
          </div>
          {exibirParcelamento && <p className="parcelamento">ou {installmentsCount}x de {moeda.format(totalComFrete / installmentsCount)} sem juros</p>}

          <button className="botao largura-total destaque" onClick={finalizarPedido} disabled={checkoutCarregando}>
            {checkoutCarregando ? 'Redirecionando para pagamento...' : 'Finalizar pedido'}
          </button>
          <button className="limpar-carrinho" onClick={limparCarrinho}>
            <Trash2 size={16} />
            Limpar carrinho
          </button>

          <div className="selos-carrinho">
            <p><ShieldCheck size={17} /> Pagamento 100% seguro</p>
            <p><Truck size={17} /> Frete preparado para integração real</p>
            <p><RotateCcw size={17} /> Trocas e devoluções conforme política da loja</p>
          </div>
        </aside>
      </div>
    </CarrinhoPage>
  )
}
