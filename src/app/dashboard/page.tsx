"use client"

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import { Table } from "./components/table";
import FeaturedCard from "./components/featuredCard";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import styles from "./page.module.scss";

import ModalCadastrarCliente from "./clients/components/modalCadastrarCliente";

import { ShoppingCart, DollarSign, UserPlus, ScanBarcode } from "lucide-react";

export interface Client {
  id: string;
  nome: string;
  email?: string;
  username?: string;
  telefone: string;
  endereco?: string;
  referencia?: string;
  created_at: string;
  updated_at: string;
  userId: string;
}

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModalCadastrarProduto, setShowModalCadastrarProduto] = useState(false);

  const [countClients, setCountClients] = useState<number | undefined>(undefined);
  const [countProducts, setCountProducts] = useState<number | undefined>(undefined);
  const [dailyPurchaseCount, setDailyPurchaseCount] = useState<number | undefined>(undefined);
  const [dailyPaymentCount, setDailyPaymentCount] = useState<number | undefined>(undefined);

  const [loadingDailyPurchaseCount, setLoadingDailyPurchaseCount] = useState(true);
  const [loadingDailyPaymentsCount, setLoadingDailyPaymentsCount] = useState(true);
  
  const [formData, setFormData] = useState({
    nome: "",
    referencia: "",
    endereco: "",
    email: "",
    telefone: "",
    username: "",
    password: "",
    id: "", // ID é vazio para novos clientes
  });

  // Função para abrir o modal de edição
  const handleOpenModalCadastrarCliente = (cliente: Client | null) => {
    if (cliente) {
      // Caso haja um cliente, preenche os dados para edição
      setFormData({
        nome: cliente.nome,
        referencia: cliente.referencia || "",
        endereco: cliente.endereco || "",
        email: cliente.email || "",
        telefone: cliente.telefone || "",
        username: cliente.username || "",
        password: "", // Não carrega a senha por segurança
        id: cliente.id,
      });
    } else {
      // Caso contrário, prepara um objeto vazio para criar um novo cliente
      setFormData({
        nome: "",
        referencia: "",
        endereco: "",
        email: "",
        telefone: "",
        username: "",
        password: "",
        id: "", // ID vazio para novo cliente
      });
    }
    setShowModalCadastrarProduto(true);
  };

  // Função para buscar a lista de clientes
  const fetchClients = async () => {
    try {
      const token = getCookie("token");
      const response = await api.get("/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  // Função para buscar a contagem de clientes
  const fetchClientCount = async () => {
    try {
      const token = getCookie("token");
      const response = await api.get("/count/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCountClients(response.data.count);
    } catch (error) {
      console.error("Erro ao buscar a contagem de clientes:", error);
    }
  };

  const fetchDailyPurchaseCount = async () => {
    try {
      const token = getCookie("token");
      const response = await api.get("/compras/total-do-dia", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDailyPurchaseCount(response.data.total); // Supondo que o backend retorne o valor em "total"
    } catch (error) {
      console.error("Erro ao buscar a contagem de compras do dia:", error);
    }
  };

  const fetchDailyPaymentCount = async () => {
    try {
      const token = getCookie("token");
      const response = await api.get("/total/pagamentos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDailyPaymentCount(response.data.total); // Supondo que o backend retorne o valor em "total"
    } catch (error) {
      console.error("Erro ao buscar a contagem de pagamentos do dia:", error);
    }
};

  const fetchProductCount = async () => {
    try {
      const token = getCookie("token");
      const response = await api.get("/count/produtos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCountProducts(response.data.count); // Certifique-se de ter um estado chamado setCountProducts
    } catch (error) {
      console.error("Erro ao buscar a contagem de produtos:", error);
    }
  };

  // Função para atualizar a lista e a contagem de clientes
  const updateFetch = async () => {
    setLoading(true); // Começa o carregamento
    await fetchClients(); // Atualiza a lista de clientes
    await fetchClientCount(); // Atualiza a contagem de clientes
    await fetchProductCount();
    setLoading(false); // Finaliza o carregamento
  };

  const updateValueCompras = async () => {
    setLoadingDailyPurchaseCount(true);
    await fetchDailyPurchaseCount();
    setLoadingDailyPurchaseCount(false);
  }

  // Carrega os dados ao montar o componente e chama updateFetch para atualização
  useEffect(() => {
    updateFetch(); // Chama a função updateFetch para carregar dados iniciais
  }, []); // Executa apenas uma vez quando o componente for montado

  useEffect(() => {
    fetchProductCount(); // Chama a função para buscar a contagem de produtos
  }, []);

  useEffect(() => {
    fetchDailyPurchaseCount(); // Chama a função para buscar a contagem de compras do dia
  }, []);

  useEffect(() => {
    fetchDailyPaymentCount(); // Chama a função para buscar a contagem de compras do dia
  }, []);

  return (
    <main className={styles.contentArea}>
      <Row className={`${styles.rowCustom} g-4`}>
        <Col md={3} className="px-10" style={{ marginRight: '3px', marginLeft: '3px', marginTop: '2rem' }}>
        <FeaturedCard 
          title="Caixa atual (compras)" 
          value={dailyPurchaseCount !== undefined 
            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dailyPurchaseCount) 
            : "..."
          } 
          updateValueCompras={updateValueCompras}
          showEyeIcon={true} 
          icon={<ShoppingCart size={40} />}
          isLoading={loading} 
        />
        </Col>
        <Col md={3} className="px-0" style={{ marginRight: '-9px', marginTop: '2rem' }}>
          <FeaturedCard 
            title="Por conta (pagamentos)"
            showEyeIcon={true}
            value={dailyPaymentCount !== undefined 
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dailyPaymentCount) 
              : "..."
            } 
            icon={<DollarSign size={40} />} 
            isLoading={loading}
          />
        </Col>
        <Col md={3} className="px-0" style={{ marginRight: '-22px', marginTop: '2rem' }}>
          <FeaturedCard 
            title="Cadastrar clientes"
            onClick={() => handleOpenModalCadastrarCliente(null)}
            count={countClients}  
            icon={<UserPlus size={40} />}
            isLoading={loading} 
          />
        </Col>
        <Col md={3} className="px-10" style={{ marginRight: '-1px', marginTop: '2rem' }}>
          <FeaturedCard 
            title="Cadastrar produtos"
            count={countProducts}   
            icon={<ScanBarcode size={40} />}
            isLoading={loading} 
          />
        </Col>
      </Row>

      <Table clients={clients} loading={loading} />

      <ModalCadastrarCliente
        show={showModalCadastrarProduto}
        onClose={() => setShowModalCadastrarProduto(false)}
        isEdit={!!formData.id} // Se id estiver presente, é edição
        initialFormData={formData} // Passa os dados do cliente para o modal
        updateClientes={updateFetch} // Passa a função updateFetch como updateClientes
      />
    </main>
  );
}
