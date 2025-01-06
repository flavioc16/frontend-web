import Link from "next/link";
import { Info } from "lucide-react";
import styles from "./styles.module.scss";

interface NotificationLembrete {
  id: string;
  title: string;
  details: string;
  dueDate: string; // Data no formato "YYYY-MM-DD"
  status: number;  // 0: Não lido, 1: Lido
  link: string;
}

interface NotificationLembreteItemProps {
  notification: NotificationLembrete;
  onClick: (id: string) => void;
  icon?: React.ReactNode;
}

const NotificationLembreteItem: React.FC<NotificationLembreteItemProps> = ({ notification, onClick }) => {
  const { id, title, details, dueDate, status, link } = notification;

  return (
    <Link href={link} onClick={() => onClick(id)}>
      <div className={styles.notificationItem}>
        <div className={styles.iconContainer}>
          <div className={styles.iconCircleBgInfo}>
            <Info 
              size={23} 
              color="#FFF" 
            />
          </div>
        </div>
        <div className={styles.notificationText}>
          <div className={styles.notificationTitle}>{title}</div>
          <div className={styles.notificationDetails}>
            <span className={styles.notificationDescription}>{details}</span>
            <div className={styles.notificationDate}>
            </div>
            {status === 0 && <div className={styles.unreadDot}></div>} {/* Exibe um ponto para notificações não lidas */}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NotificationLembreteItem;
