export interface AgendaBloque {
  id: number;
  medicoId: number;
  sedeId?: number | null;
  sede?: { id: number; nombre: string } | null;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  slotMin: number;
}

export interface Slot {
  hora: string;
  ocupado: boolean;
}
