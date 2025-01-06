import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Info, ShoppingBasket } from 'lucide-react';
import styles from './styles.module.scss';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Link from "next/link";

import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PurchaseInfoModal from '@/app/dashboard/purchases/modalMostrarInfo';

export interface Cliente {
  nome: string;
  id: string;
}

export interface Juros {
  // Defina os campos relevantes de "juros", caso existam
}

export interface Pagamento {
  id: string;
  valorPagamento: number;
  clienteId: string;
  userId: string;
  created_at: string;
  updated_at: string;
  compraId: string;
}

export interface Compra {
  id: string;
  descricaoCompra: string;
  totalCompra: number;
  valorInicialCompra: number;
  tipoCompra: number;
  statusCompra: number;
  created_at: string;
  updated_at: string;
  dataDaCompra: string;
  dataVencimento: string;
  isVencida: number;
  userId: string;
  clienteId: string;
  pagamentoId: string | null;
  cliente: Cliente;
  juros: Juros[]; // Caso a estrutura de "juros" seja complexa, adicione os campos detalhados
  pagamentos: Pagamento[];
}

export interface RelatorioComprasResponse {
  compras: Compra[];
  somaTotalCompras: number;
  loading: boolean;
}

export function TableRelatorio({ compras, somaTotalCompras, loading }: RelatorioComprasResponse) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [comprasPerPage, setComprasPerPage] = useState(10);
  const [somaAtual, setSomaAtual] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showModalInfo, setShowModalInfo] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const querySearchTerm = searchParams.get('search');
    if (querySearchTerm) {
      setSearchTerm(querySearchTerm); // Atualiza o estado se houver um parâmetro de URL
    }
  }, [searchParams]);

  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);

    if (searchTerm) {
      currentParams.set('search', searchTerm); // Define ou atualiza o parâmetro de busca
    } else {
      currentParams.delete('search'); // Se não houver valor, remove o parâmetro de busca
    }

    // Atualiza a URL com os parâmetros atuais (mantendo outros parâmetros)
    window.history.pushState(
      {},
      '',
      `${window.location.pathname}?${currentParams.toString()}`
    );
  }, [searchTerm]);

  const openModalWithPurchaseInfo = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setShowModalInfo(true);
  };

  const handleCloseModalInfo = () => {
    setShowModalInfo(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Verifica se o modal está fechado e o input do menu está focado
      if (event.key === 'Escape') {
        setSearchTerm(''); // Reseta o searchTerm apenas quando o modal estiver fechado
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Dependência de isModalOpen

  useEffect(() => {
    setCurrentPage(1); // Reseta para a primeira página quando o termo de busca muda
  }, [searchTerm]);

  function formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

    return date.toLocaleDateString('pt-BR');
  }

  function adjustDate(dateString: string): string {
    return formatDate(dateString); // Utiliza a mesma função de formatação
  }

  const filteredCompras = useMemo(() => {
    const filtered = compras.filter((compra) => {
      const searchLower = searchTerm.toLowerCase();

      const formattedDate = compra.dataDaCompra
        ? formatDate(compra.dataDaCompra)
        : "Data não disponível";

      const formatCurrency = (value: number): string => {
        return value.toFixed(2).replace('.', ',');
      };

      return (
        compra.descricaoCompra.toLowerCase().includes(searchLower) ||
        formattedDate.includes(searchLower) ||
        formatCurrency(compra.totalCompra).includes(searchLower) ||
        compra.cliente?.nome.toLowerCase().includes(searchLower)
      );
    });

    const total = filtered.reduce((acc, compra) => acc + compra.totalCompra, 0);
    setSomaAtual(total);

    return filtered;
  }, [compras, searchTerm]);

  const indexOfLastCompra = currentPage * comprasPerPage;
  const indexOfFirstCompra = indexOfLastCompra - comprasPerPage;
  const currentCompras = filteredCompras.slice(indexOfFirstCompra, indexOfLastCompra);
  const totalPages = Math.ceil(filteredCompras.length / comprasPerPage);

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);

  const generatePagination = (): (number | string)[] => {
    const pagination: (number | string)[] = [];
    const maxPagesToShow = 5;
    const firstPage = 1;
    const lastPage = totalPages;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pagination.push(i);
      }
    } else {
      if (currentPage <= maxPagesToShow - 2) {
        for (let i = 1; i <= maxPagesToShow; i++) {
          pagination.push(i);
        }
        pagination.push('...', lastPage);
      } else if (currentPage >= totalPages - (maxPagesToShow - 2)) {
        pagination.push(firstPage, '...');
        for (let i = totalPages - (maxPagesToShow - 1); i <= totalPages; i++) {
          pagination.push(i);
        }
      } else {
        pagination.push(firstPage, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pagination.push(i);
        }
        pagination.push('...', lastPage);
      }
    }

    return pagination;
  };

  return (
    <Suspense fallback={<div className={styles.loadingSpinner}><div className={styles.spinner}></div></div>}>
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <div className={styles.headerControls}>
                <div className={styles.resultsPerPage}>
                  <label htmlFor="resultsPerPage">Exibir:</label>
                  <select
                    id="resultsPerPage"
                    value={comprasPerPage}
                    onChange={(e) => setComprasPerPage(Number(e.target.value))}
                    className={styles.customSelect}
                    aria-label="Número de compras por página"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <label htmlFor="resultsPerPage" className={styles.ppage}>por página</label>
                </div>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Buscar Compra"
                    value={searchTerm}
                    autoFocus
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.filterInput}
                    ref={inputRef}
                    aria-label="Buscar Compra"
                  />
                  {searchTerm ? (
                    <X
                      className={styles.clearIcon}
                      onClick={() => setSearchTerm('')}
                      role="button"
                      aria-label="Limpar pesquisa"
                    />
                  ) : (
                    <Search className={styles.searchIcon} aria-hidden="true" />
                  )}
                </div>
              </div>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.comprasTable}>
                <thead>
                  <tr>
                    <th>Data da compra</th>
                    <th>Compra</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCompras.map((compra) => (
                    <tr key={compra.id}>
                      <td>{formatDate(compra.dataDaCompra)}</td>
                      <td>{compra.descricaoCompra}</td>
                      <td>{compra.cliente?.nome}</td>
                      <td>{compra.totalCompra.toFixed(2).replace('.', ',')}</td>
                      <td>
                        <button
                          onClick={() => openModalWithPurchaseInfo(compra.id)}
                          className={styles.modalInfoButton}
                          aria-label={`Ver detalhes da compra ${compra.id}`}
                        >
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Ver detalhes</Tooltip>}
                          >
                            <Info className={styles.infoIcon} />
                          </OverlayTrigger>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft />
              </button>
              {generatePagination().map((page, index) =>
                page === '...' ? (
                  <span key={index}>...</span>
                ) : (
                  <button
                    key={index}
                    onClick={() => handlePageChange(Number(page))}
                    className={currentPage === page ? styles.activePage : ''}
                    aria-label={`Página ${page}`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
              >
                <ChevronRight />
              </button>
            </div>
            <div className={styles.summary}>
              <p className={styles.totalAmount}>
                Total: R${somaAtual.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </>
        )}
      </div>
    </Suspense>
  );
}
