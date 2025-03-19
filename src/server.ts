import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { executorMap } from "./constants.js";
import { exec } from "child_process";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Code Runner",
    version: "0.1.0",
  });

  server.tool(
    "run-code",
    "Run code snippet and return the result.",
    {
      code: z.string().describe("Code Snippet"),
      languageId: z.string().describe("Language ID"),
    },
    async ({ code, languageId }) => {
      if (!code) {
        throw new Error("Code is required.");
      }

      if (!languageId) {
        throw new Error("Language ID is required.");
      }

      const executor = executorMap[languageId as keyof typeof executorMap];

      if (!executor) {
        throw new Error(`Language '${languageId}' is not supported.`);
      }

      const filePath = await createTmpFile(code, languageId);
      const command = `${executor} "${filePath}"`;

      const result = await executeCommand(command);

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    },
  );

  return server;
}

async function createTmpFile(content: string, languageId: string) {
  const tmpDir = os.tmpdir();
  const fileName = `tmp.${languageId}`;
  const filePath = path.join(tmpDir, fileName);

  await fs.promises.writeFile(filePath, content);

  console.debug(`Temporary file created at: ${filePath}`);

  return filePath;
}

async function executeCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    console.debug(`Executing command: ${command}`);
    exec(command, (error: any, stdout: string, stderr: string) => {
      if (error) {
        reject(`Error: ${error.message}`);
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}