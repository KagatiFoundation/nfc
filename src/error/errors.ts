import Token from "../lexer/Token";
import { LitType } from "../types/types";

export class SymbolNotFoundError extends Error {
    constructor(symName: string) {
        super(`UndefinedSymbolError: Symbol not found '${symName}'`);
    }
}

export class SyntaxError extends Error {
    constructor(message: string) {
        super(`SyntaxError: ${message}`);
    }
}

export class UnexpectedTokenError extends SyntaxError {
    constructor(token: Token) {
        super(`Unexpected token '${token.lexeme}'`);
    }
}

export class NFCTypeError extends Error {
    constructor(message?: string) {
        super(`TypeError: ${message}`);
    }
}

export class TypeMismatchError extends NFCTypeError {
    constructor(type1: LitType, type2: LitType, message?: string) {
        super(`Type mismatch: '${type1}' and '${type2}' ${message ? "(" + message + ")" : ""}`);
    }
}

export const errors = {
    SymbolNotFoundError,
    UnexpectedTokenError,
    NFCTypeError,
    TypeMismatchError,
    SyntaxError
}