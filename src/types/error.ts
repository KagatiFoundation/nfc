import { LitType } from "./types";

export class NFCTypeError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class TypeMismatchError extends NFCTypeError {
    constructor(type1: LitType, type2: LitType) {
        super(`TypeError: Type mismatch: '${type1}' and '${type2}'`);
    }
}