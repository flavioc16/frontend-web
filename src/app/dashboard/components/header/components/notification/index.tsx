import React, { useEffect, useRef } from 'react';
import styles from './styles.module.scss';
import { Bell, CircleAlert } from 'lucide-react';
import NotificationJurosItem from '../notificationJurosItem';
import { BeatLoader } from 'react-spinners'; // Loader para exibir durante o carregamento
import { getCookie } from 'cookies-next';
import { toast } from 'react-toastify';
import { api } from '@/services/api';
import axios from 'axios';
import NotificationLembreteItem from '../notificationLembreteItem';
import { useMenu } from '@/app/context/MenuContext';

interface NotificationsProps {
  showNotifications: boolean;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  notificationCount: number;
  notificationsJuros: NotificationJuros[]; // Notificações de juros
  notificationLembrete: NotificationLembrete[]; // Notificações de Lembrete
  isLoading: boolean; // Estado que indica se as notificações estão sendo carregadas
}

interface NotificationJuros {
  id: string;
  title: string;
  description: string;
  date: string;
  status: number;
  iconType: "bell" | "alert"; // Tipos de ícones que você pode personalizar
  link: string;
}

interface NotificationLembrete {
  id: string;
  title: string;
  details: string;  // O campo correto
  dueDate: string;  // Data da notificação
  status: number;   // Mudado para número, 0 ou 1
  link: string;
}

const Notifications: React.FC<NotificationsProps> = ({
  showNotifications,
  setShowNotifications,
  notificationsJuros,
  notificationLembrete,
  isLoading,
}) => {
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const { setSelected } = useMenu(); // Hook para manipular o contexto do menu

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

  // Função para fechar e alterar o notificatin do juros
  const handleNotificationClick = async (id: string) => {
    setShowNotifications(false);
    setSelected("/");
    try {
      const token = getCookie("token"); // Obtém o token de autenticação
  
      if (!token) {
        toast.error("Token de autenticação não encontrado. Faça login novamente.");
        
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
    
    } catch (error) {
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

  const handleNotificationClickLembrete = async (id: string) => {
    setShowNotifications(false); // Fecha as notificações
    setSelected("reminders");
    try {
      const token = getCookie("token"); // Obtém o token de autenticação
  
      if (!token) {
        toast.error("Token de autenticação não encontrado. Faça login novamente.");
        return;
      }
  
      // Faz a requisição para atualizar o status do lembrete
      const response = await api.put(
        `/lembrete/${id}`,  // Ajuste a URL de acordo com sua API
        {
          notification: true, // Atualiza o campo notification para true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,  // Envia o token de autenticação
          },
        }
      );
  
    } catch (error) {
      // Tratamento de erro
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao atualizar o status do lembrete.";
        toast.error(errorMessage);
        console.error("Erro ao atualizar status do lembrete:", error.response?.data);
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
      ) : (
        <>
          {/* Renderização Condicional: Exibe mensagem se não houver notificações de juros ou Lembrete */}
          {notificationsJuros.length === 0 && notificationLembrete.length === 0 ? (
            <div className={styles.emptyNotifications}>
              <p>Não há notificações para exibir.</p>
            </div>
          ) : (
            <>
              {notificationLembrete.length > 0 && (
              <div>
                {notificationLembrete.map((notification) => {
              
                  return (
                    <NotificationLembreteItem
                      key={notification.id}
                      notification={{
                        id: notification.id,
                        title: notification.title,
                        details: notification.details, // Usando 'details'
                        dueDate: notification.dueDate, // 'dueDate'
                        status: notification.status ? 1 : 0, // Convertendo booleano para 0 ou 1
                        link: notification.link,
                      }}
                      onClick={handleNotificationClickLembrete}
                      icon={<Bell size={22} color="#FFF" />}
                    />
                  );
                })}
              </div>
            )}

              {notificationsJuros.length > 0 && (
                <div>
                  {notificationsJuros.map((notificationJuros) => {
                    const Icon = notificationJuros.iconType === "bell" ? Bell : CircleAlert; // Determina o ícone com base no tipo
  
                    return (
                      <NotificationJurosItem
                        key={notificationJuros.id} // Usando o id de juros como chave
                        notification={{
                          id: notificationJuros.id,
                          title: notificationJuros.title,
                          details: notificationJuros.description,
                          dueDate: notificationJuros.date,
                          status: notificationJuros.status,
                          link: notificationJuros.link,
                        }}
                        onClick={handleNotificationClick}
                        icon={<Icon size={22} color="#FFF" />}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
  
};

export default Notifications;
