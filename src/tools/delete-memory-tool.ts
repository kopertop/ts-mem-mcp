import { MCPTool } from 'mcp-framework';
import { z } from 'zod';

import { MemoryService } from '../utils/memory-service.js';

interface DeleteMemoryInput {
  memoryId: string;
}

class DeleteMemoryTool extends MCPTool<DeleteMemoryInput> {
	name = 'delete_memory';
	description = 'Deletes a specific memory by ID';

	schema = {
		memoryId: {
			type: z.string(),
			description: 'ID of the memory to delete',
		},
	};

	async execute(input: DeleteMemoryInput) {
		try {
			const memoryService = MemoryService.getInstance();
			await memoryService.initialize();

			// Verify the memory exists before deleting
			const memory = await memoryService.getMemory(input.memoryId);

			if (!memory) {
				return {
					success: false,
					error: 'Memory not found',
				};
			}

			const deleted = await memoryService.deleteMemory(input.memoryId);

			return {
				success: deleted,
				message: deleted ? 'Memory deleted successfully' : 'Failed to delete memory',
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}
}

export default DeleteMemoryTool;
