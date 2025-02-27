import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Plus, UserPen, Trash, Lock, Eye, EyeOff } from 'lucide-react';
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
import { BeatLoader } from 'react-spinners';
import SearchInput from '@/app/dashboard/components/searchInput';


export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}

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
  user?: User;
}


interface TableClientsProps {
  clients: Client[];
  loading: boolean;
  updateClientes?: () => void; // Tipagem da função passada como prop
}

export function TableClients({ clients, loading, updateClientes }: TableClientsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clientsPerPage, setClientsPerPage] = useState(10);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isMenuInputFocused, setIsMenuInputFocused } = useFocus();

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [nome, setNome] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>('email');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState<string | undefined>();
  const [referencia, setReferencia] = useState<string | undefined>();
  const [username, setUsername] = useState<string | undefined>();
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const toggleShowPassword = () => {
    // Alternar o estado da visibilidade da senha
    const newState = !showPassword;
    setShowPassword(newState);
  
    // Focar no campo de senha sempre que o ícone for clicado
    if (passwordInputRef.current) {
      setTimeout(() => {
        passwordInputRef.current?.focus();  // Aguarda a renderização e aplica o foco
      }, 0);
    }
  };


  
  const [clientName, setClientName] = useState('');
  const [id, setClientId] = useState<string | null>(null);

  const [isEdit, setIsEdit] = useState(false); // Novo estado para controlar se é edição

  const modalTitle = "Deseja realmente excluir este cliente?";

  const handleClientsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setClientsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleOpenCreateModal  = () => {
    setIsEdit(false); 
    setNome('');
    setEmail('');
    setTelefone('');
    setEndereco('');
    setReferencia('');
    setUsername('');
    setPassword('');
    setShowModal(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setClientId(client.id);
    setIsEdit(true);
    setNome(client.nome || '');  // Valor padrão para evitar undefined
    setEmail(client.email || '');
    setTelefone(client.telefone || '');
    setEndereco(client.endereco || '');
    setReferencia(client.referencia || '');
    setUsername(client.user?.username || '');  // Verifica se o username existe na relação User
    setPassword(''); // Não preenche o password por segurança
    setShowModal(true);
  };

  const handleOpenModalDelete = (name: string, id: string) => {
    setClientName(name);
    setClientId(id);
    setShowModalDelete(true);
  };

  const handleCloseModalDelete = () => {
    setShowModalDelete(false);
    setClientName(''); 
    setClientId('');
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true); // Ativa o estado de loading
    toast.dismiss(); // Descartar qualquer notificação anterior
  
    try {
      const token = getCookie("token"); // Obtém o token de autenticação
  
      if (!token) {
        toast.error("Token de autenticação não encontrado. Faça login novamente.");
        return;
      }
  
      // Verifica se a senha foi fornecida no modo cadastro
      if (!isEdit && !password) {
        toast.error("A senha é obrigatória para cadastrar um novo cliente.");
        passwordInputRef.current?.focus();
        return;
      }
  
      // Cria o objeto clientData a partir dos estados
      const clientData = {
        nome,
        endereco,
        referencia,
        email,
        telefone,
        ...(isEdit 
          ? { 
              user: { 
                username,
                password, // Incluindo senha apenas se for fornecida no modo edição
              },
              id, // Inclui o ID na edição
            }
          : { 
              username, 
              password, // Sempre incluir no cadastro
            }
        ),
      };
  
      if (isEdit) {
        if (!id) {
          throw new Error("ID do cliente não fornecido.");
        }
  
        const response = await api.put(`/clients`, clientData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const updatedClientName = response.data.nome || "Cliente";
        toast.success(`Cliente ${updatedClientName} editado com sucesso.`);
  
      } else {
        const response = await api.post("/clients", clientData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const newClientName = response.data.cliente?.nome || "Novo cliente";
        toast.success(`Cliente ${newClientName} cadastrado com sucesso.`);
      }
  
      // Reseta o formulário após a ação (cadastro ou edição)
      setNome('');
      setEmail('');
      setTelefone('');
      setEndereco('');
      setReferencia('');
      setUsername('');
      setPassword('');
  
      if(updateClientes){
        updateClientes();
      } 
  
      handleCloseModal(); // Fecha o modal ao terminar
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || (isEdit ? "Erro ao editar cliente." : "Erro ao cadastrar cliente.");
        toast.error(errorMessage);
        console.error("Erro ao processar cliente:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }finally{
      setIsLoading(false); // desativa o estado de loading
    }
  };
  
  const handleConfirmDelete = async () => { 
    toast.dismiss(); // Descartar qualquer notificação anterior
  
    try {
      const token = getCookie('token'); // Obtém o token de autenticação
  
      if (!token) {
        toast.error('Token de autenticação não encontrado. Faça login novamente.');
        return;
      }
  
      // Envia a ID como um JSON no corpo da requisição DELETE
      const response = await api.delete(`/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Certifique-se de definir o tipo de conteúdo como JSON
        },
        data: {
          id: id, // Enviando a ID no corpo da requisição
        },
      });
  
      toast.success(`Cliente ${clientName} excluído com sucesso.`);
      console.log("Cliente excluído com sucesso:", response.data);
  
      // Chama a função para atualizar a lista de clientes após a exclusão
      if(updateClientes){
        updateClientes();
      } 
  
      handleCloseModalDelete(); // Fecha o modal ao terminar
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Erro ao excluir cliente.";
        toast.error(errorMessage);
        console.error("Erro ao excluir cliente:", error.response?.data);
      } else {
        toast.error("Erro desconhecido.");
        console.error("Erro desconhecido:", error);
      }
    }
  };
  // Função para capitalizar a primeira letra de cada palavra
  const capitalizeWords = (value: string): string => {
    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  // Função para mascarar telefone
  const maskPhone = (value: string): string => {
    // Remove todos os caracteres não numéricos
    value = value.replace(/\D/g, '');
  
    // Limita o valor a 11 caracteres (DD + 9 + XXXX + XXXX)
    if (value.length > 11) value = value.slice(0, 11);
  
    // Aplica a máscara conforme o número de dígitos
    if (value.length === 0) {
      return ''; // Se não houver nada digitado, retorna vazio
    } else if (value.length <= 2) {
      return `(${value}`; // Apenas os dois primeiros dígitos
    } else if (value.length <= 3) {
      return `(${value.slice(0, 2)}) ${value.slice(2)}`; // (XX) X
    } else if (value.length <= 6) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3)}`; // (XX) 9-XXX
    } else if (value.length <= 7) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3, 7)}`; // (XX) 9-XXXX
    } else if (value.length <= 9) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3, 7)}-${value.slice(7)}`; // (XX) 9-XXXX-XXX
    } else {
      // Depois de digitar o 9º dígito, aplica a formatação completa
      return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
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

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
        // Verifica valores de nível superior do cliente
        Object.values(client).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        ) 
        // Verifica especificamente o username dentro de user
        || (client.user?.username && client.user.username.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <h1>CLIENTES</h1>
            <div className={styles.headerControls}>
            <ButtonAdd
              onClick={handleOpenCreateModal}
              label="Cadastrar Cliente"
              icon={<Plus style={{ width: '19px', height: '18px' }} />}
              iconStyle={{
                fontSize: '20px', // Ajusta o tamanho do ícone
                marginLeft: '4px', // Ajusta o espaçamento do ícone
                marginRight: '-4px', // Ajusta o espaçamento do ícone
                marginBottom:'3px'
              }}
            />
            <div className={styles.resultsPerPage}>
                <label htmlFor="resultsPerPage">Exibir  :</label>
                <select
                  id="resultsPerPage"
                  value={clientsPerPage}
                  onChange={handleClientsPerPageChange}
                  className={styles.customSelect}
                  aria-label="Número de clientes por página"
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
                  placeholder="Buscar Cliente"
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
                  <th>Nome</th>
                  <th>Referência</th>
                  <th>Endereço</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Username</th>
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
                      <td>{client.email || ''}</td>
                      <td>{client.telefone}</td>
                      <td>{client.user?.username || ''}</td>
                      <td className={styles.actionIcons}>
                        
                        {/* Tooltip para o ícone UserPen */}
                        <OverlayTrigger
                          trigger={['hover', 'focus']}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-user-${client.id}`} className={styles.customTooltip}>
                              Editar {client.nome}
                            </Tooltip>
                          }
                        >
                          <UserPen
                            className={styles.iconUser}
                            role="button"
                            
                            aria-label={`Editar ${client.nome}`}
                            onClick={() => handleOpenEditModal(client)} 
                          />
                        </OverlayTrigger>

                        {/* Tooltip para o ícone Trash */}
                        <OverlayTrigger
                          trigger={['hover', 'focus']}
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-trash-${client.id}`} className={styles.customTooltip}>
                              Deletar {client.nome}
                            </Tooltip>
                          }
                        >
                          <Trash
                            className={styles.iconTrash}
                            role="button"
                            aria-label={`Deletar ${client.nome}`}
                            onClick={() => handleOpenModalDelete(client.nome, client.id)}
                          />
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className={styles.noRecords}>
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className={`${styles.pagination} ${currentClients.length ? '' : styles.hidden}`}>
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

          {/* Modal personalizado */}
          <Modal
            show={showModal}
            onHide={handleCloseModal}
            className={styles.customModal}
            size="lg"
          >
            <div className={styles.customModalHeader}>
              <h2>{isEdit ? 'Editar Cliente' : 'Preencha os dados do cliente'}</h2>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                <X size={24} color="var(--white)" />
              </button>
            </div>
            <div className={styles.customModalBody}>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="clientNome" className={styles.customFormLabel}>Nome</label>
                  <input
                    id="clientNome"
                    type="text"
                    required
                    placeholder="Nome do cliente"
                    value={nome}
                    onChange={(e) => setNome(capitalizeWords(e.target.value))}
                    autoFocus
                    className={styles.customFormControl}
                    maxLength={30}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="clientReferencia" className={styles.customFormLabel}>Referência</label>
                  <input
                    id="clientReferencia"
                    placeholder="Referência do cliente"
                    type="text"
                    required
                    value={referencia}
                    onChange={(e) => setReferencia(capitalizeWords(e.target.value))}
                    className={styles.customFormControl}
                    maxLength={30}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="clientEndereco" className={styles.customFormLabel}>Endereço</label>
                  <input
                    id="clientEndereco"
                    type="text"
                    required
                    placeholder="Endereço do cliente"
                    value={endereco}
                    onChange={(e) => setEndereco(capitalizeWords(e.target.value))}
                    className={styles.customFormControl}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="clientEmail" className={styles.customFormLabel}>Email</label>
                  <input
                    id="clientEmail"
                    type="email"
                    placeholder="Email do cliente"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.customFormControl}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="clientTelefone" className={styles.customFormLabel}>Telefone</label>
                  <input
                    id="clientTelefone"
                    type="text"
                    required
                    placeholder="Telefone do cliente"
                    value={telefone}
                    onChange={(e) => {
                      const input = e.target as HTMLInputElement;
                      // Formata o valor enquanto o usuário digita
                      const formattedValue = maskPhone(input.value);
                      setTelefone(formattedValue);  // Atualiza o estado com o valor formatado
                    }}
                    onBlur={(e) => {
                      // Aplica a máscara quando o campo perde o foco, sem afetar o comportamento ao digitar
                      setTelefone(maskPhone(e.target.value));
                    }}
                    className={styles.customFormControl}
                  />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="clientUsername" className={styles.customFormLabel}>Usuario</label>
                    <input
                      id="clientUsername"
                      type="text"
                      placeholder="Nome de usuário do cliente"
                      value={username}
                      required
                      onChange={(e) => setUsername(e.target.value)}
                      className={styles.customFormControl}
                      autoComplete="new-username"
                    />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="clientPassword" className={styles.customFormLabel}>
                    Senha
                  </label>
                  <div className={styles.inputContainer}>
                    <input
                      id="clientPassword"
                      type={showPassword ? "text" : "password"}  // Alterna o tipo conforme a visibilidade
                      placeholder="Senha do cliente"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.customFormControl}
                      autoComplete="new-password"
                      ref={passwordInputRef}  // Ref para o foco
                    />
                    
                    {/* Ícones de exibição de senha */}
                    {password === "" ? (
                      <Lock className={styles.icon} onClick={() => passwordInputRef.current?.focus()} />
                    ) : showPassword ? (
                      <Eye className={styles.icon} onClick={toggleShowPassword} />
                    ) : (
                      <EyeOff className={styles.icon} onClick={toggleShowPassword} />
                    )}
                  </div>
                </div>
                <div className={styles.buttonContainer}>
                  <button 
                    type="submit" 
                    className={styles.customBtnPrimary} 
                    disabled={isLoading}
                    >
                    {isLoading ? <BeatLoader color="#fff" size={6} /> : isEdit ? "Editar" : "Cadastrar"}
                  </button>
                  <button type="button" onClick={handleCloseModal} className={styles.customBtnSecondary}>
                    Cancelar
                  </button>
                </div>
              </form>
          </div>
          </Modal>
          
          {/* Modal personalizado */}
          <DeleteModal
            showModalDelete={showModalDelete}
            handleCloseModalDelete={handleCloseModalDelete}
            handleConfirmDelete={handleConfirmDelete}
            modalTitle={modalTitle} // Passando o título dinâmico como prop
          />
          <ToastContainer />
        </>
      )}
    </div>
  );
}
