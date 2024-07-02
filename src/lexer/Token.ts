export default interface Token {
    kind: TokenKind;
    lexeme?: string;
}

export enum TokenKind {
    KW_NATIVE = 1,
    KW_DEF = 2,
    T_IDENTIFIER = 3,
    T_LPAREN = 4,
    T_RPAREN = 5,
    T_SEMICOLON = 6,
    T_INTEGER = 7,
    T_PLUS = 8,
    T_MINUS = 9,
    T_EQUAL = 16,
    T_EOF = 10,
    KW_LET = 11,
    T_STRING = 12,
    T_LBRACE = 13,
    T_RBRACE = 14,
    T_NONE = 15,
    T_COLON = 16,
    KW_INT = 17,
    KW_STR = 18
};