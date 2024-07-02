import { AST, ASTOperation } from "../ast/AST";
import Expr, { BinaryExpr, IdentifierExpr, LiteralExpr } from "../ast/Expr";
import Stmt, { FuncDeclStmt, VarDeclStmt } from "../ast/Stmt";
import CompilerContext from "../context/CompilerContext";
import SymbolNotFoundError from "../error/SymbolNotFoundError";
import { QBEType } from "../qbe/types";
import { inferTypeFromExpr, LitType, TSPrimitive } from "../types/types";

export default class CodeGen {
    private ctx: CompilerContext;

    public constructor(ctx: CompilerContext) {
        this.ctx = ctx;
    }

    public startGen(nodes: AST[]) {
        for (const ast of nodes) {
            console.log(this.genFromAST(ast));
        }
    }

    private genFromAST(ast: AST): string {
        if (ast.operation === ASTOperation.AST_VARDECL) {
            return this.genGlobalVar(ast);
        } 
        else if (ast.operation === ASTOperation.AST_FUNCDECL) {
            return this.genFuncDecl(ast);
        }
        else if (ast.operation === ASTOperation.AST_GLUE) {
            let leftText = "";
            let rightText = "";
            if (ast.left) {
                leftText = this.genFromAST(ast.left);
            }
            if (ast.right) {
                rightText = this.genFromAST(ast.right);
            }
            return `${leftText} ${rightText}`;
        }
        else {
            const expr = ast.kind as Expr;
            return this.genExpr(expr);
        }
    }

    private genFuncDecl(stmt: AST): string {
        const funcStmt = stmt.kind as FuncDeclStmt;
        const funcSym = this.ctx.symtable.get(funcStmt.symtablePos);
        if (funcSym === undefined) {
            throw new Error("Function symbol not properly added to the symbol table. This is a developer's mistake.");
        }
        const funcRetType = funcSym.valueType;
        let funcBodyText = '';
        if (stmt.left) {
            funcBodyText = this.genFromAST(stmt.left);
        }
        let funcText = `
function ${this.nfcTypeToQBEType(funcRetType)} ${funcSym.name}() {\n
@start
    ${funcBodyText}
}
        `;
        return funcText;
    }

    private nfcTypeToQBEType(typ: LitType): QBEType {
        switch (typ) {
            case LitType.INT: {
                return QBEType.W; // word type
            }
            default: {
                throw new Error(`NFC type '${typ}' doesn't have a corresponding type in QBE.`);
            }
        }
    }

    private genGlobalVar(stmt: AST): string {
        const varStmt = stmt.kind as VarDeclStmt;
        const rawExpr = stmt.left?.kind as Expr;
        const evaledExpr = this.genExpr(rawExpr);
        let varType = "";
        const astOp = inferTypeFromExpr(rawExpr);
        if (astOp === LitType.INT) {
            varType = "w";
        } else if (astOp === LitType.STR) {
            return `data $${varStmt.name} = { b "${evaledExpr}", b 0 }\n`;
        }
        return `$${varStmt.name} =${varType} ${evaledExpr}\n`;
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