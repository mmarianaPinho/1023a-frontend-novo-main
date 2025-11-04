import React, { useEffect, useState } from 'react'
import api from './api/api'
import { useNavigate } from 'react-router-dom'

type ItemCarrinho = {
  _id: string
  produto: {
    _id: string
    nome: string
    preco: number
    urlfoto: string
  }
  quantidade: number
}

export default function Carrinho() {
  const [itens, setItens] = useState<ItemCarrinho[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Você precisa fazer login para ver o carrinho.")
      navigate("/login")
      return
    }

    api.get("/carrinho")
      .then((res) => setItens(res.data.itens))
      .catch(() => setErro("Não foi possível carregar o carrinho."))
  }, [navigate])

  const atualizarQuantidade = (id: string, novaQtd: number) => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Você precisa estar logado.")
      navigate("/login")
      return
    }

    api.put(`/carrinho/${id}`, { quantidade: novaQtd })
      .then(() => {
        setItens(itens.map(item =>
          item._id === id ? { ...item, quantidade: novaQtd } : item
        ))
      })
      .catch(() => alert("Erro ao atualizar quantidade"))
  }

  const removerItem = (produtoId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Você precisa estar logado.")
      navigate("/login")
      return
    }

    api.delete(`/carrinho/${produtoId}`)
      .then(() => setItens(itens.filter(item => item.produto._id !== produtoId)))
      .catch(() => alert("Erro ao remover item"))
  }

  const limparCarrinho = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      alert("Você precisa estar logado.")
      navigate("/login")
      return
    }

    api.delete("/carrinho")
      .then(() => setItens([]))
      .catch(() => alert("Erro ao limpar carrinho"))
  }

  if (erro) return <p>{erro}</p>

  return (
    <div className="carrinho-container">
      <h1>🛒 Meu Carrinho</h1>
      <button onClick={() => navigate("/")}>Voltar</button>
      {itens.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <>
          {itens.map((item) => (
            <div key={item._id} className="item-carrinho">
              <img src={item.produto.urlfoto} alt={item.produto.nome} />
              <div>
                <h3>{item.produto.nome}</h3>
                <p>Preço: R$ {item.produto.preco}</p>
                <input
                  type="number"
                  min={1}
                  value={item.quantidade}
                  onChange={(e) => atualizarQuantidade(item._id, Number(e.target.value))}
                />
                <button onClick={() => removerItem(item.produto._id)}>Remover</button>
              </div>
            </div>
          ))}
          <button onClick={limparCarrinho}>🗑 Limpar Carrinho</button>
        </>
      )}
    </div>
  )
}
