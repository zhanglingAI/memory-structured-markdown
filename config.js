import { homedir } from "node:os";

function resolveEnvVars(value) {
  return value.replace(new RegExp("\\$\\{([^}]+)\}", "g"), (_, envVar) => {
    const envValue = process.env[envVar];
    if (!envValue) {
      throw new Error(`Environment variable ${envVar} is not set`);
    }
    return envValue;
  });
}

function assertAllowedKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length === 0) {
    return;
  }
  throw new Error(`${label} has unknown keys: ${unknown.join(", ")}`);
}

const DEFAULT_ROOT_DIR = `${homedir()}/.openclaw/memory/structured`;
const DEFAULT_DECAY_RATE = 0.005;
const DEFAULT_MIN_IMPORTANCE = 0.1;

export const structuredMemoryConfigSchema = {
  parse(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("structured memory config required");
    }
    const cfg = value;
    assertAllowedKeys(
      cfg,
      [
        "rootDir",
        "enableEmbedding",
        "embedding",
        "autoCapture",
        "autoRecall",
        "importanceDecayEnabled",
        "importanceDecayRate",
        "minImportance",
      ],
      "structured-memory config"
    );

    if (typeof cfg.rootDir !== "string" || !cfg.rootDir) {
      throw new Error("rootDir must be a non-empty string");
    }

    let embedding = undefined;
    if (cfg.embedding !== undefined && cfg.embedding !== null) {
      if (typeof cfg.embedding !== "object" || Array.isArray(cfg.embedding)) {
        throw new Error("embedding must be an object");
      }
      const embeddingObj = cfg.embedding;
      assertAllowedKeys(embeddingObj, ["apiKey", "model", "baseUrl", "dimensions"], "embedding config");
      const emb = embeddingObj;
      if (typeof emb.apiKey !== "string" || !emb.apiKey) {
        throw new Error("embedding.apiKey is required");
      }
      embedding = {
        apiKey: resolveEnvVars(emb.apiKey),
        model: typeof emb.model === "string" ? emb.model : undefined,
        baseUrl: typeof emb.baseUrl === "string" ? resolveEnvVars(emb.baseUrl) : undefined,
        dimensions: typeof emb.dimensions === "number" ? emb.dimensions : undefined,
      };
    }

    let importanceDecayRate = undefined;
    if (typeof cfg.importanceDecayRate === "number") {
      if (cfg.importanceDecayRate < 0 || cfg.importanceDecayRate > 0.1) {
        throw new Error("importanceDecayRate must be between 0 and 0.1");
      }
      importanceDecayRate = cfg.importanceDecayRate;
    }

    let minImportance = undefined;
    if (typeof cfg.minImportance === "number") {
      if (cfg.minImportance < 0 || cfg.minImportance > 1) {
        throw new Error("minImportance must be between 0 and 1");
      }
      minImportance = cfg.minImportance;
    }

    return {
      rootDir: cfg.rootDir || DEFAULT_ROOT_DIR,
      enableEmbedding: cfg.enableEmbedding === true,
      embedding,
      autoCapture: cfg.autoCapture === true,
      autoRecall: cfg.autoRecall === true,
      importanceDecayEnabled: cfg.importanceDecayEnabled !== false,
      importanceDecayRate: importanceDecayRate ?? DEFAULT_DECAY_RATE,
      minImportance: minImportance ?? DEFAULT_MIN_IMPORTANCE,
    };
  },
};
