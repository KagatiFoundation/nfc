import Token, { TokenKind } from "./Token";

export default class Lexer {
    private readonly input: string;
    private position: {
        line: number;
        column: number;
    };
    private current: number;
    private keywords: { [key: string]: TokenKind };

    constructor(input: string) {
        this.input = input;
        this.position = {
            line: 1,
            column: 1
        }
        this.current = 0;
        this.keywords = {
            "let": TokenKind.KW_LET,
            "def": TokenKind.KW_DEF,
            "int": TokenKind.KW_INT,
            "str": TokenKind.KW_STR,
            "void": TokenKind.KW_VOID
        };
    }
    
    public startScan(): Token[] {
        const tokens: Token[] = [];
        while (true) {
            const newToken = this.scanToken();
            if (newToken.kind === TokenKind.T_EOF) {
                tokens.push(newToken);
                break;
            }
            if (newToken.kind !== TokenKind.T_NONE) {
                tokens.push(newToken);
            }
        }
        return tokens;
    }

    private scanToken(): Token {
        const char: string | undefined = this.nextChar();
        if (char === undefined) {
            return { kind: TokenKind.T_EOF };
        }
        switch (char) {
            case ';':
                return { kind: TokenKind.T_SEMICOLON, lexeme: ';' };
            case '(':
                return { kind: TokenKind.T_LPAREN, lexeme: '(' };
            case ')':
                return { kind: TokenKind.T_RPAREN, lexeme: ')' };
            case '{':
                return { kind: TokenKind.T_LBRACE, lexeme: '{' };
            case '}':
                return { kind: TokenKind.T_RBRACE, lexeme: '}' };
            case '=':
                return { kind: TokenKind.T_EQUAL, lexeme: '=' };
            case '+':
                return { kind: TokenKind.T_PLUS, lexeme: '+' };
            case '-':
                return { kind: TokenKind.T_MINUS, lexeme: '-' };
            case ' ':
                return { kind: TokenKind.T_NONE };
            case ':':
                return { kind: TokenKind.T_COLON, lexeme: ':' }
            case '\n': {
                this.position.line += 1;
                this.position.column = 1;
                return { kind: TokenKind.T_NONE };
            }
            default: {
                if (char.match(/[0-9]/)) {
                    return this.scanNumeric(this.current - 1);
                } else if (char === '"') {
                    return this.scanString();
                } else if (this.isLetter(char)) {
                    const ident = this.scanIdentifier(char);
                    const keyword = this.keywords[ident.lexeme!];
                    if (keyword) {
                        ident.kind = keyword;
                    }
                    return ident;
                }
                return { kind: TokenKind.T_NONE };
            }
        }
    }

    private scanIdentifier(firstChar: string): Token {
        let lexeme = firstChar;
        while (true) {
            const char = this.nextChar();
            if (!char || !this.isLetter(char)) {
                this.current -= 1; // Unread the character
                this.position.column -= 1;
                break;
            }
            lexeme += char;
        }
        return {
            kind: TokenKind.T_IDENTIFIER,
            lexeme
        };
    }

    private scanString(): Token {
        let lexeme = "";
        while (true) {
            const char = this.nextChar();
            if (!char || char === '"') { 
                break; 
            }
            if (char === '\\') {
                // Handle escape sequences
                const nextChar = this.nextChar();
                if (!nextChar) {
                    break;
                }
                switch (nextChar) {
                    case 'n':
                        lexeme += '\n';
                        break;
                    case 't':
                        lexeme += '\t';
                        break;
                    case '"':
                        lexeme += '"';
                        break;
                    default:
                        lexeme += '\\' + nextChar;
                        break;
                }
            } else {
                lexeme += char;
            }
        }
        return {
            kind: TokenKind.T_STRING,
            lexeme
        };
    }

    private scanNumeric(position: number): Token {
        let curr = position;
        let lexeme = "";
        while (this.input[curr].match(/[0-9]/)) {
            lexeme += this.input[curr];
            curr += 1;
            this.position.column += 1;
        }
        this.current = curr;
        return {
            kind: TokenKind.T_INTEGER,
            lexeme
        };
    }

    private nextChar(): string | undefined {
        if (this.eof()) {
            return undefined;
        }
        const curr = this.current;
        this.current += 1;
        this.position.column += 1;
        return this.input[curr];
    }

    private eof(): boolean {
        return this.current >= this.input.length;
    }

    private isLetter(char: string) {
        return char.length === 1 && /[a-zA-Z_]/.test(char);
    }
}