"use client"; // Garantindo que o código seja executado no cliente

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function useF2Redirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null); // Cria a referência para o campo de entrada

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        // Se a rota atual for "/dashboard/purchases/"
        if (pathname?.startsWith("/dashboard/purchases/")) {
          router.push("/dashboard"); // Redireciona para "/dashboard"
        } else {
          router.push("/dashboard"); // Redireciona para "/dashboard"
        }

        // Dá foco ao campo de pesquisa
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 200); // Ajuste o tempo de atraso conforme necessário
      }
    };

    // Adiciona o evento keydown na montagem
    window.addEventListener("keydown", handleKeyDown);

    // Remove o evento na desmontagem
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router, pathname]);

  return { searchInputRef }; // Retorna a referência para ser usada no componente
}
