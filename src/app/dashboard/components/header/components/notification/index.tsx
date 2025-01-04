import React, { useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import { Bell, CircleAlert } from 'lucide-react';
import NotificationJurosItem from '../notificationJurosItem';
import { BeatLoader } from 'react-spinners'; // Loader para exibir durante o carregamento
import { getCookie } from 'cookies-next';
import { toast } from 'react-toastify';
import { api } from '@/services/api';
import axios from 'axios';

interface NotificationsProps {
  showNotifications: boolean;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  notificationCount: number;
  notifications: Notification[]; // Agora, usaremos as notificações passadas como prop
  isLoading: boolean; // Estado que indica se as notificações estão sendo carregadas
}

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  status: number;
  iconType: "bell" | "alert"; // Tipos de ícones que você pode personalizar
  link: string;
}

const Notifications: React.FC<NotificationsProps> = ({
  showNotifications,
  setShowNotifications,
  notifications,
  isLoading,
}) => {
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showNotifications, setShowNotifications]);

  if (!showNotifications) return null;

  // Função para fechar notificações ao clicar
  const handleNotificationClick = async (id: string) => {
    //setIsLoading(true); // Ativa o loading ao fazer a requisição
    try {
      const token = getCookie("token"); // Obtém o token de autenticação
  
      if (!token) {
        toast.error("Token de autenticação não encontrado. Faça login novamente.");
        //setIsLoading(false); // Desativa o loading se não houver token
        return;
      }
  
      const response = await api.put(
        `/juros/clients/${id}`,  // Ajuste a URL de acordo com sua API
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Processa a resposta da API
      if (response.status === 200) {
        toast.success("Status da notificação atualizado com sucesso!");
      } else {
        toast.error("Erro ao atualizar status da notificação.");
      }
  
      //setIsLoading(false); // Desativa o loading após a resposta
    } catch (error) {
      //setIsLoading(false); // Desativa o loading em caso de erro
  
      // Tratamento de erro
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao atualizar o status da notificação.";
        toast.error(errorMessage);
        console.error("Erro ao atualizar status:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }
  };

  return (
    <div className={styles.notificationsContainer} ref={notificationsRef}>
      {/* Cabeçalho das Notificações */}
      <div className={styles.notificationsHeader}>
        <h6>Central de Notificações</h6>
      </div>

      {/* Exibição do estado de carregamento */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <BeatLoader size={15} color="#FFF" /> {/* Loader durante o carregamento */}
          <p>Carregando notificações...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.emptyNotifications}>
          <p>Não há notificações para exibir.</p>
        </div>
      ) : (
        // Renderização Dinâmica de Notificações
        notifications.map((notification) => {
          const Icon =
            notification.iconType === "bell" ? Bell : CircleAlert; // Determina o ícone com base no tipo

          return (
            <NotificationJurosItem
              key={notification.id}
              notification={{
                id: notification.id,
                title: notification.title,
                details: notification.description,
                dueDate: notification.date,
                status: notification.status,
                link: notification.link,
              }}
              onClick={handleNotificationClick}
              icon={<Icon size={22} color="#FFF" />}
            />
          );
        })
      )}
    </div>
  );
};

export default Notifications;
