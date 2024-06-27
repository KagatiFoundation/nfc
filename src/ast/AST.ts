import Expr from "./Expr";
import Stmt from "./Stmt";

export type AST = Expr | Stmt;

export enum ASTOperation {
    AST_PLUS,
    AST_MINUS
}