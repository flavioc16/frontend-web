"use client"

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./styles.module.scss";
import Image from "next/image";
import { Bell, LogOutIcon, X } from "lucide-react";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import Modal from "react-bootstrap/Modal";
import stylesModal from "./stylesModal.module.scss";
import useF2Redirect from "@/app/hooks/useF2Redirect";
import { useMenu } from "@/app/context/MenuContext";
import { BeatLoader } from "react-spinners";

import Notifications from "../../components/header/components/notification"; // Importe o componente
import { api } from "@/services/api";
import { toast } from "react-toastify";
import axios from "axios";

export function Header() {
  useF2Redirect(); // Usando o hook para usar F2 Início
  const { setSelected } = useMenu(); // Acessando o contexto do menu
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [lembretesCount, setLembreteCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false); // Controla se as notificações serão mostradas
  const [showModal, setShowModal] = useState<boolean>(false); // Controla se o modal de logout será mostrado

  const [notificationsJuros, setNotificationsJuros] = useState<any[]>([]); // Lista de notificações
  const [notificationsLembrete, setNotificationsLembrete] = useState<any[]>([]);
  const router = useRouter();

  // Função para logout com loading
  const handleLogout = () => {
    setIsLoading(true); // Ativa o estado de loading
    deleteCookie("token", { path: "/" });
    localStorage.removeItem("selectedMenuItem");
    setIsLoading(false); // Desativa o estado de loading
    setShowModal(false); // Fecha o modal de logout
    router.replace("/"); // Redireciona para a página inicial
  };

  // Função para abrir/fechar notificações e carregar se necessário
  const handleOpenNotifications = async () => {
    setShowNotifications((prevState) => !prevState); // Alterna a visibilidade das notificações
    if (!showNotifications) {
      await fetchNotificationsJurosItem(); // Carrega as notificações de juros ao abrir
      await fetchNotificationsLembreteItem(); // Carrega os lembretes ao abrir
    }
  };
  
  const handleCloseModal = () => {
    setShowModal(false); // Fecha o modal de logout
  };

  const handleLogoClick = () => {
    setSelected("/"); // Atualiza o contexto para o item "Início"
  };

  // Função para buscar o contador de notificações
  const fetchJurosClientesCount = useCallback(async () => {
    try {
      const token = getCookie("token"); // Obtém o token de autenticação
  
      if (!token) {
        console.log("Token de autenticação não encontrado. Faça login novamente.");
        return;
      }
  
      const response = await api.get("/juros/count", {
        headers: {
          Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho
        },
      });
  
      setNotificationCount(response.data.count); // Atualiza o contador de notificações
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao buscar o contador de notificações.";
        console.log(errorMessage);
        console.error("Erro ao buscar notificações:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }
  }, []);

  const fetchLembretesCount = useCallback(async () => {
    try {
      const token = getCookie("token"); // Obtém o token de autenticação
  
      if (!token) {
        console.log("Token de autenticação não encontrado. Faça login novamente.");
        return;
      }
  
      const response = await api.get("/lembretes/count", {
        headers: {
          Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho
        },
      });
  
      setLembreteCount(response.data.count); // Atualiza o contador de lembretes
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao buscar o contador de lembretes.";
        console.log(errorMessage);
        console.error("Erro ao buscar lembretes:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }
  }, []); // useCallback mantém a referência da função

  // Função para buscar as notificações
  const fetchNotificationsJurosItem = async () => {
    setIsLoading(true); // Ativa o estado de loading
    try {
      const token = getCookie('token'); // Obtém o token de autenticação
  
      if (!token) {
        toast.error('Token de autenticação não encontrado. Faça login novamente.');
        setIsLoading(false); // Desativa o loading se não houver token
        return;
      }
  
      const response = await api.get("/juros/clients", {
        headers: {
          Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho
        },
      });
  
      setNotificationsJuros(response.data); // Atualiza as notificações
      setIsLoading(false); // Desativa o estado de loading após a resposta
    } catch (error) {
      setIsLoading(false); // Desativa o loading em caso de erro
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao buscar notificações.";
        toast.error(errorMessage);
        console.error("Erro ao buscar notificações:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }
  };

  const fetchNotificationsLembreteItem = async () => {
    setIsLoading(true); // Ativa o estado de loading
    try {
      const token = getCookie('token'); // Obtém o token de autenticação
  
      if (!token) {
        toast.error('Token de autenticação não encontrado. Faça login novamente.');
        setIsLoading(false); // Desativa o loading se não houver token
        return;
      }
  
      // Fazendo a chamada para o serviço de lembretes de hoje
      const response = await api.get("/lembretes/today", {
        headers: {
          Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho
        },
      });
  
      setNotificationsLembrete(response.data); // Atualiza as notificações de lembretes
      setIsLoading(false); // Desativa o estado de loading após a resposta
    } catch (error) {
      setIsLoading(false); // Desativa o loading em caso de erro
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao buscar notificações de lembretes.";
        toast.error(errorMessage);
        console.error("Erro ao buscar notificações de lembretes:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLembretesCount();
    }, 1000); // Chama a função a cada 1 segundo (1000ms)
  
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, []); // O array vazio garante que o efeito só será configurado uma vez
  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchJurosClientesCount();
    }, 1000); // Chama a função a cada 1 segundo (1000ms)
  
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, []); // O array vazio garante que o efeito só será configurado uma vez

  useEffect(() => {
    fetchJurosClientesCount(); // Busca as notificações assim que o componente for montado
  }, []);

  useEffect(() => {
    fetchLembretesCount(); // Busca as notificações assim que o componente for montado
  }, []);
  
  useEffect(() => {
    fetchNotificationsJurosItem(); // Busca as notificações assim que o componente for montado
  }, []);

  useEffect(() => {
    fetchNotificationsLembreteItem(); // Busca as notificações assim que o componente for montado
  }, []);  

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
            {/* Ícone de Notificação */}
            <a onClick={handleOpenNotifications} className={styles.logoutLink}>
              <div className={styles.bellContainer}>
                <Bell size={22} color="#FFF" />
                {(notificationCount > 0 || lembretesCount > 0) && (
                  <span className={styles.notificationCount}>
                    {notificationCount + lembretesCount}
                  </span>
                )}
              </div>
            </a>
            
            {/* Ícone de Logout */}
            <div onClick={() => { 
              setShowModal(true); 
            }} className={styles.logoutLink}>
              <LogOutIcon size={22} color="#FFF" />
            </div>
          </nav>
        </div>
      </header>

      {/* Usando o componente Notifications */}
      <Notifications 
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notificationCount={notificationCount + lembretesCount} // Soma o valor de lembretesCount
        notificationsJuros={notificationsJuros}
        notificationLembrete={notificationsLembrete}
        isLoading={isLoading}
      />


      {/* Modal de Logout */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        className={stylesModal.customModal}
        size="sm"
        aria-labelledby="logout-modal"
      >
        <div className={stylesModal.customModalHeader}>
          <h2>Deseja realmente sair?</h2>
          <button onClick={handleCloseModal} className={stylesModal.closeButton}>
            <X size={24} color="var(--white)" />
          </button>
        </div>
        <div className={stylesModal.customModalBody}>
          <div className={stylesModal.buttonContainer}>
            <button
              onClick={handleLogout}
              className={stylesModal.customBtnPrimary}
            >
              {isLoading ? <BeatLoader color="#fff" size={6} /> : "Sair"}
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
