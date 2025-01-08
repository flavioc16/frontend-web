import { useRef, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import styles from "./styles.module.scss";
import { BeatLoader } from "react-spinners";

export interface CustomModalProps {
  show: boolean;
  onClose: () => void;
  isEdit?: boolean; // Indica se o modal está sendo usado para edição
  updateProdutos: () => Promise<void>; // Função para atualizar a lista de produtos após salvar/atualizar
  
  initialFormData?: {
      id?: string;
      nome: string;
      descricao: string;
      precoAVista: string;
      precoAPrazo: string;
  };
}


export default function ModalCadastrarProduto({
  show,
  isEdit,
  onClose,
  updateProdutos,
  initialFormData ={
      nome: "",
      descricao: "",
      precoAVista: "0,00",
      precoAPrazo: "0,00",
  }
}: CustomModalProps) {
  const nomeProdutoRef = useRef<HTMLInputElement | null>(null);
  const descricaoProdutoRef = useRef<HTMLTextAreaElement | null>(null);

  const [rawPrecoAVista, setRawPrecoAVista] = useState(0); // Valor numérico bruto
  const [formattedPrecoAVista, setFormattedPrecoAVista] = useState("0,00");
  const precoAVistaProdutoRef = useRef<HTMLInputElement>(null);

  const [rawPrecoAPrazo, setRawPrecoAPrazo] = useState(0); // Valor numérico bruto
  const [formattedPrecoAPrazo, setFormattedPrecoAPrazo] = useState("0,00");
  const precoAPrazoProdutoRef = useRef<HTMLInputElement>(null);
 

  const handlePrecoAVistaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    const numericValue = value.replace(/[^\d]/g, ""); // Remove caracteres não numéricos

    let rawNumber = parseFloat(numericValue);
    if (isNaN(rawNumber)) {
      rawNumber = 0;
    }

    // Atualiza o estado com o valor numérico
    setRawPrecoAVista(rawNumber);

    // Atualiza o valor formatado para exibição no input
    const formattedValue = (rawNumber / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Atualiza o estado com o valor formatado
    setFormattedPrecoAVista(formattedValue);
  };

  const handlePrecoAPrazoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    const numericValue = value.replace(/[^\d]/g, ""); // Remove caracteres não numéricos

    let rawNumber = parseFloat(numericValue);
    if (isNaN(rawNumber)) {
      rawNumber = 0;
    }

    // Atualiza o estado com o valor numérico
    setRawPrecoAPrazo(rawNumber);

    // Atualiza o valor formatado para exibição no input
    const formattedValue = (rawNumber / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Atualiza o estado com o valor formatado
    setFormattedPrecoAPrazo(formattedValue);
  };

  const [checkbox, setCheckbox] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
        if (show) {
            setFormData(initialFormData);
        }
  }, [show, initialFormData]);
  
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckbox(e.target.checked);
    nomeProdutoRef.current?.focus();
  };

  const capitalizeWords = (value: string): string => {
    return value
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast.dismiss();
  
    const token = getCookie("token");
    if (!token) {
      toast.error("Token de autenticação não encontrado. Faça login novamente.");
      setIsLoading(false);
      return;
    }
  
    // Validações de campos obrigatórios
    if (!formData.nome) {
      toast.error("O campo Nome é obrigatório.");
      nomeProdutoRef.current?.focus();
      setIsLoading(false);
      return;
    }
    if (!formData.descricao) {
      toast.error("O campo Descrição é obrigatório.");
      descricaoProdutoRef.current?.focus();
      setIsLoading(false);
      return;
    }
    if (rawPrecoAVista <= 0) {
      toast.error(
        <span>
          O valor de <strong>Preço à Vista</strong> deve ser maior que zero.
        </span>
      );
      precoAVistaProdutoRef.current?.focus();
      setIsLoading(false);
      return;
    }
    if (rawPrecoAPrazo <= 0) {
      toast.error(
        <span>
          O valor de <strong>Preço a Prazo</strong> deve ser maior que zero.
        </span>
      );
      precoAPrazoProdutoRef.current?.focus();
      setIsLoading(false);
      return;
    }
  
    try {
      // Criação do objeto do produto com os valores brutos
      const produtoData = {
        nome: formData.nome,
        descricao: formData.descricao,
        precoAVista: rawPrecoAVista,
        precoAPrazo: rawPrecoAPrazo,
      };
  
      // Envio dos dados para o backend
      await api.post("/produtos", produtoData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Atualização da lista de produtos
      await updateProdutos();
  
      // Notificação de sucesso
      setTimeout(() => {
        toast.success(`Produto ${formData.nome} cadastrado com sucesso.`);
      }, 0);
  
      // Limpa o formulário e estados
      setFormData(initialFormData);
      setRawPrecoAVista(0);
      setRawPrecoAPrazo(0);
      setFormattedPrecoAVista("0,00");
      setFormattedPrecoAPrazo("0,00");
      
      // Fecha o modal se o checkbox não estiver selecionado
      if (!checkbox) {
        onClose();
      } else {
        setTimeout(() => {
          nomeProdutoRef.current?.focus();  // Foca no campo de nome
        }, 0);  // Adiciona um pequeno delay para garantir que o foco seja aplicado após a renderização
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar produto.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Modal
      show={show}
      onHide={onClose}
      className={styles.customModal}
      size="lg"
      backdrop={true}
      keyboard={!checkbox}
    >
      <div className={styles.customModalHeader}>
        <h2>{isEdit ? `Editar Produto: ${formData?.nome}` : "Cadastrar Produto"}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} color="var(--white)" />
        </button>
      </div>
      <div className={styles.customModalBody}>
        <form onSubmit={handleSubmit}>
          {/* Nome */}
          <div className={styles.formGroup}>
            <label htmlFor="nome" className={styles.customFormLabel}>Nome</label>
            <input
              id="nome"
              type="text"
              required
              value={capitalizeWords(formData.nome)}
              onChange={(e) => handleChange("nome", e.target.value)}
              className={styles.customFormControl}
              autoFocus
              placeholder="Nome do produto"
              ref={nomeProdutoRef}
            />
          </div>

          {/* Descrição (textarea) */}
          <div className={styles.formGroup}>
            <label htmlFor="descricao" className={styles.customFormLabel}>Descrição</label>
            <textarea
              id="descricao"
              required
              rows={3}
              value={capitalizeWords(formData.descricao)}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Descrição do produto"
              className={styles.customFormControl}
              ref={descricaoProdutoRef}
            />
          </div>

          {/* Preço à Vista */}
           <div className={styles.formGroup}>
            <label htmlFor="precoAVista" className={styles.customFormLabel}>Preço à Vista</label>
            <input
              id="precoAVista"
              type="text"
              ref={precoAVistaProdutoRef} // Adiciona a referência
              value={formattedPrecoAVista} // Usa o valor formatado
              onChange={handlePrecoAVistaChange} // Manipula o valor
              placeholder="Preço à Vista"
              required
              className={styles.customFormControl}
            />
          </div>

          {/* Preço a Prazo */}
          <div className={styles.formGroup}>
            <label htmlFor="precoAPrazo" className={styles.customFormLabel}>Preço a Prazo</label>
            <input
              id="precoAPrazo"
              type="text"
              ref={precoAPrazoProdutoRef} // Adiciona a referência
              value={formattedPrecoAPrazo} // Usa o valor formatado
              onChange={handlePrecoAPrazoChange} // Manipula o valor
              placeholder="Preço à Vista"
              required
              className={styles.customFormControl}
            />
          </div>

          {/* Botões */}
          <div className={styles.buttonContainer}>
            <div className={styles.rememberMeContainer}>
              {!isEdit && (
                <label>
                  <input
                    type="checkbox"
                    checked={checkbox}
                    onChange={handleCheckboxChange}
                  />
                  <div className={styles.rememberMeText}>Adicionar outro produto</div>
                </label>
              )}
            </div>
            <div className={styles.buttonGroup}>
              <button 
                type="submit" 
                className={styles.customBtnPrimary}
                disabled={isLoading}
              >
                {isLoading ? <BeatLoader color="#fff" size={6} /> : isEdit ? "Editar" : "Cadastrar"}
              </button>
              <button type="button" onClick={onClose} className={styles.customBtnSecondary}>
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
