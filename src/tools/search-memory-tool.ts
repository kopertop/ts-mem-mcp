import { MCPTool } from 'mcp-framework';
import { z } from 'zod';

import { MemoryService } from '../utils/memory-service.js';

interface SearchMemoryInput {
  query: string;
  userId: string;
  sessionId?: string;
  agentId?: string;
  threshold?: number;
  limit?: number;
}

class SearchMemoryTool extends MCPTool<SearchMemoryInput> {
	name = 'search_memory';
	description = 'Searches for memories based on semantic similarity to the query';

	schema = {
		query: {
			type: z.string(),
			description: 'The search query text to find relevant memories',
		},
		userId: {
			type: z.string(),
			description: 'User identifier to search memories for',
		},
		sessionId: {
			type: z.string().optional(),
			description: 'Session identifier to filter memories by (optional)',
		},
		agentId: {
			type: z.string().optional(),
			description: 'Agent identifier to filter memories by (optional)',
		},
		threshold: {
			type: z.number().min(0).max(1).optional(),
			description: 'Similarity threshold between 0 and 1 (default: 0.7)',
		},
		limit: {
			type: z.number().positive().optional(),
			description: 'Maximum number of results to return (default: 10)',
		},
	};

	async execute(input: SearchMemoryInput) {
		try {
			const memoryService = MemoryService.getInstance();
			await memoryService.initialize();

			const filter = {
				userId: input.userId,
				sessionId: input.sessionId,
				agentId: input.agentId,
			};

			const searchResults = await memoryService.searchMemories(input.query, {
				threshold: input.threshold,
				limit: input.limit,
				filter,
			});

			// Transform the results to a more user-friendly format
			const results = searchResults.map(result => ({
				id: result.memory.id,
				content: result.memory.content,
				similarity: result.similarity,
				metadata: result.memory.metadata,
				createdAt: result.memory.createdAt.toISOString(),
			}));

			return {
				success: true,
				count: results.length,
				results,
			};
		} catch (error) {
			console.error('Error searching memories:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}
}

export default SearchMemoryTool;