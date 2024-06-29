import Expr from "./Expr";

export default abstract class Stmt {}

export class VarDeclStmt extends Stmt {
    public name: string;
    public expr: Expr;

    constructor(name: string, expr: Expr) {
        super();
        this.name = name;
        this.expr = expr;
    }
}