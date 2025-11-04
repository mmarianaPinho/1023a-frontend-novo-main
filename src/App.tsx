import React, { useState, useEffect } from 'react'
import './App.css'
import api from './api/api'
import { useNavigate } from 'react-router-dom'

type ProdutoType = {
  _id: string
  nome: string
  preco: number
  descricao: string
  urlfoto: string
}

function App() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const [produtos, setProdutos] = useState<ProdutoType[]>([])

  useEffect(() => {
    api.get("/produtos")
      .then((response) => setProdutos(response.data))
      .catch(() => alert("Erro ao carregar produtos"))
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) {
      alert("Você precisa estar logado para cadastrar produtos.")
      navigate("/login")
      return
    }

    const formData = new FormData(event.currentTarget)
    const produto = {
      nome: formData.get("nome"),
      preco: formData.get("preco"),
      descricao: formData.get("descricao"),
      urlfoto: formData.get("urlfoto")
    }

    api.post("/produtos", produto)
      .then((response) => setProdutos([...produtos, response.data]))
      .catch(() => alert("Erro ao cadastrar produto"))
  }

  function adicionarItemCarrinho(produtoId: string) {
    if (!token) {
      alert("Você precisa estar logado para adicionar produtos ao carrinho!")
      navigate("/login")
      return
    }

    api.post("/adicionarItem", { produtoId, quantidade: 1 })
      .then(() => alert("Produto adicionado ao carrinho!"))
      .catch((error) => {
        if (error.response?.status === 401) {
          alert("Sessão expirada, faça login novamente.")
          navigate("/login")
        } else {
          alert("Erro ao adicionar produto ao carrinho!")
        }
      })
  }

  return (
    <>
      <div className="topo">
        <button onClick={() => {
          if (!token) {
            alert("Faça login para acessar seu carrinho.")
            navigate("/login")
          } else {
            navigate("/carrinho")
          }
        }}>
          🛒 Ver Carrinho
        </button>
      </div>

      <h1>Cadastro de Produtos</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder='Nome' name="nome" />
        <input type="number" placeholder='Preço' name="preco" />
        <input type="text" placeholder='Descrição' name="descricao" />
        <input type="text" placeholder='URL Foto' name="urlfoto" />
        <button type='submit'>Cadastrar</button>
      </form>

      <h1>Lista de produtos</h1>
      <div className="container-produtos">
        {produtos.map((produto) => (
          <div key={produto._id} className="produto">
            <h2>{produto.nome}</h2>
            <img src={produto.urlfoto} alt='Imagem do produto' />
            <p>Preço: R${produto.preco}</p>
            <p>{produto.descricao}</p>
            <button onClick={() => adicionarItemCarrinho(produto._id)}>
              Adicionar ao Carrinho
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

export default App
