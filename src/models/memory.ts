/**
 * Memory models for the TypeScript Memory MCP server
 */

import { generateId } from '../utils/id-generator.js';

export interface MemoryEmbedding {
	vector: number[];
	dimensions: number;
}

export interface MemoryMetadata {
	[key: string]: string | number | boolean;
}

export interface Memory {
	id: string;
	sessionId?: string;
	agentId?: string;
	content: string;
	embedding?: MemoryEmbedding;
	metadata?: MemoryMetadata;
	createdAt: Date;
	updatedAt: Date;
}

export interface MemoryFilter {
	sessionId?: string;
	agentId?: string;
	metadata?: Partial<MemoryMetadata>;
}

export interface MemorySearchResult {
	memory: Memory;
	similarity: number;
}

export interface MemorySearchOptions {
	threshold?: number;  // Similarity threshold (0-1)
	limit?: number;      // Maximum number of results
	filter?: MemoryFilter;
}

export const createMemory = (
	content: string,
	sessionId?: string,
	agentId?: string,
	metadata?: MemoryMetadata,
): Memory => {
	const now = new Date();
	return {
		id: generateId(),
		sessionId,
		agentId,
		content,
		metadata,
		createdAt: now,
		updatedAt: now,
	};
};
