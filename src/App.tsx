import React, { useState, useEffect } from 'react'
import './App.css'
import api from './api/api'

type ProdutoType = {
  _id: string,
  nome: string,
  preco: number,
  descricao: string,
  urlfoto: string
}

type ItemCarrinhoType = {
  _id: string,
  produto: ProdutoType,
  quantidade: number
}

function App() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([])
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false)
  const [carrinho, setCarrinho] = useState<ItemCarrinhoType[]>([])
  const token = localStorage.getItem("token")

  // 🔹 Carrega produtos ao abrir o app
  useEffect(() => {
    api.get("/produtos")
      .then((response) => setProdutos(response.data))
      .catch((error) => {
        if (error.response) {
          console.error(`Erro do servidor: ${error.response.data.mensagem ?? error.response.data}`)
          alert(`Erro: ${error.response.data.mensagem ?? "veja o console para mais detalhes"}`)
        } else {
          console.error(`Erro Axios: ${error.message}`)
          alert(`Servidor não respondeu. Erro: ${error.message}`)
        }
      })
  }, [])

  // 🔹 Cadastrar produto (para admin)
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nome = formData.get("nome")
    const preco = formData.get("preco")
    const descricao = formData.get("descricao")
    const urlfoto = formData.get("urlfoto")
    const produto = { nome, preco, descricao, urlfoto }

    api.post("/produtos", produto)
      .then((response) => setProdutos([...produtos, response.data]))
      .catch((error) => {
        if (error.response) {
          alert(`Erro do servidor: ${error.response.data.mensagem ?? "veja o console"}`)
          console.error(error.response.data)
        } else {
          alert(`Erro Axios: ${error.message}`)
        }
      })
  }

  // 🔹 Adicionar produto ao carrinho
  function adicionarItemCarrinho(produtoId: string) {
    api.post("/adicionarItem", { produtoId, quantidade: 1 })
      .then(() => alert("Produto adicionado com sucesso!"))
      .catch((error) => {
        if (error.response)
          alert(`Erro: ${error.response.data.mensagem}`)
        else
          alert(`Erro Axios: ${error.message}`)
      })
  }

  // 🔹 Buscar carrinho do usuário
  function carregarCarrinho() {
    api.get("/carrinho")
      .then((response) => setCarrinho(response.data.itens ?? []))
      .catch((error) => {
        console.error("Erro ao carregar carrinho:", error)
        alert("Não foi possível carregar o carrinho.")
      })
  }

  // 🔹 Excluir item do carrinho
  function excluirItem(itemId: string) {
    api.delete(`/carrinho/item/${itemId}`)
      .then(() => {
        alert("Item removido!")
        carregarCarrinho()
      })
      .catch(() => alert("Erro ao remover item."))
  }

  // 🔹 Atualizar quantidade
  function atualizarQuantidade(itemId: string, novaQuantidade: number) {
    api.put(`/carrinho/item/${itemId}`, { quantidade: novaQuantidade })
      .then(() => carregarCarrinho())
      .catch(() => alert("Erro ao atualizar quantidade."))
  }

  // 🔹 Esvaziar o carrinho inteiro
  function esvaziarCarrinho() {
    api.delete("/carrinho")
      .then(() => {
        alert("Carrinho esvaziado!")
        setCarrinho([])
      })
      .catch(() => alert("Erro ao esvaziar carrinho."))
  }

  return (
    <>
      <div className="intro">
        <h1>🍰 Bem-vindo à Doçura da Casa!</h1>
        <p>Explore nossas delícias artesanais! Aqui você pode:</p>
        <ul>
          <li><strong>Visitante:</strong> visualizar produtos e preços.</li>
          <li><strong>Cliente logado:</strong> montar seu carrinho.</li>
          <li><strong>Administrador:</strong> gerenciar produtos e carrinhos.</li>
        </ul>
      </div>

      {token && (
        <>
          <button
            onClick={() => {
              setMostrarCarrinho(!mostrarCarrinho)
              if (!mostrarCarrinho) carregarCarrinho()
            }}
          >
            {mostrarCarrinho ? "Fechar Carrinho" : "Ver Carrinho"}
          </button>

          <h1>Cadastro de Produtos</h1>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder='Nome' name="nome" />
            <input type="number" placeholder='Preço' name="preco" />
            <input type="text" placeholder='Descrição' name="descricao" />
            <input type="text" placeholder='URL Foto' name="urlfoto" />
            <button type='submit'>Cadastrar</button>
          </form>
        </>
      )}

      <h1>Lista de produtos</h1>
      <div className="container-produtos">
        {produtos.map((produto) => (
          <div key={produto._id}>
            <h2>{produto.nome}</h2>
            <img src={produto.urlfoto} alt='Imagem do produto' />
            <p>Preço: {produto.preco}</p>
            <p>Descrição: {produto.descricao}</p>
            {token && (
              <button onClick={() => adicionarItemCarrinho(produto._id)}>
                Adicionar ao Carrinho
              </button>
            )}
          </div>
        ))}
      </div>

      {mostrarCarrinho && (
        <div className="carrinho">
          <h2>🛍️ Seu Carrinho</h2>

          {carrinho.length === 0 ? (
            <p>O carrinho está vazio.</p>
          ) : (
            <>
              {carrinho.map((item) => (
                <div key={item._id} className="item-carrinho">
                  <p><strong>{item.produto?.nome}</strong></p>
                  <p>Quantidade:
                    <input
                      type="number"
                      min={1}
                      value={item.quantidade}
                      onChange={(e) =>
                        atualizarQuantidade(item._id, Number(e.target.value))
                      }
                    />
                  </p>
                  <p>Preço: R$ {item.produto?.preco}</p>
                  <button onClick={() => excluirItem(item._id)}>Excluir</button>
                </div>
              ))}
              <button onClick={esvaziarCarrinho}>🗑️ Esvaziar Carrinho</button>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default App
