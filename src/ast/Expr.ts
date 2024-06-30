import { LitType, LitVal } from "../types/types";
import { ASTOperation } from "./AST";

export default abstract class Expr {

}

export class BinaryExpr extends Expr {
    public left: Expr;
    public right: Expr;
    public op: ASTOperation; 

    constructor(left: Expr, right: Expr, op: ASTOperation) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }

    public containsIdentifiers(): boolean {
        if (this.left instanceof IdentifierExpr || this.right instanceof IdentifierExpr) {
            return true;
        }
        if (this.left instanceof BinaryExpr && this.left.containsIdentifiers()) {
            return true;
        }
        if (this.right instanceof BinaryExpr && this.right.containsIdentifiers()) {
            return true;
        }
        return false;
    }
}

export class LiteralExpr extends Expr {
    public litType: LitType;
    public value: LitVal;

    constructor(value: LitVal, typ: LitType) {
        super();
        this.value = value;
        this.litType = typ;
    }
}

export class IdentifierExpr extends Expr {
    /**
     * Position of this identifier in a symbol table.
     */
    public symtablePos: number;

    /**
     * Type of this identifier.
     */
    public valueType: LitType;

    constructor(symtablePos: number, valueType: LitType) {
        super();
        this.symtablePos = symtablePos;
        this.valueType = valueType;
    }
}

export class AssignExpr extends Expr {

}