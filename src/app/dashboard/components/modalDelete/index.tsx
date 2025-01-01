import { Modal } from "react-bootstrap";
import { X } from "lucide-react";
import stylesModal from "./stylesModal.module.scss";

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
            onClick={handleConfirmDelete} 
            className={stylesModal.customBtnPrimary} 
            autoFocus
          >
            Excluir
          </button>
          <button 
            onClick={handleCloseModalDelete} 
            className={stylesModal.customBtnSecondary}
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
