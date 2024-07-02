import Expr from "./Expr";
import Stmt from "./Stmt";

export type ASTKind = Expr | Stmt;

export interface AST {
    kind: ASTKind | undefined;
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
    AST_PLUS = "+",
    AST_MINUS = "-",
    AST_INTLIT = "int",
    AST_IDENT = "identifier",
    AST_VARDECL = "let",
    AST_STRLIT = "string",
    AST_FUNCDECL = "def",
    AST_GLUE = "glue"
}