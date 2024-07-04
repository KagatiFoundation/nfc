import CodeGen from "./src/codegen/CodeGen";
import CompilerContext from "./src/context/CompilerContext";
import Lexer from "./src/lexer/Lexer";
import Parser from "./src/parser/Parser";
import SymbolTable from "./src/symbol/SymbolTable";

(function main() {
    const symtable = new SymbolTable();
    const ctx: CompilerContext = {
        symtable,
    };
    try {
        const lexer = new Lexer(`def random(): int { let a = 23; let b = 12 + 12; return ""; }`);
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