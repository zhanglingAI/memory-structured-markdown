/**
 * OpenClaw Structured Markdown Memory Plugin
 *
 * Long-term memory where each memory is a separate markdown file with YAML frontmatter.
 * Human readable and editable. Supports optional semantic search.
 */

import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { getMemoryEmbeddingProvider } from "openclaw/plugin-sdk/memory-core-host-engine-embeddings";
import { StructuredMemoryManager } from "./src/manager.js";
import { structuredMemoryConfigSchema } from "./config.js";

export default definePluginEntry({
  id: "memory-structured-markdown",
  name: "Memory (Structured Markdown)",
  description: "Structured markdown memory - each memory is a separate markdown file with YAML frontmatter, human readable and editable",
  kind: "memory",
  configSchema: structuredMemoryConfigSchema,

  register(api) {
    const config = structuredMemoryConfigSchema.parse(api.pluginConfig);
    const rootDir = config.rootDir.includes("://") 
      ? config.rootDir 
      : api.resolvePath(config.rootDir);

    // Initialize embedding provider if enabled
    let embeddingProvider = null;
    
    // Initialize manager lazily
    let managerPromise = null;
    
    const getManager = async () => {
      if (managerPromise) return managerPromise;
      
      managerPromise = (async () => {
        if (config.enableEmbedding && config.embedding) {
          const createOptions = {
            config: api.config,
            provider: "auto",
            fallback: "none",
            model: config.embedding.model ?? "text-embedding-3-small",
            outputDimensionality: config.embedding.dimensions,
            remote: {
              baseUrl: config.embedding.baseUrl,
              apiKey: config.embedding.apiKey,
            },
          };
          const adapter = getMemoryEmbeddingProvider(createOptions.provider, api.config);
          if (adapter) {
            const result = await adapter.create(createOptions);
            embeddingProvider = result.provider;
          }
        }

        const manager = new StructuredMemoryManager(
          api.config,
          { ...config, rootDir },
          embeddingProvider
        );

        await manager.initialize();
        return manager;
      })();
      
      return managerPromise;
    };

    // Register memory_recall tool
    api.registerTool(
      {
        name: "memory_recall",
        label: "Memory Recall",
        description: "Search through structured markdown memories. Use when you need context about user preferences, past decisions, or previously discussed topics.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            limit: { type: "number", description: "Max results (default: 5)" },
          },
          required: ["query"],
        },
        async execute(_toolCallId, params) {
          const { query, limit = 5 } = params;
          
          const manager = await getManager();

          let results;
          if (config.enableEmbedding && embeddingProvider) {
            // Semantic search
            const embedding = await embeddingProvider.embedQuery(query);
            results = await manager.searchSemantic(embedding, limit);
          } else {
            // Keyword search
            results = await manager.searchKeyword(query, limit);
          }

          if (results.length === 0) {
            return {
              content: [{ type: "text", text: "No relevant memories found." }],
              details: { count: 0 },
            };
          }

          const text = results
            .map((r, i) => `${i + 1}. [${r.score.toFixed(2)}] ${r.snippet.slice(0, 100)}...`)
            .join("\n");

          return {
            content: [{ type: "text", text: `Found ${results.length} memories:\n\n${text}` }],
            details: { count: results.length, results: results.map(r => ({ path: r.path, score: r.score })) },
          };
        },
      },
      { name: "memory_recall" }
    );

    // Register memory_store tool
    api.registerTool(
      {
        name: "memory_store",
        label: "Memory Store",
        description: "Save important information in structured markdown memory. Use for preferences, facts, decisions.",
        parameters: {
          type: "object",
          properties: {
            content: { type: "string", description: "Information to remember" },
            title: { type: "string", description: "Optional title for the memory" },
            tags: { type: "array", items: { type: "string" }, description: "Optional tags" },
            importance: { type: "number", description: "Importance 0-1 (default: 0.7)" },
          },
          required: ["content"],
        },
        async execute(_toolCallId, params) {
          const { content, title, tags = [], importance = 0.7 } = params;
          
          const manager = await getManager();

          let embedding;
          if (config.enableEmbedding && embeddingProvider) {
            embedding = await embeddingProvider.embedQuery(content);
          }

          const memory = await manager.createMemory({
            content,
            title: title ?? "Untitled",
            tags,
            importance,
            embedding,
          });

          return {
            content: [{ type: "text", text: `Stored memory: "${content.slice(0, 100)}..."` }],
            details: { id: memory.id },
          };
        },
      },
      { name: "memory_store" }
    );

    // Register service
    api.registerService({
      id: "memory-structured-markdown",
      start: () => {
        api.logger.info(`memory-structured-markdown: initialized (dir: ${rootDir})`);
      },
      stop: async () => {
        if (managerPromise) {
          const manager = await managerPromise;
          await manager.close();
        }
        api.logger.info("memory-structured-markdown: stopped");
      },
    });
  },
});
