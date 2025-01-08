import React, { useState, ChangeEvent, useEffect, forwardRef } from 'react';
import { X, Search } from 'lucide-react';
import styles from './styles.module.scss';

interface SearchInputProps {
    placeholder?: string;
    onSearch?: (value: string) => void;
    setCurrentPage: (page: number) => void; // Função para resetar a página
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ placeholder = 'Buscar...', onSearch, setCurrentPage }, ref) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sempre que searchTerm mudar, resetamos a página para 1
    useEffect(() => {
        if (searchTerm) {
            setCurrentPage(1); // Reseta para a primeira página quando o termo de busca mudar
        }
        if (onSearch) {
            onSearch(searchTerm); // Chama o callback com o novo valor de busca
        }
    }, [searchTerm, setCurrentPage, onSearch]); // Reage quando o searchTerm mudar

    // Função para limpar o campo de busca
    const handleClear = () => {
        setSearchTerm(''); // Limpa o estado da busca
        inputRef.current?.focus(); // Foca no input
        if (onSearch) onSearch(''); // Chama o callback com string vazia
    };

    // Função para manipular a mudança no campo de busca
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value); // Atualiza o estado de busca
    };

    // Reseta o searchTerm ao pressionar a tecla "Escape"
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSearchTerm(''); // Reseta a busca ao pressionar "Escape"
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown); // Limpeza do evento
    }, []);

    return (
        <div className={styles.searchContainer}>
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                autoFocus
                onChange={handleChange} // Atualiza o searchTerm com a mudança no campo
                className={styles.filterInput}
                ref={ref || inputRef} // Usa o ref passado ou o ref interno
                aria-label={placeholder}
            />
            {searchTerm ? (
                <X
                    className={styles.clearIcon}
                    onClick={handleClear} // Chama a função de limpar
                    role="button"
                    aria-label="Limpar pesquisa"
                />
            ) : (
                <Search className={styles.searchIcon} aria-hidden="true" />
            )}
        </div>
    );
});

export default SearchInput;
