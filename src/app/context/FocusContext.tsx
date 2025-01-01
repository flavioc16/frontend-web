"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

interface FocusContextType {
  isMenuInputFocused: boolean;
  setIsMenuInputFocused: (isFocused: boolean) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }:
   { children: ReactNode }) {
  const [isMenuInputFocused, setIsMenuInputFocused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleFocus = () => setIsMenuInputFocused(true);
    const handleBlur = () => setIsMenuInputFocused(false);

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);

    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (!isMenuInputFocused) {
        // Trigger focus in your component or other logic
      }
    },);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMenuInputFocused]);

  return (
    <FocusContext.Provider value={{ isMenuInputFocused, setIsMenuInputFocused }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
