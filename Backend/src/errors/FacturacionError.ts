export class FacturacionError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number = 400
    ) {
        super(message);
        this.name = 'FacturacionError';
    }

    toJSON() {
        return {
            error: this.name,
            message: this.message,
            statusCode: this.statusCode
        };
    }
}