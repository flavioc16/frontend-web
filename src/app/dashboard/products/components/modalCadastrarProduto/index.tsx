import { useRef, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import styles from "./styles.module.scss";
import { Product } from "../../page"; // Ajuste a importação conforme a localização da interface

interface ProductModalProps {
  show: boolean;
  isEdit: boolean;
  onClose: () => void;
  produto: Product | null;
  setNomeProduto: (nome: string) => void;
  setDescricaoProduto: (descricao: string) => void;
  setPrecoAVista: (preco: string) => void;
  setPrecoAPrazo: (preco: string) => void;
  updateProdutos?: () => void; // Função para atualizar a lista de produtos, opcional
}

export default function ProductModal({
  show,
  isEdit,
  onClose,
  produto,
  updateProdutos,
  setNomeProduto,
  setDescricaoProduto,
  setPrecoAVista,
  setPrecoAPrazo,
}: ProductModalProps) {
  const descricaoInputRef = useRef<HTMLInputElement | null>(null);

  const [checkbox, setCheckbox] = useState(false);

  // Atualiza os valores quando o produto é alterado (passado via props)
  useEffect(() => {
    if (produto) {
      setNomeProduto(produto.nome);
      setDescricaoProduto(produto.descricao);
      setPrecoAVista(produto.precoAVista.toFixed(2));
      setPrecoAPrazo(produto.precoAPrazo.toFixed(2));
    }
  }, [produto, setNomeProduto, setDescricaoProduto, setPrecoAVista, setPrecoAPrazo]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckbox(e.target.checked);
    descricaoInputRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    toast.dismiss();

    if (!produto?.nome || !produto?.precoAVista || !produto?.precoAPrazo) {
      toast.error("Preencha todos os campos.");
      return;
    }

    const token = getCookie("token");
    if (!token) {
      toast.error("Token de autenticação não encontrado. Faça login novamente.");
      return;
    }

    try {
      const produtoData = {
        id: produto?.id,
        nome: produto?.nome,
        descricao: produto?.descricao,
        precoAVista: produto?.precoAVista,
        precoAPrazo: produto?.precoAPrazo,
        created_at: produto?.created_at,
        updated_at: produto?.updated_at,
      };

      if (updateProdutos) {
        updateProdutos(); // Atualiza a lista de produtos após a operação
      }

      if (isEdit && produto?.id) {
        // Chamada para atualização de produto
        await api.put(`/produtos/${produto.id}`, produtoData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Produto ${produto?.nome} atualizado com sucesso.`);
      } else {
        // Chamada para criação de produto
        await api.post("/produtos", produtoData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(`Produto ${produto?.nome} cadastrado com sucesso.`);
      }

      if (!checkbox) {
        onClose(); // Fecha o modal se o checkbox não estiver marcado
      } else {
        descricaoInputRef.current?.focus();
        if (!isEdit) {
          // Limpa os campos se for um novo produto
          setNomeProduto("");
          setDescricaoProduto("");
          setPrecoAVista("0.00");
          setPrecoAPrazo("0.00");
  
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(isEdit ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.");
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
        <h2>{isEdit ? `Editar Produto: ${produto?.nome}` : "Cadastrar Produtooooo"}</h2>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} color="var(--white)" />
        </button>
      </div>
      <div className={styles.customModalBody}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nome" className={styles.customFormLabel}>Nome</label>
            <input
              id="nome"
              type="text"
              required
              value={produto?.nome || ""}
              onChange={(e) => setNomeProduto(e.target.value)}
              className={styles.customFormControl}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="descricao" className={styles.customFormLabel}>Descrição</label>
            <input
              id="descricao"
              ref={descricaoInputRef}
              type="text"
              required
              value={produto?.descricao || ""}
              onChange={(e) => setDescricaoProduto(e.target.value)}
              className={styles.customFormControl}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="precoAVista" className={styles.customFormLabel}>Preço à Vista</label>
            <input
              id="precoAVista"
              type="number"
              required
              value={produto?.precoAVista?.toFixed(2) || ""}
              onChange={(e) => setPrecoAVista(e.target.value)}
              className={styles.customFormControl}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="precoAPrazo" className={styles.customFormLabel}>Preço a Prazo</label>
            <input
              id="precoAPrazo"
              type="number"
              required
              value={produto?.precoAPrazo?.toFixed(2) || ""}
              onChange={(e) => setPrecoAPrazo(e.target.value)}
              className={styles.customFormControl}
            />
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
                  <div className={styles.rememberMeText}>Adicionar outro produto</div>
                </label>
              )}
            </div>
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.customBtnPrimary}>
                {isEdit ? "Editar" : "Cadastrar"}
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
