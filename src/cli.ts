#!/usr/bin/env node
import { program } from 'commander';
import { startMcpServer } from './index.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

program
  .name('mcp-server-code-runner')
  .description(pkg.description)
  .version(pkg.version)
  .option('-t, --transport <transport>', 'Transport (stdio or http)', 'stdio')
  .option('-p, --port <port>', 'Port number for HTTP server')
  .action(async (options) => {
    try {
      await startMcpServer(options.transport, { port: parseInt(options.port) });    
    } catch (error) {
      console.error('Error: ', error);
      process.exit(1);
    }
  });

program.parse();
