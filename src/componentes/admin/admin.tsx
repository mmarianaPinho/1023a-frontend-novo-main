// import { useNavigate } from "react-router-dom";

// export default function Admin() {
//   const navigate = useNavigate();

//   const tipo = localStorage.getItem("tipo");

//   if (tipo !== "admin") {
//     alert("Acesso negado! Somente administradores podem entrar aqui.");
//     navigate("/");
//     return null;
//   }

//   return (
//     <div className="admin-container">
//       <h1> Painel do Administrador</h1>
//       <p>Aqui o admin poderá visualizar e gerenciar os carrinhos e usuários.</p>

//       <button onClick={() => navigate("/")}>🏠 Voltar</button>
//     </div>
//   );
// }
