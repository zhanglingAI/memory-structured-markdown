/**
 * Storage layer for structured markdown memory.
 * Each memory is a separate markdown file with YAML frontmatter.
 */

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export class StructuredMemoryStorage {
  constructor(config) {
    this.rootDir = this.expandHome(config.rootDir);
    this.config = config;
  }

  expandHome(p) {
    return p.replace(/^~/, process.env.HOME || "");
  }

  async ensureRootExists() {
    await fs.mkdir(this.rootDir, { recursive: true });
    // Ensure all type directories exist
    const defaultTypes = [
      "user", "feedback", "project", "reference", "knowledge", "event", "custom"
    ];
    for (const type of defaultTypes) {
      await fs.mkdir(this.getTypeDir(type), { recursive: true });
    }
    // Ensure archive directory
    await fs.mkdir(path.join(this.rootDir, "archive"), { recursive: true });
  }

  getTypeDir(type) {
    return path.join(this.rootDir, type);
  }

  getFilePath(id, type) {
    return path.join(this.getTypeDir(type), `${id}.md`);
  }

  getArchiveFilePath(id, type) {
    return path.join(this.rootDir, "archive", type, `${id}.md`);
  }

  /**
   * Read all memory metadata from index
   */
  async readMetadataIndex() {
    const indexPath = path.join(this.rootDir, "METADATA.json");
    if (!await this.fileExists(indexPath)) {
      return new Map();
    }
    const content = await fs.readFile(indexPath, "utf-8");
    const metadata = JSON.parse(content);
    return new Map(Object.entries(metadata));
  }

  /**
   * Write metadata index
   */
  async writeMetadataIndex(metadata) {
    const indexPath = path.join(this.rootDir, "METADATA.json");
    const obj = Object.fromEntries(metadata);
    await fs.writeFile(indexPath, JSON.stringify(obj, null, 2), "utf-8");
  }

  /**
   * Rebuild MEMORY.md human-readable index
   */
  async rebuildMemoryIndex(metadata) {
    const indexPath = path.join(this.rootDir, "MEMORY.md");
    const byType = new Map();
    for (const mem of metadata.values()) {
      if (!byType.has(mem.type)) {
        byType.set(mem.type, []);
      }
      byType.get(mem.type).push(mem);
    }

    let content = "# Structured Memory Index\n\n";
    content += `This is a human-readable index of all stored memories.\n\n`;

    const typeNames = {
      user: "👤 User",
      feedback: "💬 Feedback",
      project: "📁 Project",
      reference: "📚 Reference",
      knowledge: "🧠 Knowledge",
      event: "📅 Events",
      custom: "🔧 Custom"
    };

    for (const [type, entries] of byType.entries()) {
      content += `## ${typeNames[type] || type}\n\n`;
      for (const entry of entries.sort((a, b) => b.importance - a.importance)) {
        const fileName = `${entry.id}.md`;
        const filePath = path.join(String(type), fileName);
        const importance = Math.round(entry.importance * 100);
        content += `- **${entry.title}** (${importance}%) - [${fileName}](${filePath})\n`;
        if (entry.tags.length > 0) {
          content += `  - Tags: ${entry.tags.map(t => `\`${t}\``).join(", ")}\n`;
        }
      }
      content += "\n";
    }

    content += `\n*Last updated: ${new Date().toISOString()}*\n`;

    await fs.writeFile(indexPath, content, "utf-8");
  }

  /**
   * Read a single memory file
   */
  async readMemory(id, type) {
    const filePath = this.getFilePath(id, type);
    if (!await this.fileExists(filePath)) {
      return null;
    }
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = matter(content);
    const metadata = parsed.data;
    return {
      ...metadata,
      content: parsed.content.trim(),
    };
  }

  /**
   * Write a memory to disk
   */
  async writeMemory(memory) {
    const filePath = this.getFilePath(memory.id, memory.type);
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    const content = matter.stringify(memory.content, {
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

    await this.atomicWrite(filePath, content);
  }

  /**
   * Delete a memory (move to archive)
   */
  async archiveMemory(id, type) {
    const srcPath = this.getFilePath(id, type);
    if (!await this.fileExists(srcPath)) {
      return;
    }
    const destPath = this.getArchiveFilePath(id, type);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.rename(srcPath, destPath);
  }

  /**
   * List all memory files across all types
   */
  async listAllMemoryIds() {
    const results = [];
    const types = [
      "user", "feedback", "project", "reference", "knowledge", "event", "custom"
    ];

    for (const type of types) {
      const typeDir = this.getTypeDir(type);
      if (!await this.fileExists(typeDir)) {
        continue;
      }
      const files = await fs.readdir(typeDir);
      for (const file of files) {
        if (file.endsWith(".md")) {
          const id = path.basename(file, ".md");
          results.push({ id, type });
        }
      }
    }
    return results;
  }

  async fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Atomic write using temp file + rename
   */
  async atomicWrite(filePath, content) {
    const dir = path.dirname(filePath);
    const tempPath = path.join(dir, `.tmp-${Date.now()}-${path.basename(filePath)}`);
    await fs.writeFile(tempPath, content, "utf-8");
    await fs.rename(tempPath, filePath);
  }

  getRootDir() {
    return this.rootDir;
  }
}
