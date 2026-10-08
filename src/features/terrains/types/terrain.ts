export type TerrainStatus =
  | 'DISPONIVEL'
  | 'EM_DESCANSO'
  | 'OCUPADO';

export interface Terrain {
  id: string;
  title: string;
  subtitle: string;
  status: TerrainStatus;
}
