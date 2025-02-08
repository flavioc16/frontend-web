"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { api } from "@/services/api";
import { getCookie } from "cookies-next"; // Função para obter cookies
import { TableClients } from "./components/tableClient";

export interface Client {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  referencia?: string;
  created_at: string;
  updated_at: string;
  userId: string;
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]); // Tipagem dos clientes
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // Função reutilizável para buscar clientes
  const updateClientes = async () => {
    try {
      const token = getCookie("token"); // Obtém o token dos cookies
      const response = await api.get("/clients", {
        headers: {
          Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho da requisição
        },
      });
      setClients(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false); // Define loading como false quando a chamada termina
    }
  };

  // Chamada inicial para buscar clientes
  useEffect(() => {
    updateClientes();
  }, []);

  return (
    <main className={styles.contentArea}>
      <TableClients clients={clients} loading={loading} updateClientes={updateClientes} />
    </main>
  );
}
