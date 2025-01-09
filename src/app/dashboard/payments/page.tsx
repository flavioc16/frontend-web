"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import { TablePagamentos } from "./components/tableRelatorio";

interface Cliente {
  nome: string;
}

interface PagamentoComDados {
  id: string;
  valorPagamento: number;
  cliente: Cliente;
  created_at: string;
  totalPagamentos: number;
}

interface DadosPagamentos {
  pagamentos: PagamentoComDados[];
  totalPagamentos: number;
}

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<DadosPagamentos>({ pagamentos: [], totalPagamentos: 0 });
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [totalPagamentos, setTotalPagamentos] = useState(0);

  useEffect(() => {
    const hoje = new Date();
    const dataAtualFormatada = hoje.toISOString().split("T")[0];

    // Atualiza os estados apenas se estiverem vazios
    setDataInicio((prev) => prev || dataAtualFormatada);
    setDataFim((prev) => prev || dataAtualFormatada);

    // Chama o fetch ao configurar os valores iniciais
    fetchPagamentos(dataAtualFormatada, dataAtualFormatada);
  }, []);

  async function fetchPagamentos(dataInicio: string, dataFim: string) {
    setLoading(true);
    try {
      const token = getCookie("token");
      const response = await api.get("/pagamentos/entre-datas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          dataInicio,
          dataFim,
        },
      });
      setPagamentos(response.data);
      setTotalPagamentos(response.data.totalPagamentos);
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
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
            fetchPagamentos(dataInicio, dataFim); // Atualiza a URL ao consultar
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
      <TablePagamentos pagamentos={pagamentos.pagamentos} totalPagamentos={totalPagamentos} loading={loading} />
    </main>
  );
}