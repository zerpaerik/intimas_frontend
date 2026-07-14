export interface MensajeUsuario {
  id: number;
  nombre: string;
  title?: string | null;
  role?: { nombre: string } | null;
}

export interface Mensaje {
  id: number;
  deId: number;
  paraId: number;
  pacienteId?: number | null;
  asunto?: string | null;
  cuerpo: string;
  leido: boolean;
  leidoAt?: string | null;
  createdAt: string;
  de?: { id: number; nombre: string } | null;
  para?: { id: number; nombre: string } | null;
  paciente?: { id: number; nombres: string; apellidos: string; numDoc?: string | null } | null;
}
