import React, { ReactNode, ReactElement } from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import styles from './styles.module.scss';

interface ButtonAddProps {
  onClick: () => void;
  label: string;
  icon?: ReactNode;  // Prop para o ícone
  iconStyle?: React.CSSProperties; // Prop opcional para estilos inline do ícone
  style?: React.CSSProperties; // Prop opcional para estilos inline do botão
  popover?: ReactElement; // Prop opcional para o conteúdo do Popover
}

export default function ButtonAdd({ onClick, label, icon, iconStyle, style, popover }: ButtonAddProps) {
  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="left" // Ajusta a posição do Popover
      overlay={popover || <></>} // Garante que sempre há um valor para overlay
    >
      <button className={styles.Btn} onClick={onClick} style={style}>
        {label}
        {icon && <span className={styles.Icon} style={iconStyle}>{icon}</span>} {/* Renderiza o ícone se houver */}
      </button>
    </OverlayTrigger>
  );
}
