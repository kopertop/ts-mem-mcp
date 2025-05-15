import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MemoryService } from '../utils/memory-service';

import SearchMemoryTool from './search-memory-tool';

// Mock the memory service
vi.mock('../utils/memory-service', () => {
	const mockMemories = [
		{
			memory: {
				id: 'memory-1',
				userId: 'user123',
				content: 'My favorite color is blue',
				metadata: { category: 'preferences' },
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			similarity: 0.92,
		},
		{
			memory: {
				id: 'memory-2',
				userId: 'user123',
				content: 'I like pizza for dinner',
				metadata: { category: 'preferences' },
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			similarity: 0.78,
		},
	];
  
	return {
		MemoryService: {
			getInstance: vi.fn().mockReturnValue({
				initialize: vi.fn().mockResolvedValue(undefined),
				searchMemories: vi.fn().mockResolvedValue(mockMemories),
			}),
		},
	};
});

describe('SearchMemoryTool', () => {
	let tool: SearchMemoryTool;
	let mockMemoryService: any;
  
	beforeEach(() => {
		// Create a new instance of the tool for each test
		tool = new SearchMemoryTool();
		mockMemoryService = MemoryService.getInstance();
	});
  
	it('should have the correct name and description', () => {
		expect(tool.name).toBe('search_memory');
		expect(tool.description).toBeDefined();
	});
  
	it('should define schema with required and optional parameters', () => {
		expect(tool.schema).toBeDefined();
		expect(tool.schema.query).toBeDefined();
		expect(tool.schema.userId).toBeDefined();
		expect(tool.schema.sessionId).toBeDefined();
		expect(tool.schema.agentId).toBeDefined();
		expect(tool.schema.threshold).toBeDefined();
		expect(tool.schema.limit).toBeDefined();
	});
  
	it('should successfully search memories with required fields', async () => {
		const input = {
			query: 'What is my favorite color?',
			userId: 'user123',
		};
    
		const result = await tool.execute(input);
    
		expect(mockMemoryService.initialize).toHaveBeenCalled();
		expect(mockMemoryService.searchMemories).toHaveBeenCalledWith(
			input.query,
			{
				filter: {
					userId: input.userId,
					sessionId: undefined,
					agentId: undefined,
				},
				threshold: undefined,
				limit: undefined,
			},
		);
    
		expect(result).toEqual(expect.objectContaining({
			success: true,
			count: 2,
			results: expect.arrayContaining([
				expect.objectContaining({
					id: 'memory-1',
					content: 'My favorite color is blue',
					similarity: 0.92,
				}),
				expect.objectContaining({
					id: 'memory-2',
					content: 'I like pizza for dinner',
					similarity: 0.78,
				}),
			]),
		}));
	});
  
	it('should successfully search memories with all fields', async () => {
		const input = {
			query: 'What is my favorite color?',
			userId: 'user123',
			sessionId: 'session456',
			agentId: 'agent789',
			threshold: 0.8,
			limit: 5,
		};
    
		const result = await tool.execute(input);
    
		expect(mockMemoryService.initialize).toHaveBeenCalled();
		expect(mockMemoryService.searchMemories).toHaveBeenCalledWith(
			input.query,
			{
				filter: {
					userId: input.userId,
					sessionId: input.sessionId,
					agentId: input.agentId,
				},
				threshold: input.threshold,
				limit: input.limit,
			},
		);
    
		expect(result).toEqual(expect.objectContaining({
			success: true,
			count: 2,
		}));
	});
  
	it('should handle errors during memory search', async () => {
		const error = new Error('Test error');
		mockMemoryService.searchMemories.mockRejectedValueOnce(error);
    
		const input = {
			query: 'What is my favorite color?',
			userId: 'user123',
		};
    
		const result = await tool.execute(input);
    
		expect(result).toEqual(expect.objectContaining({
			success: false,
			error: error.message,
		}));
	});
});