import Token from "../lexer/Token";

export default class UnexpectedTokenError extends Error {
    constructor(token: Token) {
        super(`UnexpectedTokenError: Unexpected token '${token.lexeme}'`);
    }
}