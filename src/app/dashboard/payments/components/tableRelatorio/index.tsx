import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './styles.module.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PurchaseInfoModal from '@/app/dashboard/purchases/modalMostrarInfo';
import SearchInput from '@/app/dashboard/components/searchInput';

// Ajuste das interfaces
interface PagamentoAgrupado {
  created: string;  // Atualizado para 'created' (sem o _at)
  nome: string;
  referencia: string;
  totalPagamento: number;
}

interface DadosPagamentos {
  pagamentos: PagamentoAgrupado[];
  totalPagamentos: number;
  loading: boolean;
}

export function TablePagamentos({ pagamentos, totalPagamentos, loading }: DadosPagamentos) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagamentosPerPage, setPagamentosPerPage] = useState(10);
  const [somaAtual, setSomaAtual] = useState<number>(0);

  const [showModalInfo, setShowModalInfo] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>('');

  const openModalWithPaymentInfo = (purchaseId: string) => {
    setSelectedPurchaseId(purchaseId);
    setShowModalInfo(true);
  };

 

  const handleCloseModalInfo = () => {
    setShowModalInfo(false);
  };




  // Filtrando os pagamentos com base no termo de busca
  const filteredPagamentos = useMemo(() => {
    const filtered = pagamentos.filter((pagamento) => {
      const searchLower = searchTerm.trim().toLowerCase();

      return (
        pagamento.nome?.toLowerCase().includes(searchLower) ||
        pagamento.referencia?.toLowerCase().includes(searchLower) ||
        pagamento.totalPagamento?.toString().includes(searchLower)
      );
    });

    const total = filtered.reduce((acc, pagamento) => acc + pagamento.totalPagamento, 0);
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
            <h1>PAGAMENTOS</h1>
            <div className={styles.headerControls}>
              <div className={styles.resultsPerPage}>
                <label htmlFor="resultsPerPage">Exibir:</label>
                <select
                  id="resultsPerPage"
                  value={pagamentosPerPage}
                  onChange={(e) => setPagamentosPerPage(Number(e.target.value))}
                  className={styles.customSelect}
                  aria-label="Número de compras por página"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <label htmlFor="resultsPerPage" className={styles.ppage}>
                  por página
                </label>
              </div>
              <div className={styles.searchContainer}>
                <SearchInput
                  placeholder="Buscar Pagamentos"
                  onSearch={(value) => setSearchTerm(value)}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </div>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.comprasTable}>
              <thead>
                <tr>
                  <th>Data </th>
                  <th>Nome</th>
                  <th>Referência</th>
                  <th>Total Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {currentPagamentos.length > 0 ? (
                  currentPagamentos.map((pagamento, index) => (
                    <tr key={index}>
                      <td>{pagamento.created}</td>
                      <td>{pagamento.nome}</td>
                      <td>{pagamento.referencia}</td>
                      <td>
                        {pagamento.totalPagamento.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className={styles.noRecords}>
                      Nenhum pagamento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
              {currentPagamentos.length > 0 && (
                <tfoot>
                  <tr className={styles.totalRow}>
                    <td colSpan={3} style={{ textAlign: 'left', padding: '10px' }}>
                      TOTAL
                    </td>
                    <td className={styles.totalValue} style={{ textAlign: 'left', paddingLeft: '7px' }}>
                      {somaAtual.toLocaleString('pt-BR', {
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
