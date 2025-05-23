import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MemoryService } from '../utils/memory-service';

import DeleteMemoryTool from './delete-memory-tool';

// Mock the memory service
vi.mock('../utils/memory-service', () => {
	return {
		MemoryService: {
			getInstance: vi.fn().mockReturnValue({
				initialize: vi.fn().mockResolvedValue(undefined),
				getMemory: vi.fn(),
				deleteMemory: vi.fn(),
			}),
		},
	};
});

describe('DeleteMemoryTool', () => {
	let tool: DeleteMemoryTool;
	let mockMemoryService: any;

	beforeEach(() => {
		// Create a new instance of the tool for each test
		tool = new DeleteMemoryTool();
		mockMemoryService = MemoryService.getInstance();

		// Reset the mocks for each test
		vi.clearAllMocks();

		// Default mock implementations
		mockMemoryService.getMemory.mockResolvedValue({
			id: 'memory-id',
			content: 'Test memory content',
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockMemoryService.deleteMemory.mockResolvedValue(true);
	});

	it('should have the correct name and description', () => {
		expect(tool.name).toBe('delete_memory');
		expect(tool.description).toBeDefined();
	});

	it('should define schema with required parameters', () => {
		expect(tool.schema).toBeDefined();
		expect(tool.schema.memoryId).toBeDefined();
	});

	it('should successfully delete a memory', async () => {
		const input = {
			memoryId: 'memory-id',
		};

		const result = await tool.execute(input);

		expect(mockMemoryService.initialize).toHaveBeenCalled();
		expect(mockMemoryService.getMemory).toHaveBeenCalledWith(input.memoryId);
		expect(mockMemoryService.deleteMemory).toHaveBeenCalledWith(input.memoryId);

		expect(result).toEqual(expect.objectContaining({
			success: true,
			message: expect.stringContaining('deleted successfully'),
		}));
	});

	it('should fail if memory not found', async () => {
		// Mock memory not found
		mockMemoryService.getMemory.mockResolvedValueOnce(null);

		const input = {
			memoryId: 'non-existent-id',
		};

		const result = await tool.execute(input);

		expect(mockMemoryService.getMemory).toHaveBeenCalledWith(input.memoryId);
		expect(mockMemoryService.deleteMemory).not.toHaveBeenCalled();

		expect(result).toEqual(expect.objectContaining({
			success: false,
			error: expect.stringContaining('not found'),
		}));
	});

	it('should return failure if deletion fails', async () => {
		mockMemoryService.deleteMemory.mockResolvedValueOnce(false);

		const input = {
			memoryId: 'memory-id',
		};

		const result = await tool.execute(input);

		expect(mockMemoryService.getMemory).toHaveBeenCalledWith(input.memoryId);
		expect(mockMemoryService.deleteMemory).toHaveBeenCalledWith(input.memoryId);

		expect(result).toEqual(expect.objectContaining({
			success: false,
			message: expect.stringContaining('Failed to delete'),
		}));
	});

	it('should handle errors during memory deletion', async () => {
		const error = new Error('Test error');
		mockMemoryService.deleteMemory.mockRejectedValueOnce(error);

		const input = {
			memoryId: 'memory-id',
		};

		const result = await tool.execute(input);

		expect(result).toEqual(expect.objectContaining({
			success: false,
			error: error.message,
		}));
	});
});