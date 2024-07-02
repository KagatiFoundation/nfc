import Token from "../lexer/Token";
import { LitType } from "../types/types";

export class SymbolNotFoundError extends Error {
    constructor(symName: string) {
        super(`UndefinedSymbolError: Symbol not found '${symName}'`);
    }
}

export class UnexpectedTokenError extends Error {
    constructor(token: Token) {
        super(`UnexpectedTokenError: Unexpected token '${token.lexeme}'`);
    }
}

export class NFCTypeError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class TypeMismatchError extends NFCTypeError {
    constructor(type1: LitType, type2: LitType, message?: string) {
        super(`TypeError: Type mismatch: '${type1}' and '${type2}' ${message ? "(" + message + ")" : ""}`);
    }
}

export const errors = {
    SymbolNotFoundError,
    UnexpectedTokenError,
    NFCTypeError,
    TypeMismatchError
}