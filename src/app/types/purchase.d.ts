export interface Purchase {
    id: string;
    descricaoCompra: string;
    totalCompra: number;
    tipoCompra: number;
    statusCompra: number;
    created_at: string;
    updated_at: string;
    userId: string;
    clienteId: string;
    pagamentoId: string | null;
  }