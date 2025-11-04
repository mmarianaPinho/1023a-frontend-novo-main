import React, { useEffect, useState } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";

type ProdutoType = {
  _id: string;
  nome: string;
  preco: number;
  descricao: string;
  urlfoto: string;
};

function App() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // 🔹 Atualiza o token quando o usuário faz login/logout
  useEffect(() => {
    const atualizarToken = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", atualizarToken);
    return () => window.removeEventListener("storage", atualizarToken);
  }, []);

  // 🔹 Carregar produtos
  useEffect(() => {
    api
      .get("/produtos")
      .then((res) => setProdutos(res.data))
      .catch(() => alert("Erro ao carregar produtos"));
  }, []);

  // 🔹 Adicionar item ao carrinho (só se estiver logado)
  const adicionarItemCarrinho = async (produtoId: string) => {
    if (!token) {
      alert("Você precisa estar logado para adicionar produtos ao carrinho!");
      navigate("/login");
      return;
    }

    try {
      await api.post(
        "/adicionarItem",
        { produtoId, quantidade: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Produto adicionado ao carrinho!");
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert("Sessão expirada. Faça login novamente.");
        navigate("/login");
      } else {
        alert("Erro ao adicionar ao carrinho.");
      }
    }
  };

  // 🔹 Logout
  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <div className="App">
      <header className="topo">
        {!token ? (
          <button onClick={() => navigate("/login")}>🔐 Fazer Login</button>
        ) : (
          <>
            <button onClick={() => navigate("/carrinho")}>🛒 Ver Carrinho</button>
            <button onClick={handleLogout}>🚪 Sair</button>
          </>
        )}
      </header>

      <h1>🍰 Produtos Disponíveis</h1>

      <div className="container-produtos">
        {produtos.map((produto) => (
          <div key={produto._id} className="produto">
            <img src={produto.urlfoto} alt={produto.nome} />
            <h2>{produto.nome}</h2>
            <p>{produto.descricao}</p>
            <p><strong>R$ {produto.preco}</strong></p>

            {/* 🔒 Só mostra o botão se estiver logado */}
            {token && (
              <button onClick={() => adicionarItemCarrinho(produto._id)}>
                Adicionar ao Carrinho
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
