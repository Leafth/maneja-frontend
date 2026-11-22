/** Marca um ponto que depende do backend e ainda não foi integrado. */
export function integrationPending(description: string): never {
  throw new Error(`Integração pendente: ${description}`);
}
