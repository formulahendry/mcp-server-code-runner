# Code Runner MCP Server

MCP Server for running code snippet and show the result.

## Setup

### VS Code

Configuration in `settings.json`:

```json
{
  "mcp": {
    "inputs": [],
    "servers": {
      "mcp-server-code-runner": {
        "command": "npx",
        "args": [
          "-y",
          "mcp-server-code-runner"
        ],
      }
    }
  }
}
```

### Claude Desktop

Configuration in `claude_desktop_config.json`: 

```json
{
  "mcpServers": {
    "mcp-server-code-runner": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-code-runner"
      ],
    }
  }
}
```

## Usage

Try below prompts in the application which has configured Code Runner MCP Server:

* `Run the JS Code: console.log(5+6)`
* `Where is temporary folder in my OS?`
* `How many CPUs do I have in my machine?`