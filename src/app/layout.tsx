// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FocusProvider } from "./context/FocusContext"; // Ajuste o caminho conforme necessário
import { MenuProvider } from "./context/MenuContext"; // Importa o MenuProvider
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Frigorifico Central",
  description: "Preço baixo e carne de qualidade!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.png" />
      <Head>
        {/* Add Google Fonts here */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      
      <body className={inter.className}>
        
          <MenuProvider>
            <FocusProvider>
            {children}
            </FocusProvider>
          </MenuProvider>
        
      </body>
    </html>
  );
}
