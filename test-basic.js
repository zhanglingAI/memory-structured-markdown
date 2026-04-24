/**
 * Basic test for memory-structured-markdown plugin
 */

import { StructuredMemoryStorage } from "./src/storage.js";
import { StructuredMemoryManager } from "./src/manager.js";
import os from "node:os";
import path from "node:path";

async function test() {
  const testDir = path.join(os.tmpdir(), "test-structured-memory-" + Date.now());
  
  console.log("Testing Structured Markdown Memory Plugin...");
  console.log("Test directory:", testDir);

  try {
    // Test 1: Storage
    console.log("\n1. Testing Storage...");
    const storage = new StructuredMemoryStorage({ rootDir: testDir });
    await storage.ensureRootExists();
    console.log("✓ Storage initialized");

    // Test 2: Create memory
    console.log("\n2. Testing Create Memory...");
    const manager = new StructuredMemoryManager(
      {},
      { rootDir: testDir, importanceDecayEnabled: true },
      null
    );
    // Skip watcher for testing
    manager.initialized = true;
    await manager.storage.ensureRootExists();
    await manager.reloadMetadata();
    console.log("✓ Manager initialized");

    const memory = await manager.createMemory({
      type: "knowledge",
      title: "Test Memory",
      content: "This is a test memory about OpenClaw plugins.",
      importance: 0.8,
      tags: ["test", "openclaw"],
    });
    console.log("✓ Memory created:", memory.id);

    // Test 3: Search
    console.log("\n3. Testing Search...");
    const results = await manager.searchKeyword("OpenClaw", 10);
    console.log("✓ Search results:", results.length, "found");
    if (results.length > 0) {
      console.log("  - Score:", results[0].score);
      console.log("  - Snippet:", results[0].snippet);
    }

    // Test 4: Status
    console.log("\n4. Testing Status...");
    const status = manager.status();
    console.log("✓ Status:", JSON.stringify(status, null, 2));

    // Test 5: Read file
    console.log("\n5. Testing Read File...");
    const fileContent = await manager.readFile({ relPath: "knowledge/" + memory.id + ".md" });
    console.log("✓ File content length:", fileContent.text.length);

    // Cleanup
    console.log("\n6. Cleanup...");
    await manager.close();
    console.log("✓ Manager closed");

    console.log("\n✅ All tests passed!");
  } catch (err) {
    console.error("\n❌ Test failed:", err);
    process.exit(1);
  }
}

test();
