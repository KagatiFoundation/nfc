import { LitType } from "../types/types";

/**
 * Maximum number of symbols that this compiler supports.
 */
export const NSYMS = 1024;

export enum SymbolType {
    Variable
}

export interface Symbol {
    name: string;
    symbolType: SymbolType;
    valueType: LitType;
}

export default class SymbolTable {
    private symbols: Symbol[];
    private counter: number;

    public constructor() {
        this.symbols = Array(NSYMS);
        this.counter = 0;
    }

    public add(sym: Symbol): number {
        const actPos = this.next();
        return actPos;
    }

    public insert(position: number, sym: Symbol): number {
        if (position > NSYMS || position < 0) {
            throw new Error(`SymbolTable::insert(): '${position}' is out of bound for range ${NSYMS}.`);
        }
        this.symbols[position] = sym;
        return 0;
    }

    public get(position: number): Symbol {
        if (position > NSYMS || position < 0) {
            throw new Error(`SymbolTable::insert(): '${position}' is out of bound for range ${NSYMS}.`);
        }
        return this.symbols[position];
    }

    private next(): number {
        if (this.counter > NSYMS) {
            throw new Error("SymbolTable::next(): Symbol table is already full. Exiting...");
        }
        this.counter += 1;
        return this.counter;
    }
}