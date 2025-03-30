const config = JSON.stringify({
    name: 'mcp-server-code-runner',
    command: 'npx',
    args: ['-y', 'mcp-server-code-runner@latest']
});

// This is a URL you can link on your website that will trigger an MCP install, similar
// to the "Install Extension" button in the VS Code marketplace.
const urlForWebsites = `vscode-insiders:mcp/install?${encodeURIComponent(config)}`;

// Github markdown does not allow linking to `vscode:` directly, so you can use redirect:
const urlForGithub = `https://insiders.vscode.dev/redirect?url=${encodeURIComponent(urlForWebsites)}`;

console.log(urlForGithub);