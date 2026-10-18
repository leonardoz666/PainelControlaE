export type Status = "TESTE" | "ATIVO" | "INADIMPLENTE" | "SUSPENSO" | "CANCELADO";

export type Summary = {
  total: number;
  ativos: number;
  testes: number;
  pendentes: number;
  suspensos: number;
};

export type Establishment = {
  id: string;
  nome: string;
  slug: string;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  garcomLatitude: number | null;
  garcomLongitude: number | null;
  garcomRaioMetros: number | null;
  status: Status;
  bancoConfigurado: boolean;
  bancoPronto: boolean;
  donoPronto: boolean;
  impressaoConfigurada: boolean;
  modulosAtivos: string[];
  criadoEm: string;
  assinatura: {
    valorMensal: number;
    proximoVencimento: string | null;
    status: string;
  } | null;
  plano: { nome: string } | null;
};
