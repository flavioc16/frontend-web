import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Info, ShoppingBasket} from 'lucide-react';
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

export function TableRelatorio({ compras, somaTotalCompras, loading}: RelatorioComprasResponse) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [comprasPerPage, setComprasPerPage] = useState(10);
  const [somaAtual, setSomaAtual] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showModalInfo, setShowModalInfo] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>("");

  // const searchParams = useSearchParams();
  
  // useEffect(() => {
  //   const querySearchTerm = searchParams.get('search');
  //   if (querySearchTerm) {
  //     setSearchTerm(querySearchTerm); // Atualiza o estado se houver um parâmetro de URL
  //   }
  // }, [searchParams]);

  // Atualiza a URL sempre que searchTerm mudar
  useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search);
    
    if (searchTerm) {
      currentParams.set('search', searchTerm); // Define ou atualiza o parâmetro de busca
    } else {
      currentParams.delete('search'); // Se não houver valor, remove o parâmetro de busca
    }

    // Atualiza a URL com os parâmetros atuais (mantendo dataInicio e dataFim)
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

  // Função para fechar o modal
  const handleCloseModalInfo = () => {
    setShowModalInfo(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Verifica se o modal está fechado e o input do menu está focado
      if (event.key === 'Escape' ) {
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
    // Ajusta a data conforme o fuso horário universal
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  
    // Retorna a data formatada no padrão brasileiro
    return date.toLocaleDateString('pt-BR');
  }

  function adjustDate(dateString: string): string {
    return formatDate(dateString); // Utiliza a mesma função de formatação
  }
  
  const filteredCompras = useMemo(() => {
    const filtered = compras.filter((compra) => {
      const searchLower = searchTerm.toLowerCase();
  
      // Utilize a função unificada para formatar a data
      const formattedDate = compra.dataDaCompra
        ? formatDate(compra.dataDaCompra)
        : "Data não disponível";
  
      const formatCurrency = (value: number): string => {
        return value
          .toFixed(2)
          .replace('.', ',');
      };
  
      return (
        compra.descricaoCompra.toLowerCase().includes(searchLower) || // Busca na descrição
        formattedDate.includes(searchLower) || // Busca na data formatada
        formatCurrency(compra.totalCompra).includes(searchLower) || // Busca no total formatado
        compra.cliente?.nome.toLowerCase().includes(searchLower) // Busca no nome do cliente
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
                {currentCompras.length > 0 ? (
                  currentCompras.map((compra) => (
                    <tr
                      key={compra.id}
                      className={`${compra.isVencida === 1 ? `${styles.vencida} ${styles.vencidaRow}` : ''} 
                        ${compra.statusCompra === 1 ? `${styles.aprovada}` : ''}`}
                    >
                      <td className={styles.tableCell}>
                        {compra.tipoCompra === 1 && <span className={styles.serviceIndicator}></span>}
                        {adjustDate(compra.dataDaCompra ?? '')}
                      </td>
                      <td>{compra.descricaoCompra}</td>
                      <td>{compra.cliente?.nome}</td>
                      <td>
                        {compra.totalCompra.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td className={styles.actionIcons}>
                        <OverlayTrigger
                          trigger={['hover', 'focus']}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-info-${compra.id}`} className={styles.customTooltip}>
                              Informações
                            </Tooltip>
                          }
                        >
                          <Info
                            className={styles.iconInfo}
                            role="button"
                            aria-label={`Informações sobre compra ${compra.id}`}
                            onClick={() => openModalWithPurchaseInfo(compra.id)}
                          />
                        </OverlayTrigger>
                        <OverlayTrigger
                          trigger={['hover', 'focus']}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-link-compras-${compra.cliente?.id}`} className={styles.customTooltip}>
                              Compras de {compra.cliente?.nome}
                            </Tooltip>
                          }
                        >
                          <Link href={`/dashboard/purchases/${compra.cliente?.id}`}>
                            <ShoppingBasket
                              className={styles.iconInfo}
                              role="button"
                              aria-label={`Informações sobre ${compra.cliente?.nome}`} />
                          </Link>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.noRecords}>
                      Nenhuma compra encontrada
                    </td>
                  </tr>
                )}
              </tbody>

              {currentCompras.length > 0 && (
                <tfoot>
                  <tr className={styles.totalRow}>
                    <td colSpan={3} style={{ textAlign: 'left', padding: '10px' }}>
                      TOTAL
                    </td>

                    <td colSpan={1} className={styles.totalValue} style={{ textAlign: 'left', paddingLeft: '4px' }}>
                      {somaAtual.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {somaTotalCompras.toLocaleString('pt-BR', {
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
            <div className={`${styles.pagination} ${currentCompras.length ? '' : styles.hidden}`}>
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
