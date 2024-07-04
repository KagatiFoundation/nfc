import { NFCSymbolClass } from "../symbol/SymbolTable";

export default abstract class Stmt {}

export class VarDeclStmt extends Stmt {
    public name: string;
    public symClass: NFCSymbolClass;

    constructor(name: string, klass: NFCSymbolClass) {
        super();
        this.name = name;
        this.symClass = klass;
    }
}

export interface ParameterList {

}

export class FuncDeclStmt extends Stmt {
    public symtablePos: number;

    constructor(symPos: number) {
        super();
        this.symtablePos = symPos;
    }
}