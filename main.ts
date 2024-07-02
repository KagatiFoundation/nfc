import CodeGen from "./src/codegen/CodeGen";
import CompilerContext from "./src/context/CompilerContext";
import Lexer from "./src/lexer/Lexer";
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
        symtable,
    };
    try {
        const lexer = new Lexer(`def random(): int { let a = 23; let b = 12; let c = a + b + ""; }`);
        const tokens = lexer.startScan();
        const p = new Parser(
            ctx, 
            tokens
        );
        const result = p.parse();
        const cg = new CodeGen(ctx);
        cg.startGen(result);
    } catch (error) {
        console.log(error);
    }
})();