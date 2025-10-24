import { startStdioMcpServer } from "./stdio.js";
import { startStreamableHttpMcpServer, McpServerEndpoint } from "./streamableHttp.js";
import { startSSEMcpServer } from "./sseServer.js";

export type Transport = 'stdio' | 'http' | 'sse';

export interface HttpServerOptions {
    port?: number;
}

export async function startMcpServer(transport: Transport, options?: HttpServerOptions): Promise<void | McpServerEndpoint> {
    if (transport === 'stdio') {
        return startStdioMcpServer();
    } else if (transport === 'http') {
        return startStreamableHttpMcpServer(options?.port);
    } else if (transport === 'sse') {
        return startSSEMcpServer(options?.port);
    } else {
        throw new Error('Invalid transport. Must be either "stdio", "http", or "sse"');
    }
}
