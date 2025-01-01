"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../styles.module.scss";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";

import { TableCompras } from "../table";

export interface Compra {
  id: string;
  descricaoCompra: string;
  totalCompra: number;
  tipoCompra: number;
  isVencida: number;
  statusCompra: number;
  created_at: string;
  updated_at: string;
  clienteId: string;
}

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

export default function ClientPurchases() {
  const { clienteId } = useParams();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Client | null>(null);
  const [somaTotalCompras, setSomaTotalCompras] = useState<number>(0);

  // Função para buscar os dados iniciais
  const fetchData = async () => {
    if (!clienteId) return;

    const token = getCookie("token");

    try {
      // Busca as compras
      const responseCompras = await api.get(`/clients/purchases/${clienteId}/compras`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCompras(responseCompras.data.compras);
      setSomaTotalCompras(responseCompras.data.somaTotalCompras);

      // Busca os dados do cliente
      const responseCliente = await api.get(`/clients/${clienteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCliente(responseCliente.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar apenas as compras
  const updateCompras = async () => {
    const token = getCookie("token");

    try {
      const responseCompras = await api.get(`/clients/purchases/${clienteId}/compras`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCompras(responseCompras.data.compras);
      setSomaTotalCompras(responseCompras.data.somaTotalCompras);
    } catch (error) {
      console.error("Erro ao atualizar compras:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clienteId]);

  return (
    <main className={styles.contentArea}>
      <TableCompras
        compras={compras}
        somaTotalCompras={somaTotalCompras}
        cliente={cliente}
        loading={loading}
        updateCompras={updateCompras} // Passa a função como prop
      />
    </main>
  );
}
