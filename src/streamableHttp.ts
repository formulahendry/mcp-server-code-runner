import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";

export interface McpServerEndpoint {
  url: string;
  port: number;
}

export async function startStreamableHttpMcpServer(port?: number): Promise<McpServerEndpoint> {
  const app = express();
  app.use(express.json());

  const server: McpServer = createServer();
  const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // set to undefined for stateless servers
  });

  // Setup routes for the server
  await server.connect(transport);

  app.post('/mcp', async (req: Request, res: Response) => {
    console.log('Received MCP request:', req.body);
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  app.get('/mcp', async (req: Request, res: Response) => {
    console.log('Received GET MCP request');
    res.writeHead(405).end(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    }));
  });

  app.delete('/mcp', async (req: Request, res: Response) => {
    console.log('Received DELETE MCP request');
    res.writeHead(405).end(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    }));
  });

  // Start the server
  const PORT = Number(port || process.env.PORT || 3088);
  
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, (error) => {
      if (error) {
        console.error('Failed to start server:', error);
        reject(error);
        return;
      }
      const endpoint: McpServerEndpoint = {
        url: `http://localhost:${PORT}/mcp`,
        port: PORT
      };
      console.log(`Code Runner Streamable HTTP MCP Server listening at ${endpoint.url}`);
      resolve(endpoint);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      reject(error);
    });
  });
}

