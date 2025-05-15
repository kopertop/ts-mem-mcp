import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { Memory, MemoryEmbedding, MemoryFilter, MemoryMetadata } from '../models/memory.js';

// Define the data directory for our database
const DATA_DIR = path.join(os.homedir(), '.ts-mem-mcp');
const DB_PATH = path.join(DATA_DIR, 'memory.db');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class Database {
  private static instance: Database;
  private db: any;
  private initialized = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    this.db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Create the memories table if it doesn't exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        sessionId TEXT,
        agentId TEXT,
        content TEXT NOT NULL,
        metadata TEXT,
        embedding BLOB,
        dimensions INTEGER,
        createdAt TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_memories_userId ON memories(userId);
      CREATE INDEX IF NOT EXISTS idx_memories_sessionId ON memories(sessionId);
      CREATE INDEX IF NOT EXISTS idx_memories_agentId ON memories(agentId);
    `);

    this.initialized = true;
  }

  public async addMemory(memory: Memory): Promise<string> {
    await this.initialize();
    
    const { id, userId, sessionId, agentId, content, metadata, embedding, createdAt, updatedAt } = memory;
    
    const metadataStr = metadata ? JSON.stringify(metadata) : null;
    const embeddingBlob = embedding ? Buffer.from(new Float32Array(embedding.vector).buffer) : null;
    const dimensions = embedding?.dimensions || null;

    await this.db.run(
      `INSERT INTO memories 
      (id, userId, sessionId, agentId, content, metadata, embedding, dimensions, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        userId, 
        sessionId || null, 
        agentId || null, 
        content, 
        metadataStr, 
        embeddingBlob, 
        dimensions, 
        createdAt.toISOString(), 
        updatedAt.toISOString()
      ]
    );

    return id;
  }

  public async getMemory(id: string): Promise<Memory | null> {
    await this.initialize();
    
    const row = await this.db.get('SELECT * FROM memories WHERE id = ?', [id]);
    
    if (!row) return null;
    
    return this.rowToMemory(row);
  }

  public async getAllMemories(filter?: MemoryFilter): Promise<Memory[]> {
    await this.initialize();

    let query = 'SELECT * FROM memories';
    const params: any[] = [];
    
    if (filter) {
      const conditions: string[] = [];
      
      if (filter.userId) {
        conditions.push('userId = ?');
        params.push(filter.userId);
      }
      
      if (filter.sessionId) {
        conditions.push('sessionId = ?');
        params.push(filter.sessionId);
      }
      
      if (filter.agentId) {
        conditions.push('agentId = ?');
        params.push(filter.agentId);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const rows = await this.db.all(query, params);
    
    return rows.map(this.rowToMemory);
  }

  public async deleteMemory(id: string): Promise<boolean> {
    await this.initialize();
    
    const result = await this.db.run('DELETE FROM memories WHERE id = ?', [id]);
    
    return result.changes > 0;
  }

  private rowToMemory(row: any): Memory {
    let embedding: MemoryEmbedding | undefined;
    
    if (row.embedding && row.dimensions) {
      const buffer = Buffer.from(row.embedding);
      const array = new Float32Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
      embedding = {
        vector: Array.from(array),
        dimensions: row.dimensions
      };
    }
    
    let metadata: MemoryMetadata | undefined;
    if (row.metadata) {
      try {
        metadata = JSON.parse(row.metadata);
      } catch (e) {
        console.error('Error parsing metadata:', e);
      }
    }
    
    return {
      id: row.id,
      userId: row.userId,
      sessionId: row.sessionId || undefined,
      agentId: row.agentId || undefined,
      content: row.content,
      metadata,
      embedding,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}