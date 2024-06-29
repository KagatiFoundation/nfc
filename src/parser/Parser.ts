import { AST, ASTOperation } from "../ast/AST";
import Expr, { BinaryExpr, IdentifierExpr, LiteralExpr } from "../ast/Expr";
import { VarDeclStmt } from "../ast/Stmt";
import CompilerContext from "../context/CompilerContext";
import SymbolNotFoundError from "../error/SymbolNotFoundError";
import Token, { TokenKind } from "../lexer/Token";
import { NFCSymbolType } from "../symbol/SymbolTable";
import { inferTypeFromExpr, LitType, LitVal } from "../types/types";

type ParseResult = AST | Error;

export default class Parser {
    private tokens: Token[];
    private current: number;
    private ctx: CompilerContext;

    constructor(ctx: CompilerContext, tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
        this.ctx = ctx;
    }

    public parse(): AST[] {
        const nodes: AST[] = [];
        switch (this.currentToken().kind) {
            case (TokenKind.KW_LET): {
                const varDeclAst = this.parseVarDecl();
                nodes.push(varDeclAst);
                break;
            } 
            case TokenKind.T_EOF:
                break;
            default:
                nodes.push(this.parseExpr());
        }
        return nodes;
    }

    public parseVarDecl(): ParseResult {
        this.consume(TokenKind.KW_LET);
        const identExpr = this.consume(TokenKind.T_IDENTIFIER);
        if (identExpr instanceof Error) {
            throw identExpr; // because this resolves into an error
        }
        this.consume(TokenKind.T_EQUAL); // expect '='
        const assignExpr = this.parseBinary();
        this.consume(TokenKind.T_SEMICOLON);
        this.ctx.symtable.add({
            name: identExpr.lexeme || "",
            symbolType: NFCSymbolType.Variable,
            valueType: inferTypeFromExpr(assignExpr)
        });
        return new VarDeclStmt(identExpr.lexeme || "", assignExpr);
    }

    public parseExpr(): AST {
        return this.parseBinary();
    }

    public parseBinary(): ParseResult {
        const left = this.parsePrimary();
        if (this.currentToken().kind === TokenKind.T_EOF) {
            return left;
        }
        const astOp = this.getASTOperationFromTokenKind(this.currentToken().kind);
        this.skip();
        const right = this.parseBinary();
        return new BinaryExpr(left, right, astOp);
    }

    public parsePrimary(): ParseResult {
        const current = this.currentToken();
        switch (current.kind) {
            case TokenKind.T_INTEGER: {
                this.skip(); // skip past an integer literal
                return new LiteralExpr(new LitVal(parseInt(current.lexeme || "0")), LitType.INT);
            }
            case TokenKind.T_IDENTIFIER: {
                const identName = current.lexeme || "";
                this.skip();
                if (identName === "") {
                    throw new Error("Invalid identifier name.");
                }
                const result = this.ctx.symtable.find(identName);
                if (result) {
                    return new IdentifierExpr(result[0], result[1].valueType);
                } else {
                    throw new SymbolNotFoundError(identName);
                }
            }
            default: {
                throw new Error("Unimplemented!");
            }
        }
    }

    private getASTOperationFromTokenKind(kind: TokenKind): ASTOperation {
        switch (kind) {
            case TokenKind.T_PLUS: 
                return ASTOperation.AST_PLUS;
            case TokenKind.T_MINUS:
                return ASTOperation.AST_MINUS;
            default:
                throw new Error("Unimplemented! Cannot form an AST operation from given TokenKind.");
        }
    }

    private consume(kind: TokenKind): Token | Error {
        if (this.current >= this.tokens.length || this.tokens[this.current].kind !== kind) {
            return new Error(`Unexpected token '${this.tokens[this.current]}'`);
        }
        const resultToken = this.tokens[this.current];
        this.skip();
        return resultToken;
    }

    private skip() {
        this.current += 1;
    }

    private currentToken(): Token {
        if (this.current >= this.tokens.length) {
            return {
                kind: TokenKind.T_EOF,
                lexeme: ""
            };
        }
        return this.tokens[this.current];
    }
}