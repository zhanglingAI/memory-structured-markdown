/**
 * @typedef {'user' | 'feedback' | 'project' | 'reference' | 'knowledge' | 'event' | 'custom'} MemoryType
 */

/**
 * @typedef {Object} MemoryMetadata
 * @property {string} id
 * @property {MemoryType} type
 * @property {string} title
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {number} accessCount
 * @property {number} lastAccessedAt
 * @property {number} importance
 * @property {string[]} tags
 */

/**
 * @typedef {Object} Memory
 * @property {string} id
 * @property {MemoryType} type
 * @property {string} title
 * @property {string} content
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {number} accessCount
 * @property {number} lastAccessedAt
 * @property {number} importance
 * @property {string[]} tags
 * @property {number[]|undefined} embedding
 */

/**
 * @typedef {Object} StructuredMemoryConfig
 * @property {string} rootDir
 * @property {boolean} [enableEmbedding]
 * @property {Object} [embedding]
 * @property {string} embedding.apiKey
 * @property {string} [embedding.model]
 * @property {string} [embedding.baseUrl]
 * @property {number} [embedding.dimensions]
 * @property {boolean} [autoCapture]
 * @property {boolean} [autoRecall]
 * @property {boolean} [importanceDecayEnabled]
 * @property {number} [importanceDecayRate]
 * @property {number} [minImportance]
 */

export {};
