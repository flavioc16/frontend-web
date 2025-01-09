import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Info, ShoppingBasket} from 'lucide-react';
import styles from './styles.module.scss';

import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Link from "next/link";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PurchaseInfoModal from '@/app/dashboard/purchases/modalMostrarInfo';
import SearchInput from '@/app/dashboard/components/searchInput';


  
interface Cliente {
  nome: string;
}

interface PagamentoComDados {
  id: string;
  valorPagamento: number;
  cliente: Cliente;
  created_at: string;
  totalPagamentos: number;
}

interface DadosPagamentos {
  pagamentos: PagamentoComDados[];
  totalPagamentos: number;
  loading: boolean;
}

export function TablePagamentos({ pagamentos, totalPagamentos, loading}: DadosPagamentos) {

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagamentosPerPage, setpagamentosPerPage] = useState(10);
  const [somaAtual, setSomaAtual] = useState<number>(0);

  const [showModalInfo, setShowModalInfo] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>("");

  const openModalWithPaymentInfo = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setShowModalInfo(true);
  };

  // Função para fechar o modal
  const handleCloseModalInfo = () => {
    setShowModalInfo(false);
  };

  function formatDate(dateString: string): string {
    if (!dateString) return '';
  
    const date = new Date(dateString);
    // Ajusta a data conforme o fuso horário universal
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  
    // Retorna a data formatada no padrão brasileiro
    return date.toLocaleDateString('pt-BR');
  }

  function adjustDate(dateString: string): string {
    return formatDate(dateString); // Utiliza a mesma função de formatação
  }
  
  const filteredPagamentos = useMemo(() => {
    const filtered = pagamentos.filter((pagamento) => {
      const searchLower = searchTerm.trim().toLowerCase();
  
      const formatCurrency = (value: number): string => {
        return value.toFixed(2).replace('.', ',');
      };
  
      const formatDate = (dateString: string): string => {
        if (!dateString) return '';
  
        const date = new Date(dateString);
        // Ajusta a data conforme o fuso horário universal
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  
        // Formata a data no formato "dd/MM/yyyy"
        return date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        }).toLowerCase(); // Converte a data para letras minúsculas
      };
  
      return (
        pagamento.cliente?.nome.toLowerCase().includes(searchLower) ||
        formatDate(pagamento.created_at).includes(searchLower) ||
        formatCurrency(pagamento.valorPagamento).includes(searchLower)
      );
    });
  
    const total = filtered.reduce((acc, pagamento) => acc + pagamento.valorPagamento, 0);
    setSomaAtual(total);
  
    return filtered;
  }, [pagamentos, searchTerm]);
  
  
  const indexOfLastPagamento = currentPage * pagamentosPerPage;
  const indexOfFirstPagamento = indexOfLastPagamento - pagamentosPerPage;
  const currentPagamentos = filteredPagamentos.slice(indexOfFirstPagamento, indexOfLastPagamento);
  const totalPages = Math.ceil(filteredPagamentos.length / pagamentosPerPage);

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
                  value={pagamentosPerPage}
                  onChange={(e) => setpagamentosPerPage(Number(e.target.value))}
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
                <SearchInput
                  placeholder="Buscar Pagamentos"
                  onSearch={(value) => setSearchTerm(value)} // Atualiza o termo de busca
                  setCurrentPage={setCurrentPage} // Passando a função para resetar a página
                />
              </div>
            </div>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.comprasTable}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Valor Pagamento</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
              {currentPagamentos.length > 0 ? (
                currentPagamentos.map((pagamento) => (
                  <tr key={pagamento.id}>
                    <td>{(adjustDate(pagamento.created_at))}</td>
                    <td>{pagamento.cliente?.nome}</td>
                    <td>
                      {pagamento.valorPagamento.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td> - </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.noRecords}>
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              )}
            </tbody>

              {currentPagamentos.length > 0 && (
                <tfoot>
                  <tr className={styles.totalRow}>
                    <td colSpan={2} style={{ textAlign: 'left', padding: '10px' }}>
                      TOTAL
                    </td>

                    <td colSpan={1} className={styles.totalValue} style={{ textAlign: 'left', paddingLeft: '7px' }}>
                      {somaAtual.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {totalPagamentos.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          <div className={styles.container}>
            {/* Paginação do lado direito */}
            <div className={`${styles.pagination} ${currentPagamentos.length ? '' : styles.hidden}`}>
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
                    className={`${styles.pageNumber} ${currentPage === page ? styles.activePage : ''}`}
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
            </div>
          </div>
          <PurchaseInfoModal
            showModalInfo={showModalInfo}
            handleCloseModalInfo={handleCloseModalInfo}
            purchaseId={selectedPurchaseId}
          />
          <ToastContainer />
        </>
      )}
    </div>
  );
  
}
