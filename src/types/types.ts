import { ASTOperation } from "../ast/AST";
import Expr, { BinaryExpr, IdentifierExpr, LiteralExpr } from "../ast/Expr";
import { NFCTypeError, TypeMismatchError } from "../error/errors";

export enum LitType {
    INT = 'int',
    STR = 'str',
    VOID = 'void'
}

export type TSPrimitive = number | string | boolean;

export class LitVal {
    public value: TSPrimitive;

    public constructor(value: TSPrimitive) {
        this.value = value;
    }
}

const typePrecedence: Record<LitType, number> = {
    [LitType.INT]: 1,
    [LitType.STR]: 2,
    [LitType.VOID]: -1
}

/**
 * @throws `TypeMismatchError`
 */
export function inferTypeFromExpr(expr: Expr): LitType {
    if (expr instanceof LiteralExpr) {
        return expr.litType;
    }
    else if (expr instanceof BinaryExpr) {
        const left = inferTypeFromExpr(expr.left);
        const right = inferTypeFromExpr(expr.right);
        if (left === LitType.STR || right === LitType.STR) {
            if (expr.op === ASTOperation.AST_PLUS) {
                return LitType.STR;
            }
            throw new TypeMismatchError(left, right);
        }
        if (left !== right) {
            return typePrecedence[left] > typePrecedence[right] ? left : right;
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