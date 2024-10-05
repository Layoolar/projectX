export class CustomError extends Error {
    public readonly statusCode: number;
    public readonly data?: object;

    // Overloaded constructor declarations
    constructor(message: string, statusCode: number, data?: object) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);

        this.statusCode = statusCode;
        this.data = data ?? {};
    }
}
