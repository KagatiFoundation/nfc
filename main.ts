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
        const lexer = new Lexer(
            `let globalVar: str = "my name is ramesh poudel"; 
             def random(input: int): int { 
                let a: int = 23; 
                let b: int = 12 + 12; 
             }`
            );
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