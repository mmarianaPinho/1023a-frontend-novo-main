import React, { useEffect, useState } from "react";
import api from "./api/api"; 
type ProdutoType = {
  _id: string;
  nome: string;
  preco: number;
  descricao: string;
  urlfoto: string;
};

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.get("/produtos")
      .then((res) => setProdutos(res.data))
      .catch(() => setErro("Erro ao carregar produtos"));
  }, []);

  if (erro) return <p>{erro}</p>;

  return (
    <div className="lista-produtos">
      <h1>📦 Lista de Produtos</h1>
      <div className="container-produtos">
        {produtos.map((produto) => (
          <div key={produto._id} className="produto">
            <img src={produto.urlfoto} alt={produto.nome} />
            <h2>{produto.nome}</h2>
            <p>{produto.descricao}</p>
            <p><strong>R$ {produto.preco}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
}
