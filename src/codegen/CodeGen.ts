import { AST, ASTOperation } from "../ast/AST";
import Expr, { BinaryExpr, LiteralExpr } from "../ast/Expr";
import { LitType, TSPrimitive } from "../types/types";

export enum RegisterState {
    ALLOCED,
    FREE
}

export interface Register {
    name: string;
    state: RegisterState;
}

export class RegisterManager {
    private regList: Register[] = [];

    public constructor(regs?: Register[]) {
        if (regs) {
            this.regList = regs;
        }
    }

    public name(idx: number): string {
        if (idx < 0 || idx > this.regList.length) {
            throw new Error("Invalid register index given.");
        }
        return this.regList[idx].name;
    }

    public allocate(): number {
        for (let i = 0; i < this.regList.length; i++) {
            const reg = this.regList[i];
            if (reg.state === RegisterState.FREE) {
                reg.state = RegisterState.ALLOCED;
                return i;
            }
        }
        throw new Error("Register exhausation.");
    }

    public deallocate(idx: number) {
        if (idx < 0 || idx > this.regList.length) {
            throw new Error("Invalid register index given to free.");
        }
        this.regList[idx].state = RegisterState.FREE;
    }
}

export default class CodeGen {
    private regMngr: RegisterManager;

    public constructor() {
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
        ]);
    }

    public genFromAST(ast: AST): number {
        if (ast instanceof Expr) {
            return this.genExpr(ast);
        } else {
            throw new Error("Only expressions are supported for now.");
        }
    }

    public genExpr(expr: Expr): number {
        if (expr instanceof BinaryExpr) {
            return this.genBinExpr(expr);
        } else if (expr instanceof LiteralExpr) {
            return this.genLitExpr(expr);
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
}