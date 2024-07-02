import { LitType } from "../types/types";

/**
 * Maximum number of symbols that this compiler supports.
 */
export const NSYMS = 1024;

export enum NFCSymbolType {
    Variable,
    Function
}

export interface NFCSymbol {
    name: string;
    symbolType: NFCSymbolType;
    valueType: LitType;
}

export default class NFCSymbolTable {
    private symbols: NFCSymbol[];
    private counter: number;

    public constructor() {
        this.symbols = Array<NFCSymbol>(NSYMS);
        this.counter = 0;
    }

    public add(sym: NFCSymbol): number {
        if (this.counter >= NSYMS) {
            throw new Error(`NFCSymbolTable::add(): Symbol table is already full.`);
        }
        const current = this.counter;
        this.symbols[current] = sym;
        this.next();
        return current;
    }

    public insert(position: number, sym: NFCSymbol): number {
        if (position > NSYMS || position < 0) {
            throw new Error(`NFCSymbolTable::insert(): '${position}' is out of bound for range ${NSYMS}.`);
        }
        this.symbols[position] = sym;
        return 0;
    }

    public get(position: number): NFCSymbol | undefined {
        if (position > NSYMS || position < 0) {
            return undefined;
        }
        return this.symbols[position];
    }

    public find(name: string): [number, NFCSymbol] | undefined {
        for (let i = 0; i < this.counter; i++) {
            const symbol = this.symbols[i];
            if (symbol && symbol.name === name) {
                return [i, symbol];
            }
        }
        return undefined;
    }

    private next(): number {
        if (this.counter > NSYMS) {
            throw new Error("NFCSymbolTable::next(): Symbol table is already full. Exiting...");
        }
        this.counter += 1;
        return this.counter;
    }

    public array(): NFCSymbol[] {
        return this.symbols.filter(sym => sym !== undefined);
    }
}