import { LitType, LitVal, TSPrimitive } from "../types/types";
import { ASTOperation } from "./AST";

export default abstract class Expr {
    public abstract eval(): LitVal;
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
    
    public eval(): LitVal {
        let leftRes: LitVal = this.left.eval();
        let rightRes: LitVal = this.right.eval();
        switch (this.op) {
            case ASTOperation.AST_PLUS: {
                if (typeof leftRes.value === "number" && typeof rightRes.value === "number") {
                    return new LitVal(leftRes.value + rightRes.value);
                } else {
                    throw new Error(`Can't perform addition on types: '${typeof leftRes.value}' and '${typeof rightRes.value}'`)
                }
            }
            case ASTOperation.AST_MINUS: {
                if (typeof leftRes.value === "number" && typeof rightRes.value === "number") {
                    return new LitVal(leftRes.value - rightRes.value);
                } else {
                    throw new Error(`Can't perform subtraction on types: '${typeof leftRes.value}' and '${typeof rightRes.value}'`)
                }
            }
        }
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

    public eval(): LitVal {
        return this.value;
    }
}