const configuredApiUrl = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : ''
const API_URL = configuredApiUrl || browserOrigin || 'http://localhost:3000'
const normalizeImagePath = (caminho) => String(caminho || '')
  .trim()
  .replace(/^\/+/, '')
  .replace(/^uploads\/+/i, '')

export function montarUrlImagem(caminho) {
  if (!caminho) return '/logo-icone-olho.png'
  if (caminho.startsWith('http') || caminho.startsWith('/')) return caminho
  return `${API_URL}/uploads/${normalizeImagePath(caminho)}`
}

export function obterImagensProduto(produto) {
  if (!produto) return ['/logo-icone-olho.png']

  try {
    const imagens = typeof produto.image_paths === 'string'
      ? JSON.parse(produto.image_paths)
      : produto.image_paths

    if (Array.isArray(imagens) && imagens.length > 0) {
      return imagens.map((imagem) => montarUrlImagem(imagem)).slice(0, 3)
    }
  } catch {
    // Fallback para produtos antigos com dados legados.
  }

  return [montarUrlImagem(produto.path)]
}

function lerMensagemErro(dados) {
  if (Array.isArray(dados?.error)) return obterMensagemErroUsuario(dados.error.join(', '))
  return obterMensagemErroUsuario(dados?.error || 'Não foi possível concluir a operação.')
}

export function obterMensagemErroUsuario(erro, fallback = 'Não foi possível concluir a operação.') {
  const mensagemOriginal = typeof erro === 'string'
    ? erro
    : erro?.message

  const mensagem = String(mensagemOriginal || '').trim()
  if (!mensagem) return fallback

  const mensagemLower = mensagem.toLowerCase()

  if (
    mensagemLower.includes('failed to fetch')
    || mensagemLower.includes('networkerror')
    || mensagemLower.includes('load failed')
  ) {
    return 'Não foi possível se comunicar com o servidor. Tente novamente em instantes.'
  }

  if (
    mensagemLower.includes('cannot read properties')
    || mensagemLower.includes('is not a function')
    || mensagemLower.includes('undefined')
    || mensagemLower.includes('null')
  ) {
    return 'Ocorreu um erro inesperado ao processar esta ação. Tente novamente.'
  }

  if (
    mensagemLower.includes("must be a 'date' type")
    || mensagemLower.includes('must be a `date` type')
    || mensagemLower.includes('invalid date')
  ) {
    return 'Verifique as datas informadas e tente novamente.'
  }

  if (
    mensagemLower.includes('invalid_client')
    || mensagemLower.includes('client authentication failed')
  ) {
    return 'Não foi possível autenticar a integração informada. Revise as credenciais e tente novamente.'
  }

  if (mensagemLower.includes('err_ngrok') || mensagemLower.includes('ngrok')) {
    return 'A URL pública da integração está offline. Reabra o túnel e tente novamente.'
  }

  if (mensagemLower.includes('internal server error')) {
    return 'O servidor encontrou um problema ao concluir a operação. Tente novamente.'
  }

  return mensagem
}

function limparSessaoExpirada() {
  localStorage.removeItem('token_otica')
  localStorage.removeItem('usuario_otica')
}

export async function apiFetch(caminho, opcoes = {}) {
  const token = localStorage.getItem('token_otica')
  let resposta

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: {
        ...(opcoes.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opcoes.headers,
      },
    })
  } catch (error) {
    throw new Error(obterMensagemErroUsuario(error, 'Não foi possível se comunicar com o servidor. Tente novamente em instantes.'))
  }

  const dados = await resposta.json().catch(() => ({}))

  if (resposta.status === 401 && token) {
    limparSessaoExpirada()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
    throw new Error(obterMensagemErroUsuario(dados?.error || 'Sua sessão expirou. Faça login novamente.'))
  }

  if (!resposta.ok) {
    throw new Error(lerMensagemErro(dados))
  }

  return dados
}

export async function listarProdutos() {
  return apiFetch('/products')
}

export async function listarProdutosAdmin() {
  return apiFetch('/admin/products')
}

export async function listarCategorias() {
  return apiFetch('/categories')
}

export async function buscarConfiguracoesPublicasLoja() {
  return apiFetch('/store/public-settings')
}

export async function criarSessao(credenciais) {
  return apiFetch('/session', {
    method: 'POST',
    body: JSON.stringify(credenciais),
  })
}

export async function cadastrarUsuario(dados) {
  return apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function buscarMeuCadastro() {
  return apiFetch('/me')
}

export async function atualizarMeuCadastro(dados) {
  return apiFetch('/me', {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export async function listarMeusEnderecos() {
  return apiFetch('/me/addresses')
}

export async function listarMeusPedidos() {
  return apiFetch('/me/orders')
}

export async function pagarPedidoNovamente(id) {
  return apiFetch(`/me/orders/${id}/retry-payment`, {
    method: 'POST',
  })
}

export async function cadastrarEndereco(dados) {
  return apiFetch('/me/addresses', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function atualizarEndereco(id, dados) {
  return apiFetch(`/me/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export async function excluirEndereco(id) {
  return apiFetch(`/me/addresses/${id}`, {
    method: 'DELETE',
  })
}

export async function calcularFrete(dados) {
  return apiFetch('/shipping/quotes', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function validarCupom(dados) {
  return apiFetch('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function cadastrarCategoria(formData) {
  return apiFetch('/categories', {
    method: 'POST',
    body: formData,
  })
}

export async function cadastrarProduto(formData) {
  return apiFetch('/products', {
    method: 'POST',
    body: formData,
  })
}

export async function atualizarProduto(id, formData) {
  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: formData,
  })
}

export async function excluirProduto(id) {
  return apiFetch(`/products/${id}`, {
    method: 'DELETE',
  })
}

export async function atualizarCategoria(id, formData) {
  return apiFetch(`/categories/${id}`, {
    method: 'PUT',
    body: formData,
  })
}

export async function excluirCategoria(id) {
  return apiFetch(`/categories/${id}`, {
    method: 'DELETE',
  })
}

export async function listarUsuariosAdmin() {
  return apiFetch('/admin/users')
}

export async function atualizarUsuarioAdmin(id, dados) {
  return apiFetch(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export async function excluirUsuarioAdmin(id) {
  return apiFetch(`/admin/users/${id}`, {
    method: 'DELETE',
  })
}

export async function criarSessaoCheckout(dados) {
  return apiFetch('/checkout/session', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function confirmarCheckoutPagamento(dados) {
  return apiFetch('/checkout/confirm', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function listarPedidosAdmin() {
  return apiFetch('/admin/orders')
}

export async function listarCuponsAdmin() {
  return apiFetch('/admin/coupons')
}

export async function cadastrarCupomAdmin(dados) {
  return apiFetch('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export async function atualizarCupomAdmin(id, dados) {
  return apiFetch(`/admin/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export async function excluirCupomAdmin(id) {
  return apiFetch(`/admin/coupons/${id}`, {
    method: 'DELETE',
  })
}

export async function atualizarPedidoAdmin(id, dados) {
  return apiFetch(`/admin/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export async function prepararEtiquetaMelhorEnvio(id) {
  return apiFetch(`/admin/orders/${id}/melhor-envio/prepare`, {
    method: 'POST',
  })
}

export async function comprarEtiquetaMelhorEnvio(id) {
  return apiFetch(`/admin/orders/${id}/melhor-envio/checkout`, {
    method: 'POST',
  })
}

export async function gerarEtiquetaMelhorEnvio(id) {
  return apiFetch(`/admin/orders/${id}/melhor-envio/generate`, {
    method: 'POST',
  })
}

export async function imprimirEtiquetaMelhorEnvio(id) {
  return apiFetch(`/admin/orders/${id}/melhor-envio/print`, {
    method: 'POST',
  })
}

export async function sincronizarEtiquetaMelhorEnvio(id) {
  return apiFetch(`/admin/orders/${id}/melhor-envio/sync`, {
    method: 'POST',
  })
}

export async function resetarProcessoMelhorEnvio(id) {
  return apiFetch(`/admin/orders/${id}/melhor-envio/reset`, {
    method: 'POST',
  })
}

export async function buscarConfiguracoesLoja() {
  return apiFetch('/admin/store-settings')
}

export async function salvarConfiguracoesLoja(dados) {
  return apiFetch('/admin/store-settings', {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export async function testarMelhorEnvioAdmin() {
  return apiFetch('/admin/store-settings/melhor-envio/test')
}

export async function obterUrlAutorizacaoMelhorEnvioAdmin() {
  return apiFetch('/admin/store-settings/melhor-envio/connect-url')
}

export async function desconectarMelhorEnvioAdmin() {
  return apiFetch('/admin/store-settings/melhor-envio/disconnect', {
    method: 'POST',
  })
}
