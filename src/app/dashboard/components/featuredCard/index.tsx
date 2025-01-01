"use client";

import { ReactNode, useState } from "react";
import Card from "react-bootstrap/Card";
import { Eye, EyeOff, Loader } from "lucide-react"; // Importa o ícone de loading
import styles from "./styles.module.scss"; // Importação do arquivo de estilos

interface FeaturedCardProps {
  icon: ReactNode; // Prop para o ícone principal
  showEyeIcon?: boolean; // Prop opcional para exibir o ícone Eye
  value?: string; // Prop opcional para o valor em dinheiro
  count?: number; // Prop opcional para exibir a contagem de produtos
  title?: string; // Prop opcional para o nome do card
  onClick?: () => void; // Callback opcional para lidar com cliques no card
  updateValueCompras?: () => void
  isLoading?: boolean; // Nova prop para controlar o estado de loading
}

export default function FeaturedCard({
  icon,
  showEyeIcon = false,
  value,
  count,
  title,
  onClick, // Callback opcional
  isLoading = false, // Valor padrão de isLoading
  updateValueCompras,
}: FeaturedCardProps) {
  const [isValueVisible, setIsValueVisible] = useState(false); // Estado para controlar a visibilidade do valor

  return (
    <Card
  className={`bg-dark text-white ${styles.cardCustom}`}
  onClick={onClick} // Chama a função passada pelo pai, se definida
  style={onClick ? { cursor: "pointer" } : undefined} // Altera o cursor apenas se `onClick` for fornecido
>
  {/* Exibe o título, se fornecido */}
  {title && <Card.Header className={styles.cardHeader}>{title}</Card.Header>}
  <Card.Body className={styles.cardBodyCustom}>
    {/* Contêiner flexível para organizar o conteúdo */}
    <div className={styles.contentWrapper}>
      {/* Renderizando o ícone principal passado como prop */}
      <div className={styles.iconWrapper}>
        {icon}
      </div>
    </div>
    {/* Se estiver carregando, exibe o ícone de carregamento */}
    {isLoading ? (
        <Loader className={styles.loadingIcon} />
      ) : (
        <>
          {/* Renderiza o valor em dinheiro, mascarado ou não, se fornecido */}
          {value && (
            <span className={styles.value}>
              {isValueVisible ? value : "******"}
            </span>
          )}

          {/* Exibe a contagem de produtos, se fornecida */}
          {count !== undefined && (
            <span className={styles.count}>
              {count}
            </span>
          )}
        </>
      )}
      {/* Condicional para exibir o ícone Eye */}
      {showEyeIcon && !isLoading && (
        <span
          className={styles.eyeIcon}
          onMouseEnter={() => {
            setIsValueVisible(true); // Mostra o valor real ao passar o mouse
            if (updateValueCompras) {
              updateValueCompras(); // Chama a função quando o mouse passa sobre o ícone
            }
          }} 
          onMouseLeave={() => setIsValueVisible(false)} // Esconde o valor ao retirar o mouse
        >
          {isValueVisible ? <Eye /> : <EyeOff />}
        </span>
      )}
  </Card.Body>
</Card>


  );
}
