'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { MenuContextType, MenuItemId } from '../types/menu';

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const validMenuItems: MenuItemId[] = ['/', 'clients', 'products', 'reminders', 'reports', 'moneybox', 'payments'];

  // Inicializa o estado como null para ser determinado após a verificação
  const [selected, setSelected] = useState<MenuItemId | null>(null);

  // Carrega a seleção do localStorage no lado do cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Primeiro, verifica se existe uma seleção salva no localStorage
      const savedSelection = localStorage.getItem('selectedMenuItem') as MenuItemId | null;
      
      // Se houver uma seleção válida no localStorage, usa ela
      if (savedSelection && validMenuItems.includes(savedSelection)) {
        setSelected(savedSelection);
      } else {
        // Caso contrário, usa o pathname atual da URL
        const pathname = window.location.pathname;
        if (validMenuItems.includes(pathname as MenuItemId)) {
          setSelected(pathname as MenuItemId); // Atualiza com o pathname válido
        } else {
          setSelected('/'); // Caso o pathname não seja válido, define '/' como padrão
        }
      }
    }
  }, []); // Esse useEffect é executado apenas uma vez após o carregamento inicial

  // Salva a seleção no localStorage sempre que 'selected' mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && selected) {
      localStorage.setItem('selectedMenuItem', selected);
    }
  }, [selected]);

  return (
    <MenuContext.Provider value={{ selected, setSelected }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = (): MenuContextType => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
