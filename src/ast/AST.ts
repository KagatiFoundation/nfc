import Expr from "./Expr";
import Stmt from "./Stmt";

export type ASTKind = Expr | Stmt;

export interface AST {
    kind: ASTKind;
    operation: ASTOperation;
    left: AST | undefined;
    right: AST | undefined;
};

export class LeafAST implements AST {
    kind: ASTKind;
    operation: ASTOperation;
    left: AST | undefined;
    right: AST | undefined;

    constructor(kind: ASTKind, operation: ASTOperation) {
        this.kind = kind;
        this.operation = operation;
    }
}

export enum ASTOperation {
    AST_PLUS = 1,
    AST_MINUS = 2,
    AST_INTLIT = 3,
    AST_IDENT = 4,
    AST_VARDECL = 5
}