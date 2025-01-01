import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { X } from "lucide-react";
import styles from "./styles.module.scss";
import { getCookie } from "cookies-next";
import { api } from "@/services/api";

interface PurchaseInfoModalProps {
  showModalInfo: boolean;
  handleCloseModalInfo: () => void;
  purchaseId: string; // ID da compra recebida via prop
}

interface PurchaseInfo {
  id: string;
  descricaoCompra: string;
  totalCompra: number;
  valorInicialCompra: number;
  tipoCompra: number; // 0 ou 1
  statusCompra: number; // 0: pendente, 1: pago
  created_at: string;
  updated_at: string;
  dataDaCompra: string;
  dataVencimento?: string;
  isVencida?: number;
  userId?: string;
  clienteId?: string;
  pagamentoId?: string;
  juros?: {
    id: string;
    valor: number;
    descricao: string;
    created_at: string;
    compraId: string;
    clienteId: string;
  }[];
  pagamentos?: {
    id: string;
    valorPagamento: number;
    clienteId: string;
    userId: string;
    created_at: string;
    updated_at: string;
    compraId: string;
  }[];
}

export default function PurchaseInfoModal({
  showModalInfo,
  handleCloseModalInfo,
  purchaseId,
}: PurchaseInfoModalProps) {
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);

  useEffect(() => {
    if (purchaseId && showModalInfo) {
      // Simulando a chamada à API para obter as informações da compra
      // Troque isso pela chamada real à API
      const fetchPurchaseInfo = async () => {
        try {
          const token = getCookie("token");
          const response = await api.get(`/compras/${purchaseId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          setPurchaseInfo(response.data);
        } catch (error) {
          console.error("Erro ao carregar as informações da compra:", error);
        }
      };
      
      fetchPurchaseInfo();
    }
  }, [purchaseId, showModalInfo]);
  
  return (
    <Modal
      show={showModalInfo}
      onHide={handleCloseModalInfo}
      className={styles.customModal}
      keyboard={true}
      size="lg"
    >
      <div className={styles.customModalHeader}>
        <h2>Informações da Compra</h2>
        <button onClick={handleCloseModalInfo} className={styles.closeButton}>
          <X size={24} color="var(--white)" />
        </button>
      </div>
      <div className={styles.customModalBody}>
        {purchaseInfo ? (
          <div>
              <h2>Compra</h2>
            {/* Informações principais */}
            <div className={styles.infoRow}>
              <strong>Descrição:</strong> {purchaseInfo.descricaoCompra}
            </div>
            <div className={styles.infoRow}>
              <strong>Data da Compra:</strong>{" "}
              {new Date(purchaseInfo.dataDaCompra).toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo", // Ajuste para o fuso horário desejado
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className={styles.infoRow}>
              <strong>Valor Inicial:</strong>{" "}
              {purchaseInfo.valorInicialCompra.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <div className={styles.infoRow}>
              <strong>Valor Atual:</strong>{" "}
              {purchaseInfo.totalCompra.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <div className={styles.infoRow}>
              <strong>Data de Vencimento:</strong>{" "}
              {purchaseInfo.dataVencimento
                ? new Date(purchaseInfo.dataVencimento).toLocaleDateString("pt-BR")
                : "Não informado"}
            </div>
            <div className={styles.infoRow}>
              <strong>Está vencida?:</strong> {purchaseInfo.isVencida ? "Sim" : "Não"}
            </div>

            {/* Juros */}
            {purchaseInfo.juros && purchaseInfo.juros.length > 0 && (
              <div className={styles.section}>
                <h2>Juros</h2>
                {purchaseInfo.juros.map((juros, index) => (
                  <div key={juros.id} className={styles.infoRow}>
                    
                    <strong>Juros #{index + 1}:</strong>{" "}
                    {new Date(juros.created_at).toLocaleDateString("pt-BR")}
                    
                    <br />
                    <strong>Descrição:</strong> {juros.descricao}
                    <br />
                    <strong>Valor:</strong>{" "}
                    {juros.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Pagamentos */}
            {purchaseInfo.pagamentos && purchaseInfo.pagamentos.length > 0 && (
              <div className={styles.section}>
                <h2>Pagamentos</h2>
                {purchaseInfo.pagamentos.map((pagamento, index) => (
                  <div key={pagamento.id} className={styles.infoRow}>
                    <strong>Pagamento #{index + 1}:</strong>{" "}
                    {new Date(pagamento.created_at).toLocaleDateString("pt-BR")}
                    <strong>Valor:</strong>{" "}
                    {pagamento.valorPagamento.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Botões */}
            <div className={styles.buttonContainer}>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={handleCloseModalInfo}
                  className={styles.customBtnSecondary}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>Carregando informações...</p>
        )}
      </div>
    </Modal>

  );
}
