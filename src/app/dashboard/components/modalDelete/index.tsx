import { Modal } from "react-bootstrap";
import { X } from "lucide-react";
import { BeatLoader } from "react-spinners"; // Exemplo de loader
import stylesModal from "./stylesModal.module.scss";
import { useState } from "react";

interface DeleteModalProps {
  showModalDelete: boolean;
  handleCloseModalDelete: () => void;
  handleConfirmDelete: () => void;
  modalTitle: string; // Título dinâmico fornecido como prop
}

export default function DeleteModal({
  showModalDelete,
  handleCloseModalDelete,
  handleConfirmDelete,
  modalTitle, // Recebe a prop modalTitle
}: DeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true); // Ativa o estado de loading
    await handleConfirmDelete(); // Aguarda a ação de exclusão
    setIsLoading(false); // Desativa o estado de loading
  };

  return (
    <Modal
      show={showModalDelete}
      onHide={handleCloseModalDelete}
      className={stylesModal.customModal}
      size="sm"
    >
      <div className={stylesModal.customModalHeader}>
        <h2>{modalTitle}</h2> {/* Título dinâmico passado por prop */}
        <button onClick={handleCloseModalDelete} className={stylesModal.closeButton}>
          <X size={24} color="var(--white)" /> {/* Ícone de fechar */}
        </button>
      </div>
      <div className={stylesModal.customModalBody}>
        <div className={stylesModal.buttonContainer}>
          <button
            onClick={handleDelete}
            className={stylesModal.customBtnPrimary}
            disabled={isLoading} // Desabilita o botão enquanto está carregando
            autoFocus
          >
            {isLoading ? <BeatLoader color="#fff" size={6} /> : "Excluir"}
          </button>
          <button
            onClick={handleCloseModalDelete}
            className={stylesModal.customBtnSecondary}
            disabled={isLoading} // Opcional: desabilita o botão de cancelar durante o loading
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
