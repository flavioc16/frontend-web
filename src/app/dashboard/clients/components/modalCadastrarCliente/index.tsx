import React, { useState, useEffect, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { getCookie } from "cookies-next";
import styles from "./styles.module.scss";
import { api } from "@/services/api";

interface CustomModalProps {
    show: boolean;
    onClose: () => void;
    isEdit?: boolean;
    updateClientes: () => Promise<void>; // Função que será chamada após salvar/atualizar o cliente
    
    initialFormData?: {
        nome: string;
        referencia: string;
        endereco: string;
        email: string;
        telefone: string;
        username: string;
        password?: string;
        id?: string;
    };
    
}

export default function ModalCadastrarCliente({
    show,
    onClose,
    isEdit = false,
    updateClientes,
    initialFormData = {
        nome: "",
        referencia: "",
        endereco: "",
        email: "",
        telefone: "",
        username: "",
        password: "",
    },
    
}: CustomModalProps) {
    const [formData, setFormData] = useState(initialFormData);
    const [showPassword, setShowPassword] = useState(false);

    const passwordInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (show) {
            setFormData(initialFormData);
        }
    }, [show, initialFormData]);

    const capitalizeWords = (value: string): string => {
        return value
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const maskPhone = (value: string): string => {
        value = value.replace(/\D/g, "");
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length === 0) return "";
        if (value.length <= 2) return `(${value}`;
        if (value.length <= 3) return `(${value.slice(0, 2)}) ${value.slice(2)}`;
        if (value.length <= 6) return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3)}`;
        if (value.length <= 7) return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3, 7)}`;
        if (value.length <= 9) return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        return `(${value.slice(0, 2)}) ${value.slice(2, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        toast.dismiss(); // Remove qualquer toast pendente
    
        try {
            const token = getCookie("token");
    
            if (!token) {
                toast.error("Token de autenticação não encontrado. Faça login novamente.");
                return;
            }
    
            if (!formData.password) {
                toast.error("A senha é obrigatória para cadastrar um novo cliente.");
                return;
            }
    
            const clientData = {
                nome: formData.nome,
                endereco: formData.endereco,
                referencia: formData.referencia,
                email: formData.email,
                telefone: formData.telefone,
                username: formData.username,
                password: formData.password, // Inclui a senha para cadastro
            };
    
            // Realiza o cadastro do cliente
            await api.post("/clients", clientData, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            // Atualiza a lista de clientes após o cadastro
            await updateClientes();
    
            // Exibe o toast de sucesso
            setTimeout(() => {
                toast.success(`Cliente ${formData.nome} cadastrado com sucesso.`);
            }, 0); // Adiciona um pequeno delay para garantir que a lista foi atualizada
    
            // Limpa o formulário e fecha o modal após a ação
            setFormData(initialFormData);
            onClose();
        } catch (error) {
            // Trata erros, se houver
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error || "Erro ao cadastrar cliente.";
                toast.error(errorMessage);
            } else {
                toast.error("Erro desconhecido.");
            }
        }
    };
    
    
    

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

    return (
        <Modal show={show} onHide={onClose} className={styles.customModal} size="lg">
            <div className={styles.customModalHeader}>
                <h2>{isEdit ? "Editar Cliente" : "Cadastrar Cliente"}</h2>
                <button onClick={onClose} className={styles.closeButton}>
                    <X size={24} color="var(--white)" />
                </button>
            </div>
            <div className={styles.customModalBody}>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="clientNome" className={styles.customFormLabel}>
                            Nome
                        </label>
                        <input
                            id="clientNome"
                            type="text"
                            required
                            placeholder="Nome do cliente"
                            value={capitalizeWords(formData.nome)}
                            onChange={(e) => handleChange("nome", e.target.value)}
                            autoFocus
                            className={styles.customFormControl}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="clientReferencia" className={styles.customFormLabel}>
                            Referência
                        </label>
                        <input
                            id="clientReferencia"
                            type="text"
                            required
                            placeholder="Referência do cliente"
                            value={capitalizeWords(formData.referencia)}
                            onChange={(e) => handleChange("referencia", e.target.value)}
                            className={styles.customFormControl}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="clientEndereco" className={styles.customFormLabel}>
                            Endereço
                        </label>
                        <input
                            id="clientEndereco"
                            type="text"
                            required
                            placeholder="Endereço do cliente"
                            value={capitalizeWords(formData.endereco)}
                            onChange={(e) => handleChange("endereco", e.target.value)}
                            className={styles.customFormControl}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="clientEmail" className={styles.customFormLabel}>
                            Email
                        </label>
                        <input
                            id="clientEmail"
                            type="email"
                            placeholder="Email do cliente"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className={styles.customFormControl}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="clientTelefone" className={styles.customFormLabel}>
                            Telefone
                        </label>
                        <input
                            id="clientTelefone"
                            type="text"
                            required
                            placeholder="Telefone do cliente"
                            value={formData.telefone}
                            onChange={(e) => {
                                const formattedValue = maskPhone(e.target.value);
                                handleChange("telefone", formattedValue);
                            }}
                            onBlur={(e) => {
                                handleChange("telefone", maskPhone(e.target.value));
                            }}
                            className={styles.customFormControl}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="clientUsername" className={styles.customFormLabel}>
                            Usuário
                        </label>
                        <input
                            id="clientUsername"
                            type="text"
                            required
                            placeholder="Nome de usuário do cliente"
                            value={formData.username}
                            onChange={(e) => handleChange("username", e.target.value)}
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
                                type={showPassword ? "text" : "password"}
                                placeholder="Senha do cliente"
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                className={styles.customFormControl}
                                autoComplete="new-password"
                                ref={passwordInputRef}
                            />
                            {formData.password === "" ? (
                                <Lock className={styles.icon} onClick={() => passwordInputRef.current?.focus()} />
                            ) : showPassword ? (
                                <Eye className={styles.icon} onClick={toggleShowPassword} />
                            ) : (
                                <EyeOff className={styles.icon} onClick={toggleShowPassword} />
                            )}
                        </div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button type="submit" className={styles.customBtnPrimary}>
                            {isEdit ? "Salvar" : "Cadastrar"}
                        </button>
                        <button type="button" onClick={onClose} className={styles.customBtnSecondary}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
