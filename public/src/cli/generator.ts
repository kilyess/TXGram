import { expandToNode, joinToNode, toString } from "langium/generate";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Diagram } from "../language/generated/ast.js";
import { extractDestinationAndName } from "./cli-util.js";

export function generateJavaScript(
    diagram: Diagram,
    filePath: string,
    destination: string | undefined
): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    const fileNode = expandToNode`
        "use strict";

        ${joinToNode(
            diagram.name,
            (name) => `console.log('Diagram ${name}');`,
            { appendNewLineIfNotEmpty: true }
        )}
    `.appendNewLineIfNotEmpty();

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}
