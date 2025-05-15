import { describe, it, expect, vi, beforeAll } from 'vitest';

import { EmbeddingService } from './embeddings';
import { setupPolyfills } from './polyfills';

// Setup polyfills before tests
beforeAll(() => {
	setupPolyfills();
});

// Mock the pipeline function
vi.mock('@xenova/transformers', () => {
	return {
		pipeline: vi.fn().mockImplementation(() => {
			return {
				async __call__() {
					// Return mock embedding data of uniform length (10)
					const mockVector = Array(10).fill(0).map((_, i) => 0.1 * (i + 1));
					return {
						data: mockVector,
					};
				},
			};
		}),
	};
});

describe('EmbeddingService', () => {
	it('should be a singleton', () => {
		const instance1 = EmbeddingService.getInstance();
		const instance2 = EmbeddingService.getInstance();
    
		expect(instance1).toBe(instance2);
	});

	it('should calculate cosine similarity correctly', async () => {
		const service = EmbeddingService.getInstance();
    
		// Two identical vectors should have similarity 1.0
		const vec1 = [0.1, 0.2, 0.3, 0.4, 0.5];
		const vec2 = [0.1, 0.2, 0.3, 0.4, 0.5];
    
		const similarity = service.calculateSimilarity(vec1, vec2);
		expect(similarity).toBeCloseTo(1.0, 5);
    
		// Orthogonal vectors should have similarity 0
		const vec3 = [1, 0, 0, 0, 0];
		const vec4 = [0, 1, 0, 0, 0];
    
		const similarity2 = service.calculateSimilarity(vec3, vec4);
		expect(similarity2).toBeCloseTo(0, 5);
	});

	it('should throw an error when vectors have different dimensions', () => {
		const service = EmbeddingService.getInstance();
    
		const vec1 = [0.1, 0.2, 0.3];
		const vec2 = [0.1, 0.2, 0.3, 0.4, 0.5];
    
		expect(() => service.calculateSimilarity(vec1, vec2)).toThrow('Embeddings must have the same dimensions');
	});

	// Other tests would follow, but they'd need more complex mocking of the transformer pipeline
});