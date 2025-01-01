'use client'; // Garantindo que o código seja executado no cliente

import { useState } from "react";
import Link from "next/link";
import styles from "./styles.module.scss";
import Image from "next/image";
import { LogOutIcon, X } from "lucide-react";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import Modal from "react-bootstrap/Modal";
import stylesModal from "./stylesModal.module.scss";
import useF2Redirect from "@/app/hooks/useF2Redirect"; // Importando o hook
import { useMenu } from "@/app/context/MenuContext";


export function Header() {
  useF2Redirect(); // usando o hook para usar f2 inicio
  const { setSelected } = useMenu(); // Acessando o contexto do menu

  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    deleteCookie("token", { path: "/" });
    localStorage.removeItem("selectedMenuItem");
    router.replace("/");
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLogoClick = () => {
    setSelected("/"); // Atualiza o contexto para o item "Início"
  };

  const handleClientsClick = () => {
    setSelected("clients"); // Atualiza o contexto para o item "Clientes"
  };

  return (
    <>
      <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <Link href="/dashboard" onClick={handleLogoClick}>
            <Image
              alt="Logo Frigorifico"
              src={"/LOGOVERTICAL.png"}
              width={167}
              height={63}
              priority={true}
              quality={100}
            />
          </Link>

          <nav>
            <Link href="/dashboard/clients" onClick={handleClientsClick}>
              Clientes
            </Link>
            <a onClick={handleOpenModal} className={styles.logoutLink}>
              <LogOutIcon size={22} color="#FFF" />
            </a>
          </nav>
        </div>
      </header>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        className={stylesModal.customModal}
        size="sm"
      >
        <div className={stylesModal.customModalHeader}>
          <h2>Deseja realmente sair?</h2>
          <button onClick={handleCloseModal} className={stylesModal.closeButton}>
            <X size={24} color="var(--white)" />
          </button>
        </div>
        <div className={stylesModal.customModalBody}>
          <div className={stylesModal.buttonContainer}>
            <button onClick={handleLogout} className={stylesModal.customBtnPrimary}>
              Sair
            </button>
            <button onClick={handleCloseModal} className={stylesModal.customBtnSecondary}>
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
