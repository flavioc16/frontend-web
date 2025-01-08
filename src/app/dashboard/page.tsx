"use client"

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { getCookie } from "cookies-next";
import { Table } from "./components/table";
import FeaturedCard from "./components/featuredCard";

import styles from "./page.module.scss";

import ModalCadastrarCliente from "./clients/components/modalCadastrarCliente";
import ModalCadastrarProduto from "./products/components/modalCadastrarProduto";

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
  const [showModalCadastrarCliente, setShowModalCadastrarCliente] = useState(false);
  const [showModalCadastrarProduto, setShowModalCadastrarProduto] = useState(false);

  const [countClients, setCountClients] = useState<number | undefined>(undefined);
  const [countProducts, setCountProducts] = useState<number | undefined>(undefined);
  const [dailyPurchaseCount, setDailyPurchaseCount] = useState<number | undefined>(undefined);
  const [dailyPaymentCount, setDailyPaymentCount] = useState<number | undefined>(undefined);

  const [nomeProduto, setNomeProduto] = useState("");
  const [descricaoProduto, setDescricaoProduto] = useState("");
  const [precoAVista, setPrecoAVista] = useState(0);
  const [precoAPrazo, setPrecoAPrazo] = useState(0);
  const [produtoId, setProdutoId] = useState(""); // ID vazio para novo produto

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

  const [formDataProduct, setFormDataProduct] = useState({
    nome: "",
    descricao: "",
    precoAVista: "0,00",
    precoAPrazo: "0,00",
  });


  // Função para abrir o modal de cadastro de cliente
  const handleOpenModalCadastrarCliente = () => {
    // Reseta os dados do formulário para um novo cliente
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

    setShowModalCadastrarCliente(true); // Abre o modal
  };


  const handleOpenModalCadastrarProduto = () => {
    // Reseta os dados do formulário para um novo cadastro
    setFormDataProduct({
      nome: "",
      descricao: "",
      precoAVista: "0,00",
      precoAPrazo: "0,00",

    });
  
    setShowModalCadastrarProduto(true); // Abre o modal
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
      <div className="container-fluid">
        <div className="row mt-2">
          <div className="col-xl-3 col-md-6 mb-4 mt-4">
            <FeaturedCard 
              title="Caixa atual (compras)" 
              value={dailyPurchaseCount !== undefined 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dailyPurchaseCount) 
                : "..." }
              updateValueCompras={updateValueCompras}
              showEyeIcon={true} 
              icon={<ShoppingCart size={40} />}
              isLoading={loading} 
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-4 mt-4">
            <FeaturedCard 
              title="Por conta (pagamentos)"
              showEyeIcon={true}
              value={dailyPaymentCount !== undefined 
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dailyPaymentCount) 
                : "..." }
              icon={<DollarSign size={40} />} 
              isLoading={loading}
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-4 mt-4">
            <FeaturedCard 
              title="Cadastrar clientes"
              onClick={() => handleOpenModalCadastrarCliente()}
              count={countClients}  
              icon={<UserPlus size={40} />}
              isLoading={loading} 
            />
          </div>
          <div className="col-xl-3 col-md-6 mb-4 mt-4 ml-4">
            <FeaturedCard 
              title="Cadastrar produtos"
              count={countProducts}   
              icon={<ScanBarcode size={40} />}
              isLoading={loading} 
              onClick={() => handleOpenModalCadastrarProduto()}
            />
          </div>
          
        </div>
      </div>


      <Table clients={clients} loading={loading} />

      <ModalCadastrarProduto
        show={showModalCadastrarProduto}
        onClose={() => setShowModalCadastrarProduto(false)}
        isEdit={false}
        initialFormData={formDataProduct}
        updateProdutos={updateFetch}
      
      />

      <ModalCadastrarCliente
        show={showModalCadastrarCliente}
        onClose={() => setShowModalCadastrarCliente(false)}
        isEdit={!!formData.id} // Se id estiver presente, é edição
        initialFormData={formData} // Passa os dados do cliente para o modal
        updateClientes={updateFetch} // Passa a função updateFetch como updateClientes
      />
    </main>
  );
}
