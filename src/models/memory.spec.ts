import { describe, it, expect } from 'vitest';

import { createMemory } from './memory';

describe('Memory Model', () => {
	it('should create a memory with the required fields', () => {
		const content = 'Test memory content';
		const userId = 'user123';
    
		const memory = createMemory(content, userId);
    
		expect(memory).toBeDefined();
		expect(memory.id).toBeDefined();
		expect(memory.content).toBe(content);
		expect(memory.userId).toBe(userId);
		expect(memory.createdAt).toBeInstanceOf(Date);
		expect(memory.updatedAt).toBeInstanceOf(Date);
		expect(memory.sessionId).toBeUndefined();
		expect(memory.agentId).toBeUndefined();
		expect(memory.metadata).toBeUndefined();
	});

	it('should create a memory with optional fields', () => {
		const content = 'Test memory content';
		const userId = 'user123';
		const sessionId = 'session456';
		const agentId = 'agent789';
		const metadata = { category: 'preferences', importance: 'high' };
    
		const memory = createMemory(content, userId, sessionId, agentId, metadata);
    
		expect(memory).toBeDefined();
		expect(memory.id).toBeDefined();
		expect(memory.content).toBe(content);
		expect(memory.userId).toBe(userId);
		expect(memory.sessionId).toBe(sessionId);
		expect(memory.agentId).toBe(agentId);
		expect(memory.metadata).toEqual(metadata);
		expect(memory.createdAt).toBeInstanceOf(Date);
		expect(memory.updatedAt).toBeInstanceOf(Date);
	});

	it('should generate a unique ID for each memory', () => {
		const content = 'Test memory content';
		const userId = 'user123';
    
		const memory1 = createMemory(content, userId);
		const memory2 = createMemory(content, userId);
    
		expect(memory1.id).not.toBe(memory2.id);
	});
});