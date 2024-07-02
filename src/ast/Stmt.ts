export default abstract class Stmt {}

export class VarDeclStmt extends Stmt {
    public name: string;

    constructor(name: string) {
        super();
        this.name = name;
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