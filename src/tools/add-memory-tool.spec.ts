import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MemoryService } from '../utils/memory-service';

import AddMemoryTool from './add-memory-tool';

// Mock the memory service
vi.mock('../utils/memory-service', () => {
	const mockMemory = {
		id: 'mock-memory-id',
		content: 'Test memory content',
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return {
		MemoryService: {
			getInstance: vi.fn().mockReturnValue({
				initialize: vi.fn().mockResolvedValue(undefined),
				addMemory: vi.fn().mockResolvedValue(mockMemory),
			}),
		},
	};
});

describe('AddMemoryTool', () => {
	let tool: AddMemoryTool;
	let mockMemoryService: any;

	beforeEach(() => {
		// Create a new instance of the tool for each test
		tool = new AddMemoryTool();
		mockMemoryService = MemoryService.getInstance();
	});

	it('should have the correct name and description', () => {
		expect(tool.name).toBe('add_memory');
		expect(tool.description).toBeDefined();
	});

	it('should define schema with required and optional parameters', () => {
		expect(tool.schema).toBeDefined();
		expect(tool.schema.content).toBeDefined();
		expect(tool.schema.sessionId).toBeDefined();
		expect(tool.schema.agentId).toBeDefined();
		expect(tool.schema.metadata).toBeDefined();
	});

	it('should successfully add a memory with required fields', async () => {
		const input = {
			content: 'Test memory content',
		};

		const result = await tool.execute(input);

		expect(mockMemoryService.initialize).toHaveBeenCalled();
		expect(mockMemoryService.addMemory).toHaveBeenCalledWith(
			input.content,
			undefined,
			undefined,
			undefined,
		);

		expect(result).toEqual(expect.objectContaining({
			success: true,
			id: 'mock-memory-id',
			message: expect.any(String),
		}));
	});

	it('should successfully add a memory with all fields', async () => {
		const input = {
			content: 'Test memory content',
			sessionId: 'session456',
			agentId: 'agent789',
			metadata: { category: 'preferences', importance: 'high' },
		};

		const result = await tool.execute(input);

		expect(mockMemoryService.initialize).toHaveBeenCalled();
		expect(mockMemoryService.addMemory).toHaveBeenCalledWith(
			input.content,
			input.sessionId,
			input.agentId,
			input.metadata,
		);

		expect(result).toEqual(expect.objectContaining({
			success: true,
			id: 'mock-memory-id',
			message: expect.any(String),
		}));
	});

	it('should handle errors during memory addition', async () => {
		const error = new Error('Test error');
		mockMemoryService.addMemory.mockRejectedValueOnce(error);

		const input = {
			content: 'Test memory content',
		};

		const result = await tool.execute(input);

		expect(result).toEqual(expect.objectContaining({
			success: false,
			error: error.message,
		}));
	});
});
