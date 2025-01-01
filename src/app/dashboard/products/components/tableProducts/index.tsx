import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Plus, UserPen, Trash, FilePenLine } from 'lucide-react';
import styles from './styles.module.scss';
import stylesModal from './stylesModal.module.scss'
import { useFocus } from '@/app/context/FocusContext';
import ButtonAdd from '@/app/dashboard/components/buttonAdd';
import { api } from '@/services/api';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Tooltip, OverlayTrigger, Popover } from 'react-bootstrap';
import { getCookie } from 'cookies-next';
import DeleteModal from '@/app/dashboard/components/modalDelete';

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  precoAVista: number;
  precoAPrazo: number;
  created_at: string | Date; // Aceita tanto string quanto Date
  updated_at: string | Date;
}

interface TableProductsProps {
  produtos: Produto[]; // Lista de produtos
  loading: boolean;
  updateProdutos: () => void; // Tipagem da função passada como prop
}

export default function TableProducts({ produtos, loading, updateProdutos }: TableProductsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMenuInputFocused, setIsMenuInputFocused } = useFocus();

  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);


  const [nome, setNome] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [precoAVista, setPrecoAVista] = useState<number>(0);
  const [precoAPrazo, setPrecoAPrazo] = useState<number>(0);

  const [formattedPrecoAVista, setFormattedPrecoAVista] = useState<string>('0,00');
  const [formattedPrecoAPrazo, setFormattedPrecoAPrazo] = useState<string>('0,00');

  const [checkbox, setCheckbox] = useState(false);

  const nomeProdutoRef = useRef<HTMLInputElement | null>(null);
  const descricaoProdutoRef = useRef<HTMLTextAreaElement | null>(null);
  const precoAVistaProdutoRef = useRef<HTMLInputElement | null>(null);
  const precoAPrazoProdutoRef = useRef<HTMLInputElement | null>(null);

  
  const [id, setProdutoId] = useState<string | null>(null);

  
  const [productName, setProductName] = useState('');
  const [isEdit, setIsEdit] = useState(false); // Controle de modo edição

  const modalTitle = "Deseja realmente excluir este produto?";

  const handleProductsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setProductsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleOpenCreateModal = () => {
    setIsEdit(false); // Modo de cadastro
    setNome('');
    setDescricao('');
    setPrecoAVista(0);
    setPrecoAPrazo(0);
    setFormattedPrecoAVista('0,00')
    setFormattedPrecoAPrazo('0,00')
    setShowModal(true);
  };

  const formatCurrency = (value: number): string => {
    return (value / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleOpenEditModal = (produto: Produto) => {
    setProdutoId(produto.id);
    setIsEdit(true);
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setPrecoAVista(produto.precoAVista);
    setPrecoAPrazo(produto.precoAPrazo)
    setShowModal(true);

    // Formatar o valor de preço à vista para exibição
    setFormattedPrecoAVista(formatCurrency(produto.precoAVista));
    setFormattedPrecoAPrazo(formatCurrency(produto.precoAPrazo));
  };

  const handlePrecoAVistaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    const numericValue = value.replace(/[^\d]/g, ""); // Remove caracteres não numéricos

    let rawNumber = parseFloat(numericValue);
    if (isNaN(rawNumber)) {
      rawNumber = 0;
    }

    // Atualiza o estado com o valor numérico
    setPrecoAVista(rawNumber);

    // Atualiza o valor formatado para exibição no input
    const formattedValue = (rawNumber / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Atualiza o estado com o valor formatado
    setFormattedPrecoAVista(formattedValue);
  };

  const handlePrecoAPrazoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    const numericValue = value.replace(/[^\d]/g, ""); // Remove caracteres não numéricos

    let rawNumber = parseFloat(numericValue);
    if (isNaN(rawNumber)) {
      rawNumber = 0;
    }

    // Atualiza o estado com o valor numérico
    setPrecoAPrazo(rawNumber);

    // Atualiza o valor formatado para exibição no input
    const formattedValue = (rawNumber / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Atualiza o estado com o valor formatado
    setFormattedPrecoAPrazo(formattedValue);
  };

  const handleOpenModalDelete = (name: string, id: string) => {
    setProductName(name);
    setProdutoId(id);
    setShowModalDelete(true);
  };

  const handleCloseModalDelete = () => {
    setShowModalDelete(false);
    setProductName('');
    setProdutoId(null);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    toast.dismiss();
  
    try {
      // Validação dos campos obrigatórios
      if (nome === "") {
        toast.error("O campo Nome é obrigatório.");
        nomeProdutoRef.current?.focus();
        return;
      }
      if (!descricao) {
        toast.error("O campo Descrição é obrigatório.");
        descricaoProdutoRef.current?.focus();
        return;
      }
      if (precoAVista <= 0) {
        toast.error(<span>O valor de <strong>Preço à Vista</strong> deve ser maior que zero.</span>);
        precoAVistaProdutoRef.current?.focus();
        return;
      }
      if (precoAPrazo <= 0) {
        toast.error(<span>O valor de <strong> Preço a Prazo</strong> deve ser maior que zero.</span>);
        precoAPrazoProdutoRef.current?.focus();
        return;
      }
  
      const token = getCookie("token");
  
      if (!token) {
        toast.error("Token de autenticação não encontrado. Faça login novamente.");
        return;
      }
  
      const productData = {
        nome,
        descricao,
        precoAVista,
        precoAPrazo,
        id: isEdit ? id : undefined, // Inclui o ID apenas no modo edição
      };
  
      console.log(productData);
  
      if (isEdit) {
        if (!id) {
          throw new Error("ID do produto não fornecido.");
        }
  
        const response = await api.put(`/produtos`, productData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        toast.success(<span>Produto <strong>{response.data.nome}</strong> editado com sucesso.</span>);
        console.log("Produto editado com sucesso:", response.data);
      } else {
        const response = await api.post("/produtos", productData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        toast.success(<span>Produto <strong>{response.data.nome}</strong> cadastrado com sucesso.</span>);
        console.log("Produto cadastrado com sucesso:", response.data.nome);
      }
  
      // Reseta o formulário
      setNome('');
      setDescricao('');
      setPrecoAVista(0);
      setPrecoAPrazo(0);
      setFormattedPrecoAVista('0,00')
      setFormattedPrecoAPrazo('0,00')
      
      nomeProdutoRef.current?.focus();

      updateProdutos();
  
      // Verifica o estado do checkbox antes de fechar o modal
      if (!checkbox) {
        handleCloseModal();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || (isEdit ? "Erro ao editar produto." : "Erro ao cadastrar produto.");
        toast.error(errorMessage);
        console.error("Erro ao processar produto:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }
  };
  
  const handleConfirmDelete = async () => {
    toast.dismiss();

    try {
      const token = getCookie('token');

      if (!token) {
        toast.error('Token de autenticação não encontrado. Faça login novamente.');
        return;
      }

      const response = await api.delete(`/produtos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { id },
      });

      toast.success(<span>Produto <strong>{productName}</strong> excluído com sucesso.</span>);
      console.log("Produto excluído com sucesso:", response.data);

      updateProdutos();

      handleCloseModalDelete();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao excluir produto.";
        toast.error(errorMessage);
        console.error("Erro ao excluir produto:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }
  };

  const capitalizeWords = (value: string): string => {
    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };


  useEffect(() => {
    setCurrentPage(1); // Reseta para a primeira página quando o termo de busca muda
  }, [searchTerm]);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuInputFocused) {
        setSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuInputFocused]);

  const handleSearchClear = () => setSearchTerm('');

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckbox(e.target.checked);
    nomeProdutoRef.current?.focus();
  };

  const filteredProducts = useMemo(() => {
    return produtos.filter((produto) =>
      // Verifica valores de nível superior do produto
      Object.values(produto).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [produtos, searchTerm]);
  
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

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

    const filteredPagination: (number | string)[] = [];
    pagination.forEach((page, index) => {
      if (page === '...') {
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
            <h1>PRODUTOS CADASTRADOS</h1>
            <div className={styles.headerControls}>
              <ButtonAdd
                onClick={handleOpenCreateModal}
                label="Cadastrar Produto"
                icon={<Plus style={{ width: '19px', height: '18px' }} />}
                iconStyle={{
                  fontSize: '20px',
                  marginLeft: '4px',
                  marginRight: '-4px',
                  marginBottom: '3px',
                }}
              />
              <div className={styles.resultsPerPage}>
                <label htmlFor="resultsPerPage">Exibir:</label>
                <select
                  id="resultsPerPage"
                  value={productsPerPage}
                  onChange={handleProductsPerPageChange}
                  className={styles.customSelect}
                  aria-label="Número de produtos por página"
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
                <input
                  type="text"
                  placeholder="Buscar Produto"
                  value={searchTerm}
                  autoFocus
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.filterInput}
                  ref={inputRef}
                  aria-label="Buscar Produto"
                  onFocus={() => setIsMenuInputFocused(true)}
                  onBlur={() => setIsMenuInputFocused(false)}
                />
                {searchTerm ? (
                  <X
                    className={styles.clearIcon}
                    onClick={handleSearchClear}
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
           <table className={styles.clientsTable}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Preço à Vista</th>
                  <th>Preço a Prazo</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product: Produto) => (
                    <tr key={product.id}>
                      <td>{product.nome}</td>
                      <td>{product.descricao}</td>
                      <td>
                        {(product.precoAVista / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>
                        {(product.precoAPrazo / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className={styles.actionIcons}>
                        <OverlayTrigger
                          trigger={['hover', 'focus']}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-edit-${product.id}`} className={styles.customTooltip}>
                              Editar {product.nome}
                            </Tooltip>
                          }
                        >
                          
                          <FilePenLine
                            className={styles.iconUser}
                            role="button"
                            aria-label={`Editar ${product.nome}`}
                            onClick={() => handleOpenEditModal(product)}
                          />
                        </OverlayTrigger>
                        <OverlayTrigger
                          trigger={['hover', 'focus']}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-trash-${product.id}`} className={styles.customTooltip}>
                              Deletar {product.nome}
                            </Tooltip>
                          }
                        >
                          <Trash
                            className={styles.iconTrash}
                            role="button"
                            aria-label={`Deletar ${product.nome}`}
                            onClick={() => handleOpenModalDelete(product.nome, product.id)}
                          />
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.noRecords}>
                      Nenhum registro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={`${styles.pagination} ${currentProducts.length ? '' : styles.hidden}`}>
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
          <Modal
            show={showModal}
            onHide={handleCloseModal}
            className={styles.customModal}
            size="lg"
            keyboard={!checkbox}
          >
            <div className={styles.customModalHeader}>
              <h2>{isEdit ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <X size={24} color="var(--white)" />
              </button>
            </div>
            <div className={styles.customModalBody}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="produtoNome" className={styles.customFormLabel}>Nome</label>
                  <input
                    id="produtoNome"
                    type="text"
                    ref={nomeProdutoRef}
                    required
                    placeholder="Nome do produto"
                    value={nome}
                    onChange={(e) => setNome(capitalizeWords(e.target.value))}
                    autoFocus
                    className={styles.customFormControl}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="produtoDescricao" className={styles.customFormLabel}>Descrição</label>
                  <textarea
                    id="produtoDescricao"
                    required
                    rows={3}
                    placeholder="Descrição do produto"
                    value={descricao}
                    ref={descricaoProdutoRef}
                    onChange={(e) => setDescricao(capitalizeWords(e.target.value))}
                    className={styles.customFormControl}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="produtoPrecoAVista" className={styles.customFormLabel}>Preço à Vista</label>
                  <input
                    id="produtoPrecoAVista"
                    type="text"
                    ref={precoAVistaProdutoRef}
                    value={formattedPrecoAVista}
                    onChange={handlePrecoAVistaChange}
                    placeholder="Preço à Vista"
                    required
                    className={styles.customFormControl}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="produtoPrecoAPrazo" className={styles.customFormLabel}>Preço a Prazo</label>
                  <input
                    id="produtoPrecoAPrazo"
                    type="text"
                    value={formattedPrecoAPrazo}
                    ref={precoAPrazoProdutoRef}
                    onChange={handlePrecoAPrazoChange}
                    placeholder="Preço a Prazo"
                    required
                    className={styles.customFormControl}
                  />
                </div>
                <div className={styles.buttonContainer}>
                  <div className={styles.rememberMeContainer}>
                    {!isEdit && (
                      <label>
                        <input
                          type="checkbox"
                          checked={checkbox}
                          onChange={handleCheckboxChange}
                        />
                        <div className={styles.rememberMeText}>
                          Adicionar mais produtos
                        </div>
                      </label>
                    )}
                  </div>
                  <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.customBtnPrimary}>
                      {isEdit ? 'Salvar' : 'Cadastrar'}
                    </button>
                    <button type="button" onClick={handleCloseModal} className={styles.customBtnSecondary}>
                      Cancelar
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </Modal>
          <DeleteModal
            showModalDelete={showModalDelete}
            handleCloseModalDelete={handleCloseModalDelete}
            handleConfirmDelete={handleConfirmDelete}
            modalTitle={modalTitle}
          />
          <ToastContainer />
        </>
      )}
    </div>
  );
  
}
