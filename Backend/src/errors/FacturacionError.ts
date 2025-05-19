export class FacturacionError extends Error {
  constructor(
    message: string,
    public code: number,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "FacturacionError";
  }
}