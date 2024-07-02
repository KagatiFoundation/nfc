import Expr, { BinaryExpr, IdentifierExpr, LiteralExpr } from "../ast/Expr";
import { NFCTypeError, TypeMismatchError } from "./error";

export enum LitType {
    INT = 'int',
    STR = 'str'
}

export type TSPrimitive = number | string | boolean;

export class LitVal {
    public value: TSPrimitive;

    public constructor(value: TSPrimitive) {
        this.value = value;
    }
}

export function inferTypeFromExpr(expr: Expr): LitType {
    if (expr instanceof LiteralExpr) {
        return expr.litType;
    }
    else if (expr instanceof BinaryExpr) {
        const left = inferTypeFromExpr(expr.left);
        const right = inferTypeFromExpr(expr.right);
        if (left !== right) {
            throw new TypeMismatchError(left, right);
        }
        return left; // 'right' could be returned as well
    } 
    else if (expr instanceof IdentifierExpr) {
        return expr.valueType;
    }
    else {
        console.log(expr);
        throw new NFCTypeError("TypeError: Unknown expression type");
    }
}