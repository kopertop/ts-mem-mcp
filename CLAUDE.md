# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based Model Context Protocol (MCP) server using the mcp-framework that implements the OpenMemory specification. It provides a memory layer for AI applications with tools for storing and retrieving memories, designed to work with any MCP-compatible client like Claude Desktop.

## Commands

### Development

```bash
# Install dependencies
npm install

# Build the project (compiles TypeScript and runs mcp-build)
npm run build

# Watch for changes during development
npm run watch

# Type checking (without emitting files)
npm run typecheck

# Linting (with auto-fix)
npm run lint

# Start the server
npm run start
```

### MCP Specific Commands

```bash
# Add a new tool
mcp add tool <tool-name>

# Test your CLI locally after linking
npm link
ts-mem-mcp
```

## Architecture

The project follows the MCP (Model Context Protocol) framework architecture with a focus on memory management:

1. **Server Setup**: The main entry point (`src/index.ts`) creates and starts an MCP server.

2. **Tools System**: Each tool is defined as a class that extends `MCPTool` from the mcp-framework and is placed in the `src/tools/` directory.

3. **Tool Structure**:
   - Each tool has a `name` and `description`
   - Input schema defined using Zod 
   - An `execute` method that implements the tool's functionality

4. **Memory Management**:
   - Stores memories as vector embeddings for semantic retrieval
   - Supports user and session management
   - Provides tools for adding, searching, and managing memories

## Memory Implementation Tasks

The following tasks need to be completed to implement the memory system:

1. **Project Setup**:
   - Set up the base project structure for TypeScript memory implementation
   - Install necessary dependencies for memory management and vector storage

2. **Data Layer**:
   - Create a Memory data model for storing and retrieving memories
   - Implement database connection and persistence layer
   - Implement vector embedding functionality for semantic search

3. **MCP Tools**:
   - Create AddMemoryTool for storing new memories
   - Create SearchMemoryTool for retrieving relevant memories
   - Create deletion tool for removing memories
   - Set up MCP server configuration for memory tools

4. **User Management**:
   - Add user and session management
   - Implement metadata filtering options for memory retrieval

5. **Documentation & Testing**:
   - Write documentation on how to use the memory tools
   - Create tests for memory tools
   - Add configuration options for storage location and embedding model

## Memory Tool Specifications

### AddMemoryTool
- **Purpose**: Store new memory entries
- **Parameters**:
  - `content`: Text content to store (required)
  - `sessionId`: Session identifier (optional)
  - `agentId`: Agent identifier (optional)
  - `metadata`: Additional metadata as a key-value object (optional)

### SearchMemoryTool
- **Purpose**: Retrieve relevant memories based on semantic search
- **Parameters**:
  - `query`: Search query text (required)
  - `sessionId`: Session identifier (optional)
  - `agentId`: Agent identifier (optional)
  - `filters`: Metadata filters as a key-value object (optional)
  - `threshold`: Similarity threshold (optional)
  - `limit`: Maximum number of results (optional)

### DeleteMemoryTool
- **Purpose**: Remove specific memories
- **Parameters**:
  - `memoryId`: ID of memory to delete (required)

## Integration with Claude Desktop

### Claude Desktop Configuration

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
            "args": [
                "/Users/cmoyer/Projects/personal/ts-mem-mcp/dist/index.js"
            ]
        }
    }
}
```

Replace the path in `args` with the absolute path to your compiled index.js file.

### After Publishing to npm

If you publish the package to npm, users can use this configuration instead:

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

## Implementation Strategy

1. Use a vector database or embedding storage solution for semantic search capabilities
2. Implement user and session management with proper authentication
3. Ensure all data remains local to the user's machine
4. Provide metadata filtering for flexible memory retrieval
5. Design tools to be compatible with any MCP client