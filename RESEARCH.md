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

#### 2.1 **claude-mem** ⭐ 66.6k stars (最高！)
**作者**: thedotmack (Alex Newman)  
**GitHub**: https://github.com/thedotmack/claude-mem  
**定位**: 持久化记忆压缩系统

**核心机制**:
- 5个生命周期钩子（SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd）
- 自动捕获工具使用观察（tool usage observations）
- AI 压缩（使用 Claude 的 agent-sdk）
- 语义摘要生成
- 渐进式披露（Progressive Disclosure）
- 3层搜索工作流（search → timeline → get_observations）

**优点**:
- ✅ **66.6k stars** - 最受欢迎的记忆插件
- ✅ 完全自动，零配置
- ✅ Token 高效（~10x 节省）
- ✅ 多 IDE 支持（Claude Code, Gemini CLI, OpenCode, OpenClaw）
- ✅ Web 查看器 UI（localhost:37777）
- ✅ 4个 MCP 搜索工具
- ✅ 混合搜索（Chroma 向量数据库 + SQLite FTS5）
- ✅ 隐私控制（`<private>` 标签）
- ✅ 引用支持（observation IDs）
- ✅ 多语言支持（中文、日语、西班牙语等）
- ✅ 渐进式披露策略
- ✅ 自动安装依赖（Bun, uv）

**缺点**:
- ❌ 依赖外部服务（Claude API 用于压缩）
- ❌ 架构复杂（Worker Service + SQLite + Chroma）
- ❌ AGPL-3.0 许可证（商业使用受限）
- ❌ 需要 Node.js + Bun + uv 环境
- ❌ 非人类可读格式（数据库存储）
- ❌ 不可直接编辑

#### 2.2 Claude Code Memory (社区)
- **特点**:
  - 基于文件的存储
  - CLAUDE.md 自动维护
  - 项目上下文感知

#### 2.3 Nemp (记忆插件)
- **特点**:
  - 记住一切
  - 持久化记忆

#### 2.4 Shared Memory
- **特点**:
  - 跨 Agent 共享记忆
  - Space-based 共享
  - 团队协作用例

---

## 二、功能对比矩阵

| 功能维度 | claude-mem | memory-lancedb | active-memory | memory-core | **我们的插件** | 行业最佳 |
|----------|------------|----------------|---------------|-------------|----------------|----------|
| **Stars** | **66.6k** | - | - | - | - | - |
| **存储格式** | SQLite+Chroma | LanceDB (二进制) | 文本摘要 | SQLite | **Markdown** | Markdown |
| **人类可读** | ❌ | ❌ | ⚠️ | ❌ | **✅** | ✅ |
| **可编辑** | ❌ | ❌ | ❌ | ❌ | **✅** | ✅ |
| **版本控制** | ❌ | ❌ | ❌ | ❌ | **✅ (Git)** | ✅ |
| **向量搜索** | ✅ | ✅ | ✅ | ✅ | **✅ (可选)** | ✅ |
| **关键词搜索** | ✅ (FTS5) | ❌ | ✅ | ✅ | **✅** | ✅ |
| **混合搜索** | ✅ | ❌ | ✅ | ✅ | **✅** | ✅ |
| **自动捕获** | ✅ | ✅ | ✅ | ❌ | **❌** | ✅ |
| **自动回忆** | ✅ | ✅ | ✅ | ❌ | **❌** | ✅ |
| **重要性衰减** | ❌ | ❌ | ❌ | ❌ | **✅** | ✅ |
| **自动归档** | ❌ | ❌ | ❌ | ❌ | **✅** | ✅ |
| **分类系统** | ✅ | ✅ (5类) | ❌ | ❌ | **✅ (7类)** | ✅ |
| **重复检测** | ✅ | ✅ | ❌ | ❌ | **❌** | ✅ |
| **提示注入防护** | ✅ | ✅ | ❌ | ❌ | **❌** | ✅ |
| **生命周期钩子** | ✅ (5个) | ✅ | ✅ | ❌ | **❌** | ✅ |
| **CLI 命令** | ✅ | ✅ | ❌ | ❌ | **❌** | ✅ |
| **渐进式披露** | ✅ | ❌ | ❌ | ❌ | **❌** | ✅ |
| **Web UI** | ✅ | ❌ | ❌ | ❌ | **❌** | ✅ |
| **MCP 工具** | ✅ (4个) | ❌ | ❌ | ❌ | **❌** | ✅ |
| **文件监视** | ❌ | ❌ | ❌ | ❌ | **✅** | ✅ |
| **原子写入** | ❌ | ❌ | ❌ | ❌ | **✅** | ✅ |
| **跨平台** | ✅ | ✅ | ✅ | ✅ | **✅** | ✅ |
| **本地优先** | ⚠️ | ⚠️ | ✅ | ✅ | **✅** | ✅ |

---

## 三、关键洞察

### 3.1 市场领导者分析：claude-mem (66.6k stars)

**为什么它能获得 66.6k stars？**

1. **极致易用** - 单命令安装 (`npx claude-mem install`)，零配置
2. **完全自动化** - 用户无需手动操作，自动捕获和回忆
3. **Token 高效** - 渐进式披露策略节省 10x Token
4. **多平台支持** - Claude Code, Gemini CLI, OpenCode, OpenClaw
5. **Web UI** - 提供可视化界面查看记忆流
6. **AI 压缩** - 使用 Claude 自动压缩和摘要
7. **隐私控制** - `<private>` 标签保护敏感信息

**它的成功公式**：
```
自动化 + 易用性 + Token 效率 + 多平台 = 66.6k stars
```

### 3.2 我们的优势

1. **人类可读性** - 唯一使用 Markdown 格式的插件（claude-mem 是二进制存储）
2. **可编辑性** - 用户可以直接编辑记忆文件
3. **版本控制友好** - 天然支持 Git
4. **重要性衰减** - 独特的记忆老化机制（claude-mem 无此功能）
5. **自动归档** - 低重要性记忆自动整理
6. **文件监视** - 外部编辑自动同步
7. **本地优先** - 无需外部 API（claude-mem 依赖 Claude API 压缩）
8. **MIT 许可证** - 比 AGPL-3.0 更宽松

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

## 八、从 claude-mem 学到的经验

### 8.1 成功要素

| 要素 | claude-mem 做法 | 我们可以借鉴 |
|------|----------------|-------------|
| **易用性** | 单命令安装 | 简化安装流程 |
| **自动化** | 5个钩子完全自动 | 实现 auto-capture + auto-recall |
| **Token 效率** | 渐进式披露（3层工作流） | 实现分层检索 |
| **可视化** | Web UI (localhost:37777) | 可选添加简单 Web 界面 |
| **多平台** | 支持4个 IDE | 保持 OpenClaw 兼容性 |
| **隐私** | `<private>` 标签 | 添加敏感信息标记 |

### 8.2 差异化定位

```
claude-mem: 自动化优先，二进制存储，依赖外部 API
我们的插件: 人类可读优先，Markdown 存储，完全本地
```

**目标用户**：
- 需要直接编辑记忆的技术用户
- 重视数据可移植性的用户
- 喜欢 Git 版本控制的开发者
- 不想依赖外部 API 的隐私敏感用户

## 九、总结

我们的 memory-structured-markdown 插件在**人类可读性**和**可编辑性**方面具有独特优势，但在**自动化**和**安全防护**方面需要加强。

**关键建议**：
1. 学习 claude-mem 的**自动化理念**（5个钩子、渐进式披露）
2. 保持我们的**Markdown 核心优势**
3. 添加 **auto-capture + auto-recall** 实现完全自动化
4. 实现 **分层检索**（索引→时间线→详情）节省 Token
5. 考虑添加 **Web UI** 提升用户体验

建议按照 Phase 1-3 的路线图逐步完善，使其成为**既人类可读又功能全面**的 OpenClaw 记忆插件。
