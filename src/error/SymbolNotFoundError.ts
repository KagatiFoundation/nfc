export default class SymbolNotFoundError extends Error {
    constructor(symName: string) {
        super(`UndefinedSymbolError: Symbol not found '${symName}'`);
    }
}