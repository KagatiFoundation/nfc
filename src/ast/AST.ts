import Expr from "./Expr";
import Stmt from "./Stmt";

export type AST = Expr | Stmt;

export enum ASTOperation {
    AST_PLUS = 1,
    AST_MINUS = 2
}