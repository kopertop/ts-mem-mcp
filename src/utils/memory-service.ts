import { Database } from '../db/database.js';
import { EmbeddingService } from './embeddings.js';
import { Memory, MemoryFilter, MemoryMetadata, MemorySearchOptions, MemorySearchResult, createMemory } from '../models/memory.js';

export class MemoryService {
  private static instance: MemoryService;
  private db: Database;
  private embeddings: EmbeddingService;

  private constructor() {
    this.db = Database.getInstance();
    this.embeddings = EmbeddingService.getInstance();
  }

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  public async initialize(): Promise<void> {
    await this.db.initialize();
    await this.embeddings.initialize();
  }

  public async addMemory(
    content: string,
    userId: string,
    sessionId?: string,
    agentId?: string,
    metadata?: MemoryMetadata
  ): Promise<Memory> {
    // Create the memory object
    const memory = createMemory(content, userId, sessionId, agentId, metadata);
    
    // Generate embedding for the content
    try {
      memory.embedding = await this.embeddings.getEmbedding(content);
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      // Continue without embedding if it fails
    }
    
    // Store in database
    await this.db.addMemory(memory);
    
    return memory;
  }

  public async searchMemories(
    query: string,
    options: MemorySearchOptions = {}
  ): Promise<MemorySearchResult[]> {
    // Get memories matching filter criteria
    const memories = await this.db.getAllMemories(options.filter);
    
    if (memories.length === 0) {
      return [];
    }
    
    // Search for similar memories
    return this.embeddings.searchSimilar(query, memories, {
      threshold: options.threshold,
      limit: options.limit
    });
  }

  public async getMemory(id: string): Promise<Memory | null> {
    return this.db.getMemory(id);
  }

  public async getAllMemories(filter?: MemoryFilter): Promise<Memory[]> {
    return this.db.getAllMemories(filter);
  }

  public async deleteMemory(id: string): Promise<boolean> {
    return this.db.deleteMemory(id);
  }
}