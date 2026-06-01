import { AdminPage } from './styles'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  BarChart3,
  Bell,
  Check,
  Calendar,
  ChevronDown,
  CreditCard,
  Download,
  Eye,
  Filter,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { EstadoVazio } from '../../componentes/EstadoVazio'
import { useAuth } from '../../contextos/AuthContext'
import {
  alternarStatusProduto,
  atualizarCategoria,
  atualizarCupomAdmin,
  comprarEtiquetaMelhorEnvio,
  atualizarPedidoAdmin,
  buscarConfiguracoesLoja,
  cadastrarCupomAdmin,
  desconectarMelhorEnvioAdmin,
  obterUrlAutorizacaoMelhorEnvioAdmin,
  testarMelhorEnvioAdmin,
  atualizarProduto,
  atualizarUsuarioAdmin,
  cadastrarCategoria,
  cadastrarProduto,
  excluirCategoria,
  excluirCupomAdmin,
  excluirUsuarioAdmin,
  listarCategorias,
  listarCuponsAdmin,
  listarPedidosAdmin,
  listarProdutosAdmin,
  listarUsuariosAdmin,
  obterMensagemErroUsuario,
  obterImagensProduto,
  prepararEtiquetaMelhorEnvio,
  resetarProcessoMelhorEnvio,
  gerarEtiquetaMelhorEnvio,
  imprimirEtiquetaMelhorEnvio,
  salvarConfiguracoesLoja,
  sincronizarEtiquetaMelhorEnvio,
  montarUrlImagem,
} from '../../servicos/api'

function slugificar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizarTextoBusca(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const categoriaInicial = { name: '', file: null, previewUrl: '' }

const corDisponivelInicial = { name: '', hex: '#223758' }

function produtoEstaAtivo(produto) {
  return produto?.is_active !== false
}
const CHAVE_NOTIFICACOES_VISUALIZADAS = 'admin.notificacoes.visualizadas'
const CHAVE_NOTIFICACOES_EXCLUIDAS = 'admin.notificacoes.excluidas'
const RECORTE_VIEWPORT = 320
const cropEditorInicial = {
  aberto: false,
  origem: 'produto',
  alvoId: null,
  previewUrl: '',
  fileName: '',
  fileType: 'image/jpeg',
  zoom: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  naturalWidth: 1,
  naturalHeight: 1,
}

function obterResumoPagamento(pedido) {
  const detalhes = pedido?.payment_details
  if (!detalhes) return 'Forma não informada'

  return detalhes.method_label || 'Forma não informada'
}

function obterDetalhesPagamentoSecundarios(pedido, moeda) {
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

function lerListaStorage(chave) {
  if (typeof window === 'undefined') return []

  try {
    const valor = window.localStorage.getItem(chave)
    const lista = valor ? JSON.parse(valor) : []
    return Array.isArray(lista) ? lista.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function somenteDigitos(valor) {
  return String(valor || '').replace(/\D/g, '')
}

function formatarCnpj(valor) {
  const digitos = somenteDigitos(valor).slice(0, 14)

  return digitos
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function extrairCentavos(valor) {
  if (valor === null || valor === undefined || valor === '') return ''
  const numero = Number(valor)
  if (Number.isFinite(numero)) return String(Math.round(numero * 100))
  return somenteDigitos(valor)
}

function extrairMilesimos(valor) {
  if (valor === null || valor === undefined || valor === '') return ''
  const numero = Number(valor)
  if (Number.isFinite(numero)) return String(Math.round(numero * 1000))
  return somenteDigitos(valor)
}

function formatarMoedaCampo(valor) {
  const digitos = extrairCentavos(valor)
  if (!digitos) return ''

  const numero = Number(digitos) / 100
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function normalizarMoedaCampo(valor) {
  const digitos = somenteDigitos(valor)
  if (!digitos) return ''
  return (Number(digitos) / 100).toFixed(2)
}

function normalizarPercentualCampo(valor) {
  const digitos = somenteDigitos(valor)
  if (!digitos) return ''
  return String(Math.min(Number(digitos), 100))
}

function normalizarPrecificacaoProduto({ price, old_price, discount_percentage }) {
  const precoAtual = normalizarMoedaCampo(price)
  const precoBase = normalizarMoedaCampo(old_price)
  const desconto = normalizarPercentualCampo(discount_percentage)

  if (!precoBase || Number(precoBase) <= 0) {
    return {
      price: precoAtual,
      old_price: '',
      discount_percentage: '',
    }
  }

  if (!precoAtual || Number(precoAtual) <= 0) {
    return {
      price: precoAtual,
      old_price: precoBase,
      discount_percentage: desconto,
    }
  }

  if (Number(precoBase) <= Number(precoAtual)) {
    return {
      price: precoAtual,
      old_price: '',
      discount_percentage: '',
    }
  }

  const descontoCalculado = desconto || calcularDescontoPorPrecos(formatarMoedaCampo(precoBase), formatarMoedaCampo(precoAtual))

  return {
    price: precoAtual,
    old_price: precoBase,
    discount_percentage: descontoCalculado === '0' ? '' : descontoCalculado,
  }
}

function formatarPesoCampo(valor) {
  const digitos = extrairMilesimos(valor)
  if (!digitos) return ''

  const preenchido = digitos.padStart(4, '0')
  const inteiro = preenchido.slice(0, -3).replace(/^0+(?=\d)/, '') || '0'
  const decimal = preenchido.slice(-3)
  return `${inteiro},${decimal} kg`
}

function normalizarPesoCampo(valor) {
  const digitos = somenteDigitos(valor)
  if (!digitos) return ''

  const preenchido = digitos.padStart(4, '0')
  const inteiro = preenchido.slice(0, -3).replace(/^0+(?=\d)/, '') || '0'
  const decimal = preenchido.slice(-3)
  return `${inteiro}.${decimal}`
}

function limitarPercentualCampo(valor) {
  const digitos = somenteDigitos(valor)
  if (!digitos) return ''
  return String(Math.min(Number(digitos), 100))
}

function calcularPrecoComDesconto(precoBase, desconto) {
  const base = Number(normalizarMoedaCampo(precoBase))
  const percentual = Number(normalizarPercentualCampo(desconto))

  if (!Number.isFinite(base) || base <= 0) return ''
  if (!Number.isFinite(percentual) || percentual <= 0) return formatarMoedaCampo(base)

  return formatarMoedaCampo(base * (1 - percentual / 100))
}

function calcularDescontoPorPrecos(precoBase, precoAtual) {
  const base = Number(normalizarMoedaCampo(precoBase))
  const atual = Number(normalizarMoedaCampo(precoAtual))

  if (!Number.isFinite(base) || base <= 0) return ''
  if (!Number.isFinite(atual) || atual <= 0) return ''
  if (atual >= base) return '0'

  return String(Math.min(100, Math.max(0, Math.round(((base - atual) / base) * 100))))
}

function parseImagePathsProduto(produto) {
  if (!produto) return []

  try {
    const parsed = typeof produto.image_paths === 'string'
      ? JSON.parse(produto.image_paths)
      : produto.image_paths

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter(Boolean).slice(0, 3)
    }
  } catch {
    return produto.path ? [produto.path] : []
  }

  return produto.path ? [produto.path] : []
}

function criarArquivoPreview(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

function obterEscalaCover(largura, altura, viewport = RECORTE_VIEWPORT) {
  return Math.max(viewport / Math.max(largura, 1), viewport / Math.max(altura, 1))
}

function normalizarRotacaoRecorte(rotacao) {
  const numero = Number(rotacao) || 0
  return ((numero % 360) + 360) % 360
}

function obterDimensoesRotacionadas(largura, altura, rotacao = 0) {
  const rotacaoNormalizada = normalizarRotacaoRecorte(rotacao)

  if (rotacaoNormalizada === 90 || rotacaoNormalizada === 270) {
    return {
      largura: Math.max(altura, 1),
      altura: Math.max(largura, 1),
    }
  }

  return {
    largura: Math.max(largura, 1),
    altura: Math.max(altura, 1),
  }
}

function obterZoomMinimoRecorte(largura, altura, viewport = RECORTE_VIEWPORT) {
  const larguraSegura = Math.max(largura, 1)
  const alturaSegura = Math.max(altura, 1)
  const escalaCover = obterEscalaCover(larguraSegura, alturaSegura, viewport)
  const escalaContain = Math.min(viewport / larguraSegura, viewport / alturaSegura)

  if (!Number.isFinite(escalaCover) || escalaCover <= 0) return 1

  return Math.min(1, Math.max(0.15, escalaContain / escalaCover))
}

function obterDimensoesPreviewRecorte(largura, altura, zoom = 1, rotation = 0) {
  const dimensoesRotacionadas = obterDimensoesRotacionadas(largura, altura, rotation)
  const escalaBase = obterEscalaCover(dimensoesRotacionadas.largura, dimensoesRotacionadas.altura)

  return {
    larguraBase: dimensoesRotacionadas.largura * escalaBase,
    alturaBase: dimensoesRotacionadas.altura * escalaBase,
    larguraFinal: dimensoesRotacionadas.largura * escalaBase * zoom,
    alturaFinal: dimensoesRotacionadas.altura * escalaBase * zoom,
    larguraImagem: largura * escalaBase * zoom,
    alturaImagem: altura * escalaBase * zoom,
  }
}

function limitarOffsetRecorte(offset, larguraNatural, alturaNatural, zoom, eixo, rotation = 0) {
  const { larguraFinal, alturaFinal } = obterDimensoesPreviewRecorte(
    larguraNatural,
    alturaNatural,
    zoom,
    rotation,
  )
  const larguraExibida = larguraFinal
  const alturaExibida = alturaFinal
  const tamanhoExibido = eixo === 'x' ? larguraExibida : alturaExibida
  const excesso = Math.max(0, (tamanhoExibido - RECORTE_VIEWPORT) / 2)

  return Math.min(excesso, Math.max(-excesso, offset))
}

function ajustarEstadoRecorte(estado, atualizacoes = {}) {
  const proximo = { ...estado, ...atualizacoes }
  const rotation = normalizarRotacaoRecorte(proximo.rotation)
  const dimensoesRotacionadas = obterDimensoesRotacionadas(
    proximo.naturalWidth,
    proximo.naturalHeight,
    rotation,
  )
  const zoomMinimo = obterZoomMinimoRecorte(dimensoesRotacionadas.largura, dimensoesRotacionadas.altura)
  const zoomMaximo = 3
  const zoomAjustado = Math.min(zoomMaximo, Math.max(zoomMinimo, Number(proximo.zoom) || 1))

  return {
    ...proximo,
    rotation,
    zoom: zoomAjustado,
    offsetX: limitarOffsetRecorte(
      proximo.offsetX,
      proximo.naturalWidth,
      proximo.naturalHeight,
      zoomAjustado,
      'x',
      rotation,
    ),
    offsetY: limitarOffsetRecorte(
      proximo.offsetY,
      proximo.naturalWidth,
      proximo.naturalHeight,
      zoomAjustado,
      'y',
      rotation,
    ),
  }
}

async function carregarImagem(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Não foi possível abrir a imagem para recorte.'))
    image.src = url
  })
}

async function gerarArquivoRecortado({
  previewUrl,
  fileName,
  fileType,
  zoom,
  rotation,
  offsetX,
  offsetY,
}) {
  const imagem = await carregarImagem(previewUrl)
  const canvas = document.createElement('canvas')
  const tamanhoSaida = 800
  const tipoSaida = 'image/png'
  const dimensoesRotacionadas = obterDimensoesRotacionadas(imagem.naturalWidth, imagem.naturalHeight, rotation)
  const escalaBase = obterEscalaCover(dimensoesRotacionadas.largura, dimensoesRotacionadas.altura, tamanhoSaida)
  const escalaFinal = escalaBase * zoom
  const largura = imagem.naturalWidth * escalaFinal
  const altura = imagem.naturalHeight * escalaFinal
  const proporcao = tamanhoSaida / RECORTE_VIEWPORT
  const rotacaoRad = (normalizarRotacaoRecorte(rotation) * Math.PI) / 180

  canvas.width = tamanhoSaida
  canvas.height = tamanhoSaida

  const contexto = canvas.getContext('2d')
  contexto.imageSmoothingEnabled = true
  contexto.imageSmoothingQuality = 'high'
  contexto.clearRect(0, 0, tamanhoSaida, tamanhoSaida)
  contexto.save()
  contexto.translate(
    (tamanhoSaida / 2) + (offsetX * proporcao),
    (tamanhoSaida / 2) + (offsetY * proporcao),
  )
  contexto.rotate(rotacaoRad)
  contexto.drawImage(imagem, -largura / 2, -altura / 2, largura, altura)
  contexto.restore()

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((resultado) => {
      if (resultado) {
        resolve(resultado)
        return
      }

      reject(new Error('Não foi possível gerar a imagem recortada.'))
    }, tipoSaida, 0.92)
  })

  const nomeBase = String(fileName || 'imagem-recortada').replace(/\.[^.]+$/, '')
  return new File([blob], `${nomeBase}.png`, { type: tipoSaida, lastModified: Date.now() })
}

function criarProdutoInicial(configuracoes = {}) {
  const defaultWeight = configuracoes.default_package_weight !== ''
    && configuracoes.default_package_weight != null
    ? String(configuracoes.default_package_weight)
    : '0.400'

  const defaultWidth = configuracoes.default_package_width !== ''
    && configuracoes.default_package_width != null
    ? String(configuracoes.default_package_width)
    : '16'

  const defaultHeight = configuracoes.default_package_height !== ''
    && configuracoes.default_package_height != null
    ? String(configuracoes.default_package_height)
    : '6'

  const defaultLength = configuracoes.default_package_length !== ''
    && configuracoes.default_package_length != null
    ? String(configuracoes.default_package_length)
    : '18'

  return {
    name: '',
    description: '',
    brand: '',
    color: '',
    available_colors: [corDisponivelInicial],
    price: '',
    old_price: '',
    discount_percentage: '',
    stock_quantity: '',
    category_id: '',
    installments_enabled: true,
    installments_count: 10,
    weight: formatarPesoCampo(defaultWeight),
    width: defaultWidth,
    height: defaultHeight,
    length: defaultLength,
    frame_material: '',
    size_label: 'Médio',
    lens_width_mm: '52',
    bridge_mm: '18',
    temple_length_mm: '145',
    gender: 'Unissex',
    existing_images: [],
    files: [],
  }
}

const cupomInicial = {
  code: '',
  description: '',
  type: 'percentage',
  value: '',
  min_order_amount: '',
  usage_limit: '',
  starts_at: '',
  expires_at: '',
  is_active: true,
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const statusPedidoMap = {
  aguardando_pagamento: { label: 'Aguardando pagamento', className: 'badge' },
  processando: { label: 'Processando', className: 'badge' },
  pago: { label: 'Pago', className: 'badge sucesso' },
  expirado: { label: 'Expirado', className: 'badge perigo' },
  cancelado: { label: 'Cancelado', className: 'badge perigo' },
}

const statusEnvioOptions = [
  { value: 'em_preparacao', label: 'Em preparação' },
  { value: 'em_transporte', label: 'Em transporte' },
  { value: 'entregue', label: 'Entregue' },
]

const statusEnvioMap = {
  em_preparacao: { label: 'Em preparação', className: 'badge alerta' },
  em_transporte: { label: 'Em transporte', className: 'badge' },
  entregue: { label: 'Entregue', className: 'badge sucesso' },
}

const statusComercialMap = {
  pedido_realizado: { label: 'Pedido realizado', className: 'badge' },
  pagamento_confirmado: { label: 'Pagamento confirmado', className: 'badge sucesso' },
  em_preparacao: { label: 'Em preparação', className: 'badge alerta' },
  em_transporte: { label: 'Em transporte', className: 'badge' },
  entregue: { label: 'Entregue', className: 'badge sucesso' },
  cancelado: { label: 'Cancelado', className: 'badge perigo' },
}

const servicosEntregaAdmin = [
  { value: '1', label: 'PAC', company: 'Correios' },
  { value: '2', label: 'SEDEX', company: 'Correios' },
  { value: 'retirada_loja', label: 'Retirar na loja', company: 'Ótica Olho de Hórus' },
]

function pedidoEhRetiradaLoja(pedidoOuForm = {}) {
  return String(pedidoOuForm?.shipping_service_id || '') === 'retirada_loja'
    || String(pedidoOuForm?.shipping_service_name || '').toLowerCase().includes('retirar na loja')
}

function obterStatusComercialPedido(pedido) {
  return statusComercialMap[pedido?.customer_stage] || { label: pedido?.customer_stage_label || 'Pedido realizado', className: 'badge' }
}

function obterClasseFluxoMelhorEnvio({ enabled, completed, keepEnabledWhenCompleted = false }) {
  if (completed && !keepEnabledWhenCompleted) return 'concluida'
  if (completed && keepEnabledWhenCompleted) return 'disponivel concluida-permissiva'
  if (enabled) return 'disponivel'
  return 'bloqueada'
}

function normalizarStatusMelhorEnvio(status) {
  return String(status || '').trim().toLowerCase()
}

function pedidoTemCheckoutMelhorEnvio(pedido) {
  const payload = pedido?.melhor_envio_payload || {}
  const status = normalizarStatusMelhorEnvio(pedido?.melhor_envio_status)
  const purchaseStatus = String(payload.checkout?.response?.purchase?.status || '').trim().toLowerCase()

  return Boolean(
    purchaseStatus === 'paid'
    || ['paid', 'released', 'generated', 'posted', 'shipped', 'in_transit', 'transporting', 'delivered'].includes(status)
  )
}

function pedidoTemEtiquetaGeradaMelhorEnvio(pedido) {
  const payload = pedido?.melhor_envio_payload || {}
  const status = normalizarStatusMelhorEnvio(pedido?.melhor_envio_status)
  const orderId = pedido?.melhor_envio_order_id
  const response = orderId && payload.generate?.response?.[orderId]
    ? payload.generate.response[orderId]
    : payload.generate?.response
  const responseStatus = response?.status

  return Boolean(
    responseStatus === true
    || ['generated', 'posted', 'shipped', 'in_transit', 'transporting', 'delivered'].includes(status)
  )
}

const filtrosVendasPeriodo = [
  { value: '1d', label: 'Último dia', days: 1 },
  { value: '7d', label: 'Semana', days: 7 },
  { value: '30d', label: '30 dias', days: 30 },
  { value: '90d', label: '90 dias', days: 90 },
]

function normalizarConfigLojaForm(configuracoes = {}) {
  return {
    store_name: configuracoes.store_name || 'Ótica Olho de Hórus',
    cnpj: formatarCnpj(configuracoes.cnpj || ''),
    contact_email: configuracoes.contact_email || '',
    contact_phone: configuracoes.contact_phone || '',
    shipping_origin_postal_code: configuracoes.shipping_origin_postal_code || '',
    shipping_origin_address: configuracoes.shipping_origin_address || '',
    shipping_origin_number: configuracoes.shipping_origin_number || '',
    shipping_origin_district: configuracoes.shipping_origin_district || '',
    shipping_origin_city: configuracoes.shipping_origin_city || '',
    shipping_origin_state: configuracoes.shipping_origin_state || '',
    default_package_weight: configuracoes.default_package_weight == null ? '' : String(configuracoes.default_package_weight),
    default_package_width: configuracoes.default_package_width == null ? '' : String(configuracoes.default_package_width),
    default_package_height: configuracoes.default_package_height == null ? '' : String(configuracoes.default_package_height),
    default_package_length: configuracoes.default_package_length == null ? '' : String(configuracoes.default_package_length),
    free_shipping_enabled: Boolean(configuracoes.free_shipping_enabled),
    free_shipping_min_amount: configuracoes.free_shipping_min_amount == null ? '' : String(configuracoes.free_shipping_min_amount),
    warranty_months: configuracoes.warranty_months == null ? '' : String(configuracoes.warranty_months),
    return_days: configuracoes.return_days == null ? '' : String(configuracoes.return_days),
    melhor_envio_enabled: Boolean(configuracoes.melhor_envio_enabled),
    melhor_envio_sandbox: configuracoes.melhor_envio_sandbox !== false,
    melhor_envio_token: configuracoes.melhor_envio_token || '',
    melhor_envio_token_configured: Boolean(configuracoes.melhor_envio_token_configured),
    melhor_envio_app_name: configuracoes.melhor_envio_app_name || '',
    melhor_envio_technical_email: configuracoes.melhor_envio_technical_email || '',
    melhor_envio_agency: configuracoes.melhor_envio_agency == null ? '' : String(configuracoes.melhor_envio_agency),
    melhor_envio_client_id: configuracoes.melhor_envio_client_id || '',
    melhor_envio_client_secret: configuracoes.melhor_envio_client_secret || '',
    melhor_envio_client_secret_configured: Boolean(configuracoes.melhor_envio_client_secret_configured),
    melhor_envio_public_url: configuracoes.melhor_envio_public_url || '',
  }
}

function parseAvailableColors(value, fallbackColor = [corDisponivelInicial]) {
  if (!value) return fallbackColor

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    return fallbackColor
  }

  return fallbackColor
}

function formatarTelefoneExportacao(valor) {
  const digitos = String(valor || '').replace(/\D/g, '')
  if (!digitos) return ''
  return digitos
}

function formatarMoedaExportacao(valor) {
  return moeda.format(Number(valor || 0))
}

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function aplicarFallbackImagem(evento) {
  if (evento.currentTarget.dataset.fallbackApplied === 'true') return
  evento.currentTarget.dataset.fallbackApplied = 'true'
  evento.currentTarget.src = '/logo-icone-olho.png'
}

function formatarDataHoraLocal(valor) {
  if (!valor) return ''

  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''

  const pad = (numero) => String(numero).padStart(2, '0')
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}`
}

export function Admin() {
  const { usuario, sair } = useAuth()
  const [abaAtiva, setAbaAtiva] = useState('dashboard')
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false)
  const [notificacoesVisualizadas, setNotificacoesVisualizadas] = useState(() => lerListaStorage(CHAVE_NOTIFICACOES_VISUALIZADAS))
  const [notificacoesExcluidas, setNotificacoesExcluidas] = useState(() => lerListaStorage(CHAVE_NOTIFICACOES_EXCLUIDAS))
  const [buscaProduto, setBuscaProduto] = useState('')
  const [buscaUsuario, setBuscaUsuario] = useState('')
  const [buscaPedido, setBuscaPedido] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroEstoque, setFiltroEstoque] = useState('todos')
  const [filtroPedidoStatus, setFiltroPedidoStatus] = useState('todos')
  const [filtroPedidoDataInicio, setFiltroPedidoDataInicio] = useState('')
  const [filtroPedidoDataFim, setFiltroPedidoDataFim] = useState('')
  const [filtroDatasAberto, setFiltroDatasAberto] = useState(false)
  const [filtroVendasPeriodo, setFiltroVendasPeriodo] = useState('30d')
  const [filtroRelatorioPeriodo, setFiltroRelatorioPeriodo] = useState('30d')
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [cupons, setCupons] = useState([])
  const [categoriaForm, setCategoriaForm] = useState(categoriaInicial)
  const [produtoForm, setProdutoForm] = useState(() => criarProdutoInicial())
  const [cupomForm, setCupomForm] = useState(cupomInicial)
  const [categoriaEditandoId, setCategoriaEditandoId] = useState(null)
  const [produtoEditandoId, setProdutoEditandoId] = useState(null)
  const [cupomEditandoId, setCupomEditandoId] = useState(null)
  const [estoqueEditandoId, setEstoqueEditandoId] = useState(null)
  const [estoqueRapidoValor, setEstoqueRapidoValor] = useState('')
  const [origemPrecificacao, setOrigemPrecificacao] = useState('desconto')
  const [formCategoriaAberto, setFormCategoriaAberto] = useState(false)
  const [formProdutoAberto, setFormProdutoAberto] = useState(false)
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null)
  const [pedidoEditandoId, setPedidoEditandoId] = useState(null)
  const [pedidoDetalheAbertoId, setPedidoDetalheAbertoId] = useState(null)
  const [menuContaAberto, setMenuContaAberto] = useState(false)
  const [configMelhorEnvioAberto, setConfigMelhorEnvioAberto] = useState(false)
  const [cropEditor, setCropEditor] = useState(cropEditorInicial)
  const [configLojaForm, setConfigLojaForm] = useState({
    store_name: 'Ótica Olho de Hórus',
    cnpj: '',
    contact_email: '',
    contact_phone: '',
    shipping_origin_postal_code: '',
    shipping_origin_address: '',
    shipping_origin_number: '',
    shipping_origin_district: '',
    shipping_origin_city: '',
    shipping_origin_state: '',
    default_package_weight: '',
    default_package_width: '',
    default_package_height: '',
    default_package_length: '',
    free_shipping_enabled: false,
    free_shipping_min_amount: '',
    warranty_months: '',
    return_days: '',
    melhor_envio_enabled: false,
    melhor_envio_sandbox: true,
    melhor_envio_token: '',
    melhor_envio_app_name: '',
    melhor_envio_technical_email: '',
    melhor_envio_agency: '',
    melhor_envio_client_id: '',
    melhor_envio_client_secret: '',
    melhor_envio_public_url: '',
  })
  const [testeMelhorEnvioResumo, setTesteMelhorEnvioResumo] = useState(null)
  const [usuarioForm, setUsuarioForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    whatsapp: '',
    city: '',
    state: '',
    admin: false,
    is_active: true,
  })
  const [pedidoForm, setPedidoForm] = useState({
    status: 'pago',
    shipping_service_id: '1',
    shipping_service_name: 'PAC',
    shipping_company_name: 'Correios',
    tracking_code: '',
    tracking_url: '',
    fulfillment_status: 'em_preparacao',
    recipient_name: '',
    recipient_phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    reference: '',
  })
  const notificacoesRef = useRef(null)
  const menuContaRef = useRef(null)
  const filtroDataInicioRef = useRef(null)
  const filtroDataFimRef = useRef(null)
  const dragRecorteRef = useRef(null)

  const podeAdministrar = Boolean(usuario?.admin)

  async function carregarPedidos() {
    const pedidosApi = await listarPedidosAdmin()
    setPedidos(pedidosApi)
    return pedidosApi
  }

  async function carregarDados() {
    try {
      const [produtosApi, categoriasApi, usuariosApi, pedidosApi, cuponsApi] = await Promise.all([
        listarProdutosAdmin(),
        listarCategorias(),
        listarUsuariosAdmin(),
        carregarPedidos(),
        listarCuponsAdmin(),
      ])
      setProdutos(produtosApi)
      setCategorias(categoriasApi)
      setUsuarios(usuariosApi)
      setCupons(cuponsApi)
      const configuracoes = await buscarConfiguracoesLoja()
      setConfigLojaForm(normalizarConfigLojaForm(configuracoes))
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('melhor_envio')
    const motivo = params.get('motivo')
    const aba = params.get('aba')

    if (aba === 'configuracoes') {
      setAbaAtiva('configuracoes')
    }

    if (status === 'conectado') {
      toast.success('Conta do Melhor Envio conectada com sucesso.')
      params.delete('melhor_envio')
      params.delete('motivo')
      params.delete('aba')
      const queryString = params.toString()
      window.history.replaceState({}, '', `${window.location.pathname}${queryString ? `?${queryString}` : ''}`)
      carregarDados()
    }

    if (status === 'erro') {
      toast.error(`Falha ao conectar Melhor Envio: ${obterMensagemErroUsuario(motivo || 'erro desconhecido')}`)
      params.delete('melhor_envio')
      params.delete('motivo')
      params.delete('aba')
      const queryString = params.toString()
      window.history.replaceState({}, '', `${window.location.pathname}${queryString ? `?${queryString}` : ''}`)
    }
  }, [])

  useEffect(() => {
    function fecharAoClicarFora(evento) {
      if (!notificacoesRef.current?.contains(evento.target)) {
        setNotificacoesAbertas(false)
      }

      if (!menuContaRef.current?.contains(evento.target)) {
        setMenuContaAberto(false)
      }
    }

    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

  useEffect(() => {
    if (!cropEditor.aberto) return undefined

    function moverRecorte(evento) {
      if (!dragRecorteRef.current) return
      if (evento.buttons === 0) {
        dragRecorteRef.current = null
        return
      }

      const { startX, startY, initialOffsetX, initialOffsetY } = dragRecorteRef.current

      setCropEditor((atual) => ajustarEstadoRecorte(atual, {
        offsetX: initialOffsetX + (evento.clientX - startX),
        offsetY: initialOffsetY + (evento.clientY - startY),
      }))
    }

    function finalizarRecorte() {
      dragRecorteRef.current = null
    }

    window.addEventListener('mousemove', moverRecorte)
    window.addEventListener('mouseup', finalizarRecorte)

    return () => {
      window.removeEventListener('mousemove', moverRecorte)
      window.removeEventListener('mouseup', finalizarRecorte)
    }
  }, [cropEditor.aberto])

  useEffect(() => {
    window.localStorage.setItem(CHAVE_NOTIFICACOES_VISUALIZADAS, JSON.stringify(notificacoesVisualizadas))
  }, [notificacoesVisualizadas])

  useEffect(() => {
    window.localStorage.setItem(CHAVE_NOTIFICACOES_EXCLUIDAS, JSON.stringify(notificacoesExcluidas))
  }, [notificacoesExcluidas])

  function limparArquivoCategoriaTemporario(formulario = categoriaForm) {
    if (formulario?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(formulario.previewUrl)
    }
  }

  function fecharEditorRecorte() {
    dragRecorteRef.current = null
    setCropEditor(cropEditorInicial)
  }

  function iniciarArrasteRecorte(evento) {
    if (evento.button !== 0) return

    evento.preventDefault()
    dragRecorteRef.current = {
      startX: evento.clientX,
      startY: evento.clientY,
      initialOffsetX: cropEditor.offsetX,
      initialOffsetY: cropEditor.offsetY,
    }
  }

  function atualizarZoomRecorte(valor) {
    setCropEditor((atual) => ajustarEstadoRecorte(atual, {
      zoom: Number(valor),
    }))
  }

  function rotacionarRecorte(delta) {
    setCropEditor((atual) => ajustarEstadoRecorte(atual, {
      rotation: atual.rotation + delta,
    }))
  }

  function registrarDimensoesRecorte(evento) {
    const { naturalWidth, naturalHeight } = evento.currentTarget

    setCropEditor((atual) => ajustarEstadoRecorte(atual, {
      naturalWidth,
      naturalHeight,
    }))
  }

  function abrirEditorRecorteProduto(item) {
    setCropEditor({
      ...cropEditorInicial,
      aberto: true,
      origem: 'produto',
      alvoId: item.id,
      previewUrl: item.previewUrl,
      fileName: item.file.name,
      fileType: item.file.type || 'image/jpeg',
    })
  }

  function abrirEditorRecorteCategoria() {
    if (!categoriaForm.file || !categoriaForm.previewUrl) return

    setCropEditor({
      ...cropEditorInicial,
      aberto: true,
      origem: 'categoria',
      previewUrl: categoriaForm.previewUrl,
      fileName: categoriaForm.file.name,
      fileType: categoriaForm.file.type || 'image/jpeg',
    })
  }

  async function aplicarRecorteAtual() {
    try {
      const arquivoRecortado = await gerarArquivoRecortado({
        previewUrl: cropEditor.previewUrl,
        fileName: cropEditor.fileName,
        fileType: cropEditor.fileType,
        zoom: cropEditor.zoom,
        rotation: cropEditor.rotation,
        offsetX: cropEditor.offsetX,
        offsetY: cropEditor.offsetY,
      })
      const novoPreviewUrl = URL.createObjectURL(arquivoRecortado)

      if (cropEditor.origem === 'produto') {
        setProdutoForm((atual) => ({
          ...atual,
          files: atual.files.map((item) => {
            if (item.id !== cropEditor.alvoId) return item

            URL.revokeObjectURL(item.previewUrl)
            return {
              ...item,
              file: arquivoRecortado,
              previewUrl: novoPreviewUrl,
            }
          }),
        }))
      } else {
        setCategoriaForm((atual) => {
          limparArquivoCategoriaTemporario(atual)
          return {
            ...atual,
            file: arquivoRecortado,
            previewUrl: novoPreviewUrl,
          }
        })
      }

      toast.success('Recorte aplicado com sucesso.')
      fecharEditorRecorte()
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error, 'Não foi possível aplicar o recorte.'))
    }
  }

  const resumo = useMemo(() => ({
    produtos: produtos.length,
    categorias: categorias.length,
    estoqueBaixo: produtos.filter((produto) => produtoEstaAtivo(produto) && Number(produto.stock_quantity) <= 3).length,
    produtosEmPromocao: produtos.filter((produto) => produto.old_price).length,
    pedidos: pedidos.length,
    pedidosPagos: pedidos.filter((pedido) => pedido.status === 'pago').length,
    receita: pedidos
      .filter((pedido) => pedido.status === 'pago')
      .reduce((total, pedido) => total + Number(pedido.total_amount || 0), 0),
  }), [produtos, categorias, pedidos])

  const pedidosRecentes = useMemo(() => pedidos.slice(0, 5), [pedidos])

  const statusPedidos = useMemo(() => ({
    total: pedidos.length,
    pendentes: pedidos.filter((pedido) => pedido.status === 'aguardando_pagamento').length,
    processando: pedidos.filter((pedido) => pedido.status === 'processando').length,
    pagos: pedidos.filter((pedido) => pedido.status === 'pago').length,
    expirados: pedidos.filter((pedido) => pedido.status === 'expirado').length,
  }), [pedidos])

  const notificacoesAdmin = useMemo(() => {
    const pendentes = pedidos.filter((pedido) => pedido.status === 'aguardando_pagamento')
    const processando = pedidos.filter((pedido) => pedido.status === 'processando')
    const estoqueCritico = produtos.filter((produto) => produtoEstaAtivo(produto) && Number(produto.stock_quantity || 0) <= 3)

    const notificacoes = []

    if (pendentes.length > 0) {
      notificacoes.push({
        id: 'pedidos-pendentes',
        assinatura: `pedidos-pendentes:${pendentes.length}`,
        tipo: 'alerta',
        titulo: `${pendentes.length} pedido${pendentes.length > 1 ? 's' : ''} aguardando pagamento`,
        descricao: 'Revise a lista de pedidos para acompanhar cobranças ainda não concluídas.',
        aba: 'pedidos',
      })
    }

    if (processando.length > 0) {
      notificacoes.push({
        id: 'pedidos-processando',
        assinatura: `pedidos-processando:${processando.length}`,
        tipo: 'info',
        titulo: `${processando.length} pedido${processando.length > 1 ? 's' : ''} em processamento`,
        descricao: 'Há pedidos pagos que ainda precisam de conferência ou expedição.',
        aba: 'pedidos',
      })
    }

    if (estoqueCritico.length > 0) {
      const destaque = estoqueCritico
        .slice(0, 2)
        .map((produto) => produto.name)
        .join(', ')

      notificacoes.push({
        id: 'estoque-critico',
        assinatura: `estoque-critico:${estoqueCritico.length}:${destaque}`,
        tipo: 'alerta',
        titulo: `${estoqueCritico.length} produto${estoqueCritico.length > 1 ? 's' : ''} com estoque critico`,
        descricao: destaque
          ? `Itens mais urgentes: ${destaque}${estoqueCritico.length > 2 ? '...' : ''}.`
          : 'Revise os produtos com quantidade muito baixa em estoque.',
        aba: 'produtos',
      })
    }

    return notificacoes
  }, [pedidos, produtos])

  const assinaturasAtivasNotificacoes = useMemo(
    () => notificacoesAdmin.map((notificacao) => notificacao.assinatura),
    [notificacoesAdmin],
  )

  useEffect(() => {
    setNotificacoesVisualizadas((atual) => atual.filter((assinatura) => assinaturasAtivasNotificacoes.includes(assinatura)))
    setNotificacoesExcluidas((atual) => atual.filter((assinatura) => assinaturasAtivasNotificacoes.includes(assinatura)))
  }, [assinaturasAtivasNotificacoes])

  const notificacoesVisiveis = useMemo(
    () => notificacoesAdmin.filter((notificacao) => !notificacoesVisualizadas.includes(notificacao.assinatura) && !notificacoesExcluidas.includes(notificacao.assinatura)),
    [notificacoesAdmin, notificacoesExcluidas, notificacoesVisualizadas],
  )

  function marcarNotificacaoComoVisualizada(assinatura) {
    if (!assinatura) return
    setNotificacoesVisualizadas((atual) => (atual.includes(assinatura) ? atual : [...atual, assinatura]))
  }

  function excluirNotificacao(assinatura) {
    if (!assinatura) return
    setNotificacoesExcluidas((atual) => (atual.includes(assinatura) ? atual : [...atual, assinatura]))
  }

  const vendasDashboard = useMemo(() => {
    const filtroSelecionado = filtrosVendasPeriodo.find((item) => item.value === filtroVendasPeriodo) || filtrosVendasPeriodo[2]
    const hoje = new Date()
    hoje.setHours(23, 59, 59, 999)

    const inicioPeriodo = new Date(hoje)
    inicioPeriodo.setHours(0, 0, 0, 0)
    inicioPeriodo.setDate(inicioPeriodo.getDate() - (filtroSelecionado.days - 1))

    const dias = Array.from({ length: filtroSelecionado.days }, (_, indice) => {
      const data = new Date(inicioPeriodo)
      data.setDate(inicioPeriodo.getDate() + indice)
      return {
        key: data.toISOString().slice(0, 10),
        label: data.toLocaleDateString('pt-BR', filtroSelecionado.days <= 7
          ? { weekday: 'short' }
          : { day: '2-digit', month: '2-digit' }),
        fullLabel: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        total: 0,
        pedidos: 0,
      }
    })

    const mapaDias = new Map(dias.map((dia) => [dia.key, dia]))

    const pedidosPagosPeriodo = pedidos.filter((pedido) => {
      if (pedido.status !== 'pago' || !pedido.paid_at) return false
      const dataPedido = new Date(pedido.paid_at)
      return dataPedido >= inicioPeriodo && dataPedido <= hoje
    })

    pedidosPagosPeriodo.forEach((pedido) => {
      const chave = new Date(pedido.paid_at).toISOString().slice(0, 10)
      const dia = mapaDias.get(chave)
      if (!dia) return
      dia.total += Number(pedido.total_amount || 0)
      dia.pedidos += 1
    })

    const maioresVendas = Math.max(...dias.map((dia) => dia.total), 0)
    const totalPeriodo = dias.reduce((soma, dia) => soma + dia.total, 0)
    const totalPedidos = dias.reduce((soma, dia) => soma + dia.pedidos, 0)

    return {
      filtroSelecionado,
      dias,
      totalPeriodo,
      totalPedidos,
      ticketMedio: totalPedidos > 0 ? totalPeriodo / totalPedidos : 0,
      maioresVendas,
    }
  }, [pedidos, filtroVendasPeriodo])

  const categoriasDashboard = useMemo(() => {
    const linhas = categorias.map((categoria) => {
      const total = produtos.filter((produto) => produto.category_id === categoria.id).length
      return {
        id: categoria.id,
        nome: categoria.name,
        total,
      }
    })

    const maior = Math.max(...linhas.map((item) => item.total), 0)
    const totalGeral = linhas.reduce((acc, item) => acc + item.total, 0)

    return linhas
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
      .map((item, index) => ({
        ...item,
        percentual: totalGeral > 0 ? Math.round((item.total / totalGeral) * 100) : 0,
        largura: maior > 0 ? Math.max(14, Math.round((item.total / maior) * 100)) : 0,
        posicao: index + 1,
      }))
  }, [categorias, produtos])

  const relatorioPeriodo = useMemo(() => {
    const filtroSelecionado = filtrosVendasPeriodo.find((item) => item.value === filtroRelatorioPeriodo) || filtrosVendasPeriodo[2]
    const hoje = new Date()
    hoje.setHours(23, 59, 59, 999)

    const inicioPeriodo = new Date(hoje)
    inicioPeriodo.setHours(0, 0, 0, 0)
    inicioPeriodo.setDate(inicioPeriodo.getDate() - (filtroSelecionado.days - 1))

    const pedidosPagos = pedidos.filter((pedido) => {
      if (pedido.status !== 'pago' || !pedido.paid_at) return false
      const dataPedido = new Date(pedido.paid_at)
      return dataPedido >= inicioPeriodo && dataPedido <= hoje
    })

    const serie = Array.from({ length: filtroSelecionado.days }, (_, indice) => {
      const data = new Date(inicioPeriodo)
      data.setDate(inicioPeriodo.getDate() + indice)
      return {
        key: data.toISOString().slice(0, 10),
        label: data.toLocaleDateString('pt-BR', filtroSelecionado.days <= 7
          ? { weekday: 'short' }
          : { day: '2-digit', month: '2-digit' }),
        fullLabel: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        receita: 0,
        pedidos: 0,
      }
    })

    const mapaSerie = new Map(serie.map((item) => [item.key, item]))
    const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]))
    const agregadosProdutos = new Map()
    const agregadosCategorias = new Map()
    const agregadosClientes = new Map()

    let itensVendidos = 0

    pedidosPagos.forEach((pedido) => {
      const chaveData = new Date(pedido.paid_at).toISOString().slice(0, 10)
      const ponto = mapaSerie.get(chaveData)
      if (ponto) {
        ponto.receita += Number(pedido.total_amount || 0)
        ponto.pedidos += 1
      }

      const chaveCliente = pedido.user?.email || pedido.customer_email || `pedido-${pedido.id}`
      const clienteAtual = agregadosClientes.get(chaveCliente) || {
        key: chaveCliente,
        nome: pedido.user?.name || pedido.customer_name || 'Cliente não identificado',
        email: pedido.user?.email || pedido.customer_email || 'Sem e-mail',
        pedidos: 0,
        gasto: 0,
      }
      clienteAtual.pedidos += 1
      clienteAtual.gasto += Number(pedido.total_amount || 0)
      agregadosClientes.set(chaveCliente, clienteAtual)

      ;(pedido.items || []).forEach((item) => {
        const produtoAtual = agregadosProdutos.get(item.product_id) || {
          key: item.product_id || `${item.product_slug}-${item.product_name}`,
          nome: item.product_name,
          slug: item.product_slug || 'sem slug',
          imagem: item.product_image,
          quantidade: 0,
          receita: 0,
          categoria: produtosPorId.get(item.product_id)?.category?.name || 'Sem categoria',
        }
        produtoAtual.quantidade += Number(item.quantity || 0)
        produtoAtual.receita += Number(item.total_price || 0)
        agregadosProdutos.set(item.product_id, produtoAtual)

        const chaveCategoria = produtoAtual.categoria
        const categoriaAtual = agregadosCategorias.get(chaveCategoria) || {
          nome: chaveCategoria,
          quantidade: 0,
          receita: 0,
        }
        categoriaAtual.quantidade += Number(item.quantity || 0)
        categoriaAtual.receita += Number(item.total_price || 0)
        agregadosCategorias.set(chaveCategoria, categoriaAtual)

        itensVendidos += Number(item.quantity || 0)
      })
    })

    const receitaTotal = pedidosPagos.reduce((total, pedido) => total + Number(pedido.total_amount || 0), 0)
    const maiorReceitaDia = Math.max(...serie.map((item) => item.receita), 0)

    return {
      filtroSelecionado,
      serie,
      pedidosPagos,
      receitaTotal,
      totalPedidos: pedidosPagos.length,
      itensVendidos,
      ticketMedio: pedidosPagos.length > 0 ? receitaTotal / pedidosPagos.length : 0,
      maiorReceitaDia,
      topProdutos: [...agregadosProdutos.values()].sort((a, b) => b.quantidade - a.quantidade || b.receita - a.receita).slice(0, 5),
      topCategorias: [...agregadosCategorias.values()].sort((a, b) => b.receita - a.receita).slice(0, 5),
      topClientes: [...agregadosClientes.values()].sort((a, b) => b.gasto - a.gasto).slice(0, 5),
    }
  }, [pedidos, produtos, filtroRelatorioPeriodo])

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const termoBusca = String(buscaPedido || '').trim().toLowerCase()
      const buscaNumerica = /^\d+$/.test(termoBusca)
      const texto = [
        pedido.id,
        pedido.customer_name,
        pedido.customer_email,
        pedido.customer_phone,
        pedido.user?.name,
        pedido.user?.email,
        pedido.shipping_company_name,
        pedido.payment_reference,
      ].filter(Boolean).join(' ').toLowerCase()

      const bateBusca = !termoBusca
        || (buscaNumerica
          ? String(pedido.id) === termoBusca
          : texto.includes(termoBusca))

      const statusEnvioAtual = pedido.fulfillment_status || ''
      const bateStatus = filtroPedidoStatus === 'todos'
        || pedido.status === filtroPedidoStatus
        || statusEnvioAtual === filtroPedidoStatus

      const dataPedido = new Date(pedido.paid_at || pedido.created_at)
      const inicio = filtroPedidoDataInicio ? new Date(`${filtroPedidoDataInicio}T00:00:00`) : null
      const fim = filtroPedidoDataFim ? new Date(`${filtroPedidoDataFim}T23:59:59`) : null
      const bateInicio = !inicio || dataPedido >= inicio
      const bateFim = !fim || dataPedido <= fim

      return bateBusca && bateStatus && bateInicio && bateFim
    })
  }, [pedidos, buscaPedido, filtroPedidoStatus, filtroPedidoDataInicio, filtroPedidoDataFim])

  const pedidoDetalhado = useMemo(
    () => pedidos.find((pedido) => pedido.id === pedidoDetalheAbertoId) || null,
    [pedidos, pedidoDetalheAbertoId],
  )

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const texto = normalizarTextoBusca([
        produto.name,
        produto.brand,
        produto.color,
        produto.slug,
        produto.category?.name,
      ].filter(Boolean).join(' '))
      const termoBusca = normalizarTextoBusca(buscaProduto)
      const bateBusca = !termoBusca || texto.includes(termoBusca)
      const bateCategoria = filtroCategoria === 'todas' || String(produto.category_id) === filtroCategoria
      const estoque = Number(produto.stock_quantity || 0)
      const bateEstoque = filtroEstoque === 'todos'
        || (filtroEstoque === 'critico' && estoque <= 3)
        || (filtroEstoque === 'baixo' && estoque > 3 && estoque <= 10)
        || (filtroEstoque === 'normal' && estoque > 10)
      return bateBusca && bateCategoria && bateEstoque
    })
  }, [produtos, buscaProduto, filtroCategoria, filtroEstoque])

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((item) => {
      const texto = `${item.name} ${item.email} ${item.phone || ''} ${item.whatsapp || ''}`.toLowerCase()
      return texto.includes(buscaUsuario.toLowerCase())
    })
  }, [usuarios, buscaUsuario])

  function obterStatusPedido(status) {
    return statusPedidoMap[status] || { label: status || 'Desconhecido', className: 'badge' }
  }

  function formatarData(data) {
    if (!data) return 'Sem data'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  function exportarPedidosCsv() {
    if (pedidosFiltrados.length === 0) {
      toast.info('Não há pedidos para exportar com os filtros atuais.')
      return
    }

    const linhas = pedidosFiltrados.map((pedido) => {
      const itens = (pedido.items || [])
        .map((item) => `${item.product_name}${item.selected_color_name ? ` (${item.selected_color_name})` : ''} x${item.quantity}`)
        .join(' | ')

      return `
        <tr>
          <td>${escaparHtml(pedido.id)}</td>
          <td>${escaparHtml(formatarData(pedido.paid_at || pedido.created_at))}</td>
          <td>${escaparHtml(pedido.customer_name || pedido.user?.name || '')}</td>
          <td>${escaparHtml(pedido.customer_email || pedido.user?.email || '')}</td>
          <td style="mso-number-format:'\\@';">${escaparHtml(formatarTelefoneExportacao(pedido.customer_phone || pedido.user?.phone || ''))}</td>
          <td>${escaparHtml(obterStatusPedido(pedido.status).label)}</td>
          <td>${escaparHtml(obterStatusEnvioPedido(pedido).label)}</td>
          <td>${escaparHtml(pedido.shipping_company_name || '')}</td>
          <td>${escaparHtml(pedido.tracking_code || '')}</td>
          <td style="mso-number-format:'[$R$-416] #,##0.00';">${escaparHtml(Number(pedido.total_amount || 0).toFixed(2).replace('.', ','))}</td>
          <td>${escaparHtml(itens)}</td>
          <td>${escaparHtml(pedido.shipping_address?.recipient_name || '')}</td>
          <td style="mso-number-format:'\\@';">${escaparHtml(pedido.shipping_address?.cep || '')}</td>
          <td>${escaparHtml(pedido.shipping_address?.city || '')}</td>
          <td>${escaparHtml(pedido.shipping_address?.state || '')}</td>
        </tr>
      `
    })

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th, td { border: 1px solid #d9e2ec; padding: 8px 10px; font-size: 12px; }
            th { background: #223758; color: #ffffff; text-align: left; }
            tr:nth-child(even) td { background: #f8fbff; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Status pagamento</th>
                <th>Status envio</th>
                <th>Transportadora</th>
                <th>Rastreio</th>
                <th>Total</th>
                <th>Itens</th>
                <th>Destinatário</th>
                <th>CEP</th>
                <th>Cidade</th>
                <th>UF</th>
              </tr>
            </thead>
            <tbody>${linhas.join('')}</tbody>
          </table>
        </body>
      </html>
    `

    const blob = new Blob([`\uFEFF${html}`], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dataAtual = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `pedidos-admin-${dataAtual}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function obterStatusEnvioPedido(pedido) {
    if (pedido.fulfillment_status) {
      return statusEnvioMap[pedido.fulfillment_status] || { label: pedido.fulfillment_status, className: 'badge' }
    }

    if (pedido.status === 'cancelado') {
      return { label: 'Pedido cancelado', className: 'badge perigo' }
    }

    if (['aguardando_pagamento', 'expirado'].includes(pedido.status)) {
      return { label: 'Aguardando pagamento', className: 'badge' }
    }

    return statusEnvioMap.em_preparacao
  }

  async function editarPedido(pedido) {
    if (pedidoEditandoId === pedido.id) {
      setPedidoEditandoId(null)
      return
    }

    const pedidosAtualizados = await carregarPedidos()
    const pedidoAtual = pedidosAtualizados.find((item) => item.id === pedido.id) || pedido

    setPedidoEditandoId(pedidoAtual.id)
    setPedidoDetalheAbertoId(null)
    setPedidoForm({
      status: pedidoAtual.status || 'pago',
      shipping_service_id: pedidoAtual.shipping_service_id || '1',
      shipping_service_name: pedidoAtual.shipping_service_name || 'PAC',
      shipping_company_name: pedidoAtual.shipping_company_name || 'Correios',
      tracking_code: pedidoAtual.tracking_code || '',
      tracking_url: pedidoAtual.tracking_url || '',
      fulfillment_status: pedidoAtual.fulfillment_status || 'em_preparacao',
      recipient_name: pedidoAtual.shipping_address?.recipient_name || pedidoAtual.customer_name || '',
      recipient_phone: pedidoAtual.shipping_address?.phone || pedidoAtual.customer_phone || '',
      cep: pedidoAtual.shipping_address?.cep || '',
      street: pedidoAtual.shipping_address?.street || '',
      number: pedidoAtual.shipping_address?.number || '',
      complement: pedidoAtual.shipping_address?.complement || '',
      neighborhood: pedidoAtual.shipping_address?.neighborhood || '',
      city: pedidoAtual.shipping_address?.city || '',
      state: pedidoAtual.shipping_address?.state || '',
      reference: pedidoAtual.shipping_address?.reference || '',
    })
    document.getElementById('form-pedido-admin')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function abrirDetalhesPedido(pedido) {
    if (pedidoDetalheAbertoId === pedido.id) {
      setPedidoDetalheAbertoId(null)
      return
    }

    const pedidosAtualizados = await carregarPedidos()
    const pedidoAtual = pedidosAtualizados.find((item) => item.id === pedido.id) || pedido
    setPedidoDetalheAbertoId(pedidoAtual.id)
    setPedidoEditandoId(null)
    document.getElementById('detalhe-pedido-admin')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function abrirFiltrosDeData() {
    setFiltroDatasAberto(true)

    const alvo = !filtroPedidoDataInicio ? filtroDataInicioRef.current : filtroDataFimRef.current || filtroDataInicioRef.current
    if (!alvo) return

    if (typeof alvo.showPicker === 'function') {
      alvo.showPicker()
      return
    }

    alvo.focus()
    alvo.click()
  }

  async function imprimirResumoEnvio(pedido) {
    const pedidosAtualizados = await carregarPedidos()
    const pedidoAtual = pedidosAtualizados.find((item) => item.id === pedido.id) || pedido

    const popup = window.open('', '_blank', 'width=980,height=720')
    if (!popup) {
      toast.error('Não foi possível abrir a janela de impressão.')
      return
    }

    const origem = [
      configLojaForm.shipping_origin_address,
      configLojaForm.shipping_origin_number,
      configLojaForm.shipping_origin_district,
      configLojaForm.shipping_origin_city,
      configLojaForm.shipping_origin_state,
      configLojaForm.shipping_origin_postal_code ? `CEP ${configLojaForm.shipping_origin_postal_code}` : '',
    ].filter(Boolean).join(', ')

    const destino = pedidoAtual.shipping_address
      ? [
          pedidoAtual.shipping_address.street,
          pedidoAtual.shipping_address.number,
          pedidoAtual.shipping_address.complement,
          pedidoAtual.shipping_address.neighborhood,
          pedidoAtual.shipping_address.city,
          pedidoAtual.shipping_address.state,
          pedidoAtual.shipping_address.cep ? `CEP ${pedidoAtual.shipping_address.cep}` : '',
        ].filter(Boolean).join(', ')
      : 'Não informado'

    const itensHtml = (pedidoAtual.items || []).map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.product_name}</td>
        <td>${item.selected_color_name || '-'}</td>
        <td>${item.product_slug || '-'}</td>
        <td>${item.quantity}</td>
        <td>${moeda.format(Number(item.unit_price || 0))}</td>
      </tr>
    `).join('')

    popup.document.write(`
      <html lang="pt-BR">
        <head>
          <title>Resumo de envio do pedido #${pedidoAtual.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #172033; margin: 32px; }
            h1, h2, p { margin: 0; }
            .topo { display:flex; justify-content:space-between; gap:24px; margin-bottom:24px; }
            .bloco { border:1px solid #d9e2ec; border-radius:12px; padding:16px; margin-bottom:16px; }
            .grade { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
            .etiqueta { font-size:12px; color:#5b708b; text-transform:uppercase; font-weight:700; margin-bottom:6px; }
            table { width:100%; border-collapse:collapse; margin-top:12px; }
            th, td { border:1px solid #d9e2ec; padding:10px; text-align:left; font-size:14px; }
            th { background:#f8fbff; }
            .aviso { font-size:13px; color:#5b708b; line-height:1.5; }
            @media print { body { margin: 12px; } }
          </style>
        </head>
        <body>
          <div class="topo">
            <div>
              <h1>Resumo de envio</h1>
              <p>Pedido #${pedidoAtual.id}</p>
            </div>
            <div>
              <div class="etiqueta">Gerado em</div>
              <strong>${new Date().toLocaleString('pt-BR')}</strong>
            </div>
          </div>

          <div class="grade">
            <section class="bloco">
              <div class="etiqueta">Remetente</div>
              <strong>${configLojaForm.store_name || 'Ótica Olho de Hórus'}</strong>
              <p>${origem || 'Configure o endereço de origem da loja no painel.'}</p>
              <p>${configLojaForm.cnpj ? `CNPJ ${formatarCnpj(configLojaForm.cnpj)}` : ''}</p>
            </section>
            <section class="bloco">
              <div class="etiqueta">Destinatário</div>
              <strong>${pedidoAtual.customer_name || pedidoAtual.user?.name || pedidoAtual.shipping_address?.recipient_name || 'Cliente'}</strong>
              <p>${destino}</p>
              <p>${pedidoAtual.user?.cpf ? `CPF ${pedidoAtual.user.cpf}` : ''}</p>
            </section>
          </div>

          <section class="bloco">
            <div class="etiqueta">Itens declarados</div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Conteúdo</th>
                  <th>Cor</th>
                  <th>Slug</th>
                  <th>Qtd.</th>
                  <th>Valor unitário</th>
                </tr>
              </thead>
              <tbody>${itensHtml}</tbody>
            </table>
            <p style="margin-top:12px;"><strong>Total da remessa:</strong> ${moeda.format(Number(pedidoAtual.total_amount || 0))}</p>
            <p><strong>Peso cadastrado:</strong> ${pedidoAtual.items?.length || 0} item(ns)</p>
          </section>

          <section class="bloco">
            <div class="etiqueta">Acompanhamento</div>
            <p><strong>Transportadora:</strong> ${pedidoAtual.shipping_company_name || 'Correios'}</p>
            <p><strong>Código de rastreio:</strong> ${pedidoAtual.tracking_code || 'Ainda não informado'}</p>
            <p><strong>Status logístico:</strong> ${obterStatusEnvioPedido(pedidoAtual).label}</p>
          </section>

          <section class="bloco aviso">
            Este impresso funciona como resumo operacional para separação e postagem.
            Para remessas sem NF-e, os Correios passaram a exigir a DC-e como documento oficial a partir de 06/04/2026.
            Use este resumo como apoio para reunir remetente, destinatário, itens e valores antes da emissão oficial.
          </section>
        </body>
      </html>
    `)

    popup.document.close()
    popup.focus()
    popup.print()
  }

  async function enviarCategoria(evento) {
    evento.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', categoriaForm.name)
      formData.append('slug', slugificar(categoriaForm.name))
      if (categoriaForm.file) formData.append('file', categoriaForm.file)
      if (categoriaEditandoId) {
        await atualizarCategoria(categoriaEditandoId, formData)
        toast.success('Categoria atualizada.')
      } else {
        await cadastrarCategoria(formData)
        toast.success('Categoria cadastrada.')
      }
      limparArquivoCategoriaTemporario(categoriaForm)
      limparArquivoCategoriaTemporario(categoriaForm)
      setCategoriaForm(categoriaInicial)
      setCategoriaEditandoId(null)
      setFormCategoriaAberto(false)
      await carregarDados()
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function enviarProduto(evento) {
    evento.preventDefault()
    try {
      const coresValidas = produtoForm.available_colors.filter((item) => item.name && item.hex)
      const formData = new FormData()
      const precificacaoNormalizada = normalizarPrecificacaoProduto(produtoForm)
      const produtoNormalizado = {
        ...produtoForm,
        color: coresValidas[0]?.name || produtoForm.color || '',
        ...precificacaoNormalizada,
        weight: normalizarPesoCampo(produtoForm.weight),
      }

      Object.entries(produtoNormalizado).forEach(([campo, valor]) => {
        if (campo === 'available_colors' || campo === 'files' || campo === 'existing_images') return
        if (campo === 'old_price' || campo === 'discount_percentage') {
          formData.append(campo, valor ?? '')
          return
        }
        if (valor !== '' && valor !== null) formData.append(campo, valor)
      })
      formData.append('available_colors', JSON.stringify(coresValidas))
      if (produtoEditandoId) {
        formData.append('existing_image_paths', JSON.stringify(produtoForm.existing_images))
      }
      formData.append('slug', slugificar(produtoForm.name))
      produtoForm.files.forEach((item) => formData.append('files', item.file))
      if (produtoEditandoId) {
        await atualizarProduto(produtoEditandoId, formData)
        toast.success('Produto atualizado.')
      } else {
        await cadastrarProduto(formData)
        toast.success('Produto cadastrado.')
      }
      resetarFormularioProduto()
      setFormProdutoAberto(false)
      await carregarDados()
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  function construirFormDataProdutoExistente(produto, overrides = {}) {
    const coresValidas = parseAvailableColors(
      overrides.available_colors ?? produto.available_colors,
      [{ name: produto.color || 'Principal', hex: '#223758' }],
    ).filter((item) => item.name && item.hex)

    const produtoNormalizado = {
      name: overrides.name ?? produto.name ?? '',
      description: overrides.description ?? produto.description ?? '',
      brand: overrides.brand ?? produto.brand ?? '',
      color: overrides.color ?? (coresValidas[0]?.name || produto.color || ''),
      price: overrides.price ?? String(Number(produto.price || 0).toFixed(2)),
      old_price: overrides.old_price ?? (produto.old_price == null ? '' : String(Number(produto.old_price).toFixed(2))),
      discount_percentage: overrides.discount_percentage ?? (produto.discount_percentage == null ? '' : String(produto.discount_percentage)),
      stock_quantity: overrides.stock_quantity ?? String(produto.stock_quantity ?? 0),
      category_id: overrides.category_id ?? String(produto.category_id || ''),
      installments_enabled: overrides.installments_enabled ?? String(produto.installments_enabled !== false),
      installments_count: overrides.installments_count ?? String(produto.installments_count || 10),
      weight: overrides.weight ?? String(Number(produto.weight || 0.4).toFixed(3)),
      width: overrides.width ?? String(produto.width || 16),
      height: overrides.height ?? String(produto.height || 6),
      length: overrides.length ?? String(produto.length || 18),
      frame_material: overrides.frame_material ?? (produto.frame_material || ''),
      size_label: overrides.size_label ?? (produto.size_label || ''),
      lens_width_mm: overrides.lens_width_mm ?? (produto.lens_width_mm == null ? '' : String(produto.lens_width_mm)),
      bridge_mm: overrides.bridge_mm ?? (produto.bridge_mm == null ? '' : String(produto.bridge_mm)),
      temple_length_mm: overrides.temple_length_mm ?? (produto.temple_length_mm == null ? '' : String(produto.temple_length_mm)),
      gender: overrides.gender ?? (produto.gender || ''),
      slug: overrides.slug ?? slugificar(overrides.name ?? produto.name ?? ''),
    }

    const formData = new FormData()
    Object.entries(produtoNormalizado).forEach(([campo, valor]) => {
      if (valor !== '' && valor !== null && valor !== undefined) {
        formData.append(campo, valor)
      }
    })
    formData.append('available_colors', JSON.stringify(coresValidas))
    formData.append('existing_image_paths', JSON.stringify(parseImagePathsProduto(produto)))
    return formData
  }

  function limparArquivosTemporarios(files = produtoForm.files) {
    files.forEach((item) => URL.revokeObjectURL(item.previewUrl))
  }

  function resetarFormularioProduto() {
    limparArquivosTemporarios()
    setProdutoForm(criarProdutoInicial(configLojaForm))
    setProdutoEditandoId(null)
    setOrigemPrecificacao('desconto')
  }

  function adicionarArquivosProduto(fileList) {
    const arquivosSelecionados = Array.from(fileList || [])

    if (arquivosSelecionados.length === 0) return

    setProdutoForm((atual) => {
      const vagasDisponiveis = Math.max(0, 3 - atual.existing_images.length - atual.files.length)

      if (vagasDisponiveis <= 0) {
        toast.info('O produto pode ter no máximo 3 imagens.')
        return atual
      }

      const arquivosAceitos = arquivosSelecionados.slice(0, vagasDisponiveis).map(criarArquivoPreview)

      if (arquivosSelecionados.length > vagasDisponiveis) {
        toast.info('Apenas as 3 primeiras imagens foram mantidas.')
      }

      return {
        ...atual,
        files: [...atual.files, ...arquivosAceitos],
      }
    })
  }

  function removerImagemExistente(index) {
    setProdutoForm((atual) => ({
      ...atual,
      existing_images: atual.existing_images.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function removerImagemNova(id) {
    setProdutoForm((atual) => {
      const arquivoRemovido = atual.files.find((item) => item.id === id)
      if (arquivoRemovido) {
        URL.revokeObjectURL(arquivoRemovido.previewUrl)
      }

      return {
        ...atual,
        files: atual.files.filter((item) => item.id !== id),
      }
    })
  }

  function selecionarArquivoCategoria(file) {
    if (!file) return

    setCategoriaForm((atual) => {
      limparArquivoCategoriaTemporario(atual)
      return {
        ...atual,
        file,
        previewUrl: URL.createObjectURL(file),
      }
    })
  }

  function removerArquivoCategoria() {
    setCategoriaForm((atual) => {
      limparArquivoCategoriaTemporario(atual)
      return {
        ...atual,
        file: null,
        previewUrl: '',
      }
    })
  }

  function tornarImagemExistentePrincipal(index) {
    setProdutoForm((atual) => {
      const proximaLista = [...atual.existing_images]
      const [imagem] = proximaLista.splice(index, 1)
      if (imagem) proximaLista.unshift(imagem)

      return {
        ...atual,
        existing_images: proximaLista,
      }
    })
  }

  function tornarImagemNovaPrincipal(id) {
    setProdutoForm((atual) => {
      const itemIndex = atual.files.findIndex((item) => item.id === id)

      if (itemIndex <= 0) return atual

      const proximaLista = [...atual.files]
      const [imagem] = proximaLista.splice(itemIndex, 1)
      proximaLista.unshift(imagem)

      return {
        ...atual,
        files: proximaLista,
      }
    })
  }

  function editarProduto(produto) {
    limparArquivosTemporarios()
    setProdutoEditandoId(produto.id)
    setFormProdutoAberto(true)
    setOrigemPrecificacao(produto.discount_percentage ? 'desconto' : 'preco')
    setProdutoForm({
      name: produto.name || '',
      description: produto.description || '',
      brand: produto.brand || '',
      color: produto.color || '',
      price: formatarMoedaCampo(produto.price),
      old_price: formatarMoedaCampo(produto.old_price),
      discount_percentage: normalizarPercentualCampo(produto.discount_percentage),
      stock_quantity: produto.stock_quantity || '',
      category_id: String(produto.category_id || ''),
      installments_enabled: produto.installments_enabled !== false,
      installments_count: produto.installments_count || 10,
      weight: formatarPesoCampo(String(produto.weight || '').replace(/\D/g, '')),
      width: produto.width || '16',
      height: produto.height || '6',
      length: produto.length || '18',
      available_colors: parseAvailableColors(produto.available_colors, [{ name: produto.color || 'Principal', hex: '#223758' }]),
      frame_material: produto.frame_material || '',
      size_label: produto.size_label || 'Médio',
      lens_width_mm: produto.lens_width_mm || '52',
      bridge_mm: produto.bridge_mm || '18',
      temple_length_mm: produto.temple_length_mm || '145',
      gender: produto.gender || 'Unissex',
      existing_images: parseImagePathsProduto(produto),
      files: [],
    })
    document.getElementById('form-produto')?.scrollIntoView({ behavior: 'smooth' })
  }

  function atualizarPrecoBase(valor) {
    const precoBase = formatarMoedaCampo(valor)

    setProdutoForm((atual) => {
      if (!precoBase) {
        return {
          ...atual,
          old_price: '',
          discount_percentage: '',
        }
      }

      if (origemPrecificacao === 'preco') {
        return {
          ...atual,
          old_price: precoBase,
          discount_percentage: calcularDescontoPorPrecos(precoBase, atual.price),
        }
      }

      return {
        ...atual,
        old_price: precoBase,
        price: calcularPrecoComDesconto(precoBase, atual.discount_percentage),
      }
    })
  }

  function atualizarPrecoAtual(valor) {
    const precoAtual = formatarMoedaCampo(valor)
    setOrigemPrecificacao('preco')

    setProdutoForm((atual) => ({
      ...atual,
      price: precoAtual,
      discount_percentage: atual.old_price ? calcularDescontoPorPrecos(atual.old_price, precoAtual) : '',
    }))
  }

  function atualizarDesconto(valor) {
    const desconto = limitarPercentualCampo(valor)
    setOrigemPrecificacao('desconto')

    if (!desconto) {
      setProdutoForm((atual) => ({
        ...atual,
        discount_percentage: '',
        price: atual.old_price || atual.price,
      }))
      return
    }

    setProdutoForm((atual) => ({
      ...atual,
      discount_percentage: desconto,
      price: calcularPrecoComDesconto(atual.old_price, desconto),
    }))
  }

  function aplicarMedidasPadraoProduto() {
    setProdutoForm((atual) => ({
      ...atual,
      weight: configLojaForm.default_package_weight !== ''
        ? formatarPesoCampo(String(configLojaForm.default_package_weight))
        : atual.weight,
      width: configLojaForm.default_package_width !== '' ? String(configLojaForm.default_package_width) : atual.width,
      height: configLojaForm.default_package_height !== '' ? String(configLojaForm.default_package_height) : atual.height,
      length: configLojaForm.default_package_length !== '' ? String(configLojaForm.default_package_length) : atual.length,
    }))
  }

  function atualizarCorDisponivel(index, campo, valor) {
    setProdutoForm((atual) => ({
      ...atual,
      available_colors: atual.available_colors.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [campo]: valor } : item
      )),
    }))
  }

  function adicionarCorDisponivel() {
    setProdutoForm((atual) => ({
      ...atual,
      available_colors: [...atual.available_colors, { ...corDisponivelInicial }],
    }))
  }

  function removerCorDisponivel(index) {
    setProdutoForm((atual) => ({
      ...atual,
      available_colors: atual.available_colors.length === 1
        ? [{ ...corDisponivelInicial }]
        : atual.available_colors.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  async function alternarProdutoAtivo(produto) {
    const proximoStatus = produtoEstaAtivo(produto) ? 'desativar' : 'ativar'

    if (!window.confirm(`${proximoStatus === 'desativar' ? 'Desativar' : 'Ativar'} o produto "${produto.name}"?`)) return

    try {
      const atualizado = await alternarStatusProduto(produto.id)
      toast.success(`Produto ${atualizado?.is_active === false ? 'desativado' : 'ativado'}.`)
      await carregarDados()
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  function iniciarEdicaoRapidaEstoque(produto) {
    setEstoqueEditandoId(produto.id)
    setEstoqueRapidoValor(String(produto.stock_quantity ?? 0))
  }

  function cancelarEdicaoRapidaEstoque() {
    setEstoqueEditandoId(null)
    setEstoqueRapidoValor('')
  }

  async function salvarEdicaoRapidaEstoque(produto) {
    const estoqueNormalizado = String(estoqueRapidoValor || '').trim()

    if (!/^\d+$/.test(estoqueNormalizado)) {
      toast.info('Informe um estoque inteiro maior ou igual a zero.')
      return
    }

    try {
      const formData = construirFormDataProdutoExistente(produto, {
        stock_quantity: estoqueNormalizado,
      })
      const atualizado = await atualizarProduto(produto.id, formData)
      setProdutos((atual) => atual.map((item) => (item.id === atualizado.id ? atualizado : item)))
      if (produtoEditandoId === produto.id) {
        setProdutoForm((atual) => ({ ...atual, stock_quantity: estoqueNormalizado }))
      }
      cancelarEdicaoRapidaEstoque()
      toast.success('Estoque atualizado.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  function editarCategoria(categoria) {
    setCategoriaEditandoId(categoria.id)
    setFormCategoriaAberto(true)
    setCategoriaForm((atual) => {
      limparArquivoCategoriaTemporario(atual)
      return {
        name: categoria.name || '',
        file: null,
        previewUrl: categoria.path ? montarUrlImagem(categoria.path) : '',
      }
    })
  }

  function abrirFormularioNovaCategoria() {
    limparArquivoCategoriaTemporario(categoriaForm)
    setCategoriaEditandoId(null)
    setCategoriaForm(categoriaInicial)
    setFormCategoriaAberto(true)
  }

  function fecharFormularioCategoria() {
    limparArquivoCategoriaTemporario(categoriaForm)
    setCategoriaEditandoId(null)
    setCategoriaForm(categoriaInicial)
    setFormCategoriaAberto(false)
  }

  async function removerCategoria(categoria) {
    if (!window.confirm(`Excluir a categoria "${categoria.name}"?`)) return

    try {
      await excluirCategoria(categoria.id)
      toast.success('Categoria excluída.')
      if (categoriaEditandoId === categoria.id) {
        setCategoriaEditandoId(null)
        limparArquivoCategoriaTemporario(categoriaForm)
        setCategoriaForm(categoriaInicial)
        setFormCategoriaAberto(false)
      }
      await carregarDados()
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  function editarUsuario(item) {
    setUsuarioEditandoId(item.id)
    setUsuarioForm({
      name: item.name || '',
      email: item.email || '',
      cpf: item.cpf || '',
      phone: item.phone || '',
      whatsapp: item.whatsapp || '',
      city: item.city || '',
      state: item.state || '',
      admin: Boolean(item.admin),
      is_active: Boolean(item.is_active),
    })
  }

  async function salvarUsuario(evento) {
    evento.preventDefault()

    try {
      await atualizarUsuarioAdmin(usuarioEditandoId, usuarioForm)
      toast.success('Usuário atualizado.')
      setUsuarioEditandoId(null)
      await carregarDados()
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function salvarPedido(evento) {
    evento.preventDefault()

    try {
      const atualizado = await atualizarPedidoAdmin(pedidoEditandoId, {
        status: pedidoForm.status || null,
        shipping_service_id: pedidoForm.shipping_service_id || null,
        shipping_service_name: pedidoForm.shipping_service_name || null,
        shipping_company_name: pedidoForm.shipping_company_name || null,
        tracking_code: pedidoForm.tracking_code || null,
        tracking_url: pedidoForm.tracking_url || null,
        fulfillment_status: pedidoForm.fulfillment_status || null,
        recipient_name: pedidoForm.recipient_name || null,
        recipient_phone: pedidoForm.recipient_phone || null,
        cep: pedidoForm.cep || null,
        street: pedidoForm.street || null,
        number: pedidoForm.number || null,
        complement: pedidoForm.complement || null,
        neighborhood: pedidoForm.neighborhood || null,
        city: pedidoForm.city || null,
        state: pedidoForm.state || null,
        reference: pedidoForm.reference || null,
      })
      setPedidos((atual) => atual.map((pedido) => (
        pedido.id === atualizado.id ? atualizado : pedido
      )))
      setPedidoDetalheAbertoId(atualizado.id)
      setPedidoEditandoId(null)
      toast.success('Pedido atualizado.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function cancelarPedidoAtual() {
    if (!pedidoEditandoId) return
    if (!window.confirm('Cancelar este pedido? Essa ação remove o andamento logístico e marca o pedido como cancelado.')) return

    try {
      const atualizado = await atualizarPedidoAdmin(pedidoEditandoId, {
        status: 'cancelado',
        shipping_service_id: pedidoForm.shipping_service_id || null,
        shipping_service_name: pedidoForm.shipping_service_name || null,
        shipping_company_name: pedidoForm.shipping_company_name || null,
        tracking_code: null,
        tracking_url: null,
        fulfillment_status: null,
        recipient_name: pedidoForm.recipient_name || null,
        recipient_phone: pedidoForm.recipient_phone || null,
        cep: pedidoForm.cep || null,
        street: pedidoForm.street || null,
        number: pedidoForm.number || null,
        complement: pedidoForm.complement || null,
        neighborhood: pedidoForm.neighborhood || null,
        city: pedidoForm.city || null,
        state: pedidoForm.state || null,
        reference: pedidoForm.reference || null,
      })

      setPedidos((atual) => atual.map((pedido) => (
        pedido.id === atualizado.id ? atualizado : pedido
      )))
      setPedidoForm((atual) => ({
        ...atual,
        status: atualizado.status || 'cancelado',
        fulfillment_status: atualizado.fulfillment_status || '',
        tracking_code: atualizado.tracking_code || '',
        tracking_url: atualizado.tracking_url || '',
      }))
      setPedidoDetalheAbertoId(atualizado.id)
      setPedidoEditandoId(null)
      toast.success('Pedido cancelado.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function removerUsuario(item) {
    if (!window.confirm(`Excluir o usuário "${item.name}"?`)) return

    try {
      await excluirUsuarioAdmin(item.id)
      toast.success('Usuário excluído.')
      if (usuarioEditandoId === item.id) {
        setUsuarioEditandoId(null)
      }
      await carregarDados()
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function salvarConfiguracoes(evento) {
    evento.preventDefault()

    try {
      const {
        melhor_envio_token_configured,
        melhor_envio_client_secret_configured,
        ...configLojaPayload
      } = configLojaForm

      const payload = {
        ...configLojaPayload,
        default_package_weight: configLojaPayload.default_package_weight === '' ? null : Number(configLojaPayload.default_package_weight),
        default_package_width: configLojaPayload.default_package_width === '' ? null : Number(configLojaPayload.default_package_width),
        default_package_height: configLojaPayload.default_package_height === '' ? null : Number(configLojaPayload.default_package_height),
        default_package_length: configLojaPayload.default_package_length === '' ? null : Number(configLojaPayload.default_package_length),
        free_shipping_min_amount: configLojaPayload.free_shipping_enabled && configLojaPayload.free_shipping_min_amount !== ''
          ? Number(configLojaPayload.free_shipping_min_amount)
          : null,
        warranty_months: configLojaPayload.warranty_months === '' ? null : Number(configLojaPayload.warranty_months),
        return_days: configLojaPayload.return_days === '' ? null : Number(configLojaPayload.return_days),
        melhor_envio_agency: configLojaPayload.melhor_envio_agency === '' ? null : Number(configLojaPayload.melhor_envio_agency),
        melhor_envio_client_id: configLojaPayload.melhor_envio_client_id || null,
        melhor_envio_client_secret: configLojaPayload.melhor_envio_client_secret || null,
        melhor_envio_public_url: configLojaPayload.melhor_envio_public_url || null,
      }

      const atualizado = await salvarConfiguracoesLoja(payload)
      setConfigLojaForm(normalizarConfigLojaForm(atualizado))
      toast.success('Configurações da loja atualizadas.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  function editarCupom(cupom) {
    setCupomEditandoId(cupom.id)
    setCupomForm({
      code: cupom.code || '',
      description: cupom.description || '',
      type: cupom.type || 'percentage',
      value: cupom.value == null ? '' : String(cupom.value),
      min_order_amount: cupom.min_order_amount == null ? '' : String(cupom.min_order_amount),
      usage_limit: cupom.usage_limit == null ? '' : String(cupom.usage_limit),
      starts_at: formatarDataHoraLocal(cupom.starts_at),
      expires_at: formatarDataHoraLocal(cupom.expires_at),
      is_active: cupom.is_active !== false,
    })
  }

  function cancelarEdicaoCupom() {
    setCupomEditandoId(null)
    setCupomForm(cupomInicial)
  }

  async function salvarCupom(evento) {
    evento?.preventDefault?.()

    try {
      const payload = {
        code: cupomForm.code.trim(),
        description: cupomForm.description.trim() || null,
        type: cupomForm.type,
        value: cupomForm.value === '' ? null : Number(cupomForm.value),
        min_order_amount: cupomForm.min_order_amount === '' ? null : Number(cupomForm.min_order_amount),
        usage_limit: cupomForm.usage_limit === '' ? null : Number(cupomForm.usage_limit),
        starts_at: cupomForm.starts_at || null,
        expires_at: cupomForm.expires_at || null,
        is_active: Boolean(cupomForm.is_active),
      }

      if (cupomEditandoId) {
        await atualizarCupomAdmin(cupomEditandoId, payload)
        toast.success('Cupom atualizado.')
      } else {
        await cadastrarCupomAdmin(payload)
        toast.success('Cupom criado.')
      }

      cancelarEdicaoCupom()
      setCupons(await listarCuponsAdmin())
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function alternarStatusCupom(cupom) {
    try {
      await atualizarCupomAdmin(cupom.id, {
        code: cupom.code,
        description: cupom.description || null,
        type: cupom.type,
        value: Number(cupom.value),
        min_order_amount: cupom.min_order_amount == null ? null : Number(cupom.min_order_amount),
        usage_limit: cupom.usage_limit == null ? null : Number(cupom.usage_limit),
        starts_at: cupom.starts_at || null,
        expires_at: cupom.expires_at || null,
        is_active: !cupom.is_active,
      })

      setCupons(await listarCuponsAdmin())
      toast.success(cupom.is_active ? 'Cupom desativado.' : 'Cupom ativado.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function removerCupom(cupom) {
    if (!window.confirm(`Excluir o cupom "${cupom.code}"?`)) return

    try {
      await excluirCupomAdmin(cupom.id)
      if (cupomEditandoId === cupom.id) {
        cancelarEdicaoCupom()
      }
      setCupons(await listarCuponsAdmin())
      toast.success('Cupom excluído.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function prepararEtiquetaPedido(pedidoId) {
    try {
      const atualizado = await prepararEtiquetaMelhorEnvio(pedidoId)
      setPedidos((atual) => atual.map((pedido) => (
        pedido.id === atualizado.id ? atualizado : pedido
      )))
      setPedidoDetalheAbertoId(atualizado.id)
      if (pedidoEditandoId === atualizado.id) {
        setPedidoEditandoId(atualizado.id)
      }
      toast.success('Etiqueta preparada no Melhor Envio.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function comprarEtiquetaPedido(pedidoId) {
    try {
      const atualizado = await comprarEtiquetaMelhorEnvio(pedidoId)
      setPedidos((atual) => atual.map((pedido) => (
        pedido.id === atualizado.id ? atualizado : pedido
      )))
      setPedidoDetalheAbertoId(atualizado.id)
      toast.success('Checkout da etiqueta enviado ao Melhor Envio.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function gerarEtiquetaPedido(pedidoId) {
    try {
      const atualizado = await gerarEtiquetaMelhorEnvio(pedidoId)
      setPedidos((atual) => atual.map((pedido) => (
        pedido.id === atualizado.id ? atualizado : pedido
      )))
      setPedidoDetalheAbertoId(atualizado.id)
      toast.success('Etiqueta gerada no Melhor Envio.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function imprimirEtiquetaPedido(pedidoId) {
    try {
      const resposta = await imprimirEtiquetaMelhorEnvio(pedidoId)
      const atualizado = resposta.order
      if (atualizado) {
        setPedidos((atual) => atual.map((pedido) => (
          pedido.id === atualizado.id ? atualizado : pedido
        )))
        setPedidoDetalheAbertoId(atualizado.id)
      }
      if (resposta.print_url) {
        window.open(resposta.print_url, '_blank', 'noopener,noreferrer')
      } else {
        toast.info('A etiqueta foi processada, mas o Melhor Envio não retornou uma URL pública de impressão.')
      }
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function sincronizarEtiquetaPedido(pedidoId) {
    try {
      const atualizado = await sincronizarEtiquetaMelhorEnvio(pedidoId)
      setPedidos((atual) => atual.map((pedido) => (
        pedido.id === atualizado.id ? atualizado : pedido
      )))
      setPedidoDetalheAbertoId(atualizado.id)
      toast.success('Status da etiqueta sincronizado.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function resetarProcessoEtiquetaPedido(pedidoId) {
    const confirmar = window.confirm(
      'Isso vai limpar a etiqueta, rastreio e o vínculo atual com o Melhor Envio deste pedido. Deseja reiniciar o processo?',
    )

    if (!confirmar) return

    try {
      const atualizado = await resetarProcessoMelhorEnvio(pedidoId)
      setPedidos((atual) => atual.map((pedido) => (
        pedido.id === atualizado.id ? atualizado : pedido
      )))
      setPedidoDetalheAbertoId(null)
      if (pedidoEditandoId === atualizado.id) {
        setPedidoEditandoId(atualizado.id)
      }
      setPedidoForm((atual) => ({
        ...atual,
        tracking_code: '',
        tracking_url: '',
        fulfillment_status: ['aguardando_pagamento', 'expirado'].includes(atual.status) ? '' : 'em_preparacao',
      }))
      toast.success('Processo do Melhor Envio resetado. Você já pode preparar a etiqueta novamente.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function testarConexaoMelhorEnvio() {
    try {
      const resposta = await testarMelhorEnvioAdmin()
      setTesteMelhorEnvioResumo(resposta)
      toast.success(`Conexão OAuth validada no ${resposta.sandbox ? 'sandbox' : 'ambiente de produção'}.`)
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function conectarContaMelhorEnvio() {
    try {
      const resposta = await obterUrlAutorizacaoMelhorEnvioAdmin()
      if (resposta?.authorization_url) {
        window.location.assign(resposta.authorization_url)
        return
      }
      toast.error('Não foi possível iniciar a autorização do Melhor Envio.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  async function desconectarContaMelhorEnvio() {
    try {
      const resposta = await desconectarMelhorEnvioAdmin()
      if (resposta?.setting) {
        setConfigLojaForm(normalizarConfigLojaForm(resposta.setting))
      } else {
        setConfigLojaForm((atual) => ({
          ...atual,
          melhor_envio_token: '',
        }))
      }
      setTesteMelhorEnvioResumo(null)
      toast.success(resposta?.message || 'Conta do Melhor Envio desconectada.')
    } catch (error) {
      toast.error(obterMensagemErroUsuario(error))
    }
  }

  if (!podeAdministrar) {
    return (
      <section className="secao">
        <EstadoVazio
          titulo="Acesso administrativo restrito"
          texto="Entre com uma conta administradora para cadastrar produtos e categorias."
        />
      </section>
    )
  }

  const pedidoEditandoAtual = pedidoEditandoId
    ? pedidos.find((item) => item.id === pedidoEditandoId) || null
    : null
  const pedidoEditandoEhRetirada = pedidoEhRetiradaLoja(pedidoForm)
  const melhorEnvioPayloadAtual = pedidoEditandoAtual?.melhor_envio_payload || {}
  const etapaPrepareConcluida = Boolean(pedidoEditandoAtual?.melhor_envio_order_id || melhorEnvioPayloadAtual.prepare)
  const etapaCheckoutConcluida = pedidoTemCheckoutMelhorEnvio(pedidoEditandoAtual)
  const etapaGenerateConcluida = pedidoTemEtiquetaGeradaMelhorEnvio(pedidoEditandoAtual)
  const etapaPrintConcluida = Boolean(melhorEnvioPayloadAtual.print?.print_url)
  const etapaSyncConcluida = Boolean(melhorEnvioPayloadAtual.tracking_synced_at)
  const podePrepararEtiqueta = !etapaPrepareConcluida
  const podeComprarEtiqueta = etapaPrepareConcluida && !etapaCheckoutConcluida
  const podeGerarEtiqueta = etapaCheckoutConcluida && !etapaGenerateConcluida
  const podeImprimirEtiqueta = etapaGenerateConcluida
  const podeSincronizarEtiqueta = etapaGenerateConcluida

  const linksAdmin = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'categorias', label: 'Categorias', icon: Tag },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ]

  return (
    <AdminPage className="admin-shell">
      {sidebarAberta && <button className="admin-overlay" onClick={() => setSidebarAberta(false)} aria-label="Fechar menu" />}

      <aside className={`admin-sidebar ${sidebarAberta ? 'aberta' : ''}`}>
        <div className="admin-marca">
          <img src="/logo-icone-olho.png" alt="" />
          <div>
            <strong>Olho de Hórus</strong>
            <span>Admin</span>
          </div>
        </div>

        <nav>
          {linksAdmin.map((link) => (
            <button
              className={abaAtiva === link.id ? 'ativo' : ''}
              key={link.id}
              onClick={() => {
                if (link.id === 'categorias') {
                  fecharFormularioCategoria()
                }
                setAbaAtiva(link.id)
                setSidebarAberta(false)
              }}
            >
              <link.icon size={19} />
              {link.label}
            </button>
          ))}
        </nav>

      </aside>

      <div className="admin-conteudo">
        <header className="admin-topo">
          <button className="botao-icone admin-menu-mobile" onClick={() => setSidebarAberta(true)}>
            <Menu size={21} />
          </button>
          <div className="admin-acoes">
            <div className="admin-menu-notificacoes" ref={notificacoesRef}>
              <button
                className={`botao-icone admin-botao-notificacoes ${notificacoesAbertas ? 'ativo' : ''}`}
                type="button"
                aria-label="Abrir notificações"
                onClick={() => {
                  setNotificacoesAbertas((atual) => !atual)
                  setMenuContaAberto(false)
                }}
              >
                <Bell size={20} />
                {notificacoesVisiveis.length > 0 ? (
                  <span className="admin-notificacao-badge">{notificacoesVisiveis.length}</span>
                ) : null}
              </button>

              {notificacoesAbertas ? (
                <div className="admin-dropdown-notificacoes">
                  <div className="admin-dropdown-notificacoes-topo">
                    <strong>Notificações</strong>
                    <span>{notificacoesVisiveis.length}</span>
                  </div>

                  {notificacoesVisiveis.length > 0 ? (
                    <div className="admin-lista-notificacoes">
                      {notificacoesVisiveis.map((notificacao) => (
                        <div
                          key={notificacao.id}
                          className={`admin-item-notificacao ${notificacao.tipo}`}
                        >
                          <button
                            type="button"
                            className="admin-item-notificacao-conteudo"
                            onClick={() => {
                              marcarNotificacaoComoVisualizada(notificacao.assinatura)
                              setAbaAtiva(notificacao.aba)
                              setNotificacoesAbertas(false)
                            }}
                          >
                            <strong>{notificacao.titulo}</strong>
                            <span>{notificacao.descricao}</span>
                          </button>
                          <button
                            type="button"
                            className="admin-item-notificacao-excluir"
                            aria-label="Excluir notificação"
                            onClick={() => excluirNotificacao(notificacao.assinatura)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-notificacoes-vazio">Nenhuma notificação pendente.</p>
                  )}
                </div>
              ) : null}
            </div>
            <div className="admin-menu-conta" ref={menuContaRef}>
              <button
                className={`admin-usuario ${menuContaAberto ? 'ativo' : ''}`}
                type="button"
                onClick={() => {
                  setMenuContaAberto((atual) => !atual)
                  setNotificacoesAbertas(false)
                }}
              >
                <span>{usuario.name?.[0] || 'A'}</span>
                <div className="admin-usuario-texto">
                  <strong>{usuario.name || 'Administrador'}</strong>
                  <small>{usuario.admin ? 'Conta administrativa' : 'Minha conta'}</small>
                </div>
                <ChevronDown size={16} />
              </button>

              {menuContaAberto ? (
                <div className="admin-dropdown-conta">
                  <Link to="/" onClick={() => setMenuContaAberto(false)}>
                    <Eye size={16} />
                    Home do site
                  </Link>
                  <Link to="/cliente" onClick={() => setMenuContaAberto(false)}>
                    <Users size={16} />
                    Minha conta
                  </Link>
                  <Link to="/produtos" onClick={() => setMenuContaAberto(false)}>
                    <ShoppingCart size={16} />
                    Ver loja
                  </Link>
                  <button type="button" onClick={sair}>
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="admin-main">
          {abaAtiva === 'dashboard' && (
            <>
              <div className="admin-titulo">
                <h1>Dashboard</h1>
                <p>Visão geral dos dados reais já existentes na loja.</p>
              </div>

              <div className="admin-metricas">
                <div><span className="icone-metrica"><Package /></span><strong>{resumo.produtos}</strong><span>Produtos</span></div>
                <div><span className="icone-metrica"><Tag /></span><strong>{resumo.categorias}</strong><span>Categorias</span></div>
                <div><span className="icone-metrica"><ShoppingCart /></span><strong>{resumo.pedidos}</strong><span>Pedidos</span></div>
                <div><span className="icone-metrica"><Users /></span><strong>{usuarios.filter((item) => !item.admin).length}</strong><span>Clientes listáveis</span></div>
              </div>

              <div className="admin-graficos">
                <div className="admin-card grafico-card">
                  <div className="grafico-topo">
                    <div>
                      <h2>Vendas por período</h2>
                      <p>Acompanhe o volume de pedidos pagos na janela selecionada.</p>
                    </div>
                    <div className="grafico-filtros">
                      {filtrosVendasPeriodo.map((filtro) => (
                        <button
                          key={filtro.value}
                          type="button"
                          className={filtroVendasPeriodo === filtro.value ? 'ativo' : ''}
                          onClick={() => setFiltroVendasPeriodo(filtro.value)}
                        >
                          {filtro.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grafico-resumo-periodo">
                    <div>
                      <span>Receita no período</span>
                      <strong>{moeda.format(vendasDashboard.totalPeriodo)}</strong>
                    </div>
                    <div>
                      <span>Pedidos pagos</span>
                      <strong>{vendasDashboard.totalPedidos}</strong>
                    </div>
                    <div>
                      <span>Ticket médio</span>
                      <strong>{moeda.format(vendasDashboard.ticketMedio)}</strong>
                    </div>
                  </div>

                  {vendasDashboard.totalPedidos > 0 ? (
                    <div className="grafico-barras-vendas">
                      {vendasDashboard.dias.map((dia) => {
                        const altura = vendasDashboard.maioresVendas > 0
                          ? Math.max(10, Math.round((dia.total / vendasDashboard.maioresVendas) * 100))
                          : 0

                        return (
                          <div className="grafico-barra-dia" key={dia.key} title={`${dia.fullLabel} • ${moeda.format(dia.total)} • ${dia.pedidos} pedido(s)`}>
                            <small>{dia.pedidos}</small>
                            <div>
                              <i style={{ height: `${altura}%` }} />
                            </div>
                            <span>{dia.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="grafico-vazio">
                      <BarChart3 size={34} />
                      <p>Não houve pedidos pagos no período selecionado.</p>
                    </div>
                  )}
                </div>
                <div className="admin-card grafico-card">
                  <h2>Vendas por Categoria</h2>
                  <p className="grafico-categorias-legenda">Leitura rápida da distribuição atual do catálogo por categoria.</p>
                  <div className="barras-categorias">
                    {categoriasDashboard.length > 0 ? categoriasDashboard.map((categoria) => (
                      <article key={categoria.id} className="categoria-dashboard-item">
                        <div className="categoria-dashboard-topo">
                          <div className="categoria-dashboard-nome">
                            <b>{categoria.nome}</b>
                            <small>{categoria.total} produto(s)</small>
                          </div>
                          <div className="categoria-dashboard-resumo">
                            <strong>{categoria.percentual}%</strong>
                            <span>#{categoria.posicao}</span>
                          </div>
                        </div>
                        <div className="categoria-dashboard-trilha">
                          <i style={{ width: `${categoria.largura}%` }} />
                        </div>
                      </article>
                    )) : <p className="admin-texto-vazio">Cadastre categorias e vincule produtos para visualizar este gráfico.</p>}
                  </div>
                </div>
              </div>

              <div className={`admin-duas-colunas admin-duas-colunas-categorias ${formCategoriaAberto ? 'com-formulario' : 'sem-formulario'}`}>
                <div className="admin-card lista-categorias-card">
                  <h2>Estoque baixo</h2>
                  {produtos.filter((produto) => produtoEstaAtivo(produto) && Number(produto.stock_quantity) <= 3).length > 0 ? (
                    produtos.filter((produto) => produtoEstaAtivo(produto) && Number(produto.stock_quantity) <= 3).slice(0, 5).map((produto) => (
                      <div className="admin-lista-item" key={produto.id}>
                        <img src={obterImagensProduto(produto)[0]} alt={produto.name} />
                        <div><strong>{produto.name}</strong><span>{produto.brand}</span></div>
                        <em>{produto.stock_quantity} un.</em>
                      </div>
                    ))
                  ) : (
                    <p className="admin-texto-vazio">Nenhum produto com estoque crítico.</p>
                  )}
                </div>

                <div className="admin-card">
                  <h2>Pedidos recentes</h2>
                  {pedidosRecentes.length > 0 ? pedidosRecentes.map((pedido) => {
                    const status = obterStatusPedido(pedido.status)
                    const clientePedido = pedido.customer_name || pedido.user?.name || pedido.customer_email || 'Cliente não identificado'
                    const dataPedido = pedido.paid_at || pedido.created_at
                      ? new Date(pedido.paid_at || pedido.created_at).toLocaleDateString('pt-BR')
                      : 'Data não informada'

                    return (
                      <article className="admin-lista-item admin-lista-item-pedido" key={pedido.id}>
                        <div className="admin-lista-icone"><ShoppingCart size={18} /></div>
                        <div className="admin-lista-pedido-conteudo">
                          <div className="admin-lista-pedido-topo">
                            <strong>Pedido #{pedido.id}</strong>
                            <small>{dataPedido}</small>
                          </div>
                          <span>{clientePedido}</span>
                        </div>
                        <div className="admin-lista-pedido-resumo">
                          <span className={status.className}>{status.label}</span>
                          <small>{moeda.format(Number(pedido.total_amount || 0))}</small>
                        </div>
                      </article>
                    )
                  }) : (
                    <p className="admin-texto-vazio">Nenhum pedido registrado até o momento.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {abaAtiva === 'produtos' && (
            <>
              <div className="admin-titulo linha">
                <div>
                  <h1>Produtos</h1>
                  <p>Gerencie o catálogo de produtos da loja.</p>
                </div>
                <button className="botao" type="button" onClick={() => {
                  if (formProdutoAberto && !produtoEditandoId) {
                    setFormProdutoAberto(false)
                    resetarFormularioProduto()
                    return
                  }

                  resetarFormularioProduto()
                  setFormProdutoAberto(true)
                  document.getElementById('form-produto')?.scrollIntoView({ behavior: 'smooth' })
                }}>
                  <Plus size={17} />
                  {formProdutoAberto ? (produtoEditandoId ? 'Editando produto' : 'Fechar formulário') : 'Adicionar produto'}
                </button>
              </div>

              <div className="admin-card">
                <div className="admin-filtros">
                  <div className="campo-com-icone">
                    <Search size={17} />
                    <input value={buscaProduto} onChange={(e) => setBuscaProduto(e.target.value)} placeholder="Buscar produtos..." />
                  </div>
                  <div className="campo-select-admin">
                    <Filter size={17} />
                    <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                      <option value="todas">Todas</option>
                      {categorias.map((categoria) => <option value={categoria.id} key={categoria.id}>{categoria.name}</option>)}
                    </select>
                  </div>
                  <div className="campo-select-admin">
                    <Package size={17} />
                    <select value={filtroEstoque} onChange={(e) => setFiltroEstoque(e.target.value)}>
                      <option value="todos">Todos os estoques</option>
                      <option value="critico">Estoque crítico</option>
                      <option value="baixo">Estoque baixo</option>
                      <option value="normal">Estoque normal</option>
                    </select>
                  </div>
                </div>

                <div className="tabela-admin">
                  <table>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosFiltrados.map((produto) => (
                        <tr key={produto.id}>
                          <td><img src={obterImagensProduto(produto)[0]} alt={produto.name} /></td>
                          <td>
                            <div className="produto-admin-identificacao">
                              <strong>{produto.name}</strong>
                              {produto.old_price ? <span className="badge alerta">Em oferta</span> : null}
                            </div>
                            <span>{produto.brand}</span>
                          </td>
                          <td><em>{produto.category?.name || 'Sem categoria'}</em></td>
                          <td>R$ {Number(produto.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td>
                            {estoqueEditandoId === produto.id ? (
                              <div className="estoque-edicao-rapida">
                                <input
                                  type="number"
                                  min="0"
                                  value={estoqueRapidoValor}
                                  onChange={(e) => setEstoqueRapidoValor(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') salvarEdicaoRapidaEstoque(produto)
                                    if (e.key === 'Escape') cancelarEdicaoRapidaEstoque()
                                  }}
                                  autoFocus
                                />
                                <button className="botao-acao salvar" type="button" onClick={() => salvarEdicaoRapidaEstoque(produto)}>
                                  <Check size={14} />
                                </button>
                                <button className="botao-acao cancelar" type="button" onClick={cancelarEdicaoRapidaEstoque}>
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                className={`badge badge-estoque-editavel ${Number(produto.stock_quantity) <= 3 ? 'perigo' : 'sucesso'}`}
                                type="button"
                                onClick={() => iniciarEdicaoRapidaEstoque(produto)}
                                title="Clique para editar o estoque"
                              >
                                {produto.stock_quantity}
                              </button>
                            )}
                          </td>
                          <td>
                            <button
                              className={`badge ${produtoEstaAtivo(produto) ? 'sucesso' : 'perigo'}`}
                              type="button"
                              onClick={() => alternarProdutoAtivo(produto)}
                              title={produtoEstaAtivo(produto) ? 'Clique para desativar o produto' : 'Clique para ativar o produto'}
                            >
                              {produtoEstaAtivo(produto) ? 'Ativo' : 'Inativo'}
                            </button>
                          </td>
                          <td>
                            <div className="acoes-tabela">
                              <button className="botao-acao editar" type="button" onClick={() => editarProduto(produto)}>
                                <Pencil size={15} />
                                Editar
                              </button>
                              <button className={`botao-acao ${produtoEstaAtivo(produto) ? 'excluir' : 'salvar'}`} type="button" onClick={() => alternarProdutoAtivo(produto)}>
                                <Trash2 size={15} />
                                {produtoEstaAtivo(produto) ? 'Desativar' : 'Ativar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {formProdutoAberto && (
              <form id="form-produto" className="form-card admin-form-amplo" onSubmit={enviarProduto}>
                <div className="admin-subtopo">
                  <h2>{produtoEditandoId ? 'Editar produto' : 'Novo produto'}</h2>
                  {produtoEditandoId && (
                    <button className="botao secundario-admin" type="button" onClick={() => {
                      resetarFormularioProduto()
                      setFormProdutoAberto(false)
                    }}>
                      Cancelar edição
                    </button>
                  )}
                  {!produtoEditandoId && (
                    <button className="botao secundario-admin" type="button" onClick={() => {
                      resetarFormularioProduto()
                      setFormProdutoAberto(false)
                    }}>
                      Fechar
                    </button>
                  )}
                </div>
                <div className="roteiro-form-produto">
                  <strong>Preencha nesta ordem</strong>
                  <span>Comece pelos dados principais, depois imagens, preço, frete, especificações e finalize com a descrição.</span>
                </div>
                <div className="admin-form-grid">
                  <label className="campo-admin destaque">
                    <span>Nome do produto</span>
                    <input value={produtoForm.name} onChange={(e) => setProdutoForm({ ...produtoForm, name: e.target.value })} placeholder="Ex: Armação Rockbros esportiva" required />
                    <small>Esse é o nome que o cliente verá na vitrine.</small>
                  </label>
                  <label className="campo-admin">
                    <span>Marca</span>
                    <input value={produtoForm.brand} onChange={(e) => setProdutoForm({ ...produtoForm, brand: e.target.value })} placeholder="Ex: Rockbros" required />
                    <small>Ajuda o cliente a identificar o produto rapidamente.</small>
                  </label>
                  <label className="campo-admin destaque">
                    <span>Categoria</span>
                    <select value={produtoForm.category_id} onChange={(e) => setProdutoForm({ ...produtoForm, category_id: e.target.value })} required>
                    <option value="">Selecione</option>
                    {categorias.map((categoria) => <option value={categoria.id} key={categoria.id}>{categoria.name}</option>)}
                  </select>
                    <small>Define onde o produto vai aparecer dentro da loja.</small>
                  </label>
                  <label className="campo-admin">
                    <span>Estoque disponível</span>
                    <input type="number" value={produtoForm.stock_quantity} onChange={(e) => setProdutoForm({ ...produtoForm, stock_quantity: e.target.value })} placeholder="0" required />
                    <small>Quantidade disponível para venda imediata.</small>
                  </label>
                  <div className="bloco-imagens-produto">
                    <div className="bloco-parcelamento-topo">
                      <strong>Galeria do produto</strong>
                      <span>Envie até 3 imagens. A primeira será usada como principal na vitrine e na página do produto. Você pode recortar cada imagem nova para pré-visualizar como ela ficará no card.</span>
                    </div>

                    <div className="upload-imagens-admin destaque-upload">
                      <label className="campo-upload-imagens" htmlFor="produto-imagens-input">
                        <div className="campo-upload-icone">
                          <ImagePlus size={24} />
                        </div>
                        <strong>Selecionar imagens</strong>
                        <span>Clique aqui para carregar imagens do produto. JPG, PNG ou WEBP. Você pode adicionar novas imagens sem perder as atuais.</span>
                      </label>
                      <input
                        id="produto-imagens-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          adicionarArquivosProduto(e.target.files)
                          e.target.value = ''
                        }}
                      />
                      <small>{produtoForm.existing_images.length + produtoForm.files.length}/3 imagens preparadas</small>
                    </div>

                    <div className="grade-imagens-admin">
                      {produtoForm.existing_images.map((imagem, index) => (
                        <article className={`card-imagem-admin ${index === 0 ? 'principal' : ''}`} key={`existente-${imagem}-${index}`}>
                          <img src={montarUrlImagem(imagem)} alt={`Imagem existente ${index + 1}`} />
                          <div className="card-imagem-admin-info">
                            <strong>{index === 0 ? 'Imagem principal atual' : `Imagem atual ${index + 1}`}</strong>
                            <span>{imagem}</span>
                          </div>
                          <div className="card-imagem-admin-acoes">
                            {index !== 0 && (
                              <button className="botao-acao editar" type="button" onClick={() => tornarImagemExistentePrincipal(index)}>
                                Tornar principal
                              </button>
                            )}
                            <button className="botao-acao excluir" type="button" onClick={() => removerImagemExistente(index)}>
                              <Trash2 size={15} />
                              Remover
                            </button>
                          </div>
                        </article>
                      ))}

                      {produtoForm.files.map((item, index) => {
                        const posicaoFinal = produtoForm.existing_images.length + index

                        return (
                          <article className={`card-imagem-admin nova ${posicaoFinal === 0 ? 'principal' : ''}`} key={item.id}>
                            <img src={item.previewUrl} alt={`Nova imagem ${index + 1}`} />
                          <div className="card-imagem-admin-info">
                              <strong>{posicaoFinal === 0 ? 'Nova imagem principal' : `Nova imagem ${index + 1}`}</strong>
                              <span>{item.file.name}</span>
                            </div>
                            <div className="card-imagem-admin-acoes">
                              <button className="botao-acao editar" type="button" onClick={() => abrirEditorRecorteProduto(item)}>
                                Recortar
                              </button>
                              {produtoForm.existing_images.length === 0 && index !== 0 && (
                                <button className="botao-acao editar" type="button" onClick={() => tornarImagemNovaPrincipal(item.id)}>
                                  Tornar principal
                                </button>
                              )}
                              <button className="botao-acao excluir" type="button" onClick={() => removerImagemNova(item.id)}>
                                <Trash2 size={15} />
                                Remover
                              </button>
                            </div>
                          </article>
                        )
                      })}

                      {produtoForm.existing_images.length + produtoForm.files.length === 0 && (
                        <div className="estado-imagens-admin">
                          <strong>Nenhuma imagem selecionada</strong>
                          <span>Adicione pelo menos uma imagem para cadastrar ou atualizar o produto.</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bloco-precificacao-produto">
                    <div className="bloco-parcelamento-topo">
                      <strong>Precificação do produto</strong>
                      <span>Informe o preço base e altere desconto ou preço atual. O sistema calcula automaticamente o outro campo.</span>
                    </div>
                    <div className="bloco-precificacao-grid">
                      <label className="campo-admin">
                        <span>Preço base</span>
                        <input inputMode="numeric" value={produtoForm.old_price} onChange={(e) => atualizarPrecoBase(e.target.value)} placeholder="R$ 0,00" />
                        <small>Preço de referência para comparação, se houver.</small>
                      </label>
                      <label className="campo-admin destaque campo-admin-preco-atual">
                        <span>Preço atual</span>
                        <input inputMode="numeric" value={produtoForm.price} onChange={(e) => atualizarPrecoAtual(e.target.value)} placeholder="R$ 0,00" required />
                        <small>Valor final exibido ao cliente.</small>
                      </label>
                      <label className="campo-admin">
                        <span>Desconto</span>
                        <div className="campo-sufixo">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            inputMode="numeric"
                            value={produtoForm.discount_percentage}
                            onChange={(e) => atualizarDesconto(e.target.value)}
                            placeholder="0"
                          />
                          <span>%</span>
                        </div>
                        <small>Opcional. O sistema recalcula o valor automaticamente.</small>
                      </label>
                      <div className="resumo-precificacao-admin">
                        <span>Resumo</span>
                        <strong>{produtoForm.price || 'R$ 0,00'}</strong>
                        <small>
                          {produtoForm.old_price && produtoForm.discount_percentage
                            ? `De ${produtoForm.old_price} por ${produtoForm.price || 'R$ 0,00'}`
                            : 'Preço atual exibido na loja'}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="bloco-frete-produto">
                    <div className="bloco-parcelamento-topo">
                      <strong>Informações importantes para cálculo do frete</strong>
                      <span>Essas medidas e peso são usados diretamente para cotar o frete no checkout.</span>
                    </div>
                    <div className="acoes-medidas-padrao">
                      <button className="botao secundario-admin" type="button" onClick={aplicarMedidasPadraoProduto}>
                        Medidas padrão
                      </button>
                      <small>Preenche automaticamente com os valores definidos em Configurações.</small>
                    </div>
                    <div className="bloco-frete-grid">
                      <label className="campo-admin"><span>Peso (kg)</span><input inputMode="numeric" value={produtoForm.weight} onChange={(e) => setProdutoForm({ ...produtoForm, weight: formatarPesoCampo(e.target.value) })} placeholder="0,000 kg" required /><small>Usado no cálculo do frete.</small></label>
                      <label className="campo-admin"><span>Largura (cm)</span><input type="number" step="0.01" min="0.01" value={produtoForm.width} onChange={(e) => setProdutoForm({ ...produtoForm, width: e.target.value })} required /><small>Medida da embalagem.</small></label>
                      <label className="campo-admin"><span>Altura (cm)</span><input type="number" step="0.01" min="0.01" value={produtoForm.height} onChange={(e) => setProdutoForm({ ...produtoForm, height: e.target.value })} required /><small>Medida da embalagem.</small></label>
                      <label className="campo-admin"><span>Comprimento (cm)</span><input type="number" step="0.01" min="0.01" value={produtoForm.length} onChange={(e) => setProdutoForm({ ...produtoForm, length: e.target.value })} required /><small>Medida da embalagem.</small></label>
                    </div>
                  </div>
                  <div className="bloco-especificacoes-produto">
                    <div className="bloco-parcelamento-topo">
                      <strong>Especificações técnicas do produto</strong>
                      <span>Configure aqui as informações que aparecem na página do produto para o cliente.</span>
                    </div>
                    <div className="admin-form-grid bloco-especificacoes-grid">
                      <label className="campo-admin"><span>Material da armação</span><input value={produtoForm.frame_material} onChange={(e) => setProdutoForm({ ...produtoForm, frame_material: e.target.value })} placeholder="Ex: Acetato" /><small>Informação útil para decisão de compra.</small></label>
                      <label className="campo-admin"><span>Tamanho</span><input value={produtoForm.size_label} onChange={(e) => setProdutoForm({ ...produtoForm, size_label: e.target.value })} placeholder="Ex: Médio" /><small>Nome simples para o cliente entender.</small></label>
                      <label className="campo-admin"><span>Largura da lente (mm)</span><input type="number" min="1" value={produtoForm.lens_width_mm} onChange={(e) => setProdutoForm({ ...produtoForm, lens_width_mm: e.target.value })} /><small>Medida técnica opcional.</small></label>
                      <label className="campo-admin"><span>Ponte (mm)</span><input type="number" min="1" value={produtoForm.bridge_mm} onChange={(e) => setProdutoForm({ ...produtoForm, bridge_mm: e.target.value })} /><small>Distância entre as lentes.</small></label>
                      <label className="campo-admin"><span>Comprimento da haste (mm)</span><input type="number" min="1" value={produtoForm.temple_length_mm} onChange={(e) => setProdutoForm({ ...produtoForm, temple_length_mm: e.target.value })} /><small>Informação complementar do encaixe.</small></label>
                      <label className="campo-admin"><span>Gênero</span><input value={produtoForm.gender} onChange={(e) => setProdutoForm({ ...produtoForm, gender: e.target.value })} placeholder="Ex: Unissex" /><small>Use apenas se fizer sentido para a vitrine.</small></label>
                    </div>
                    <div className="cores-disponiveis-admin">
                    <div className="cores-disponiveis-topo">
                      <strong>Cores disponíveis</strong>
                      <span>A primeira cor da lista será usada como cor principal do produto.</span>
                      <button className="botao secundario-admin" type="button" onClick={adicionarCorDisponivel}>Adicionar cor</button>
                    </div>
                      <div className="cores-disponiveis-lista">
                        {produtoForm.available_colors.map((cor, index) => (
                          <div className="linha-cor-admin" key={`cor-disponivel-${index}`}>
                            <input type="color" value={cor.hex} onChange={(e) => atualizarCorDisponivel(index, 'hex', e.target.value)} />
                            <input value={cor.name} onChange={(e) => atualizarCorDisponivel(index, 'name', e.target.value)} placeholder="Nome da cor" />
                            <button className="botao-acao excluir" type="button" onClick={() => removerCorDisponivel(index)}>
                              <Trash2 size={15} />
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bloco-parcelamento">
                    <div className="bloco-parcelamento-topo">
                      <strong>Parcelamento</strong>
                      <span>Se ativado, o produto será exibido sempre com parcelamento sem juros.</span>
                    </div>
                    <div className="bloco-parcelamento-grid">
                      <label className="checkbox-linha">
                        <input
                          type="checkbox"
                          checked={produtoForm.installments_enabled}
                          onChange={(e) => setProdutoForm({ ...produtoForm, installments_enabled: e.target.checked })}
                        />
                        Permitir parcelamento neste produto
                      </label>
                      <label className="campo-admin">
                        <span>Parcelas máximas</span>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={produtoForm.installments_count}
                          onChange={(e) => setProdutoForm({ ...produtoForm, installments_count: e.target.value })}
                          disabled={!produtoForm.installments_enabled}
                          required={produtoForm.installments_enabled}
                        />
                        <small>Quantidade máxima mostrada na loja.</small>
                      </label>
                    </div>
                  </div>
                  <label className="campo-admin campo-descricao destaque">
                    <span>Descrição do produto</span>
                    <textarea value={produtoForm.description} onChange={(e) => setProdutoForm({ ...produtoForm, description: e.target.value })} placeholder="Descreva o produto com clareza: estilo, material, conforto e diferenciais." required />
                    <small>Esse texto ajuda o cliente a entender o produto antes da compra.</small>
                  </label>
                </div>
                <div className="acoes-form-produto">
                  <button className="botao destaque" type="submit">{produtoEditandoId ? 'Salvar alterações' : 'Cadastrar produto'}</button>
                </div>
              </form>
              )}
            </>
          )}

          {abaAtiva === 'categorias' && (
            <>
              <div className="admin-titulo linha">
                <div>
                  <h1>Categorias</h1>
                  <p>Organize as categorias exibidas no catálogo.</p>
                </div>
                <button className="botao" type="button" onClick={() => {
                  if (formCategoriaAberto && !categoriaEditandoId) {
                    fecharFormularioCategoria()
                    return
                  }

                  abrirFormularioNovaCategoria()
                }}>
                  <Plus size={17} />
                  {formCategoriaAberto ? (categoriaEditandoId ? 'Editando categoria' : 'Fechar formulário') : 'Adicionar categoria'}
                </button>
              </div>

                  {formCategoriaAberto ? (
                <div className="admin-duas-colunas admin-duas-colunas-categorias">
                  <form className="form-card" onSubmit={enviarCategoria}>
                    <div className="admin-subtopo">
                      <h2>{categoriaEditandoId ? 'Editar categoria' : 'Nova categoria'}</h2>
                      {categoriaEditandoId && (
                        <button className="botao secundario-admin" type="button" onClick={() => {
                          fecharFormularioCategoria()
                        }}>
                          Cancelar edição
                        </button>
                      )}
                      {!categoriaEditandoId && (
                        <button className="botao secundario-admin" type="button" onClick={() => {
                          fecharFormularioCategoria()
                        }}>
                          Fechar
                        </button>
                      )}
                    </div>
                    <label>Nome<input value={categoriaForm.name} onChange={(e) => setCategoriaForm({ ...categoriaForm, name: e.target.value })} required /></label>
                    <label>
                      Imagem
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          selecionarArquivoCategoria(e.target.files?.[0] || null)
                          e.target.value = ''
                        }}
                      />
                    </label>
                    {categoriaForm.previewUrl ? (
                      <div className="preview-categoria-admin">
                        <article className="card-imagem-admin nova principal">
                          <img src={categoriaForm.previewUrl} alt="Preview da categoria" />
                          <div className="card-imagem-admin-info">
                            <strong>Preview do card da categoria</strong>
                            <span>{categoriaForm.file?.name || 'Imagem atualmente vinculada à categoria'}</span>
                          </div>
                          <div className="card-imagem-admin-acoes">
                            <button className="botao-acao editar" type="button" onClick={abrirEditorRecorteCategoria}>
                              Recortar
                            </button>
                            <button className="botao-acao excluir" type="button" onClick={removerArquivoCategoria}>
                              <Trash2 size={15} />
                              Remover
                            </button>
                          </div>
                        </article>
                      </div>
                    ) : null}
                    <button className="botao destaque botao-salvar-categoria" type="submit">{categoriaEditandoId ? 'Salvar alterações' : 'Cadastrar categoria'}</button>
                  </form>

                  <div className="admin-card lista-categorias-card">
                    <h2>Categorias cadastradas</h2>
                    {categorias.length > 0 ? categorias.map((categoria) => (
                      <div className="admin-lista-item" key={categoria.id}>
                        <img src={montarUrlImagem(categoria.path)} alt={categoria.name} />
                        <div><strong>{categoria.name}</strong><span>{categoria.slug}</span></div>
                        <div className="acoes-tabela">
                          <button className="botao-acao editar" type="button" onClick={() => editarCategoria(categoria)}>
                            <Pencil size={15} />
                            Editar
                          </button>
                          <button className="botao-acao excluir" type="button" onClick={() => removerCategoria(categoria)}>
                            <Trash2 size={15} />
                            Excluir
                          </button>
                        </div>
                      </div>
                    )) : <p className="admin-texto-vazio">Nenhuma categoria cadastrada.</p>}
                  </div>
                </div>
              ) : (
                <div className="admin-card lista-categorias-card largura-total">
                  <h2>Categorias cadastradas</h2>
                  {categorias.length > 0 ? categorias.map((categoria) => (
                    <div className="admin-lista-item" key={categoria.id}>
                      <img src={montarUrlImagem(categoria.path)} alt={categoria.name} />
                      <div><strong>{categoria.name}</strong><span>{categoria.slug}</span></div>
                      <div className="acoes-tabela">
                        <button className="botao-acao editar" type="button" onClick={() => editarCategoria(categoria)}>
                          <Pencil size={15} />
                          Editar
                        </button>
                        <button className="botao-acao excluir" type="button" onClick={() => removerCategoria(categoria)}>
                          <Trash2 size={15} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  )) : <p className="admin-texto-vazio">Nenhuma categoria cadastrada.</p>}
                </div>
              )}
            </>
          )}

          {abaAtiva === 'pedidos' && (
            <>
              <div className="admin-titulo linha">
                <div>
                  <h1>Pedidos</h1>
                  <p>Gerencie e acompanhe os pedidos da loja.</p>
                </div>
                <button className="botao secundario-admin" type="button" onClick={exportarPedidosCsv}><Download size={17} /> Exportar</button>
              </div>

              <div className="admin-status-grid">
                <div className="admin-card status-card"><strong>{statusPedidos.total}</strong><span>Total</span></div>
                <div className="admin-card status-card"><strong>{statusPedidos.pendentes}</strong><span>Pendentes</span></div>
                <div className="admin-card status-card"><strong>{statusPedidos.processando}</strong><span>Processando</span></div>
                <div className="admin-card status-card"><strong>{statusPedidos.pagos}</strong><span>Pagos</span></div>
                <div className="admin-card status-card"><strong>{statusPedidos.expirados}</strong><span>Expirados</span></div>
              </div>

              <div className="admin-card">
                <div className="admin-filtros">
                  <div className="campo-com-icone">
                    <Search size={17} />
                      <input
                        value={buscaPedido}
                        onChange={(e) => setBuscaPedido(e.target.value)}
                        placeholder="Buscar por pedido, cliente, e-mail ou referência do pagamento"
                      />
                  </div>
                  <div className="campo-select-admin">
                    <Filter size={17} />
                    <select value={filtroPedidoStatus} onChange={(e) => setFiltroPedidoStatus(e.target.value)}>
                      <option value="todos">Todos os status</option>
                      <option value="aguardando_pagamento">Aguardando pagamento</option>
                      <option value="pago">Pagamento confirmado</option>
                      <option value="expirado">Expirado</option>
                      <option value="em_preparacao">Em preparação</option>
                      <option value="em_transporte">Em transporte</option>
                      <option value="entregue">Entregue</option>
                    </select>
                  </div>
                  <button
                    className={`botao-icone admin-calendario ${filtroDatasAberto || filtroPedidoDataInicio || filtroPedidoDataFim ? 'ativo' : ''}`}
                    type="button"
                    onClick={abrirFiltrosDeData}
                  >
                    <Calendar size={18} />
                    <span>Filtrar por data</span>
                  </button>
                </div>
                {filtroDatasAberto ? (
                  <div className="admin-filtros-data">
                    <label className="filtro-data-campo">
                      <span>Data inicial</span>
                      <input
                        ref={filtroDataInicioRef}
                        type="date"
                        value={filtroPedidoDataInicio}
                        onChange={(e) => setFiltroPedidoDataInicio(e.target.value)}
                      />
                    </label>
                    <label className="filtro-data-campo">
                      <span>Data final</span>
                      <input
                        ref={filtroDataFimRef}
                        type="date"
                        value={filtroPedidoDataFim}
                        min={filtroPedidoDataInicio || undefined}
                        onChange={(e) => setFiltroPedidoDataFim(e.target.value)}
                      />
                    </label>
                    <div className="admin-filtros-data-acoes">
                      <small>Use o período para localizar pedidos com mais rapidez.</small>
                      <button
                        className="botao secundario-admin"
                        type="button"
                        onClick={() => {
                          setFiltroPedidoDataInicio('')
                          setFiltroPedidoDataFim('')
                          setFiltroDatasAberto(false)
                        }}
                      >
                        Limpar datas
                      </button>
                    </div>
                  </div>
                ) : null}
                <div className="tabela-admin">
                  <table>
                    <colgroup>
                      <col className="col-pedido-admin" />
                      <col className="col-cliente-admin" />
                      <col className="col-data-admin" />
                      <col className="col-pagamento-admin" />
                      <col className="col-envio-admin" />
                      <col className="col-total-admin" />
                      <col className="col-acoes-admin" />
                    </colgroup>
                    <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Pagamento</th><th>Envio</th><th>Total</th><th></th></tr></thead>
                    <tbody>
                      {pedidosFiltrados.length > 0 ? pedidosFiltrados.map((pedido) => {
                        const statusPagamento = obterStatusPedido(pedido.status)
                        const statusEnvio = obterStatusEnvioPedido(pedido)
                        const statusComercial = obterStatusComercialPedido(pedido)
                        const resumoPagamento = obterResumoPagamento(pedido)
                        const detalhesPagamento = obterDetalhesPagamentoSecundarios(pedido, moeda)

                        return (
                          <tr key={pedido.id}>
                            <td>
                              <strong>#{pedido.id}</strong>
                              <span>{pedido.items?.length || 0} item(ns)</span>
                            </td>
                            <td>
                              <strong>{pedido.customer_name || pedido.user?.name || 'Cliente não identificado'}</strong>
                              <span>{pedido.customer_email || pedido.user?.email || 'Sem e-mail'}</span>
                            </td>
                            <td>{formatarData(pedido.paid_at || pedido.created_at)}</td>
                            <td className="coluna-pagamento">
                              <div className="bloco-pagamento-admin">
                                <strong className="status-pagamento-admin">{statusPagamento.label}</strong>
                                <span className="metodo-pagamento-admin">{resumoPagamento}</span>
                                {detalhesPagamento.map((linha) => <span className="detalhe-pagamento-admin" key={`${pedido.id}-${linha}`}>{linha}</span>)}
                                <span className="referencia-pagamento">Ref. {pedido.payment_reference}</span>
                              </div>
                            </td>
                            <td className="coluna-envio-admin">
                              <div className="bloco-envio-admin">
                                <span className={statusComercial.className}>{statusComercial.label}</span>
                                <span>{statusEnvio.label}</span>
                                <span>{pedido.tracking_code || pedido.shipping_company_name || 'Sem rastreio'}</span>
                              </div>
                            </td>
                            <td className="coluna-total-admin">{moeda.format(Number(pedido.total_amount || 0))}</td>
                            <td className="coluna-acoes-pedido">
                              <div className="acoes-tabela acoes-tabela-pedidos">
                                <button className={`botao-acao visualizar ${pedidoDetalheAbertoId === pedido.id ? 'ativo' : ''}`} type="button" onClick={() => abrirDetalhesPedido(pedido)}>
                                  <Eye size={15} />
                                  Detalhes
                                </button>
                                <button className={`botao-acao editar ${pedidoEditandoId === pedido.id ? 'ativo' : ''}`} type="button" onClick={() => editarPedido(pedido)}>
                                  <Truck size={15} />
                                  Gerenciar
                                </button>
                                <button className="botao-acao imprimir" type="button" onClick={() => imprimirResumoEnvio(pedido)}>
                                  <Printer size={15} />
                                  Imprimir
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      }) : <tr><td colSpan="7" className="tabela-vazia">Nenhum pedido encontrado com os filtros atuais.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {pedidoEditandoId ? (
                <form className="form-card" id="form-pedido-admin" onSubmit={salvarPedido}>
                  <div className="admin-subtopo">
                    <div>
                      <h2>Gerenciar pedido #{pedidoEditandoId}</h2>
                      <p>Atualize o andamento logístico e informe o rastreio para o cliente acompanhar a entrega.</p>
                    </div>
                    <button className="botao secundario-admin" type="button" onClick={() => setPedidoEditandoId(null)}>
                      Fechar
                    </button>
                  </div>

                  <section className="bloco-pedido-admin bloco-pedido-admin-status">
                    <div className="bloco-parcelamento-topo">
                      <strong>Status e despacho</strong>
                      <span>Controle aqui a situação do pagamento, a transportadora usada e o andamento da entrega.</span>
                    </div>
                    <div className="admin-form-grid">
                      <label className="campo-admin destaque">
                        <span>Modalidade de entrega</span>
                        <select
                          value={pedidoForm.shipping_service_id}
                          onChange={(e) => {
                            const proximoServico = servicosEntregaAdmin.find((item) => item.value === e.target.value) || servicosEntregaAdmin[0]
                            setPedidoForm((atual) => ({
                              ...atual,
                              shipping_service_id: proximoServico.value,
                              shipping_service_name: proximoServico.label,
                              shipping_company_name: proximoServico.company,
                              tracking_code: proximoServico.value === 'retirada_loja' ? '' : atual.tracking_code,
                              tracking_url: proximoServico.value === 'retirada_loja' ? '' : atual.tracking_url,
                              fulfillment_status: proximoServico.value === 'retirada_loja' ? '' : (atual.fulfillment_status || 'em_preparacao'),
                            }))
                          }}
                        >
                          {servicosEntregaAdmin.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <small>Permite alternar entre entrega transportada e retirada local.</small>
                      </label>
                      <label className="campo-admin destaque">
                        <span>Status do pedido</span>
                        <select
                          value={pedidoForm.status}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, status: e.target.value })}
                        >
                          <option value="aguardando_pagamento">Aguardando pagamento</option>
                          <option value="processando">Processando</option>
                          <option value="pago">Pago</option>
                          <option value="expirado">Expirado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                        <small>Use este campo para refletir a situação geral do pedido.</small>
                      </label>
                      <label className="campo-admin destaque">
                        <span>Status do envio</span>
                        <select
                          disabled={pedidoForm.status === 'cancelado' || pedidoEditandoEhRetirada}
                          value={pedidoForm.fulfillment_status}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, fulfillment_status: e.target.value })}
                        >
                          {statusEnvioOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <small>Mostra ao cliente em que etapa logística o pedido está.</small>
                      </label>
                      <label className="campo-admin">
                        <span>Transportadora</span>
                        <input
                          disabled={pedidoEditandoEhRetirada}
                          value={pedidoForm.shipping_company_name}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, shipping_company_name: e.target.value })}
                          placeholder="Correios, Jadlog, Loggi..."
                        />
                        <small>Informe a empresa responsável pela entrega.</small>
                      </label>
                    </div>
                  </section>

                  {pedidoEditandoEhRetirada ? (
                    <section className="bloco-pedido-admin bloco-pedido-admin-rastreio">
                      <div className="bloco-parcelamento-topo">
                        <strong>Retirada na loja</strong>
                        <span>Este pedido não precisa de rastreio nem de etiqueta enquanto estiver marcado para retirada local.</span>
                      </div>
                      <div className="pedido-admin-ajuda pedido-admin-ajuda-info">
                        <strong>Atendimento no balcão</strong>
                        <span>Deixe esta modalidade para pedidos retirados presencialmente na ótica.</span>
                        <span>Se o cliente voltar a precisar de envio, altere a modalidade para PAC ou SEDEX e o bloco de etiqueta será liberado novamente.</span>
                      </div>
                    </section>
                  ) : (
                    <section className="bloco-pedido-admin bloco-pedido-admin-rastreio">
                      <div className="bloco-parcelamento-topo">
                        <strong>Rastreamento</strong>
                        <span>Preencha os dados que o cliente vai usar para acompanhar a entrega.</span>
                      </div>
                      <div className="admin-form-grid">
                        <label className="campo-admin destaque">
                          <span>Código de rastreio</span>
                          <input
                            value={pedidoForm.tracking_code}
                            onChange={(e) => setPedidoForm({ ...pedidoForm, tracking_code: e.target.value.toUpperCase() })}
                            placeholder="AA123456789BR"
                          />
                          <small>O link de rastreio passa a usar o Melhor Envio automaticamente.</small>
                        </label>
                        <label className="campo-admin campo-descricao">
                          <span>Link de rastreio</span>
                          <input
                            value={pedidoForm.tracking_url}
                            onChange={(e) => setPedidoForm({ ...pedidoForm, tracking_url: e.target.value })}
                            placeholder="Opcional para outras transportadoras"
                          />
                          <small>Preencha manualmente apenas se precisar sobrescrever o link padrão do Melhor Envio.</small>
                        </label>
                      </div>
                      <div className="acoes-melhor-envio">
                        <div className="acoes-melhor-envio-esquerda">
                          <div className="acoes-melhor-envio-botoes">
                            <div
                              className={`acao-fluxo-wrapper ${obterClasseFluxoMelhorEnvio({ enabled: podePrepararEtiqueta, completed: etapaPrepareConcluida })}`}
                              title={podePrepararEtiqueta ? 'Passo 1: cria o envio no carrinho do Melhor Envio com os dados do pedido.' : 'Etapa já concluída para este pedido.'}
                            >
                              <button
                                className={`botao secundario-admin botao-fluxo ${obterClasseFluxoMelhorEnvio({ enabled: podePrepararEtiqueta, completed: etapaPrepareConcluida })}`}
                                type="button"
                                onClick={() => prepararEtiquetaPedido(pedidoEditandoId)}
                                disabled={!podePrepararEtiqueta}
                              >
                                <Package size={16} />
                                Preparar etiqueta
                              </button>
                            </div>
                            <div
                              className={`acao-fluxo-wrapper ${obterClasseFluxoMelhorEnvio({ enabled: podeComprarEtiqueta, completed: etapaCheckoutConcluida })}`}
                              title={podeComprarEtiqueta ? 'Passo 2: compra a etiqueta no Melhor Envio depois que o envio já foi preparado.' : etapaCheckoutConcluida ? 'Etiqueta já comprada.' : 'Prepare a etiqueta primeiro.'}
                            >
                              <button
                                className={`botao secundario-admin botao-fluxo ${obterClasseFluxoMelhorEnvio({ enabled: podeComprarEtiqueta, completed: etapaCheckoutConcluida })}`}
                                type="button"
                                onClick={() => comprarEtiquetaPedido(pedidoEditandoId)}
                                disabled={!podeComprarEtiqueta}
                              >
                                <CreditCard size={16} />
                                Comprar etiqueta
                              </button>
                            </div>
                            <div
                              className={`acao-fluxo-wrapper ${obterClasseFluxoMelhorEnvio({ enabled: podeGerarEtiqueta, completed: etapaGenerateConcluida })}`}
                              title={podeGerarEtiqueta ? 'Passo 3: gera a etiqueta já paga para liberar impressão e rastreio.' : etapaGenerateConcluida ? 'Etiqueta já gerada.' : 'Compre a etiqueta antes de gerar.'}
                            >
                              <button
                                className={`botao secundario-admin botao-fluxo ${obterClasseFluxoMelhorEnvio({ enabled: podeGerarEtiqueta, completed: etapaGenerateConcluida })}`}
                                type="button"
                                onClick={() => gerarEtiquetaPedido(pedidoEditandoId)}
                                disabled={!podeGerarEtiqueta}
                              >
                                <Tag size={16} />
                                Gerar etiqueta
                              </button>
                            </div>
                            <div
                              className={`acao-fluxo-wrapper ${obterClasseFluxoMelhorEnvio({ enabled: podeImprimirEtiqueta, completed: etapaPrintConcluida, keepEnabledWhenCompleted: true })}`}
                              title={podeImprimirEtiqueta ? 'Passo 4: abre a etiqueta pronta para impressão. Pode ser usado novamente para reimprimir.' : 'Gere a etiqueta antes de imprimir.'}
                            >
                              <button
                                className={`botao secundario-admin botao-fluxo ${obterClasseFluxoMelhorEnvio({ enabled: podeImprimirEtiqueta, completed: etapaPrintConcluida, keepEnabledWhenCompleted: true })}`}
                                type="button"
                                onClick={() => imprimirEtiquetaPedido(pedidoEditandoId)}
                                disabled={!podeImprimirEtiqueta}
                              >
                                <Printer size={16} />
                                Imprimir etiqueta
                              </button>
                            </div>
                            <div
                              className={`acao-fluxo-wrapper ${obterClasseFluxoMelhorEnvio({ enabled: podeSincronizarEtiqueta, completed: etapaSyncConcluida, keepEnabledWhenCompleted: true })}`}
                              title={podeSincronizarEtiqueta ? 'Consulta o Melhor Envio para atualizar código, link e status do rastreio.' : 'Prepare a etiqueta antes de sincronizar o rastreio.'}
                            >
                              <button
                                className={`botao secundario-admin botao-fluxo ${obterClasseFluxoMelhorEnvio({ enabled: podeSincronizarEtiqueta, completed: etapaSyncConcluida, keepEnabledWhenCompleted: true })}`}
                                type="button"
                                onClick={() => sincronizarEtiquetaPedido(pedidoEditandoId)}
                                disabled={!podeSincronizarEtiqueta}
                              >
                                <Truck size={16} />
                                Sincronizar status
                              </button>
                            </div>
                          </div>
                          <div className="reset-melhor-envio-admin">
                            <div>
                              <strong>Resetar processo</strong>
                              <p>Se alguma etapa falhar ou a etiqueta ficar incorreta, reinicie o fluxo.</p>
                            </div>
                            <button
                              className="botao resetar-processo-melhor-envio"
                              type="button"
                              onClick={() => resetarProcessoEtiquetaPedido(pedidoEditandoId)}
                            >
                              <RotateCcw size={16} />
                              Resetar processo
                            </button>
                          </div>
                        </div>
                        <div className="resumo-melhor-envio-admin">
                          <strong>Integração Melhor Envio</strong>
                          <span>
                            {pedidoEditandoAtual?.melhor_envio_order_id
                              ? `Etiqueta vinculada ao envio ${pedidoEditandoAtual.melhor_envio_order_id}`
                              : 'Ainda não há etiqueta preparada para este pedido.'}
                          </span>
                          {pedidoEditandoAtual?.melhor_envio_status ? (
                            <small>Status externo: {pedidoEditandoAtual.melhor_envio_status}</small>
                          ) : null}
                          {pedidoEditandoAtual?.tracking_url ? (
                            <small>Rastreio público: {pedidoEditandoAtual.tracking_url}</small>
                          ) : null}
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="bloco-pedido-admin bloco-pedido-admin-destino">
                    <div className="bloco-parcelamento-topo">
                      <strong>Destinatário e endereço</strong>
                      <span>Ajuste estes campos somente antes da postagem, para evitar erro de entrega.</span>
                    </div>
                    <div className="admin-form-grid">
                      <label className="campo-admin destaque">
                        <span>Destinatário</span>
                        <input
                          value={pedidoForm.recipient_name}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, recipient_name: e.target.value })}
                        />
                        <small>Nome que será usado na conferência e envio.</small>
                      </label>
                      <label className="campo-admin">
                        <span>Telefone do destinatário</span>
                        <input
                          value={pedidoForm.recipient_phone}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, recipient_phone: e.target.value })}
                        />
                        <small>Contato útil caso a transportadora precise falar com o cliente.</small>
                      </label>
                      <label className="campo-admin destaque">
                        <span>CEP</span>
                        <input
                          value={pedidoForm.cep}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, cep: e.target.value })}
                        />
                        <small>Confira primeiro este campo para reduzir erro de rota.</small>
                      </label>
                      <label className="campo-admin">
                        <span>Rua</span>
                        <input
                          value={pedidoForm.street}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, street: e.target.value })}
                        />
                      </label>
                      <label className="campo-admin">
                        <span>Número</span>
                        <input
                          value={pedidoForm.number}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, number: e.target.value })}
                        />
                      </label>
                      <label className="campo-admin">
                        <span>Complemento</span>
                        <input
                          value={pedidoForm.complement}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, complement: e.target.value })}
                        />
                      </label>
                      <label className="campo-admin">
                        <span>Bairro</span>
                        <input
                          value={pedidoForm.neighborhood}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, neighborhood: e.target.value })}
                        />
                      </label>
                      <label className="campo-admin">
                        <span>Cidade</span>
                        <input
                          value={pedidoForm.city}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, city: e.target.value })}
                        />
                      </label>
                      <label className="campo-admin">
                        <span>UF</span>
                        <input
                          maxLength={2}
                          value={pedidoForm.state}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, state: e.target.value.toUpperCase() })}
                        />
                      </label>
                      <label className="campo-admin campo-descricao">
                        <span>Referência</span>
                        <input
                          value={pedidoForm.reference}
                          onChange={(e) => setPedidoForm({ ...pedidoForm, reference: e.target.value })}
                        />
                        <small>Ponto de apoio para localizar o endereço com mais segurança.</small>
                      </label>
                    </div>
                  </section>

                  <div className="pedido-admin-ajuda">
                    <strong>Fluxo sugerido</strong>
                    <span>{pedidoEditandoEhRetirada ? 'Pedido pago → separar no balcão → avisar cliente para retirada.' : 'Pagamento confirmado → em preparação → em transporte → entregue.'}</span>
                    <span>{pedidoEditandoEhRetirada ? 'Pedidos de retirada local não usam etiqueta nem rastreamento.' : 'Para envios pelos Correios, o link de rastreio é preenchido automaticamente quando houver código e a transportadora contiver "Correios".'}</span>
                    <span>Se o cliente pedir correção de endereço ou destinatário antes da postagem, ajuste os campos acima e salve antes do envio.</span>
                  </div>

                  <div className="acoes-form-produto">
                    <button className="botao-acao excluir" type="button" onClick={cancelarPedidoAtual}>
                      <Trash2 size={16} />
                      Cancelar pedido
                    </button>
                    <button className="botao secundario-admin" type="button" onClick={() => {
                      const pedidoAtual = pedidos.find((item) => item.id === pedidoEditandoId)
                      if (pedidoAtual) imprimirResumoEnvio(pedidoAtual)
                    }}>
                      <Printer size={16} />
                      Imprimir resumo
                    </button>
                    <button className="botao destaque" type="submit">Salvar andamento do pedido</button>
                  </div>
                </form>
              ) : null}

              {pedidoDetalhado ? (
                <section className="admin-card detalhe-pedido-admin" id="detalhe-pedido-admin">
                  <div className="admin-subtopo">
                    <div>
                      <h2>Conferência do pedido #{pedidoDetalhado.id}</h2>
                      <p>Visualize os dados mais importantes antes de separar, etiquetar e enviar.</p>
                    </div>
                    <button className="botao secundario-admin" type="button" onClick={() => setPedidoDetalheAbertoId(null)}>
                      Fechar detalhes
                    </button>
                  </div>

                  <div className="detalhe-pedido-admin-grid">
                    <div className="detalhe-pedido-admin-bloco">
                      <strong>Cliente</strong>
                      <div className="detalhe-pedido-admin-linhas">
                        <p><span>Nome</span><b>{pedidoDetalhado.customer_name || pedidoDetalhado.user?.name || 'Não informado'}</b></p>
                        <p><span>E-mail</span><b>{pedidoDetalhado.customer_email || pedidoDetalhado.user?.email || 'Não informado'}</b></p>
                        <p><span>Telefone</span><b>{pedidoDetalhado.customer_phone || pedidoDetalhado.user?.phone || 'Não informado'}</b></p>
                        <p><span>CPF</span><b>{pedidoDetalhado.user?.cpf || 'Não informado'}</b></p>
                      </div>
                    </div>

                    <div className="detalhe-pedido-admin-bloco">
                      <strong>Entrega</strong>
                      <div className="detalhe-pedido-admin-linhas">
                        <p><span>Transportadora</span><b>{pedidoEhRetiradaLoja(pedidoDetalhado) ? 'Retirada na loja' : (pedidoDetalhado.shipping_company_name || 'Correios')}</b></p>
                        <p><span>Serviço</span><b>{pedidoDetalhado.shipping_service_name || 'Não informado'}</b></p>
                        <p><span>Status do envio</span><b>{pedidoEhRetiradaLoja(pedidoDetalhado) ? 'Retirada presencial' : obterStatusEnvioPedido(pedidoDetalhado).label}</b></p>
                        <p><span>Rastreamento</span><b>{pedidoEhRetiradaLoja(pedidoDetalhado) ? 'Não se aplica' : (pedidoDetalhado.tracking_code || 'Ainda não informado')}</b></p>
                      </div>
                    </div>
                  </div>

                  <div className="detalhe-pedido-admin-grid">
                    <div className="detalhe-pedido-admin-bloco amplo">
                      <strong>Endereço do destinatário</strong>
                      <p className="detalhe-endereco-destino">
                        {pedidoDetalhado.shipping_address ? [
                          pedidoDetalhado.shipping_address.recipient_name,
                          pedidoDetalhado.shipping_address.street,
                          pedidoDetalhado.shipping_address.number,
                          pedidoDetalhado.shipping_address.complement,
                          pedidoDetalhado.shipping_address.neighborhood,
                          pedidoDetalhado.shipping_address.city,
                          pedidoDetalhado.shipping_address.state,
                          pedidoDetalhado.shipping_address.cep ? `CEP ${pedidoDetalhado.shipping_address.cep}` : '',
                          pedidoDetalhado.shipping_address.reference ? `Ref.: ${pedidoDetalhado.shipping_address.reference}` : '',
                        ].filter(Boolean).join(', ') : 'Endereço não informado'}
                      </p>
                    </div>
                  </div>

                  <div className="detalhe-pedido-admin-bloco amplo">
                    <strong>Itens para separação</strong>
                    <div className="detalhe-itens-admin-lista">
                      {(pedidoDetalhado.items || []).map((item) => (
                        <article key={item.id} className="detalhe-item-admin">
                          <div className="detalhe-item-admin-produto">
                            <img src={montarUrlImagem(item.product_image)} alt={item.product_name} onError={aplicarFallbackImagem} />
                            <div className="detalhe-item-admin-meta">
                              <b>{item.product_name}</b>
                              <small className="detalhe-item-admin-auxiliar">Conferir modelo, cor e quantidade antes da separação.</small>
                              <div className="detalhe-item-admin-tags">
                                <span className="detalhe-item-admin-tag">Ref.: {item.product_slug || 'sem slug'}</span>
                                <span className="detalhe-item-admin-tag cor">
                                  <i style={{ background: item.selected_color_hex || '#d9e2ec' }} />
                                  Cor: {item.selected_color_name || 'Não informada'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="detalhe-item-admin-resumo">
                            <small>Quantidade</small>
                            <b>{item.quantity} unidade(s)</b>
                            <small>Total do item</small>
                            <span>{moeda.format(Number(item.total_price || 0))}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="detalhe-pedido-admin-grid">
                    <div className="detalhe-pedido-admin-bloco">
                      <strong>Pagamento</strong>
                      <div className="detalhe-pedido-admin-linhas">
                        <p><span>Status</span><b>{obterStatusPedido(pedidoDetalhado.status).label}</b></p>
                        <p><span>Forma</span><b>{obterResumoPagamento(pedidoDetalhado)}</b></p>
                        {obterDetalhesPagamentoSecundarios(pedidoDetalhado, moeda).map((linha) => (
                          <p key={`detalhe-pagamento-${linha}`}><span>Detalhe</span><b>{linha}</b></p>
                        ))}
                        <p><span>ID da transação</span><b>{pedidoDetalhado.payment_transaction_id || 'Não informado'}</b></p>
                        <p><span>Subtotal</span><b>{moeda.format(Number(pedidoDetalhado.subtotal_amount || 0))}</b></p>
                        <p><span>Frete</span><b>{moeda.format(Number(pedidoDetalhado.shipping_price || 0))}</b></p>
                        <p><span>Total</span><b>{moeda.format(Number(pedidoDetalhado.total_amount || 0))}</b></p>
                      </div>
                    </div>

                    <div className="detalhe-pedido-admin-bloco">
                      <strong>Conferência antes do envio</strong>
                      <div className="detalhe-pedido-admin-checklist">
                        <span>Confirme nome do destinatário e CEP.</span>
                        <span>Verifique quantidade de itens e modelo enviado.</span>
                        <span>Após postar, salve transportadora, rastreio e status do envio.</span>
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </>
          )}

          {abaAtiva === 'clientes' && (
            <>
              <div className="admin-titulo linha">
                <div>
                  <h1>Clientes</h1>
                  <p>Gerencie a base de clientes da loja.</p>
                </div>
                <button className="botao secundario-admin"><Download size={17} /> Exportar</button>
              </div>

              <div className="admin-status-grid tres">
                <div className="admin-card status-card icone"><Users /><strong>0</strong><span>Total de clientes</span></div>
                <div className="admin-card status-card icone"><UserPlus /><strong>0</strong><span>Novos este mês</span></div>
                <div className="admin-card status-card icone"><ShoppingCart /><strong>{moeda.format(resumo.receita)}</strong><span>Faturamento total</span></div>
              </div>

              <div className="admin-card">
                <div className="admin-filtros">
                  <div className="campo-com-icone">
                    <Search size={17} />
                    <input value={buscaUsuario} onChange={(e) => setBuscaUsuario(e.target.value)} placeholder="Buscar clientes..." />
                  </div>
                </div>
                <div className="tabela-admin">
                  <table>
                    <thead><tr><th>Cliente</th><th>Contato</th><th>Cidade</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                      {usuariosFiltrados.length > 0 ? usuariosFiltrados.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong><span>{item.email}</span></td>
                          <td><span>{item.phone || item.whatsapp || 'Não informado'}</span></td>
                          <td>{item.city ? `${item.city}${item.state ? `/${item.state}` : ''}` : 'Não informado'}</td>
                          <td><span className={item.admin ? 'badge sucesso' : 'badge'}>{item.admin ? 'Admin' : 'Cliente'}</span></td>
                          <td><span className={item.is_active ? 'badge sucesso' : 'badge perigo'}>{item.is_active ? 'Ativo' : 'Inativo'}</span></td>
                          <td>
                            <div className="acoes-tabela">
                              <button className="botao-acao editar" type="button" onClick={() => editarUsuario(item)}>
                                <Pencil size={15} />
                                Editar
                              </button>
                              <button className="botao-acao excluir" type="button" onClick={() => removerUsuario(item)}>
                                <Trash2 size={15} />
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : <tr><td colSpan="6" className="tabela-vazia">Nenhum usuário encontrado.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {usuarioEditandoId && (
                <form className="form-card" onSubmit={salvarUsuario}>
                  <div className="admin-subtopo">
                    <h2>Editar usuário</h2>
                    <button className="botao secundario-admin" type="button" onClick={() => setUsuarioEditandoId(null)}>
                      Cancelar edição
                    </button>
                  </div>
                  <div className="admin-form-grid">
                    <label>Nome<input value={usuarioForm.name} onChange={(e) => setUsuarioForm({ ...usuarioForm, name: e.target.value })} required /></label>
                    <label>E-mail<input type="email" value={usuarioForm.email} onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })} required /></label>
                    <label>CPF<input value={usuarioForm.cpf} onChange={(e) => setUsuarioForm({ ...usuarioForm, cpf: e.target.value })} /></label>
                    <label>Telefone<input value={usuarioForm.phone} onChange={(e) => setUsuarioForm({ ...usuarioForm, phone: e.target.value })} /></label>
                    <label>WhatsApp<input value={usuarioForm.whatsapp} onChange={(e) => setUsuarioForm({ ...usuarioForm, whatsapp: e.target.value })} /></label>
                    <label>Cidade<input value={usuarioForm.city} onChange={(e) => setUsuarioForm({ ...usuarioForm, city: e.target.value })} /></label>
                    <label>UF<input maxLength={2} value={usuarioForm.state} onChange={(e) => setUsuarioForm({ ...usuarioForm, state: e.target.value })} /></label>
                    <label className="checkbox-linha">
                      <input type="checkbox" checked={usuarioForm.admin} onChange={(e) => setUsuarioForm({ ...usuarioForm, admin: e.target.checked })} />
                      Usuário administrador
                    </label>
                    <label className="checkbox-linha">
                      <input type="checkbox" checked={usuarioForm.is_active} onChange={(e) => setUsuarioForm({ ...usuarioForm, is_active: e.target.checked })} />
                      Usuário ativo
                    </label>
                  </div>
                  <button className="botao destaque" type="submit">Salvar usuário</button>
                </form>
              )}
            </>
          )}

          {abaAtiva === 'relatorios' && (
            <>
              <div className="admin-titulo">
                <h1>Relatórios</h1>
                <p>Análise comercial baseada em pedidos, produtos e clientes reais.</p>
              </div>

              <div className="admin-card relatorios-topo">
                <div>
                  <h2>Janela de análise</h2>
                  <p>Escolha um recorte para acompanhar vendas, volume e clientes com mais precisão.</p>
                </div>
                <div className="grafico-filtros">
                  {filtrosVendasPeriodo.map((filtro) => (
                    <button
                      key={filtro.value}
                      type="button"
                      className={filtroRelatorioPeriodo === filtro.value ? 'ativo' : ''}
                      onClick={() => setFiltroRelatorioPeriodo(filtro.value)}
                    >
                      {filtro.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-status-grid relatorios-metricas">
                <div className="admin-card status-card">
                  <strong>{moeda.format(relatorioPeriodo.receitaTotal)}</strong>
                  <span>Faturamento no período</span>
                </div>
                <div className="admin-card status-card">
                  <strong>{relatorioPeriodo.totalPedidos}</strong>
                  <span>Pedidos pagos</span>
                </div>
                <div className="admin-card status-card">
                  <strong>{relatorioPeriodo.itensVendidos}</strong>
                  <span>Itens vendidos</span>
                </div>
                <div className="admin-card status-card">
                  <strong>{moeda.format(relatorioPeriodo.ticketMedio)}</strong>
                  <span>Ticket médio</span>
                </div>
              </div>

              <div className="admin-graficos">
                <div className="admin-card grafico-card">
                  <h2>Receita por período</h2>
                  {relatorioPeriodo.totalPedidos > 0 ? (
                    <div className="grafico-barras-vendas relatorio-barras">
                      {relatorioPeriodo.serie.map((dia) => {
                        const altura = relatorioPeriodo.maiorReceitaDia > 0
                          ? Math.max(10, Math.round((dia.receita / relatorioPeriodo.maiorReceitaDia) * 100))
                          : 0

                        return (
                          <div className="grafico-barra-dia" key={dia.key} title={`${dia.fullLabel} • ${moeda.format(dia.receita)} • ${dia.pedidos} pedido(s)`}>
                            <small>{moeda.format(dia.receita)}</small>
                            <div>
                              <i style={{ height: `${altura}%` }} />
                            </div>
                            <span>{dia.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="grafico-vazio">
                      <BarChart3 />
                      <p>Não houve pedidos pagos no período selecionado.</p>
                    </div>
                  )}
                </div>

                <div className="admin-card grafico-card">
                  <h2>Produtos mais vendidos</h2>
                  {relatorioPeriodo.topProdutos.length > 0 ? (
                    <div className="ranking-relatorio">
                      {relatorioPeriodo.topProdutos.map((produto, index) => (
                        <article key={produto.key} className="ranking-relatorio-item">
                          <div className="ranking-relatorio-esquerda">
                            <span className="ranking-posicao">{index + 1}</span>
                            <img src={montarUrlImagem(produto.imagem)} alt={produto.nome} />
                            <div>
                              <strong>{produto.nome}</strong>
                              <small>{produto.categoria}</small>
                            </div>
                          </div>
                          <div className="ranking-relatorio-direita">
                            <b>{produto.quantidade} un.</b>
                            <span>{moeda.format(produto.receita)}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="grafico-vazio">
                      <Package />
                      <p>Aguardando itens de pedido.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-duas-colunas">
                <div className="admin-card">
                  <h2>Categorias com maior receita</h2>
                  {relatorioPeriodo.topCategorias.length > 0 ? (
                    <div className="barras-categorias barras-relatorio">
                      {relatorioPeriodo.topCategorias.map((categoria) => {
                        const maior = relatorioPeriodo.topCategorias[0]?.receita || 0
                        const largura = maior > 0 ? Math.max(10, Math.round((categoria.receita / maior) * 100)) : 0
                        return (
                          <div key={categoria.nome}>
                            <span>{categoria.nome}</span>
                            <small>{categoria.quantidade} item(ns) • {moeda.format(categoria.receita)}</small>
                            <div><i style={{ width: `${largura}%` }} /></div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="admin-texto-vazio">Sem dados suficientes para categorias neste período.</p>
                  )}
                </div>

                <div className="admin-card">
                  <h2>Clientes com maior gasto</h2>
                  {relatorioPeriodo.topClientes.length > 0 ? (
                    <div className="ranking-relatorio ranking-clientes">
                      {relatorioPeriodo.topClientes.map((cliente, index) => (
                        <article key={cliente.key} className="ranking-relatorio-item">
                          <div className="ranking-relatorio-esquerda">
                            <span className="ranking-posicao">{index + 1}</span>
                            <div className="avatar-ranking-cliente">
                              {cliente.nome?.[0] || 'C'}
                            </div>
                            <div>
                              <strong>{cliente.nome}</strong>
                              <small>{cliente.email}</small>
                            </div>
                          </div>
                          <div className="ranking-relatorio-direita">
                            <b>{cliente.pedidos} pedido(s)</b>
                            <span>{moeda.format(cliente.gasto)}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-texto-vazio">Nenhum cliente com compras concluídas neste período.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {abaAtiva === 'configuracoes' && (
            <>
              <div className="admin-titulo">
                <h1>Configurações</h1>
                <p>Defina aqui o endereço de origem do frete e a política de frete grátis da loja.</p>
              </div>
              <form className="configuracoes-loja-form" onSubmit={salvarConfiguracoes}>
                <div className="config-grid">
                  <div className="admin-card config-card">
                    <Settings />
                    <h2>Informações da loja</h2>
                    <label>Nome da loja<input value={configLojaForm.store_name} onChange={(e) => setConfigLojaForm({ ...configLojaForm, store_name: e.target.value })} /></label>
                    <label>CNPJ<input value={configLojaForm.cnpj} onChange={(e) => setConfigLojaForm({ ...configLojaForm, cnpj: formatarCnpj(e.target.value) })} placeholder="00.000.000/0000-00" /></label>
                  </div>
                  <div className="admin-card config-card">
                    <Mail />
                    <h2>Contato</h2>
                    <label>E-mail<input value={configLojaForm.contact_email} onChange={(e) => setConfigLojaForm({ ...configLojaForm, contact_email: e.target.value })} /></label>
                    <label>Telefone<input value={configLojaForm.contact_phone} onChange={(e) => setConfigLojaForm({ ...configLojaForm, contact_phone: e.target.value })} /></label>
                  </div>
                  <div className="admin-card config-card config-card-amplo">
                    <Truck />
                    <h2>Endereço de origem do frete</h2>
                    <p>Esse endereço será usado pelo sistema para calcular o frete da loja até o cliente.</p>
                    <div className="admin-form-grid">
                      <label>CEP<input value={configLojaForm.shipping_origin_postal_code} onChange={(e) => setConfigLojaForm({ ...configLojaForm, shipping_origin_postal_code: e.target.value })} placeholder="Somente números ou CEP formatado" /></label>
                      <label>Endereço<input value={configLojaForm.shipping_origin_address} onChange={(e) => setConfigLojaForm({ ...configLojaForm, shipping_origin_address: e.target.value })} /></label>
                      <label>Número<input value={configLojaForm.shipping_origin_number} onChange={(e) => setConfigLojaForm({ ...configLojaForm, shipping_origin_number: e.target.value })} /></label>
                      <label>Bairro<input value={configLojaForm.shipping_origin_district} onChange={(e) => setConfigLojaForm({ ...configLojaForm, shipping_origin_district: e.target.value })} /></label>
                      <label>Cidade<input value={configLojaForm.shipping_origin_city} onChange={(e) => setConfigLojaForm({ ...configLojaForm, shipping_origin_city: e.target.value })} /></label>
                      <label>UF<input maxLength={2} value={configLojaForm.shipping_origin_state} onChange={(e) => setConfigLojaForm({ ...configLojaForm, shipping_origin_state: e.target.value.toUpperCase() })} /></label>
                    </div>
                  </div>
                  <div className="admin-card config-card config-card-amplo">
                    <Package />
                    <h2>Medidas padrão dos produtos</h2>
                    <p>Use esses valores como base para preencher rapidamente peso e dimensões quando vários produtos tiverem medidas semelhantes.</p>
                    <div className="admin-form-grid">
                      <label>Peso padrão (kg)<input type="number" min="0" step="0.001" value={configLojaForm.default_package_weight} onChange={(e) => setConfigLojaForm({ ...configLojaForm, default_package_weight: e.target.value })} placeholder="0.400" /></label>
                      <label>Largura padrão (cm)<input type="number" min="0" step="0.01" value={configLojaForm.default_package_width} onChange={(e) => setConfigLojaForm({ ...configLojaForm, default_package_width: e.target.value })} placeholder="16" /></label>
                      <label>Altura padrão (cm)<input type="number" min="0" step="0.01" value={configLojaForm.default_package_height} onChange={(e) => setConfigLojaForm({ ...configLojaForm, default_package_height: e.target.value })} placeholder="6" /></label>
                      <label>Comprimento padrão (cm)<input type="number" min="0" step="0.01" value={configLojaForm.default_package_length} onChange={(e) => setConfigLojaForm({ ...configLojaForm, default_package_length: e.target.value })} placeholder="18" /></label>
                    </div>
                  </div>
                  <div className="admin-card config-card config-card-amplo">
                    <CreditCard />
                    <h2>Frete grátis</h2>
                    <p>Ative ou desative a regra de frete grátis e defina o valor mínimo do pedido para aplicar automaticamente.</p>
                    <label className="checkbox-linha">
                      <input
                        type="checkbox"
                        checked={configLojaForm.free_shipping_enabled}
                        onChange={(e) => setConfigLojaForm({
                          ...configLojaForm,
                          free_shipping_enabled: e.target.checked,
                          free_shipping_min_amount: e.target.checked ? configLojaForm.free_shipping_min_amount : '',
                        })}
                      />
                      Ativar frete grátis
                    </label>
                    <label>
                      Valor mínimo para frete grátis
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={configLojaForm.free_shipping_min_amount}
                        onChange={(e) => setConfigLojaForm({ ...configLojaForm, free_shipping_min_amount: e.target.value })}
                        disabled={!configLojaForm.free_shipping_enabled}
                        placeholder="Ex: 399.90"
                      />
                    </label>
                  </div>
                  <div className="admin-card config-card config-card-amplo">
                    <Shield />
                    <h2>Garantia e devolução</h2>
                    <p>Defina o que deve aparecer na vitrine do produto para orientar o cliente com clareza.</p>
                    <div className="admin-form-grid">
                      <label>
                        Garantia (meses)
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={configLojaForm.warranty_months}
                          onChange={(e) => setConfigLojaForm({ ...configLojaForm, warranty_months: e.target.value })}
                          placeholder="Ex: 12"
                        />
                      </label>
                      <label>
                        Devolução (dias)
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={configLojaForm.return_days}
                          onChange={(e) => setConfigLojaForm({ ...configLojaForm, return_days: e.target.value })}
                          placeholder="Ex: 30"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="admin-card config-card config-card-amplo">
                    <Tag />
                    <h2>Cupons de desconto</h2>
                    <p>Crie códigos promocionais para campanhas, ações sazonais e incentivo de recompra.</p>
                    <div className="configuracao-cupom-form">
                      <div className="admin-form-grid">
                        <label>
                          Código do cupom
                          <input
                            value={cupomForm.code}
                            onChange={(e) => setCupomForm({ ...cupomForm, code: e.target.value.toUpperCase() })}
                            placeholder="Ex: BEMVINDO10"
                          />
                        </label>
                        <label>
                          Descrição
                          <input
                            value={cupomForm.description}
                            onChange={(e) => setCupomForm({ ...cupomForm, description: e.target.value })}
                            placeholder="Ex: 10% na primeira compra"
                          />
                        </label>
                        <label>
                          Tipo de desconto
                          <select
                            value={cupomForm.type}
                            onChange={(e) => setCupomForm({ ...cupomForm, type: e.target.value })}
                          >
                            <option value="percentage">Percentual</option>
                            <option value="fixed">Valor fixo</option>
                          </select>
                        </label>
                        <label>
                          Valor
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cupomForm.value}
                            onChange={(e) => setCupomForm({ ...cupomForm, value: e.target.value })}
                            placeholder={cupomForm.type === 'percentage' ? 'Ex: 10' : 'Ex: 25.00'}
                          />
                        </label>
                        <label>
                          Pedido mínimo
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={cupomForm.min_order_amount}
                            onChange={(e) => setCupomForm({ ...cupomForm, min_order_amount: e.target.value })}
                            placeholder="Ex: 199.90"
                          />
                        </label>
                        <label>
                          Limite de uso
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={cupomForm.usage_limit}
                            onChange={(e) => setCupomForm({ ...cupomForm, usage_limit: e.target.value })}
                            placeholder="Opcional"
                          />
                        </label>
                        <label>
                          Início da validade
                          <input
                            type="datetime-local"
                            value={cupomForm.starts_at}
                            onChange={(e) => setCupomForm({ ...cupomForm, starts_at: e.target.value })}
                          />
                        </label>
                        <label>
                          Fim da validade
                          <input
                            type="datetime-local"
                            value={cupomForm.expires_at}
                            onChange={(e) => setCupomForm({ ...cupomForm, expires_at: e.target.value })}
                          />
                        </label>
                      </div>
                      <p className="admin-texto-vazio">
                        A ativação do cupom é controlada pelos botões <strong>Ativar</strong> e <strong>Desativar</strong> na lista abaixo.
                      </p>
                      <div className="configuracao-cupom-acoes">
                        <button className="botao destaque" type="button" onClick={salvarCupom}>
                          {cupomEditandoId ? 'Salvar cupom' : 'Criar cupom'}
                        </button>
                        {cupomEditandoId ? (
                          <button className="botao secundario-admin" type="button" onClick={cancelarEdicaoCupom}>
                            Cancelar edição
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="configuracao-cupom-lista">
                      {cupons.length > 0 ? cupons.map((cupom) => (
                        <article className="admin-lista-item admin-lista-item-cupom" key={cupom.id}>
                          <div className="admin-lista-icone">
                            <Tag size={18} />
                          </div>
                          <div>
                            <strong>{cupom.code}</strong>
                            <span>{cupom.description || 'Cupom sem descrição adicional.'}</span>
                            <small>
                              {cupom.type === 'percentage' ? `${Number(cupom.value)}% de desconto` : moeda.format(Number(cupom.value || 0))}
                              {cupom.min_order_amount ? ` • mínimo ${moeda.format(Number(cupom.min_order_amount))}` : ''}
                              {cupom.usage_limit ? ` • ${cupom.usage_count || 0}/${cupom.usage_limit} usos` : ` • ${cupom.usage_count || 0} uso(s)`}
                            </small>
                          </div>
                          <div className="admin-lista-acoes">
                            <span className={`badge ${cupom.is_active ? 'sucesso' : 'perigo'}`}>
                              {cupom.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                            <button className="botao secundario-admin pequeno" type="button" onClick={() => editarCupom(cupom)}>
                              <Pencil size={14} />
                              Editar
                            </button>
                            <button className="botao secundario-admin pequeno" type="button" onClick={() => alternarStatusCupom(cupom)}>
                              <Check size={14} />
                              {cupom.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                            <button className="botao perigo pequeno" type="button" onClick={() => removerCupom(cupom)}>
                              <Trash2 size={14} />
                              Excluir
                            </button>
                          </div>
                        </article>
                      )) : (
                        <p className="admin-texto-vazio">Nenhum cupom cadastrado ainda.</p>
                      )}
                    </div>
                  </div>
                  <div className="admin-card config-card config-card-amplo config-card-melhor-envio">
                    <button
                      className={`config-melhor-envio-toggle ${configMelhorEnvioAberto ? 'aberto' : ''}`}
                      type="button"
                      onClick={() => setConfigMelhorEnvioAberto((atual) => !atual)}
                    >
                      <div className="config-melhor-envio-topo">
                        <Truck />
                        <div>
                          <h2>Integração Melhor Envio</h2>
                          <p>Abra para configurar ambiente, OAuth e credenciais logísticas.</p>
                        </div>
                      </div>
                      <ChevronDown size={18} />
                    </button>

                    {configMelhorEnvioAberto ? (
                      <>
                        <label className="checkbox-linha">
                          <input
                            type="checkbox"
                            checked={configLojaForm.melhor_envio_enabled}
                            onChange={(e) => setConfigLojaForm({
                              ...configLojaForm,
                              melhor_envio_enabled: e.target.checked,
                            })}
                          />
                          Ativar integração com Melhor Envio
                        </label>
                        <label className="checkbox-linha">
                          <input
                            type="checkbox"
                            checked={configLojaForm.melhor_envio_sandbox}
                            onChange={(e) => setConfigLojaForm({
                              ...configLojaForm,
                              melhor_envio_sandbox: e.target.checked,
                            })}
                          />
                          Usar ambiente sandbox
                        </label>
                        <div className="admin-form-grid">
                          <label>
                            Nome da aplicação
                            <input
                              value={configLojaForm.melhor_envio_app_name}
                              onChange={(e) => setConfigLojaForm({ ...configLojaForm, melhor_envio_app_name: e.target.value })}
                              placeholder="Ótica Olho de Hórus"
                            />
                          </label>
                          <label>
                            E-mail técnico
                            <input
                              type="email"
                              value={configLojaForm.melhor_envio_technical_email}
                              onChange={(e) => setConfigLojaForm({ ...configLojaForm, melhor_envio_technical_email: e.target.value })}
                              placeholder="suporte@seudominio.com"
                            />
                          </label>
                          <label>
                            Client ID
                            <input
                              value={configLojaForm.melhor_envio_client_id}
                              onChange={(e) => setConfigLojaForm({ ...configLojaForm, melhor_envio_client_id: e.target.value })}
                              placeholder="Ex: 24919"
                            />
                          </label>
                          <label>
                            Client Secret
                            <input
                              value={configLojaForm.melhor_envio_client_secret}
                              onChange={(e) => setConfigLojaForm({ ...configLojaForm, melhor_envio_client_secret: e.target.value })}
                              placeholder={configLojaForm.melhor_envio_client_secret_configured ? 'Ja configurado. Preencha apenas para substituir.' : 'Secret do aplicativo'}
                            />
                          </label>
                          <label>
                            URL pública do backend
                            <input
                              value={configLojaForm.melhor_envio_public_url}
                              onChange={(e) => setConfigLojaForm({ ...configLojaForm, melhor_envio_public_url: e.target.value })}
                              placeholder="https://seu-ngrok.ngrok-free.app"
                            />
                          </label>
                          <label>
                            Token de acesso
                            <input
                              value={configLojaForm.melhor_envio_token}
                              onChange={(e) => setConfigLojaForm({ ...configLojaForm, melhor_envio_token: e.target.value })}
                              placeholder={configLojaForm.melhor_envio_token_configured ? 'Ja configurado. Preencha apenas para substituir.' : 'Bearer token da conta Melhor Envio'}
                            />
                          </label>
                          <label>
                            Agência / unidade
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={configLojaForm.melhor_envio_agency}
                              onChange={(e) => setConfigLojaForm({ ...configLojaForm, melhor_envio_agency: e.target.value })}
                              placeholder="Opcional, ex: 1"
                            />
                          </label>
                        </div>
                        <div className="config-melhor-envio-acoes">
                          <button className="botao destaque" type="button" onClick={conectarContaMelhorEnvio}>
                            <Truck size={16} />
                            {configLojaForm.melhor_envio_token_configured ? 'Reconectar conta via OAuth' : 'Conectar conta via OAuth'}
                          </button>
                          <button
                            className="botao secundario-admin"
                            type="button"
                            onClick={desconectarContaMelhorEnvio}
                            disabled={!configLojaForm.melhor_envio_token_configured}
                          >
                            <LogOut size={16} />
                            Desconectar conta
                          </button>
                          <button className="botao secundario-admin" type="button" onClick={testarConexaoMelhorEnvio}>
                            <Shield size={16} />
                            Testar conexão {configLojaForm.melhor_envio_sandbox ? 'sandbox' : 'produção'}
                          </button>
                          {testeMelhorEnvioResumo ? (
                            <div className="config-melhor-envio-resumo">
                              <strong>Conexão OAuth validada</strong>
                              <span>Ambiente: {testeMelhorEnvioResumo.sandbox ? 'Sandbox' : 'Produção'}</span>
                              <small>Expira em: {testeMelhorEnvioResumo.token_expires_at ? new Date(testeMelhorEnvioResumo.token_expires_at).toLocaleString('pt-BR') : 'não informado'}</small>
                              <small>Escopos: {(testeMelhorEnvioResumo.scopes || []).join(', ') || 'nenhum escopo retornado'}</small>
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="acoes-form-produto">
                  <button className="botao destaque" type="submit">Salvar configurações</button>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
      {cropEditor.aberto ? (
        <div className="editor-recorte-overlay" role="dialog" aria-modal="true" aria-label="Editor de recorte de imagem">
          <div className="editor-recorte-modal">
            <div className="editor-recorte-topo">
              <div>
                <strong>Recortar imagem</strong>
                <span>Arraste a imagem e ajuste o zoom para ver como ela ficará no card quadrado do catálogo.</span>
              </div>
              <button className="botao-acao excluir" type="button" onClick={fecharEditorRecorte}>
                <X size={16} />
              </button>
            </div>

            <div className="editor-recorte-corpo">
              <div
                className="editor-recorte-preview"
                onMouseDown={iniciarArrasteRecorte}
                role="presentation"
              >
                {(() => {
                  const { larguraFinal, alturaFinal, larguraImagem, alturaImagem } = obterDimensoesPreviewRecorte(
                    cropEditor.naturalWidth,
                    cropEditor.naturalHeight,
                    cropEditor.zoom,
                    cropEditor.rotation,
                  )
                  const left = ((RECORTE_VIEWPORT - larguraFinal) / 2) + cropEditor.offsetX
                  const top = ((RECORTE_VIEWPORT - alturaFinal) / 2) + cropEditor.offsetY

                  return (
                    <div
                      className="editor-recorte-imagem"
                      style={{
                        width: `${larguraFinal}px`,
                        height: `${alturaFinal}px`,
                        left: `${left}px`,
                        top: `${top}px`,
                      }}
                    >
                      <img
                        src={cropEditor.previewUrl}
                        alt="Pré-visualização para recorte"
                        draggable="false"
                        onDragStart={(evento) => evento.preventDefault()}
                        onLoad={registrarDimensoesRecorte}
                        style={{
                          width: `${larguraImagem}px`,
                          height: `${alturaImagem}px`,
                          transform: `translate(-50%, -50%) rotate(${cropEditor.rotation}deg)`,
                        }}
                      />
                    </div>
                  )
                })()}
                <div className="editor-recorte-mascara" />
              </div>

              <div className="editor-recorte-ajustes">
                {(() => {
                  const zoomMinimo = obterZoomMinimoRecorte(
                    obterDimensoesRotacionadas(
                      cropEditor.naturalWidth,
                      cropEditor.naturalHeight,
                      cropEditor.rotation,
                    ).largura,
                    obterDimensoesRotacionadas(
                      cropEditor.naturalWidth,
                      cropEditor.naturalHeight,
                      cropEditor.rotation,
                    ).altura,
                  )

                  return (
                    <label>
                      Zoom
                      <input
                        type="range"
                        min={String(zoomMinimo)}
                        max="3"
                        step="0.01"
                        value={cropEditor.zoom}
                        onChange={(e) => atualizarZoomRecorte(e.target.value)}
                      />
                    </label>
                  )
                })()}
                <div className="editor-recorte-rotacao">
                  <span>Rotação</span>
                  <div>
                    <button className="botao secundario-admin" type="button" onClick={() => rotacionarRecorte(-90)}>
                      <RotateCcw size={15} />
                      Girar à esquerda
                    </button>
                    <button className="botao secundario-admin" type="button" onClick={() => rotacionarRecorte(90)}>
                      <RotateCcw size={15} style={{ transform: 'scaleX(-1)' }} />
                      Girar à direita
                    </button>
                  </div>
                </div>
                <small>Você pode aproximar ou afastar a imagem. O enquadramento acima representa o corte final do card.</small>
              </div>
            </div>

            <div className="editor-recorte-acoes">
              <button className="botao secundario-admin" type="button" onClick={fecharEditorRecorte}>
                Cancelar
              </button>
              <button className="botao destaque" type="button" onClick={aplicarRecorteAtual}>
                Aplicar recorte
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPage>
  )
}
