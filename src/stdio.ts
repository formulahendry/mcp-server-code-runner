import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

export async function startStdioMcpServer(): Promise<void> {
    const server: McpServer = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.debug("Code Runner MCP Server running on stdio");
}
