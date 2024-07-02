import { AST, ASTOperation } from "../ast/AST";
import Expr, { BinaryExpr, IdentifierExpr, LiteralExpr } from "../ast/Expr";
import Stmt, { VarDeclStmt } from "../ast/Stmt";
import CompilerContext from "../context/CompilerContext";
import SymbolNotFoundError from "../error/SymbolNotFoundError";
import { inferTypeFromExpr, LitType, TSPrimitive } from "../types/types";

export default class CodeGen {
    private ctx: CompilerContext;

    public constructor(ctx: CompilerContext) {
        this.ctx = ctx;
    }

    public startGen(nodes: AST[]) {
        for (const ast of nodes) {
            if (ast.operation === ASTOperation.AST_VARDECL) {
                console.log(this.genGlobalVar(ast));
            } else {
                const expr = ast.kind as Expr;
                console.log(this.genExpr(expr));
            }
        }
    }

    private genGlobalVar(stmt: AST): string {
        const varStmt = (stmt.kind as Stmt) as VarDeclStmt;
        const rawExpr = stmt.left?.kind as Expr;
        const evaledExpr = this.genExpr(rawExpr);
        let varType = "";
        const astOp = inferTypeFromExpr(rawExpr);
        if (astOp === LitType.INT) {
            varType = "w";
        } else if (astOp === LitType.STR) {
            return `data $${varStmt.name} = { b "${evaledExpr}", b 0 }`;
        }
        return `$${varStmt.name} =${varType} ${evaledExpr}`;
    }

    public genExpr(expr: Expr): string {
        if (expr instanceof BinaryExpr) {
            return this.genBinExpr(expr as BinaryExpr);
        } else if (expr instanceof LiteralExpr) {
            return this.genLitExpr(expr as LiteralExpr);
        } else if (expr instanceof IdentifierExpr) {
            return this.genIdentExpr(expr as IdentifierExpr);
        }
        console.log(expr);
        throw new Error("Unknown expression type!");
    }

    public genIdentExpr(expr: IdentifierExpr): string {
        const sym = this.ctx.symtable.get(expr.symtablePos);
        if (!sym) {
            throw new SymbolNotFoundError(expr.name);
        }
        return `%${expr.name}`;
    }

    public genLitExpr(expr: LiteralExpr): string {
        let value: TSPrimitive | undefined;
        if (expr.litType === LitType.INT) {
            value = expr.value.value as number;
        } else if (expr.litType === LitType.STR) {
            value = expr.value.value;
        }
        return value ? value.toString() : "";
    }

    public genBinExpr(expr: BinaryExpr): string {
        const leftEval = this.genExpr(expr.left);
        const rightEval = this.genExpr(expr.right);
        switch (expr.op) {
            case ASTOperation.AST_MINUS: return this.genSub(leftEval, rightEval);
            case ASTOperation.AST_PLUS: return this.genAdd(leftEval, rightEval);
        }
        return "";
    }

    public genAdd(leftVal: string, rightVal: string): string {
        return `add ${leftVal}, ${rightVal}`;
    }
    
    public genSub(leftVal: string, rightVal: string): string {
        return `sub ${leftVal}, ${rightVal}`;
    }
}