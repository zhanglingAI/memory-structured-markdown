/**
 * Main manager for structured markdown memory.
 * Implements the MemorySearchManager interface for openclaw.
 */

import { randomUUID } from "node:crypto";
import chokidar from "chokidar";
import fs from "node:fs/promises";
import path from "node:path";
import { createSubsystemLogger } from "openclaw/plugin-sdk/runtime-env";
import { StructuredMemoryStorage } from "./storage.js";
import { calculateCurrentImportance, shouldArchive, updateImportanceOnAccess } from "./importance.js";

const log = createSubsystemLogger("structured-memory");

const DEFAULT_DECAY_RATE = 0.005;
const DEFAULT_MIN_IMPORTANCE = 0.1;

export class StructuredMemoryManager {
  constructor(openClawConfig, config, embeddingProvider) {
    this.openClawConfig = openClawConfig;
    this.config = this.normalizeConfig(config);
    this.storage = new StructuredMemoryStorage(this.config);
    this.embeddingProvider = embeddingProvider;
    this.metadata = new Map();
    this.watcher = null;
    this.closed = false;
    this.initialized = false;
  }

  normalizeConfig(config) {
    return {
      ...config,
      importanceDecayEnabled: config.importanceDecayEnabled ?? true,
      importanceDecayRate: config.importanceDecayRate ?? DEFAULT_DECAY_RATE,
      minImportance: config.minImportance ?? DEFAULT_MIN_IMPORTANCE,
      enableEmbedding: config.enableEmbedding ?? false,
    };
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    await this.storage.ensureRootExists();
    await this.reloadMetadata();

    this.watcher = chokidar.watch(
      this.storage.getRootDir() + "/**/*.md",
      {
        ignoreInitial: true,
        ignored: /\/\.tmp-.*\.md$/,
      }
    );

    this.watcher.on("change", async () => {
      await this.reloadMetadata();
    });

    this.watcher.on("add", async () => {
      await this.reloadMetadata();
    });

    this.watcher.on("unlink", async () => {
      await this.reloadMetadata();
    });

    await this.cleanupArchived();

    this.initialized = true;
  }

  async reloadMetadata() {
    const loaded = await this.storage.readMetadataIndex();
    this.metadata = loaded;

    const allFiles = await this.storage.listAllMemoryIds();
    for (const { id, type } of allFiles) {
      if (!this.metadata.has(id)) {
        const memory = await this.storage.readMemory(id, type);
        if (memory) {
          this.metadata.set(id, {
            id: memory.id,
            type: memory.type,
            title: memory.title,
            createdAt: memory.createdAt,
            updatedAt: memory.updatedAt,
            accessCount: memory.accessCount,
            lastAccessedAt: memory.lastAccessedAt,
            importance: memory.importance,
            tags: memory.tags,
          });
        }
      }
    }

    await this.storage.rebuildMemoryIndex(this.metadata);
  }

  async createMemory(params) {
    const id = randomUUID();
    const now = Date.now();
    const memoryType = params.type ?? "custom";
    const memory = {
      id: id,
      type: memoryType,
      title: params.title,
      content: params.content,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      lastAccessedAt: now,
      importance: params.importance,
      tags: params.tags,
      embedding: params.embedding,
    };

    const metadata = {
      id: memory.id,
      type: memory.type,
      title: memory.title,
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
      accessCount: memory.accessCount,
      lastAccessedAt: memory.lastAccessedAt,
      importance: memory.importance,
      tags: memory.tags,
    };

    this.metadata.set(id, metadata);
    await this.storage.writeMemory(memory);
    await this.storage.writeMetadataIndex(this.metadata);
    await this.storage.rebuildMemoryIndex(this.metadata);

    return memory;
  }

  async updateMemory(id, updates) {
    const existingMeta = this.metadata.get(id);
    if (!existingMeta) {
      return null;
    }

    const existing = await this.storage.readMemory(id, existingMeta.type);
    if (!existing) {
      return null;
    }

    const now = Date.now();
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    if (updates.content !== undefined && this.config.enableEmbedding && this.embeddingProvider) {
      try {
        updated.embedding = await this.embeddingProvider.embedQuery(updated.content);
      } catch (err) {
        log.warn("Failed to update embedding: " + String(err));
      }
    }

    const updatedMeta = {
      ...existingMeta,
      type: updated.type,
      title: updated.title,
      updatedAt: updated.updatedAt,
      importance: updated.importance,
      tags: updated.tags,
    };

    this.metadata.set(id, updatedMeta);
    await this.storage.writeMemory(updated);
    await this.storage.writeMetadataIndex(this.metadata);
    await this.storage.rebuildMemoryIndex(this.metadata);

    return updated;
  }

  async searchKeyword(query, maxResults = 10) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [id, meta] of this.metadata) {
      const currentImportance = calculateCurrentImportance(
        meta,
        this.config.importanceDecayEnabled,
        this.config.importanceDecayRate,
        this.config.minImportance
      );

      if (shouldArchive(currentImportance, this.config.minImportance)) {
        continue;
      }

      const memory = await this.storage.readMemory(id, meta.type);
      if (!memory) continue;

      let score = currentImportance;
      let matches = false;

      if (memory.title.toLowerCase().includes(lowerQuery)) {
        score += 0.3;
        matches = true;
      }
      if (memory.tags.some(t => t.toLowerCase().includes(lowerQuery))) {
        score += 0.2;
        matches = true;
      }
      if (memory.content.toLowerCase().includes(lowerQuery)) {
        score += 0.1;
        matches = true;
      }

      if (matches) {
        const updatedMeta = updateImportanceOnAccess(meta);
        this.metadata.set(id, updatedMeta);
        await this.storage.writeMetadataIndex(this.metadata);

        const snippet = this.extractSnippet(memory.content, lowerQuery);

        results.push({
          path: meta.type + "/" + id + ".md",
          startLine: 1,
          endLine: memory.content.split("\n").length,
          score: Math.min(1, score),
          snippet: snippet,
          source: "memory",
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  async searchSemantic(embedding, maxResults = 10) {
    if (!this.embeddingProvider || !this.config.enableEmbedding) {
      return [];
    }

    const results = [];

    for (const [id, meta] of this.metadata) {
      const currentImportance = calculateCurrentImportance(
        meta,
        this.config.importanceDecayEnabled,
        this.config.importanceDecayRate,
        this.config.minImportance
      );

      if (shouldArchive(currentImportance, this.config.minImportance)) {
        continue;
      }

      const memory = await this.storage.readMemory(id, meta.type);
      if (!memory || !memory.embedding) {
        continue;
      }

      const similarity = this.cosineSimilarity(embedding, memory.embedding);
      const score = similarity * currentImportance;

      const updatedMeta = updateImportanceOnAccess(meta);
      this.metadata.set(id, updatedMeta);
      await this.storage.writeMetadataIndex(this.metadata);

      results.push({
        path: meta.type + "/" + id + ".md",
        startLine: 1,
        endLine: memory.content.split("\n").length,
        score: score,
        snippet: memory.content.slice(0, 300),
        source: "memory",
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  async search(query, opts = {}) {
    const keywordResults = await this.searchKeyword(query, opts.maxResults ?? 10);

    if (this.config.enableEmbedding && this.embeddingProvider) {
      try {
        const queryEmbedding = await this.embeddingProvider.embedQuery(query);
        const semanticResults = await this.searchSemantic(queryEmbedding, opts.maxResults ?? 10);

        const combined = new Map();

        for (const r of keywordResults) {
          combined.set(r.path, r);
        }
        for (const r of semanticResults) {
          const existing = combined.get(r.path);
          if (existing) {
            existing.score = (existing.score + r.score) / 2;
          } else {
            combined.set(r.path, r);
          }
        }

        return Array.from(combined.values())
          .filter(r => r.score >= (opts.minScore ?? 0))
          .sort((a, b) => b.score - a.score)
          .slice(0, opts.maxResults ?? 10);
      } catch (err) {
        log.warn("Semantic search failed: " + String(err));
      }
    }

    return keywordResults
      .filter(r => r.score >= (opts.minScore ?? 0))
      .slice(0, opts.maxResults ?? 10);
  }

  async sync(params = {}) {
    await this.reloadMetadata();
    await this.cleanupArchived();
  }

  async readFile(params) {
    const fullPath = path.join(this.storage.getRootDir(), params.relPath);
    const content = await fs.readFile(fullPath, "utf-8");

    if (params.from !== undefined || params.lines !== undefined) {
      const lines = content.split("\n");
      const start = Math.max(1, (params.from ?? 1)) - 1;
      const count = params.lines ?? lines.length;
      const selected = lines.slice(start, start + count);
      return {
        text: selected.join("\n"),
        path: params.relPath,
      };
    }

    return { text: content, path: params.relPath };
  }

  status() {
    const totalDocuments = this.metadata.size;
    let vectorEnabled = false;
    let vectorAvailable = false;

    if (this.config.enableEmbedding) {
      vectorEnabled = true;
      vectorAvailable = this.embeddingProvider !== null;
    }

    return {
      backend: "builtin",
      provider: "structured-markdown",
      model: "markdown",
      requestedProvider: "structured-markdown",
      files: totalDocuments,
      chunks: totalDocuments,
      dirty: false,
      workspaceDir: this.storage.getRootDir(),
      dbPath: path.join(this.storage.getRootDir(), "METADATA.json"),
      sources: ["memory"],
      sourceCounts: [{ source: "memory", files: totalDocuments, chunks: totalDocuments }],
      vector: {
        enabled: vectorEnabled,
        available: vectorAvailable,
      },
      batch: {
        enabled: false,
        failures: 0,
        limit: 0,
        wait: false,
        concurrency: 0,
        pollIntervalMs: 0,
        timeoutMs: 0,
      },
    };
  }

  async probeEmbeddingAvailability() {
    if (!this.config.enableEmbedding || !this.embeddingProvider) {
      return { ok: false, error: "Embedding not enabled" };
    }

    try {
      await this.embeddingProvider.embedQuery("test");
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }

  async probeVectorAvailability() {
    return !!(this.config.enableEmbedding && this.embeddingProvider !== null);
  }

  async close() {
    if (this.closed) {
      return;
    }
    if (this.watcher) {
      await this.watcher.close();
    }
    await this.storage.writeMetadataIndex(this.metadata);
    this.closed = true;
  }

  extractSnippet(content, query) {
    const lowerContent = content.toLowerCase();
    const index = lowerContent.indexOf(query.toLowerCase());
    if (index === -1) {
      return content.slice(0, 200);
    }
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 150);
    let snippet = content.slice(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet += "...";
    return snippet;
  }

  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }

    if (magA === 0 || magB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  async cleanupArchived() {
    const toArchive = [];

    for (const [id, meta] of this.metadata) {
      const current = calculateCurrentImportance(
        meta,
        this.config.importanceDecayEnabled,
        this.config.importanceDecayRate,
        this.config.minImportance
      );

      if (shouldArchive(current, this.config.minImportance)) {
        toArchive.push(id);
      }
    }

    for (const id of toArchive) {
      const meta = this.metadata.get(id);
      if (!meta) continue;
      await this.storage.archiveMemory(id, meta.type);
      this.metadata.delete(id);
    }

    if (toArchive.length > 0) {
      log.info("Auto-archived " + toArchive.length + " low importance memories");
      await this.storage.writeMetadataIndex(this.metadata);
      await this.storage.rebuildMemoryIndex(this.metadata);
    }
  }
}
