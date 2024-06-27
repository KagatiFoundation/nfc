import { AST } from "../ast/AST";
import Token, { TokenKind } from "../lexer/Token";

export default class Parser {
    private tokens: Token[];
    private current: number;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.current = 0;
    }

    public parse() {
    }

    public parseExpr() {

    }

    public parseLiteral() {

    }

    private consume(kind: TokenKind): Token | Error {
        if (this.tokens[this.current].kind !== kind) {
            return new Error(`Unexpected token '${this.tokens[this.current]}'`);
        }
        const resultToken = this.tokens[this.current];
        this.current += 1;
        return resultToken;
    }
}

export type ParseResult = AST | Error;