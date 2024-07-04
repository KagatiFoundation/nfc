import { AST, ASTOperation } from "../ast/AST";
import Expr, { BinaryExpr, IdentifierExpr, LiteralExpr } from "../ast/Expr";
import { FuncDeclStmt, ReturnStmt, VarDeclStmt } from "../ast/Stmt";
import CompilerContext from "../context/CompilerContext";
import { SymbolNotFoundError } from "../error/errors";
import { QBEType } from "../qbe/types";
import { NFCSymbolClass } from "../symbol/SymbolTable";
import { inferTypeFromExpr, LitType } from "../types/types";

interface CodeGenContext {
    emittingBinExpr: boolean;
    emittingFuncStmt: boolean;
}

export default class CodeGen {
    private ctx: CompilerContext;
    private cgCtx: CodeGenContext;

    public constructor(ctx: CompilerContext) {
        this.ctx = ctx;
        this.cgCtx = {
            emittingBinExpr: false,
            emittingFuncStmt: false
        };
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
        else if (ast.operation === ASTOperation.AST_RETURN) {
            return this.genReturnStmt(ast);
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
            export function ${this.nfcTypeToQBEType(funcRetType)} $${funcSym.name}() {
            @start
                ${funcBodyText}
                ${funcRetType === LitType.VOID ? "ret 0" : ""}
            }
            `;
        return funcText;
    }

    private nfcTypeToQBEType(typ: LitType): QBEType {
        switch (typ) {
            case LitType.INT:
            case LitType.VOID: {
                return QBEType.W; // word type
            }
            default: {
                throw new Error(`NFC type '${typ}' doesn't have a corresponding type in QBE.`);
            }
        }
    }

    private genReturnStmt(stmt: AST): string {
        const returtnStmt = stmt.kind as ReturnStmt;
        const funcSym = this.ctx.symtable.get(returtnStmt.functionId);
        if (!funcSym) {
            throw new Error("Function is not found!");
        }
        let exprEvaled: string | undefined = undefined;
        if (stmt.left) {
            exprEvaled = this.genExpr(stmt.left?.kind as Expr);
        }
        const tempVarName = this.createRandomString(16);
        if (funcSym.valueType === LitType.VOID) {
            return 'ret 0';
        }
        const funcRetType = this.nfcTypeToQBEType(funcSym.valueType);
        const retVal = `%${tempVarName} =${funcRetType} ${exprEvaled}`;
        return `${retVal}\nret %${tempVarName}`;
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
        const varPrefix = varStmt.symClass === NFCSymbolClass.GLOBAL ? "$" : "%";
        return `${varPrefix}${varStmt.name} =${varType} ${evaledExpr}\n`;
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
        const ebe = this.cgCtx.emittingBinExpr;
        if (expr.litType === LitType.INT) {
            /// In QBE, all instructions must have an operation, 
            /// so add with zero is used here to simply load an immediate value.
            return !ebe ? `add ${expr.value.value}, 0` : `${expr.value.value}`;
        } else if (expr.litType === LitType.STR) {
            return expr.value.value.toString();
        }
        return "";
    }

    public genBinExpr(expr: BinaryExpr): string {
        this.cgCtx.emittingBinExpr = true;
        const leftEval = this.genExpr(expr.left);
        const rightEval = this.genExpr(expr.right);
        let returnVal = "";
        switch (expr.op) {
            case ASTOperation.AST_MINUS: {
                returnVal = this.genSub(leftEval, rightEval);
            }
            case ASTOperation.AST_PLUS: {
                returnVal = this.genAdd(leftEval, rightEval);
            }
        }
        this.cgCtx.emittingBinExpr = false;
        return returnVal;
    }

    public genAdd(leftVal: string, rightVal: string): string {
        return `add ${leftVal}, ${rightVal}`;
    }
    
    public genSub(leftVal: string, rightVal: string): string {
        return `sub ${leftVal}, ${rightVal}`;
    }

    private createRandomString(length: number) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < length; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }      
}