import { MCPTool } from 'mcp-framework';
import { z } from 'zod';

import { MemoryService } from '../utils/memory-service.js';

interface AddMemoryInput {
	content: string;
	sessionId?: string;
	agentId?: string;
	metadata?: Record<string, string | number | boolean>;
}

class AddMemoryTool extends MCPTool<AddMemoryInput> {
	name = 'add_memory';
	description = 'Stores a new memory entry for retrieval later';

	schema = {
		content: {
			type: z.string(),
			description: 'Text content to store as a memory',
		},
		sessionId: {
			type: z.string().optional(),
			description: 'Session identifier (optional)',
		},
		agentId: {
			type: z.string().optional(),
			description: 'Agent identifier (optional)',
		},
		metadata: {
			type: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
			description: 'Additional metadata to store with the memory (optional)',
		},
	};

	async execute(input: AddMemoryInput) {
		try {
			const memoryService = MemoryService.getInstance();
			await memoryService.initialize();

			const memory = await memoryService.addMemory(
				input.content,
				input.sessionId,
				input.agentId,
				input.metadata,
			);

			return {
				success: true,
				id: memory.id,
				message: 'Memory stored successfully',
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}
}

export default AddMemoryTool;
