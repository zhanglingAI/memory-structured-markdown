/**
 * Importance decay calculation
 * Updates importance based on time decay and access frequency.
 */

const DEFAULT_DECAY_RATE = 0.005;  // 0.5% per day
const DEFAULT_MIN_IMPORTANCE = 0.1;

export function calculateCurrentImportance(
  memory,
  decayEnabled = true,
  decayRate = DEFAULT_DECAY_RATE,
  minImportance = DEFAULT_MIN_IMPORTANCE
) {
  if (!decayEnabled) {
    return memory.importance;
  }

  const now = Date.now();
  const daysSinceLastAccess = (now - memory.lastAccessedAt) / (1000 * 60 * 60 * 24);

  // Exponential decay: importance = importance * (1 - decayRate) ^ days
  let current = memory.importance * Math.pow(1 - decayRate, daysSinceLastAccess);

  // Boost importance when accessed: + (1 - importance) * 0.1 per access
  // This means frequent access gradually increases importance
  const boost = (1 - current) * (memory.accessCount / 100);
  current += boost;

  // Clamp to min and max
  return Math.max(minImportance, Math.min(1, current));
}

export function shouldArchive(
  importance,
  minImportance = DEFAULT_MIN_IMPORTANCE
) {
  return importance < minImportance;
}

export function updateImportanceOnAccess(memory) {
  return {
    ...memory,
    accessCount: memory.accessCount + 1,
    lastAccessedAt: Date.now(),
  };
}
