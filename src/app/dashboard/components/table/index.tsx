"use client"; // Garantindo que o código seja executado no cliente 
import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Plus, ShoppingBasket } from 'lucide-react';
import styles from './styles.module.scss';
import { useFocus } from '@/app/context/FocusContext';

import  CreatePurchaseModal  from '../modalEfetuarCompra';
import { useSearchParams } from 'next/navigation';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import Link from 'next/link';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import useF2Redirect from "@/app/hooks/useF2Redirect";  // Importando o hook
import { Compra } from '../../purchases/table';
import SearchInput from '../searchInput';

export interface Client {
  id: string;
  nome: string;
  email?: string;
  telefone: string;
  endereco?: string;
  referencia?: string;
  created_at: string;
  updated_at: string;
  userId: string;
}

interface TableClientsProps {
  clients: Client[];
  loading: boolean;
  
}

export function Table ({ clients, loading }: TableClientsProps) {
  const { searchInputRef } = useF2Redirect(); // Pegando a ref do hook
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage, setClientsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);  // Estado para o modal
  const { isMenuInputFocused } = useFocus();
  const [mouseMoved, setMouseMoved] = useState(false);
  const [showModalCreateCompra, setShowModalCreateCompra] = useState(false);
  
  const [dataDaCompra, setDataDaCompra] = useState('');
  const [descricaoCompra, setDescricaoCompra] = useState<string | undefined>();
  const [totalCompra, setTotalCompra] = useState<string>("0,00"); // Inicializa vazio
  const [rawValue, setRawValue] = useState<number>(0);
  const [tipoCompra, setTipoCompra] = useState<string | null>('');  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [created_at, setCreatedAt] = useState('');
  const [isEdit, setIsEdit] = useState(false); // Novo estado para controlar se é edição
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);


  useEffect(() => {
    setTotalCompra("0,00");
  }, []);

  const applyFocus = () => {
    if (!isMenuInputFocused && searchInputRef.current && !mouseMoved) {
      searchInputRef.current.focus(); // Aplica o foco apenas se as condições forem atendidas
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => applyFocus());
    return () => clearInterval(intervalId);
  }, [isMenuInputFocused, mouseMoved]);

  const handleOpenModalCreateCompra  = (client: Client) => {
    setDescricaoCompra('');
    setTotalCompra("0,00");
    setTipoCompra('');
    setIsModalOpen(true)
    setSelectedClient(client);
    setShowModalCreateCompra(true);

    // Defina dataDaCompra como a data atual no caso de cadastro
    const currentDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    setDataDaCompra(currentDate);
  };

  const handleCloseModalCreateCompra = () => {
    setShowModalCreateCompra(false);
    setIsModalOpen(false)
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      setMouseMoved(true);
      setTimeout(() => setMouseMoved(false),);
    };
  
    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction); // Captura cliques
  
    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    };
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Verifica se o modal está fechado e o input do menu está focado
      if (event.key === 'Escape' && isMenuInputFocused && !isModalOpen) {
        setSearchTerm(''); // Reseta o searchTerm apenas quando o modal estiver fechado
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuInputFocused, isModalOpen]); // Dependência de isModalOpen
  

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      Object.values(client).some((value) =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [clients, searchTerm]);

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  const generatePagination = (): (number | string)[] => {
    const pagination: (number | string)[] = [];
    const maxPagesToShow = 5;
    const firstPage = 1;
    const lastPage = totalPages;
  
    if (totalPages <= maxPagesToShow) {
      // Exibir todas as páginas, caso o total de páginas seja menor ou igual ao máximo a ser exibido.
      for (let i = 1; i <= totalPages; i++) {
        pagination.push(i);
      }
    } else {
      if (currentPage <= maxPagesToShow - 2) {
        // Se a página atual for nas primeiras páginas
        for (let i = 1; i <= maxPagesToShow; i++) {
          pagination.push(i);
        }
        pagination.push('...', lastPage); // Adiciona as reticências e a última página
      } else if (currentPage >= totalPages - (maxPagesToShow - 2)) {
        // Se a página atual for nas últimas páginas
        pagination.push(firstPage, '...');
        for (let i = totalPages - (maxPagesToShow - 1); i <= totalPages; i++) {
          pagination.push(i);
        }
      } else {
        // Caso a página atual esteja no meio
        pagination.push(firstPage, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pagination.push(i);
        }
        pagination.push('...', lastPage);
      }
    }
  
    // Filtra a duplicação de reticências consecutivas
    const filteredPagination: (number | string)[] = [];
    pagination.forEach((page, index) => {
      if (page === '...') {
        // Evita duplicação de reticências
        if (filteredPagination[filteredPagination.length - 1] !== '...') {
          filteredPagination.push(page);
        }
      } else {
        filteredPagination.push(page);
      }
    });
  
    return filteredPagination;
  };
  
  return (
    
    <div className={styles.tableWrapper}>
      {loading ? (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
        </div>
      
      ) : (
        <>
          <div className={styles.header}>
            <h1>CLIENTES CADASTRADOS</h1>
            <div className={styles.headerControls}>
              <div className={styles.searchContainer}>
                <SearchInput
                    placeholder="Buscar Cliente"
                    onSearch={(value) => setSearchTerm(value)}
                    setCurrentPage={setCurrentPage}
                    ref={searchInputRef}
                />
              </div>
            </div>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.clientsTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Referência</th>
                  <th>Endereço</th>
                  <th>Telefone</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {currentClients.length > 0 ? (
                  currentClients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.nome}</td>
                      <td>{client.referencia || ''}</td>
                      <td>{client.endereco || ''}</td>
                      <td>{client.telefone}</td>
                      <td className={styles.actionIcons}>
                      <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="top"
                        container={document.body} // Colocando diretamente no body
                        flip={true}
                        overlay={
                          <Tooltip id={`tooltip-plus-${client.id}`} className={styles.customTooltip}>
                            Adicionar em {client.nome}
                          </Tooltip>
                        }
                      >
                        <Plus
                          className={styles.iconPlus}
                          onClick={() => handleOpenModalCreateCompra(client)}
                          role="button"
                          aria-label={`Adicionar ${client.nome}`}
                        />
                      </OverlayTrigger>



                      <OverlayTrigger
                        trigger={['hover', 'focus']}
                        placement="top"
                        container={() => document.body} // Força o Tooltip a ser renderizado fora do layout
                        flip={true}
                        overlay={
                          <Tooltip id={`tooltip-info-${client.id}`} className={styles.customTooltip}>
                            Compras de {client.nome}
                          </Tooltip>
                        }
                      >
                        <Link href={`/dashboard/purchases/${client.id}`}>
                          <ShoppingBasket
                            className={styles.iconInfo}
                            role="button"
                            aria-label={`Informações sobre ${client.nome}`} />
                        </Link>
                      </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.noRecords}>
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div
            className={`${styles.pagination} ${
              currentClients.length ? '' : styles.hidden
            }`}
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft />
            </button>
            {generatePagination().map((page, index) =>
              typeof page === 'number' ? (
                <span
                  key={index}
                  className={`${styles.pageNumber} ${
                    currentPage === page ? styles.activePage : ''
                  }`}
                  onClick={() => handlePageChange(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  role="button"
                >
                  {page}
                </span>
              ) : (
                <span key={index} className={styles.ellipsis} aria-hidden="true">
                  {page}
                </span>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight />
            </button>

            <CreatePurchaseModal
              isEdit={isEdit}  
              show={showModalCreateCompra} 
              onClose={handleCloseModalCreateCompra} 
              selectedClient={selectedClient}
              selectedCompra={selectedCompra}
              descricaoCompra={descricaoCompra}
              totalCompra={totalCompra}
              tipoCompra={tipoCompra}
              setCreatedAt={setCreatedAt}
              setDescricaoCompra={setDescricaoCompra}
              setTotalCompra={setTotalCompra}
              setTipoCompra={setTipoCompra}
              dataDaCompra={dataDaCompra}
              created_at={created_at}
              rawValue={rawValue}
              setDataCompra={setDataDaCompra}
              setRawValue={setRawValue}
            />
          </div>
          <ToastContainer />
        </>
      )}
    </div>
  ); 
}