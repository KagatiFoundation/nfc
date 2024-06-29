import { AST, ASTOperation } from "../ast/AST";
import Expr, { BinaryExpr, IdentifierExpr, LiteralExpr } from "../ast/Expr";
import Stmt, { VarDeclStmt } from "../ast/Stmt";
import CompilerContext from "../context/CompilerContext";
import RegisterManager, { RegisterState } from "../register/RegisterManager";
import { NFCSymbol } from "../symbol/SymbolTable";
import { LitType, TSPrimitive } from "../types/types";

export default class CodeGen {
    private regMngr: RegisterManager;
    private ctx: CompilerContext;

    public constructor(ctx: CompilerContext) {
        this.ctx = ctx;
        this.regMngr = new RegisterManager([
            {
                name: "x0",
                state: RegisterState.FREE
            },
            {
                name: "x1",
                state: RegisterState.FREE
            },
            {
                name: "x2",
                state: RegisterState.FREE
            },
            {
                name: "x3",
                state: RegisterState.FREE
            },
            {
                name: "x4",
                state: RegisterState.FREE
            },
            {
                name: "x5",
                state: RegisterState.FREE
            },
            {
                name: "x6",
                state: RegisterState.FREE
            },
            {
                name: "x7",
                state: RegisterState.FREE
            },
        ]);
    }

    public startGen(nodes: AST[]) {
        // search for global var decls in the symbol table and 
        // generate a code for them first
        console.log(".data");
        for (const sym of this.ctx.symtable.array()) {
            this.genGlobalVar(sym);
        }
        console.log("\n.text");
        for (const ast of nodes) {
            if (ast instanceof Expr) {
                this.genFromAST(ast);
            }
        }
    }

    public genFromAST(ast: AST): number {
        if (ast instanceof Expr) {
            return this.genExpr(ast);
        } else {
            throw new Error("Only expressions are supported for now.");
        }
    }

    private genGlobalVar(sym: NFCSymbol) {
        console.log(`.global ${sym.name}`);
        console.log(`${sym.name}:`);
        switch (sym.valueType) {
            case LitType.INT: {
                console.log(`.word 0`);
            }
        }
    }

    public genExpr(expr: Expr): number {
        if (expr instanceof BinaryExpr) {
            return this.genBinExpr(expr);
        } else if (expr instanceof LiteralExpr) {
            return this.genLitExpr(expr);
        } else if (expr instanceof IdentifierExpr) {
            return this.genIdentExpr(expr);
        }
        return -1;
    }

    public genLitExpr(expr: LiteralExpr): number {
        let value: TSPrimitive | undefined;
        if (expr.litType === LitType.INT) {
            value = expr.value.value as number;
        }
        const reg = this.regMngr.allocate();
        console.log(`mov ${this.regMngr.name(reg)}, ${value ?? ""}`);
        return reg;
    }

    public genBinExpr(expr: BinaryExpr): number {
        const leftReg = this.genExpr(expr.left);
        const rightReg = this.genExpr(expr.right);
        switch (expr.op) {
            case ASTOperation.AST_MINUS: return this.genMinus(leftReg, rightReg);
            case ASTOperation.AST_PLUS: return this.genAdd(leftReg, rightReg);
        }
    }

    public genAdd(leftReg: number, rightReg: number): number {
        const lrn = this.regMngr.name(leftReg);
        const rrn = this.regMngr.name(rightReg);
        console.log(`add ${lrn}, ${lrn}, ${rrn}`);
        this.regMngr.deallocate(rightReg);
        return leftReg;
    }
    
    public genMinus(leftReg: number, rightReg: number): number {
        const lrn = this.regMngr.name(leftReg);
        const rrn = this.regMngr.name(rightReg);
        console.log(`sub ${lrn}, ${lrn}, ${rrn}`);
        this.regMngr.deallocate(rightReg);
        return leftReg;
    }

    public genIdentExpr(expr: IdentifierExpr): number {
        const valueReg = this.regMngr.allocate();
        const valueRegName = this.regMngr.name(valueReg);
        return 0;
    }
}