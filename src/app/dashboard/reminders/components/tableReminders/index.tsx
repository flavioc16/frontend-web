import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Plus, Trash, FilePenLine } from 'lucide-react';
import styles from './styles.module.scss';
import { useFocus } from '@/app/context/FocusContext';
import ButtonAdd from '@/app/dashboard/components/buttonAdd';
import { api } from '@/services/api';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Tooltip, OverlayTrigger} from 'react-bootstrap';
import { getCookie } from 'cookies-next';
import DeleteModal from '@/app/dashboard/components/modalDelete';
import { BeatLoader } from 'react-spinners';
import SearchInput from '@/app/dashboard/components/searchInput';
import { Reminders } from '@/app/types/lembretes';

interface TableRemindersProps {
  lembretes: Reminders[]; // Lista de Lembretes
  loading: boolean;
  updateLembretes: () => void; // Tipagem da função passada como prop
}

export default function TableReminders({ lembretes, loading, updateLembretes }: TableRemindersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [RemindersPerPage, setRemindersPerPage] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMenuInputFocused, setIsMenuInputFocused } = useFocus();
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [id, setIdReminders] = useState<string | null>(null);;
  const [descricao, setDescricao] = useState<string>('');
  const [notification, setNotification] = useState<number>(0);

  const [dataCadastro, setDataCadastro] = useState('');
  
  
  const descricaoLembreteRef = useRef<HTMLTextAreaElement | null>(null);
  const [checkbox, setCheckbox] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false); // Controle de modo edição
  const modalTitle = "Deseja realmente excluir este lembrete?";

  const handleRemindersPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRemindersPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleOpenCreateModal = () => {
    setIsEdit(false); // Modo de cadastro
    setDescricao('');

    const currentDate = new Date().toISOString().split('T')[0]; 
    setDataCadastro(currentDate);

    setShowModal(true);
  };

  const handleOpenEditModal = (lembrete: Reminders) => {
    setIdReminders(lembrete.id);
    setIsEdit(true);
    setDescricao(lembrete.descricao);
  
    // Ajusta a data no formato YYYY-MM-DD para o input
    const formattedDate = lembrete.dataCadastro
      ? new Date(lembrete.dataCadastro).toISOString().split('T')[0]
      : '';
    setDataCadastro(formattedDate);
  
    setShowModal(true);
  };
  
  const handleOpenModalDelete = (id: string) => {
    setIdReminders(id);
    setShowModalDelete(true);
  };

  const handleCloseModalDelete = () => {
    setShowModalDelete(false);
    setIdReminders(null);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    toast.dismiss();
  
    try {
      if (!descricao) {
        toast.error("O campo Descrição é obrigatório.");
        descricaoLembreteRef.current?.focus();
        return;
      }
      const token = getCookie("token");
      if (!token) {
        toast.error("Token de autenticação não encontrado. Faça login novamente.");
        return;
      }
     
      if (isEdit) {
        if (!id) {
          throw new Error("ID do lembrete não fornecido.");
        }
        
        const productData = {
          dataCadastro: new Date(dataCadastro).toISOString(), // Converte para formato ISO
          notification: false,
          descricao,
      };
        
        const response = await api.put(`/lembrete/${id}`, productData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        toast.success(<span>Lembrete <strong>{response.data.nome}</strong> editado com sucesso.</span>);

      } else {

        const productData = {
          dataCadastro,
          descricao,
        };

        const response = await api.post("/lembrete", productData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        toast.success(<span>Lembrete <strong>{response.data.nome}</strong> cadastrado com sucesso.</span>);
        console.log("Lembrete cadastrado com sucesso:", response.data.nome);
      }
  
      if(!isEdit){
        setDescricao('');
        descricaoLembreteRef.current?.focus();
      }
   
      updateLembretes();
  
      // Verifica o estado do checkbox antes de fechar o modal
      if (!checkbox) {
        handleCloseModal();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || (isEdit ? "Erro ao editar lembrete." : "Erro ao cadastrar lembrete.");
        toast.error(errorMessage);
        console.error("Erro ao processar lembrete:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }finally{
      setIsLoading(false);
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

      const response = await api.delete(`/lembrete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { id },
      });

      toast.success(<span>Lembrete excluído com sucesso.</span>);
      console.log("Lembrete excluído com sucesso:", response.data);

      updateLembretes();

      handleCloseModalDelete();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao excluir lembrete.";
        toast.error(errorMessage);
        console.error("Erro ao excluir lembrete:", error.response?.data);
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

  function formatDate(dateString: string): string {
    if (!dateString) return 'Data não disponível';
  
    const date = new Date(dateString);
  
    // Ajuste de fuso horário (opcional, dependendo da sua necessidade)
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  
    // Formata a data no padrão brasileiro (DD/MM/YYYY)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  function adjustDate(dateString: string): string {
    return formatDate(dateString); // Retorna a data formatada no formato correto
  }
  
  const filteredReminders = useMemo(() => {
    const filtered = lembretes.filter((lembrete) => {
      const searchLower = searchTerm.toLowerCase();

      const formattedDate = lembrete.dataCadastro ? formatDate(lembrete.dataCadastro) : "Data não disponível";
  
      const formatCurrency = (value: number): string => {
        return value
          .toFixed(2)
          .replace('.', ',');
      };
  
      return (
        lembrete.descricao.toLowerCase().includes(searchLower) ||
        formattedDate.includes(searchLower) 
      );
    });
  
    return filtered;
  }, [lembretes, searchTerm]);


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


  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckbox(e.target.checked);
    descricaoLembreteRef.current?.focus();
  };

  const indexOfLastLembrete = currentPage * RemindersPerPage;
  const indexOfFirstLembrete = indexOfLastLembrete - RemindersPerPage;
  const currentReminders = filteredReminders.slice(indexOfFirstLembrete, indexOfLastLembrete);
  const totalPages = Math.ceil(filteredReminders.length / RemindersPerPage);

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
            <h1>LEMBRETES CADASTRADOS</h1>
            <div className={styles.headerControls}>
              <ButtonAdd
                onClick={handleOpenCreateModal}
                label="Cadastrar Lembrete"
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
                  value={RemindersPerPage}
                  onChange={handleRemindersPerPageChange}
                  className={styles.customSelect}
                  aria-label="Número de Lembretes por página"
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
                  placeholder="Buscar Lembrete"
                  onSearch={(value) => setSearchTerm(value)} // Atualiza o termo de busca
                  setCurrentPage={setCurrentPage} // Passando a função para resetar a página
                />
              </div>
            </div>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.clientsTable}>
              <thead>
                <tr>
                  <th>Data a Notificar</th>
                  <th>Descrição</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {currentReminders.length > 0 ? (
                  currentReminders.map((reminder: Reminders) => (
                    <tr key={reminder.id}>
                      <td>
                        {adjustDate(reminder.dataCadastro)}
                      </td>
                      <td>{reminder.descricao}</td>
                      <td className={styles.actionIcons}>
                        <OverlayTrigger
                          trigger={['hover', 'focus']}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-edit-${reminder.id}`} className={styles.customTooltip}>
                              Editar {reminder.descricao}
                            </Tooltip>
                          }
                        >
                          <FilePenLine
                            className={styles.iconUser}
                            role="button"
                            aria-label={`Editar ${reminder.descricao}`}
                            onClick={() => handleOpenEditModal(reminder)}
                          />
                        </OverlayTrigger>
                        <OverlayTrigger
                          trigger={['hover', 'focus']}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-trash-${reminder.id}`} className={styles.customTooltip}>
                              Deletar {reminder.descricao}
                            </Tooltip>
                          }
                        >
                          <Trash
                            className={styles.iconTrash}
                            role="button"
                            aria-label={`Deletar ${reminder.descricao}`}
                            onClick={() => handleOpenModalDelete(reminder.id)}
                          />
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.noRecords}>
                      Nenhum lembrete encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={`${styles.pagination} ${currentReminders.length ? '' : styles.hidden}`}>
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
              <h2>{isEdit ? 'Editar Lembrete' : 'Cadastrar Lembrete'}</h2>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <X size={24} color="var(--white)" />
              </button>
            </div>
            <div className={styles.customModalBody}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="descricao" className={styles.customFormLabel}>Descrição</label>
                <textarea
                  id="descricao"
                  autoFocus
                  required
                  placeholder="Descrição do lembrete"
                  value={capitalizeWords(descricao)}
                  ref={descricaoLembreteRef}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescricao(e.target.value)}
                  className={styles.customFormControl}
                  rows={3} // Define a altura inicial do textarea
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dataCadastro" className={styles.customFormLabel}>Data</label>
                <input
                  id="dataCadastro"
                  type="date"
                  value={dataCadastro} // Verifica se é uma instância válida de Date
                  onChange={(e) => setDataCadastro(e.target.value)} 
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
                    <button 
                      type="submit" 
                      className={styles.customBtnPrimary}
                    >
                    {isLoading ? <BeatLoader color="#fff" size={6} /> : isEdit ? "Editar" : "Cadastrar"}
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
