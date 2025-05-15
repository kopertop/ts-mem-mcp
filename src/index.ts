import { MCPServer } from 'mcp-framework';

import { Database } from './db/database.js';
import { EmbeddingService } from './utils/embeddings.js';
import { MemoryService } from './utils/memory-service.js';
import { setupPolyfills } from './utils/polyfills.js';

// Set up web API polyfills for transformers.js
setupPolyfills();

/**
 * Initialize the server components
 */
async function initialize() {
	try {
		// Initialize the database
		const db = Database.getInstance();
		await db.initialize();
		// Database initialized successfully
    
		// Initialize the embedding service
		const embeddingService = EmbeddingService.getInstance();
		await embeddingService.initialize();
		// Embedding service initialized successfully
    
		// Initialize the memory service
		const memoryService = MemoryService.getInstance();
		await memoryService.initialize();
		// Memory service initialized successfully
    
		return true;
	} catch (error) {
		console.error('Failed to initialize server components:', error);
		return false;
	}
}

/**
 * Start the MCP server with memory tools
 */
async function startServer() {
	// Starting TypeScript Memory MCP Server...
  
	// First initialize all components
	const initialized = await initialize();
	if (!initialized) {
		console.error('Failed to initialize required components. Exiting.');
		process.exit(1);
	}
  
	// Create the MCP server instance - tools will be loaded automatically
	const server = new MCPServer();
  
	// Start the server - this will load the tools from the src/tools directory
	await server.start();
	// Server started successfully
}

// Start the server
startServer().catch(error => {
	console.error('Failed to start server:', error);
	process.exit(1);
});