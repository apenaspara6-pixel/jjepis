import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const queries = new Set();
function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { scan(file); continue; }
    if (!/\.tsx?$/.test(file) || file.endsWith("storage-queries.ts")) continue;
    const ast = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "prepare" && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) queries.add(node.arguments[0].text);
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
}
scan("app"); scan("lib");
fs.writeFileSync("lib/storage-queries.ts", "// Generated from the application's prepared statements. Never accept arbitrary SQL.\nexport const storageQueries: string[] = " + JSON.stringify([...queries].sort(), null, 2) + ";\n");
console.log("Storage query allowlist updated (" + queries.size + " statements)");
