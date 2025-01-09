import Link from "next/link";
import { TriangleAlert } from "lucide-react"; 
import styles from "./styles.module.scss";

interface Notification {
  id: string;
  title: string;
  details: string;
  dueDate: string;
  status: number;
  link: string;
}

interface NotificationJurosItemProps {
  notification: Notification;
  onClick: (id: string) => void;
  icon?: React.ReactNode;
}

const NotificationJurosItem: React.FC<NotificationJurosItemProps> = ({ notification, onClick }) => {
  const { id, title, details, dueDate, status, link } = notification;

  return (
    <Link href={link} onClick={() => onClick(id)}>
      <div className={styles.notificationItem}>
        <div className={styles.iconContainer}>
          <div className={styles.iconCircleBgDanger}>
            <TriangleAlert 
              size={20} 
              color="#FFF" 
              style={{ marginTop: '-4px' }} // Ajuste o valor conforme necessário
            />
          </div>
        </div>
        <div className={styles.notificationText}>
          <div className={styles.notificationTitle}>{title}</div>
          <div className={styles.notificationDetails}>
            <span className={styles.notificationAmount}>{details}</span>
            <div className={styles.notificationDate}>
              Data de vencimento: {dueDate} {/* Exibindo a data diretamente */}
            </div>
            {status === 0 && <div className={styles.unreadDot}></div>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NotificationJurosItem;
