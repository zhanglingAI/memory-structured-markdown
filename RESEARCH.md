# 记忆插件调研报告

## 调研时间
2026-04-24

## 调研目标
对比分析主流 AI 记忆插件，为 memory-structured-markdown 插件提供改进方向。

---

## 一、调研对象

### 1. Claude Code 官方/社区插件

#### 1.1 memory-lancedb (OpenClaw 官方)
- **位置**: `openclaw/extensions/memory-lancedb`
- **存储**: LanceDB (向量数据库)
- **特点**:
  - 向量搜索 (L2 distance)
  - 自动捕获 (auto-capture) - 分析对话自动存储
  - 自动回忆 (auto-recall) - 自动注入相关记忆到上下文
  - 分类系统 (preference, decision, entity, fact, other)
  - 重复检测 (相似度 > 0.95)
  - 提示注入防护
  - CLI 命令支持
  - 生命周期钩子 (before_prompt_build, agent_end)

#### 1.2 active-memory (OpenClaw 官方)
- **位置**: `openclaw/extensions/active-memory`
- **特点**:
  - 基于对话摘要的主动记忆
  - 可配置的思考级别
  - 多种查询模式 (message, recent, full)
  - 会话切换支持
  - 缓存机制

#### 1.3 memory-core (OpenClaw 官方)
- **位置**: `openclaw/extensions/memory-core`
- **特点**:
  - 基础记忆搜索管理器
  - 内置向量搜索
  - FTS (全文搜索)
  - 混合搜索

### 2. 第三方 Claude Code 插件

#### 2.1 Claude Code Memory (社区)
- **特点**:
  - 基于文件的存储
  - CLAUDE.md 自动维护
  - 项目上下文感知

#### 2.2 Nemp (记忆插件)
- **特点**:
  - 记住一切
  - 持久化记忆

#### 2.3 Shared Memory
- **特点**:
  - 跨 Agent 共享记忆
  - Space-based 共享
  - 团队协作用例

---

## 二、功能对比矩阵

| 功能维度 | memory-lancedb | active-memory | memory-core | **我们的插件** | 行业最佳 |
|----------|----------------|---------------|-------------|----------------|----------|
| **存储格式** | LanceDB (二进制) | 文本摘要 | SQLite | **Markdown** | Markdown |
| **人类可读** | ❌ | ⚠️ | ❌ | **✅** | ✅ |
| **可编辑** | ❌ | ❌ | ❌ | **✅** | ✅ |
| **版本控制** | ❌ | ❌ | ❌ | **✅ (Git)** | ✅ |
| **向量搜索** | ✅ | ✅ | ✅ | **✅ (可选)** | ✅ |
| **关键词搜索** | ❌ | ✅ | ✅ | **✅** | ✅ |
| **混合搜索** | ❌ | ✅ | ✅ | **✅** | ✅ |
| **自动捕获** | ✅ | ✅ | ❌ | **❌** | ✅ |
| **自动回忆** | ✅ | ✅ | ❌ | **❌** | ✅ |
| **重要性衰减** | ❌ | ❌ | ❌ | **✅** | ✅ |
| **自动归档** | ❌ | ❌ | ❌ | **✅** | ✅ |
| **分类系统** | ✅ (5类) | ❌ | ❌ | **✅ (7类)** | ✅ |
| **重复检测** | ✅ | ❌ | ❌ | **❌** | ✅ |
| **提示注入防护** | ✅ | ❌ | ❌ | **❌** | ✅ |
| **生命周期钩子** | ✅ | ✅ | ❌ | **❌** | ✅ |
| **CLI 命令** | ✅ | ❌ | ❌ | **❌** | ✅ |
| **文件监视** | ❌ | ❌ | ❌ | **✅** | ✅ |
| **原子写入** | ❌ | ❌ | ❌ | **✅** | ✅ |
| **跨平台** | ✅ | ✅ | ✅ | **✅** | ✅ |
| **本地优先** | ✅ | ✅ | ✅ | **✅** | ✅ |

---

## 三、我们的优势

1. **人类可读性** - 唯一使用 Markdown 格式的插件
2. **可编辑性** - 用户可以直接编辑记忆文件
3. **版本控制友好** - 天然支持 Git
4. **重要性衰减** - 独特的记忆老化机制
5. **自动归档** - 低重要性记忆自动整理
6. **文件监视** - 外部编辑自动同步

---

## 四、需要改进的方面

### 高优先级
1. **自动捕获** - 分析对话自动提取重要信息
2. **自动回忆** - 在对话前自动注入相关记忆
3. **重复检测** - 避免存储相似记忆
4. **提示注入防护** - 防止恶意记忆内容

### 中优先级
5. **生命周期钩子** - 集成 OpenClaw 事件系统
6. **CLI 命令** - 提供命令行管理工具
7. **记忆合并** - 相似记忆自动合并
8. **记忆纠错** - 支持修正和更新

### 低优先级
9. **统计面板** - 记忆使用情况统计
10. **导入导出** - 支持多种格式
11. **记忆分享** - 跨会话/Agent 共享

---

## 五、设计建议

### 5.1 架构改进
```
memory-structured-markdown/
├── index.js              # 插件入口
├── config.js             # 配置解析
├── src/
│   ├── storage.js        # 文件存储层
│   ├── manager.js        # 核心管理器
│   ├── importance.js     # 重要性算法
│   ├── capture.js        # [新增] 自动捕获
│   ├── recall.js         # [新增] 自动回忆
│   ├── dedupe.js         # [新增] 重复检测
│   ├── security.js       # [新增] 安全防护
│   └── types.js          # 类型定义
└── tests/
    └── ...
```

### 5.2 配置扩展
```yaml
memory:
  provider: memory-structured-markdown
  'memory-structured-markdown':
    rootDir: "~/.openclaw/memory/structured"
    enableEmbedding: true
    
    # [新增] 自动捕获配置
    autoCapture: true
    captureMaxChars: 1000
    captureTriggers: ['remember', 'prefer', 'decided']
    
    # [新增] 自动回忆配置
    autoRecall: true
    recallThreshold: 0.7
    recallMaxMemories: 3
    
    # [新增] 重复检测
    deduplication: true
    dedupeThreshold: 0.95
    
    # [新增] 安全防护
    security:
      promptInjectionCheck: true
      escapeHtml: true
      maxMemoryLength: 10000
    
    embedding:
      apiKey: "${OPENAI_API_KEY}"
      model: "text-embedding-3-small"
```

### 5.3 API 设计
```javascript
// 新增工具
api.registerTool({ name: "memory_forget" });      // 删除记忆
api.registerTool({ name: "memory_update" });      // 更新记忆
api.registerTool({ name: "memory_merge" });       // 合并记忆

// 新增钩子
api.on("before_prompt_build", async (event) => {
  // 自动回忆逻辑
});

api.on("agent_end", async (event) => {
  // 自动捕获逻辑
});

// 新增 CLI
api.registerCli(({ program }) => {
  program.command("memory:list");
  program.command("memory:search");
  program.command("memory:stats");
  program.command("memory:export");
  program.command("memory:import");
});
```

---

## 六、实现路线图

### Phase 1: 核心功能完善 (1-2 天)
- [ ] 自动捕获 (capture.js)
- [ ] 自动回忆 (recall.js)
- [ ] 重复检测 (dedupe.js)

### Phase 2: 安全与工具 (1-2 天)
- [ ] 提示注入防护 (security.js)
- [ ] memory_forget 工具
- [ ] memory_update 工具

### Phase 3: CLI 与钩子 (1 天)
- [ ] CLI 命令
- [ ] 生命周期钩子集成

### Phase 4: 高级功能 (可选)
- [ ] 记忆合并
- [ ] 统计面板
- [ ] 导入导出

---

## 七、参考资源

1. **Claude Code 官方文档**: https://docs.anthropic.com/en/docs/claude-code
2. **OpenClaw 插件开发**: https://docs.openclaw.ai/plugins
3. **LanceDB 文档**: https://lancedb.github.io/lancedb/
4. **YAML Frontmatter**: https://jekyllrb.com/docs/front-matter/

---

## 八、总结

我们的 memory-structured-markdown 插件在**人类可读性**和**可编辑性**方面具有独特优势，但在**自动化**和**安全防护**方面需要加强。建议按照 Phase 1-3 的路线图逐步完善，使其成为功能全面、安全可靠的 OpenClaw 记忆插件。
