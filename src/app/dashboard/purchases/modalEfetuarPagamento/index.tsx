import { useRef, useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import styles from "./styles.module.scss";
import { BeatLoader } from "react-spinners";

interface PaymentModalProps {
  showModalPayment: boolean;
  handleCloseModalPayment: () => void;
  clientId: string; // ID do cliente recebida via prop
  totalValue: number; // Valor total das compras do cliente
  updateCompras: () => void;
}

export default function PaymentModal({
  showModalPayment,
  handleCloseModalPayment,
  clientId,
  totalValue,
  updateCompras
}: PaymentModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [valueInputForPayment, setValueInputForPayment] = useState("0,00"); // Valor formatado
  const [rawValue, setRawValue] = useState(0); // Valor bruto
  const [initialPaymentValue, setInitialPaymentValue] = useState(0); // Valor bruto
  const [isLoading, setIsLoading] = useState(false);
  

  // Formatação para o formato pt-BR
  const formatToCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Atualiza o estado com o valor total formatado quando o `totalValue` mudar
 useEffect(() => {
  if (showModalPayment) {
    // O modal foi aberto, então inicializa o estado
    setInitialPaymentValue(totalValue); // Armazena o valor inicial
    setValueInputForPayment(formatToCurrency(totalValue)); // Ajusta o valor formatado
    setRawValue(totalValue); // Ajusta o valor bruto

    // Garantir que o modal tenha sido renderizado antes de aplicar o foco
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0); // Ajuste o tempo conforme necessário
  } else {
    // O modal foi fechado, então você pode resetar os estados, se necessário
    setValueInputForPayment("0,00");
    setRawValue(0);
  }
}, [showModalPayment, totalValue]);

  // Atualiza o valor enquanto o usuário digita
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    const numericValue = value.replace(/[^\d]/g, ""); // Remove caracteres não numéricos
    const rawNumber = parseFloat(numericValue) / 100; // Converte para valor decimal
    setRawValue(isNaN(rawNumber) ? 0 : rawNumber);

    const formattedValue = isNaN(rawNumber)
      ? "0,00"
      : rawNumber.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

    setValueInputForPayment(formattedValue);
  };

  // Formata o valor ao perder o foco
  const handleBlur = () => {
    const formattedValue = rawValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setValueInputForPayment(formattedValue);
  };

  // Envia o formulário
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    toast.dismiss();
    setIsLoading(true);

    const paymentValue = parseFloat(valueInputForPayment.replace(/\./g, "").replace(",", "."));

    if (paymentValue <= 0) {
      // Restaura o valor inicial
      setValueInputForPayment(formatToCurrency(initialPaymentValue)); // Usa o valor inicial formatado
      setRawValue(initialPaymentValue); // Restaura o valor bruto inicial
    
      toast.error("Digite um valor válido para o pagamento.");
    
      // Foca no input e seleciona o texto após um pequeno atraso
      inputRef.current?.focus(); // Foca no input
      setTimeout(() => {
        inputRef.current?.select(); // Seleciona o texto no input
      }, 50); // Pequeno atraso (ajuste conforme necessário)
      setIsLoading(false);
      return;
    }

    console.log("Valor do pagamento:", paymentValue);
    console.log("Valor do banco:", totalValue);
    
    if (paymentValue > totalValue) {
      // Restaura o valor inicial
      setValueInputForPayment(formatToCurrency(initialPaymentValue)); // Usa o valor inicial formatado
      setRawValue(initialPaymentValue); // Restaura o valor bruto inicial
    
      toast.error("O valor do pagamento não pode exceder o total das compras.");
    
      // Foca no input e seleciona o texto após um pequeno atraso
      inputRef.current?.focus(); // Foca no input
      setTimeout(() => {
        inputRef.current?.select(); // Seleciona o texto no input
      }, 50); // Pequeno atraso (ajuste conforme necessário)
      setIsLoading(false);
      return;
    }
    
    const token = getCookie("token");
    if (!token) {
      toast.error("Token de autenticação não encontrado. Faça login novamente.");
      return;
    }

    try {
      const paymentData = {
        valorPagamento: paymentValue,
        clienteId: clientId, // Utiliza a ID recebida via prop
      };

      // Chamada para registrar o pagamento
      await api.post("/pagamentos", paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateCompras();
      toast.success(`Pagamento de ${valueInputForPayment} registrado com sucesso.`);
      setValueInputForPayment("0,00")
      handleCloseModalPayment(); // Fecha o modal após o sucesso

    } catch (error) {
      console.error(error);
      toast.error("Erro ao registrar o pagamento.");
    }finally{
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        show={showModalPayment}
        onHide={handleCloseModalPayment}
        className={styles.customModal}
        backdrop={true}
        keyboard={true}
      >
        <div className={styles.customModalHeader}>
          <h2>Pagamento</h2>

          <button onClick={handleCloseModalPayment} className={styles.closeButton}>
            <X size={24} color="var(--white)" />
          </button>
        </div>
        <div className={styles.customModalBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="valorPagamento" className={styles.customFormLabel}>
                Valor
              </label>
              <input
                id="valorPagamento"
                type="text"
                value={valueInputForPayment} // Valor formatado para exibição
                onBlur={handleBlur} // Formata ao perder o foco
                onChange={handleChange} // Atualiza o valor durante a digitação
                className={styles.customFormControl}
                placeholder="Valor"
                ref={inputRef} // Atribui a ref ao input
                required
              />
            </div>
            <div className={styles.buttonContainer}>
              <div className={styles.buttonGroup}>
                <button
                  type="submit"
                  className={styles.customBtnPrimary}
                  disabled={isLoading}
                 >
                  {isLoading ? <BeatLoader color="#fff" size={6} /> : 'Efetuar'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModalPayment}
                  className={styles.customBtnSecondary}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
