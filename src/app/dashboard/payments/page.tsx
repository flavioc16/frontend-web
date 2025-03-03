'use client';
import { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import { TablePagamentos } from "./components/tableRelatorio";

interface PagamentoAgrupado {
  created: string;
  nome: string;
  referencia: string;
  totalPagamento: number;
}

interface DadosPagamentos {
  pagamentos: PagamentoAgrupado[];
  totalPagamentos: number;
}

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<DadosPagamentos>({ pagamentos: [], totalPagamentos: 0 });
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [totalPagamentos, setTotalPagamentos] = useState(0);
  const adjustDate = (dateString: string): string => {
    // Verifique se o dateString não é vazio ou inválido
    if (!dateString) {
      console.error("Data recebida é inválida:", dateString); 
      return "Data inválida";
    }
  
    const date = new Date(dateString);
  
    // Verificar se o objeto Date gerado é válido
    if (isNaN(date.getTime())) {
      console.error("Data inválida:", dateString); 
      return "Data inválida";
    }
  
    // Exibindo no formato pt-BR
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };
  
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
  
      // Verifique se a resposta contém os dados esperados e mapeie corretamente
      setPagamentos({
        pagamentos: response.data.pagamentos.map((p: any) => {
          // Verifique se `created_at` existe, caso contrário, defina uma string vazia ou "Data inválida"
          const createdAt = p.created_at ? adjustDate(p.created_at) : "Data inválida";
          
          // Verifique se o campo `cliente` e `cliente.nome` existem
          const nome = p.cliente?.nome || "Nome não disponível";
          const referencia = p.cliente?.referencia || "Referência não disponível";
  
          return {
            created: createdAt,
            nome: nome,
            referencia: referencia,
            totalPagamento: p.valorPagamento,
          };
        }),
        totalPagamentos: response.data.totalPagamentos,
      });
  
      setTotalPagamentos(response.data.totalPagamentos);
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
    } finally {
      setLoading(false);
    }
  }
  
  

  console.log(pagamentos);

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
