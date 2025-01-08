"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import TableReminders from "./components/tableReminders";

import { Reminders } from "@/app/types/lembretes";

export default function Lembretes() {
  const [lembretes, setLembretes] = useState<Reminders[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchsetLembretes() {
      try {
        const token = getCookie("token"); // Obtém o token dos cookies
        const response = await api.get("/lembretes", {
          headers: {
            Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho da requisição
          },
        });
        setLembretes(response.data);
      } catch (error) {
        console.error("Erro ao buscar lembretes:", error);
      } finally {
        setLoading(false); // Define loading como false quando a chamada termina
      }
    }

    fetchsetLembretes();
    
  }, []);

  // Função para atualizar produtos
  const updateLembretes = async () => {
    try {
      const token = getCookie("token");
      const responseProdutos = await api.get("/lembretes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Verifique se a API retorna `response.data.produtos` ou apenas `response.data`
      const LembretesData = responseProdutos.data.produtos || responseProdutos.data;
      setLembretes(LembretesData); // Atualiza o estado de forma consistente
    } catch (error) {
      console.error("Erro ao atualizar produtos:", error);
    }
  };
  
  return (
    <main className={styles.contentArea}>
      <TableReminders lembretes={lembretes} loading={loading} updateLembretes={updateLembretes} />
    </main>
  );
}
