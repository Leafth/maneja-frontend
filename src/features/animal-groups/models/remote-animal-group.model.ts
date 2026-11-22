export interface RemoteAnimalGroup {
  remoteId: string;
  name: string;
  animalCount: number;

  currentTerrain: {
    remoteId: string;
    name: string;
  } | null;

  remoteCreatedAt: string;
  remoteUpdatedAt: string;
}
