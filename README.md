# ts-mem-mcp

A TypeScript-based Model Context Protocol (MCP) server that implements the OpenMemory specification. It provides a memory layer for AI applications with tools for storing and retrieving memories, designed to work with any MCP-compatible client like Claude Desktop.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm run start
```

## Features

- Persistent memory across conversations and sessions
- Semantic search using vector embeddings
- Local storage of all memories (nothing sent to external servers)
- Compatible with any MCP client (Claude Desktop, etc.)
- User and session-based memory segregation

## Available Memory Tools

### add_memory

Stores a new memory entry for later retrieval.

**Parameters:**
- `content`: Text content to store as a memory (required)
- `userId`: User identifier for the memory (required)
- `sessionId`: Session identifier (optional)
- `agentId`: Agent identifier (optional)
- `metadata`: Additional metadata to store with the memory (optional)

**Example:**
```json
{
  "content": "My favorite color is blue",
  "userId": "user-123",
  "sessionId": "session-456",
  "metadata": {
    "category": "preferences",
    "importance": "high"
  }
}
```

### search_memory

Searches for memories based on semantic similarity to the query.

**Parameters:**
- `query`: The search query text to find relevant memories (required)
- `userId`: User identifier to search memories for (required)
- `sessionId`: Session identifier to filter memories by (optional)
- `agentId`: Agent identifier to filter memories by (optional)
- `threshold`: Similarity threshold between 0 and 1 (default: 0.7) (optional)
- `limit`: Maximum number of results to return (default: 10) (optional)

**Example:**
```json
{
  "query": "What is my favorite color?",
  "userId": "user-123",
  "threshold": 0.6,
  "limit": 5
}
```

### delete_memory

Deletes a specific memory by ID.

**Parameters:**
- `memoryId`: ID of the memory to delete (required)
- `userId`: User identifier for verification (required)

**Example:**
```json
{
  "memoryId": "d8e8fca2-dc0f-4331-819e-bade0fc66666",
  "userId": "user-123"
}
```

## Project Structure

```
ts-mem-mcp/
├── src/
│   ├── db/              # Database connection and operations
│   ├── models/          # Memory data models
│   ├── tools/           # MCP Tools implementation
│   │   ├── AddMemoryTool.ts
│   │   ├── SearchMemoryTool.ts
│   │   └── DeleteMemoryTool.ts
│   ├── utils/           # Helper utilities 
│   │   ├── embeddings.ts    # Vector embedding functionality
│   │   └── memory-service.ts # Memory service layer
│   └── index.ts         # Server entry point
├── package.json
└── tsconfig.json
```

## Using with Claude Desktop

### Local Development

Add this configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ts-mem-mcp": {
      "name": "TypeScript Memory MCP",
      "description": "Local memory infrastructure that provides persistent memory across sessions",
      "enabled": true,
      "command": "node",
      "args":["/absolute/path/to/ts-mem-mcp/dist/index.js"]
    }
  }
}
```

### After Publishing

After publishing to npm, users can add this configuration to their Claude Desktop config file:

```json
{
  "mcpServers": {
    "ts-mem-mcp": {
      "name": "TypeScript Memory MCP",
      "description": "Local memory infrastructure that provides persistent memory across sessions",
      "enabled": true,
      "command": "npx",
      "args": ["ts-mem-mcp"]
    }
  }
}
```

## Building and Testing

1. Make changes to your tools
2. Run `npm run build` to compile
3. Run `npm run start` to start the server
4. Configure Claude Desktop to use your server

## Data Storage

All memories are stored locally in a SQLite database located at `~/.ts-mem-mcp/memory.db`. No data is sent to external servers.

## Learn More

- [MCP Framework Docs](https://www.npmjs.com/package/mcp-framework)
- [Claude Desktop Documentation](https://docs.anthropic.com/en/docs/claude-desktop)