import { useRef, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import styles from "./styles.module.scss";
import { Compra } from "../../purchases/table";
import { BeatLoader } from "react-spinners";

interface CreatePurchaseModalProps {
  show: boolean;
  isEdit: boolean;
  onClose: () => void;
  selectedClient: { id: string; nome: string } | null;
  selectedCompra: Compra | null; // Permitir que seja null
  dataDaCompra: string;
  created_at: string;
  rawValue: number;
  descricaoCompra: string | undefined;
  totalCompra: string;
  tipoCompra: string | null;  // Permitir null
  setDataCompra: React.Dispatch<React.SetStateAction<string>>;
  setCreatedAt: React.Dispatch<React.SetStateAction<string>>;
  setRawValue: React.Dispatch<React.SetStateAction<number>>;
  setDescricaoCompra: React.Dispatch<React.SetStateAction<string | undefined>>;
  setTotalCompra: React.Dispatch<React.SetStateAction<string>>;
  setTipoCompra: React.Dispatch<React.SetStateAction<string | null>>;  // Permitir null
  updateCompras?: () => void;
  
}

export default function CreatePurchaseModal({
  show,
  isEdit,
  onClose,
  selectedClient,
  dataDaCompra,
  selectedCompra,
  rawValue,
  descricaoCompra,
  totalCompra,
  tipoCompra,
  setDataCompra,
  setRawValue,
  setDescricaoCompra,
  setTotalCompra,
  setTipoCompra,
  updateCompras 
}: CreatePurchaseModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const descricaoInputRef = useRef<HTMLInputElement | null>(null);
  const [checkbox, setCheckbox] = useState(false);

  const [produtos, setProdutos] = useState<any[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
 
  const fetchProdutos = async () => {
    try {
      const token = getCookie("token");
      const response = await api.get("/produtos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProdutos(response.data); // Atualiza a lista completa de produtos
      setFilteredProdutos(response.data.slice(0, 5)); // Exibe os primeiros 5 produtos inicialmente
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  // Chama a função fetchProdutos assim que o modal for aberto
  useEffect(() => {
    fetchProdutos(); // Chama a função de buscar produtos assim que o modal for carregado
  }, []); // O array vazio [] faz com que a função seja chamada apenas uma vez quando o modal for aberto

  useEffect(() => {
    if (tipoCompra === "0") {
      fetchProdutos(); // Chama novamente a função para garantir que os produtos são carregados para "Compra"
    }
  }, [tipoCompra]);

  const handleDescricaoCompraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescricaoCompra(value); // Atualiza o valor do estado para refletir a mudança no campo de texto
  
    if (value.length === 0) {
      // Se o campo de descrição estiver vazio, mostramos os primeiros 5 produtos
      setFilteredProdutos(produtos.slice(0, 5)); // Exibe apenas os primeiros 5 produtos
    } else {
      // Filtra produtos com base no texto digitado
      const filtered = produtos.filter((produto) =>
        produto.nome.toLowerCase().includes(value.toLowerCase())
      );
  
      const maxSuggestions = 5; // Limite para mostrar apenas 5 sugestões
      setFilteredProdutos(filtered.slice(0, maxSuggestions)); // Atualiza a lista de produtos filtrados com o limite
    }
  };

  const clearInput = () => {
    setDescricaoCompra('');
    descricaoInputRef.current?.focus(); // Foca no input após limpar
  };
  

  useEffect(() => {
    if (isEdit && dataDaCompra) {
      const formattedDate = new Date(dataDaCompra).toISOString().split('T')[0];
      setDataCompra(formattedDate);  // Atualizando o estado ao abrir o modal em modo de edição
    }
  }, [isEdit, dataDaCompra, setDataCompra]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckbox(e.target.checked);
    descricaoInputRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
  
    toast.dismiss();
  
    if (isEdit && !selectedCompra?.id) {
      toast.error("Nenhuma compra selecionada.");
      return;
    }

    if (!descricaoCompra || descricaoCompra.trim() === "") {
      toast.error("Digite uma descrição para a compra.");
      descricaoInputRef.current?.focus();
      setIsLoading(false);
      return; // Impede a continuação da submissão
    }
  
    if (parseFloat(totalCompra.replace(",", ".")) === 0) {
      toast.error("Digite um valor válido para a compra.");
      inputRef.current?.focus();
      setIsLoading(false);
      return;
    }
  
    const token = getCookie("token");
    
    if (!token) {
      toast.error("Token de autenticação não encontrado. Faça login novamente.");
      setIsLoading(false);
      return;
    }

    if (!selectedClient?.id) {
      toast.error("Nenhum cliente selecionado.");
      setIsLoading(false);
      return;
    }
  
    try {
      const tipoCompraValor = tipoCompra ? parseInt(tipoCompra, 10) : 0;
  
      const compraData = {
        id: selectedCompra?.id, // Envia a id da compra (no modo edição)
        descricaoCompra,
        totalCompra: parseFloat(totalCompra.replace(/\./g, "").replace(",", ".")),
        valorInicialCompra: parseFloat(totalCompra.replace(/\./g, "").replace(",", ".")),
        tipoCompra: tipoCompraValor,
        statusCompra: 0,
        dataDaCompra: dataDaCompra, // Ou outra data conforme necessário
        clienteId: selectedClient.id,
      };
  
      if (updateCompras) {
        updateCompras();
      }
  
      if (isEdit) {
        // Chamada para atualização
        await api.put(`/compras`, compraData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Compra de ${selectedClient.nome} atualizada com sucesso.`);
      } else {
        // Chamada para criação
        await api.post("/compras", compraData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Compra de ${selectedClient.nome} cadastrada com sucesso.`);
      }
  
      // Resetar estados e foco após sucesso
      if (!checkbox) {
        onClose(); // Fecha o modal se o checkbox não estiver marcado
      } else {
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error(isEdit ? "Erro ao atualizar compra." : "Erro ao cadastrar compra.");
    }finally{
      setIsLoading(false);
    }
  };

  // Função para resetar os campos do formulário
  const resetForm = () => {
    descricaoInputRef.current?.focus();
    setDescricaoCompra("");
    setTotalCompra("0,00");
    setTipoCompra("0");
  };
  
  const capitalizeWords = (value: string): string => {
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toLowercaseWords = (value: string): string => {
    return value.toLowerCase();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    const numericValue = value.replace(/[^\d]/g, "");
    const rawNumber = parseFloat(numericValue) / 100;
    setRawValue(isNaN(rawNumber) ? 0 : rawNumber);

    const formattedValue = isNaN(rawNumber)
      ? "0,00"
      : rawNumber.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

    setTotalCompra(formattedValue);
  };

  const handleBlur = () => {
    const formattedValue = rawValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    setTotalCompra(formattedValue);
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        className={styles.customModal}
        size="lg"
        backdrop={true}
        keyboard={!checkbox}
      >
        <div className={styles.customModalHeader}>
          <h2> {selectedClient?.nome}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} color="var(--white)" />
          </button>
        </div>
        <div className={styles.customModalBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="dataCompra" className={styles.customFormLabel}> Data da compra </label>
              <input
                id="dataCompra"
                type="date"
                required
                value={dataDaCompra}  // O valor vem das props
                onChange={(e) => setDataCompra(e.target.value)}  // Atualiza o valor da prop dataDaCompra
                className={styles.customFormControl}
              />
            </div>
              <div className={styles.formGroup}>
                <label htmlFor="descricaoCompra" className={styles.customFormLabel}>Descrição</label>
                <div className={styles.inputContainer}>
                  <input
                    id="descricaoCompra"
                    type="text"
                    required
                    ref={descricaoInputRef}
                    placeholder="Descrição"
                    value={capitalizeWords(descricaoCompra ?? '')}
                    onChange={handleDescricaoCompraChange}
                    autoFocus
                    className={styles.customFormControl}
                    list="produtos"
                    autoComplete="off"
                  />
                </div>
        
                {descricaoCompra && (
                  <div className={styles.valueContainer}>
                    <span className={styles.value}>
                      {toLowercaseWords(descricaoCompra ?? '')}
                    </span>
                    <span
                      className={styles.clearIcon}
                      onClick={clearInput}
                    >
                      &#10006;
                    </span>
                  </div>
                )}
                <datalist id="produtos">
                  {filteredProdutos.map((produto) => (
                    <option
                      key={produto.id}
                      value={produto.nome}
                      data-price={produto.precoAVista} // Armazena o preço como dado adicional
                    >
                     {produto.descricao?.trim() 
                        ? `${produto.descricao.trim()} - ` 
                        : ""}R$ {(
                        produto.precoAPrazo / 100
                      ).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </option>
                  ))}
                </datalist>
              </div>
            <div className={styles.formGroup}>
              <label htmlFor="totalCompra" className={styles.customFormLabel}>Total</label>
              <input
                id="totalCompra"
                type="text"
                value={totalCompra}  // Valor formatado para exibição
                onBlur={handleBlur}
                onChange={handleChange}  // Atualiza o valor durante a digitação
                className={styles.customFormControl}
                placeholder="Valor"
                ref={inputRef} // Atribui a ref ao input
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="tipoCompra" className={styles.customFormLabel}>Tipo de Serviço</label>
              <select
                id="tipoCompra"
                required
                value={tipoCompra ?? '0'} // Se tipoCompra for null, '0' será usado
                onChange={(e) => setTipoCompra(e.target.value)}
                className={styles.customFormControl}
              >
                <option value="0">Compra</option>
                <option value="1">Serviço</option>
              </select>
            </div>
            <div className={styles.buttonContainer}>
              <div className={styles.rememberMeContainer}>
              {!isEdit && (
                <label>
                  <input
                    type="checkbox"
                    checked={checkbox}
                    onChange={handleCheckboxChange}
                  />
                  <div className={styles.rememberMeText}>
                    Adicionar mais compras
                  </div>
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
                <button type="button" onClick={onClose} className={styles.customBtnSecondary} >
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
