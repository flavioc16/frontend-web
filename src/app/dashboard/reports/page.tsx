"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./styles.module.scss";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import { TableRelatorio } from "./components/tableRelatorio";

export interface Cliente {
  nome: string;
  id: string;
}

export interface Juros {}

export interface Pagamento {
  id: string;
  valorPagamento: number;
  clienteId: string;
  userId: string;
  created_at: string;
  updated_at: string;
  compraId: string;
}

export interface Compra {
  id: string;
  descricaoCompra: string;
  totalCompra: number;
  valorInicialCompra: number;
  tipoCompra: number;
  statusCompra: number;
  created_at: string;
  updated_at: string;
  dataDaCompra: string;
  dataVencimento: string;
  isVencida: number;
  userId: string;
  clienteId: string;
  pagamentoId: string | null;
  cliente: Cliente;
  juros: Juros[];
  pagamentos: Pagamento[];
}

export interface RelatorioComprasResponse {
  compras: Compra[];
  somaTotalCompras: number;
}

export default function Relatorios() {
  const router = useRouter();
  //const searchParams = useSearchParams();

  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [somaTotalCompras, setSomaTotalCompras] = useState(0);

  useEffect(() => {
    const hoje = new Date();
    const dataAtualFormatada = hoje.toISOString().split("T")[0];
  
    // Atualiza os estados apenas se estiverem vazios
    setDataInicio((prev) => prev || dataAtualFormatada);
    setDataFim((prev) => prev || dataAtualFormatada);
  
    // Chama o fetch ao configurar os valores iniciais
    fetchRelatorios(dataAtualFormatada, dataAtualFormatada);
  }, []);
  
  
  
  // Esse useEffect deve ser disparado apenas se searchParams mudar

  async function fetchRelatorios(dataInicio: string, dataFim: string) {
    setLoading(true);
    try {
      const token = getCookie("token");
  
      const response = await api.get<RelatorioComprasResponse>("/relatorio/compras", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          dataInicio,
          dataFim,
        },
      });
  
      setCompras(response.data.compras);
      setSomaTotalCompras(response.data.somaTotalCompras);
  
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <main className={styles.contentArea}>
      <div className={styles.filterContainer}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchRelatorios(dataInicio, dataFim); // Atualiza a URL ao consultar
          }}
        >
          <div className={styles.dateInputs}>
            <div className={styles.formGroup}>
              <label htmlFor="dataInicio" className={styles.customFormLabel}>
                Data Início:
              </label>
              <input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
                className={styles.customFormControl}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="dataFim" className={styles.customFormLabel}>
                Data Fim:
              </label>
              <input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                required
                className={styles.customFormControl}
              />
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.searchButton}>
              Consultar
            </button>
          </div>
        </form>
      </div>
      <TableRelatorio compras={compras} somaTotalCompras={somaTotalCompras} loading={loading} />
    </main>
  );
}
