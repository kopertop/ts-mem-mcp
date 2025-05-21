import { pipeline } from '@xenova/transformers';

import { Memory, MemoryEmbedding } from '../models/memory.js';

// Configuration
const DEFAULT_MODEL = 'Xenova/all-MiniLM-L6-v2';
const DEFAULT_DIMENSIONS = 384;

export class EmbeddingService {
	private static instance: EmbeddingService;
	private pipeline: any;
	private modelName: string;
	private dimensions: number;
	private initialized = false;

	private constructor(modelName = DEFAULT_MODEL, dimensions = DEFAULT_DIMENSIONS) {
		this.modelName = modelName;
		this.dimensions = dimensions;
	}

	public static getInstance(modelName?: string, dimensions?: number): EmbeddingService {
		if (!EmbeddingService.instance) {
			EmbeddingService.instance = new EmbeddingService(modelName, dimensions);
		}
		return EmbeddingService.instance;
	}

	public async initialize(): Promise<void> {
		if (this.initialized) return;

		this.pipeline = await pipeline('feature-extraction', this.modelName);
		this.initialized = true;
	}

	public async getEmbedding(text: string): Promise<MemoryEmbedding> {
		await this.initialize();

		const result = await this.pipeline(text, { pooling: 'mean', normalize: true });
		const vector = Array.from(result.data).map(value => Number(value));

		return {
			vector,
			dimensions: this.dimensions,
		};
	}

	public calculateSimilarity(embedding1: number[], embedding2: number[]): number {
		if (embedding1.length !== embedding2.length) {
			throw new Error('Embeddings must have the same dimensions');
		}

		// Calculate cosine similarity
		let dotProduct = 0;
		let norm1 = 0;
		let norm2 = 0;

		for (let i = 0; i < embedding1.length; i++) {
			dotProduct += embedding1[i] * embedding2[i];
			norm1 += embedding1[i] * embedding1[i];
			norm2 += embedding2[i] * embedding2[i];
		}

		// Normalize to range from 0 to 1
		return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
	}

	public async searchSimilar(
		query: string,
		memories: Memory[],
		options: { threshold?: number; limit?: number; } = {},
	): Promise<{ memory: Memory; similarity: number }[]> {
		const queryEmbedding = await this.getEmbedding(query);
		const threshold = options.threshold ?? 0.7;
		const limit = options.limit ?? 10;

		// Filter memories that have embeddings
		const memoriesWithEmbeddings = memories.filter(memory => memory.embedding?.vector);

		// Calculate similarity for each memory
		const results = memoriesWithEmbeddings.map(memory => {
			const similarity = this.calculateSimilarity(
				queryEmbedding.vector,
				memory.embedding!.vector,
			);

			return { memory, similarity };
		});

		// Filter by threshold and sort by similarity (highest first)
		return results
			.filter(result => result.similarity >= threshold)
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, limit);
	}
}
