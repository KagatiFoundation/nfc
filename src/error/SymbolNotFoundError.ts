export default class SymbolNotFoundError extends Error {
    constructor(symName: string) {
        super(`Error: Symbol not found '${symName}'`);
    }
}