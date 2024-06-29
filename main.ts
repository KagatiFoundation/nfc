import { ASTOperation } from "./src/ast/AST";
import { BinaryExpr, LiteralExpr } from "./src/ast/Expr";
import Stmt, { VarDeclStmt } from "./src/ast/Stmt";
import CodeGen from "./src/codegen/CodeGen";
import CompilerContext from "./src/context/CompilerContext";
import { TokenKind } from "./src/lexer/Token";
import Parser from "./src/parser/Parser";
import SymbolTable, { NFCSymbolType } from "./src/symbol/SymbolTable";
import { LitType } from "./src/types/types";

(function main() {
    const symtable = new SymbolTable();
    symtable.add({
        name: "number",
        symbolType: NFCSymbolType.Variable,
        valueType: LitType.INT
    });

    const ctx: CompilerContext = {
        symtable
    };
    const p = new Parser(
        ctx, 
        [
            {
                kind: TokenKind.T_INTEGER,
                lexeme: "2"
            },
            {
                kind: TokenKind.T_PLUS,
            },
            {
                kind: TokenKind.T_IDENTIFIER,
                lexeme: "number"
            },
        ]
    );
    const result = p.parse();
    const cg = new CodeGen(ctx);
    cg.startGen(result);
})();