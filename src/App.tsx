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

  // Campos do novo produto
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    preco: "",
    descricao: "",
    urlfoto: "",
  });

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

  // 🔹 Cadastrar novo produto
  async function cadastrarProduto(e: React.FormEvent) {
    e.preventDefault();

    if (!novoProduto.nome || !novoProduto.preco) {
      alert("Preencha ao menos o nome e o preço!");
      return;
    }

    try {
      await api.post("/produtos", novoProduto, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Produto cadastrado com sucesso!");

      // Atualiza lista
      const res = await api.get("/produtos");
      setProdutos(res.data);

      // Limpa o formulário
      setNovoProduto({ nome: "", preco: "", descricao: "", urlfoto: "" });
    } catch (err) {
      alert("Erro ao cadastrar produto.");
    }
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

      {/* 🔸 Só mostra o formulário de cadastro se estiver logado */}
      {token && (
        <div className="cadastro-produto">
          <h2>📦 Cadastrar Novo Produto</h2>
          <form onSubmit={cadastrarProduto}>
            <input
              type="text"
              placeholder="Nome"
              value={novoProduto.nome}
              onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
            />
            <input
              type="number"
              placeholder="Preço"
              value={novoProduto.preco}
              onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
            />
            <input
              type="text"
              placeholder="Descrição"
              value={novoProduto.descricao}
              onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
            />
            <input
              type="text"
              placeholder="URL da Foto"
              value={novoProduto.urlfoto}
              onChange={(e) => setNovoProduto({ ...novoProduto, urlfoto: e.target.value })}
            />
            <button type="submit">Cadastrar Produto</button>
          </form>
        </div>
      )}

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
