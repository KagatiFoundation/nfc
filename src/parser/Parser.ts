import { AST, ASTOperation, LeafAST } from "../ast/AST";
import { BinaryExpr, IdentifierExpr, LiteralExpr } from "../ast/Expr";
import { FuncDeclStmt, VarDeclStmt } from "../ast/Stmt";
import CompilerContext from "../context/CompilerContext";
import SymbolNotFoundError from "../error/SymbolNotFoundError";
import UnexpectedTokenError from "../error/UnexpectedTokenError";
import Token, { TokenKind } from "../lexer/Token";
import { NFCSymbol, NFCSymbolType } from "../symbol/SymbolTable";
import { TypeMismatchError } from "../types/error";
import { inferTypeFromExpr, LitType, LitVal } from "../types/types";

type ParseResult = AST | Error | undefined;

enum ParserScope {
    BLOCK,
    GLOBAL
}

interface ParserContext {
    scope: ParserScope
}

export default class Parser {
    private tokens: Token[];
    private current: number;
    private ctx: CompilerContext;
    private _pctx: ParserContext;

    constructor(ctx: CompilerContext, tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
        this.ctx = ctx;
        this._pctx = {
            scope: ParserScope.GLOBAL
        };
    }

    public parse(): AST[] {
        const nodes: AST[] = [];
        while (true) {
            if (this.currentToken().kind === TokenKind.T_EOF) {
                break;
            }
            const newAst = this.parseSingleStmt();
            if (newAst instanceof Error) {
                throw newAst;
            }
            if (newAst === undefined) continue;
            nodes.push(newAst);
        }
        return nodes;
    }

    public parseSingleStmt(): ParseResult {
        switch (this.currentToken().kind) {
            case (TokenKind.KW_LET): {
                const varDeclAst = this.parseVarDecl();
                if (varDeclAst instanceof Error) {
                    throw varDeclAst;
                }
                return varDeclAst;
            } 
            case (TokenKind.KW_DEF): {
                const funcDecl = this.parseFuncDecl();
                if (funcDecl instanceof Error) {
                    throw funcDecl;
                }
                return funcDecl;
            }
            default: {
                const result = this.parseExpr();
                if (result instanceof Error) {
                    throw result;
                }
                return result;
            }
        }
    }

    public parseFuncDecl(): ParseResult {
        this.changeScopeToLocal();
        this.consume(TokenKind.KW_DEF);
        const identExpr = this.consume(TokenKind.T_IDENTIFIER);
        if (!this.isToken(identExpr)) {
            throw identExpr;
        }
        this.consume(TokenKind.T_LPAREN);
        this.consume(TokenKind.T_RPAREN);
        this.consume(TokenKind.T_COLON);
        const retType = this.parseType();
        this.skip();
        const funcBody = this.parseCompoundStmt();
        if (funcBody instanceof Error) {
            throw funcBody;
        }
        const funcSymbol: NFCSymbol = {
            name: identExpr.lexeme || "",
            symbolType: NFCSymbolType.Function,
            valueType: retType
        };
        const funcSymPos = this.ctx.symtable.add(funcSymbol);
        return {
            kind: new FuncDeclStmt(funcSymPos),
            left: funcBody,
            right: undefined,
            operation: ASTOperation.AST_FUNCDECL
        };
    }

    private parseType(): LitType {
        switch (this.currentToken().kind) {
            case TokenKind.KW_INT: {
                return LitType.INT;
            }
            case TokenKind.KW_STR: {
                return LitType.STR;
            }
            default: {
                throw new UnexpectedTokenError(this.currentToken());
            }
        }
    }

    public parseCompoundStmt(): ParseResult {
        this.consume(TokenKind.T_LBRACE);
        let tree: ParseResult | undefined = undefined;
        while (true) {
            if (this.tokens[this.current].kind === TokenKind.T_RBRACE) {
                this.skip();
                break;
            }
            const stmt = this.parseSingleStmt();
            if (stmt instanceof Error) {
                throw stmt;
            }
            if (tree === undefined) {
                tree = stmt;
                continue;
            } 
            if (tree instanceof Error) {
                throw tree;
            }
            tree = {
                kind: undefined,
                left: tree,
                right: stmt,
                operation: ASTOperation.AST_GLUE
            };
        }
        return tree;
    }

    public parseVarDecl(): ParseResult {
        this.consume(TokenKind.KW_LET);
        const identExpr = this.consume(TokenKind.T_IDENTIFIER);
        if (identExpr instanceof Error) {
            throw identExpr; // because this resolves into an error
        }
        this.consume(TokenKind.T_EQUAL); // expect '='
        const assignExpr = this.parseExpr();
        if (assignExpr instanceof Error) {
            throw assignExpr;
        }
        this.consume(TokenKind.T_SEMICOLON);
        this.ctx.symtable.add({
            name: identExpr.lexeme || "",
            symbolType: NFCSymbolType.Variable,
            valueType: inferTypeFromExpr(assignExpr!.kind!)
        });
        return {
            kind: new VarDeclStmt(identExpr.lexeme || ""),
            left: assignExpr,
            right: undefined,
            operation: ASTOperation.AST_VARDECL
        }
    }

    public parseExpr(): ParseResult {
        return this.parseBinary();
    }

    public parseBinary(): ParseResult {
        const left = this.parsePrimary();
        if (left instanceof Error) {
            throw left;
        }
        const currentTokKind = this.currentToken().kind;
        if ([TokenKind.T_PLUS, TokenKind.T_MINUS].indexOf(currentTokKind) === -1) {
            return left;
        }
        if (this.currentToken().kind === TokenKind.T_EOF) {
            return left;
        }
        const astOp = this.getASTOperationFromTokenKind(this.currentToken().kind);
        this.skip();
        const right = this.parseBinary();
        if (right instanceof Error) {
            throw right;
        }
        const typeOfLeft = inferTypeFromExpr(left!.kind!);
        const typeOfRight = inferTypeFromExpr(right!.kind!);
        if (typeOfLeft !== typeOfRight) {
            throw new TypeMismatchError(typeOfLeft, typeOfRight, `for operation '${astOp}'`);
        }
        return new LeafAST(
            new BinaryExpr(left!.kind!, right!.kind!, astOp),
            astOp
        );
    }

    public parsePrimary(): ParseResult {
        const current = this.currentToken();
        switch (current.kind) {
            case TokenKind.T_INTEGER: {
                this.skip(); // skip past an integer literal
                return new LeafAST(
                    new LiteralExpr(new LitVal(parseInt(current.lexeme || "0")), LitType.INT),
                    ASTOperation.AST_INTLIT
                );
            }
            case TokenKind.T_STRING: {
                this.skip();
                return new LeafAST(
                    new LiteralExpr(new LitVal(current.lexeme || ""), LitType.STR),
                    ASTOperation.AST_STRLIT
                );
            }
            case TokenKind.T_IDENTIFIER: {
                const identName = current.lexeme || "";
                this.skip();
                if (identName === "") {
                    throw new Error("Invalid identifier name.");
                }
                const result = this.ctx.symtable.find(identName);
                if (result) {
                    return new LeafAST(
                        new IdentifierExpr(result[0], result[1].valueType, identName),
                        ASTOperation.AST_IDENT
                    );
                } else {
                    throw new SymbolNotFoundError(identName);
                }
            }
            default: {
                throw new Error("Unimplemented! " + current.lexeme + " " + current.kind);
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
            return new Error(`Unexpected token '${this.tokens[this.current].lexeme}'`);
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

    private changeScopeToLocal() {
        this._pctx.scope = ParserScope.BLOCK;
    }

    private changeScopeToGlobal() {
        this._pctx.scope = ParserScope.BLOCK;
    }

    private isToken(result: Token | Error): result is Token {
        return (result as Token).kind !== undefined;
    }
}