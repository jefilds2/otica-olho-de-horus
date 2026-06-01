/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const CarrinhoContext = createContext(null)

function criarChaveCarrinho(produtoId, corSelecionadaNome) {
  return `${produtoId}::${String(corSelecionadaNome || 'sem-cor').toLowerCase()}`
}

function normalizarItemCarrinho(item) {
  const selectedColorName = item.selected_color_name || item.color || null

  return {
    ...item,
    selected_color_name: selectedColorName,
    selected_color_hex: item.selected_color_hex || null,
    cart_key: item.cart_key || criarChaveCarrinho(item.id, selectedColorName),
  }
}

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho_otica')
    return carrinhoSalvo ? JSON.parse(carrinhoSalvo).map(normalizarItemCarrinho) : []
  })

  useEffect(() => {
    localStorage.setItem('carrinho_otica', JSON.stringify(itens))
  }, [itens])

  function adicionarProduto(produto, opcoes = {}) {
    if (produto?.is_active === false) {
      toast.warning('Produto sem estoque no momento.')
      return
    }

    if (Number(produto.stock_quantity) <= 0) {
      toast.warning('Produto sem estoque no momento.')
      return
    }

    const selectedColorName = opcoes.selected_color_name || produto.color || null
    const itemNormalizado = normalizarItemCarrinho({
      ...produto,
      selected_color_name: selectedColorName,
      selected_color_hex: opcoes.selected_color_hex || null,
      quantidade: 1,
    })

    setItens((atuais) => {
      const itemAtual = atuais.find((item) => item.cart_key === itemNormalizado.cart_key)
      if (itemAtual) {
        return atuais.map((item) =>
          item.cart_key === itemNormalizado.cart_key ? { ...item, quantidade: item.quantidade + 1 } : item,
        )
      }
      return [...atuais, itemNormalizado]
    })

    toast.success('Produto adicionado ao carrinho.')
  }

  function removerProduto(cartKey) {
    setItens((atuais) => atuais.filter((item) => item.cart_key !== cartKey))
  }

  function atualizarQuantidade(cartKey, novaQuantidade) {
    if (novaQuantidade <= 0) {
      removerProduto(cartKey)
      return
    }

    setItens((atuais) =>
      atuais.map((item) =>
        item.cart_key === cartKey ? { ...item, quantidade: novaQuantidade } : item,
      ),
    )
  }

  function limparCarrinho() {
    setItens([])
  }

  const total = itens.reduce((soma, item) => soma + Number(item.price) * item.quantidade, 0)
  const quantidade = itens.reduce((soma, item) => soma + item.quantidade, 0)
  return (
    <CarrinhoContext.Provider value={{ itens, total, quantidade, adicionarProduto, removerProduto, atualizarQuantidade, limparCarrinho }}>
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  return useContext(CarrinhoContext)
}
