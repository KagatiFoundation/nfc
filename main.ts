import { ASTOperation } from "./src/ast/AST";
import { BinaryExpr, LiteralExpr } from "./src/ast/Expr";
import CodeGen from "./src/codegen/CodeGen";
import { LitType, LitVal } from "./src/types/types";


(function main() {
    const cg = new CodeGen();
    const expr = new BinaryExpr(
        new BinaryExpr(
            new LiteralExpr(new LitVal(10), LitType.INT),
            new LiteralExpr(new LitVal(2), LitType.INT),
            ASTOperation.AST_MINUS
        ),
        new LiteralExpr(new LitVal(5), LitType.INT),
        ASTOperation.AST_PLUS
    )
    cg.genFromAST(expr);
})();