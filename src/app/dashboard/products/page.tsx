"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import TableProducts from "./components/tableProducts";

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  precoAVista: number;
  precoAPrazo: number;
  created_at: string;
  updated_at: string;
}

export default function Products() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const token = getCookie("token"); // Obtém o token dos cookies
        const response = await api.get("/produtos", {
          headers: {
            Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho da requisição
          },
        });
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setLoading(false); // Define loading como false quando a chamada termina
      }
    }

    fetchClients();
  }, []);

  // Função para atualizar produtos
  const updateProdutos = async () => {
    try {
      const token = getCookie("token");
      const responseProdutos = await api.get("/produtos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Verifique se a API retorna `response.data.produtos` ou apenas `response.data`
      const produtosData = responseProdutos.data.produtos || responseProdutos.data;
      setProdutos(produtosData); // Atualiza o estado de forma consistente
    } catch (error) {
      console.error("Erro ao atualizar produtos:", error);
    }
  };
  
  return (
    <main className={styles.contentArea}>
      <TableProducts produtos={produtos} loading={loading} updateProdutos={updateProdutos} />
    </main>
  );
}
