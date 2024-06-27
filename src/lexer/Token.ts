export default interface Token {
    kind: TokenKind;
    lexeme: string;
}

export enum TokenKind {
    KW_NATIVE,
    KW_DEF,
    T_IDENTIFIER,
    T_LPAREN,
    T_RPAREN,
    T_SEMICOLON,
    T_INTEGER,
    T_PLUS,
    T_MINUS
};