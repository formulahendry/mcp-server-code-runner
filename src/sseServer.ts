import express, { Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createServer } from "./server.js";

export interface McpServerEndpoint {
  url: string;
  port: number;
}

export async function startSSEMcpServer(port?: number): Promise<McpServerEndpoint> {
  const app = express();
  app.use(express.json());

  // Store transports by session ID
  const transports: { [sessionId: string]: SSEServerTransport } = {};

  // SSE endpoint for establishing connection
  app.get('/sse', async (req: Request, res: Response) => {
    console.log('Received SSE connection request');
    try {
      const server: McpServer = createServer();
      const transport: SSEServerTransport = new SSEServerTransport('/messages', res);
      
      // Store the transport by session ID
      transports[transport.sessionId] = transport;
      
      // Clean up transport when connection closes
      transport.onclose = () => {
        delete transports[transport.sessionId];
        console.log(`SSE session ${transport.sessionId} closed`);
      };

      // Connect the server to the transport
      await server.connect(transport);
      
      console.log(`SSE session ${transport.sessionId} established`);
    } catch (error) {
      console.error('Error establishing SSE connection:', error);
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

  // Messages endpoint for receiving client messages
  app.post('/messages', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    console.log(`Received message for session: ${sessionId}`);
    
    if (!sessionId || !transports[sessionId]) {
      console.error(`No transport found for sessionId: ${sessionId}`);
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Invalid or missing session ID',
        },
        id: null,
      });
      return;
    }

    try {
      const transport = transports[sessionId];
      await transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      console.error('Error handling SSE message:', error);
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

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      transport: 'sse',
      activeSessions: Object.keys(transports).length 
    });
  });

  // Start the server
  const PORT = Number(port || process.env.PORT || 3088);
  
  return new Promise((resolve, reject) => {
    const appServer = app.listen(PORT, (error) => {
      if (error) {
        console.error('Failed to start server:', error);
        reject(error);
        return;
      }
      const endpoint: McpServerEndpoint = {
        url: `http://localhost:${PORT}/sse`,
        port: PORT
      };
      console.log(`Code Runner SSE MCP Server listening at ${endpoint.url}`);
      console.log(`Messages endpoint: http://localhost:${PORT}/messages`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      resolve(endpoint);
    });

    // Handle server errors
    appServer.on('error', (error) => {
      console.error('Server error:', error);
      reject(error);
    });
  });
}

