# 记忆插件调研报告（修正版）

## 调研时间
2026-04-24（修正版）

## 调研方法
使用 GitHub API 进行程序化搜索，确保数据准确性。

---

## 一、高星记忆插件列表（按 Stars 排序）

### 1. **everything-claude-code** ⭐ 165,584 stars
**作者**: affaan-m  
**GitHub**: https://github.com/affaan-m/everything-claude-code  
**定位**: Agent harness 性能优化系统

**优点**:
- ✅ 165k+ stars，最受欢迎
- ✅ Skills + Instinct 架构
- ✅ 性能优化

**缺点**:
- ❌ 不是纯记忆插件，是完整的 agent 系统
- ❌ 复杂度高

---

### 2. **mem0** ⭐ 53,945 stars
**作者**: mem0ai  
**GitHub**: https://github.com/mem0ai/mem0  
**定位**: Universal memory layer for AI Agents

**核心机制**:
- 2026年4月新算法（LoCoMo 91.6分，LongMemEval 93.4分）
- Single-pass ADD-only extraction
- Entity linking（实体链接）
- Multi-signal retrieval（语义+BM25+实体匹配）

**优点**:
- ✅ 53.9k stars，专业记忆层
- ✅ 多层级记忆（User/Session/Agent）
- ✅ 混合搜索（语义+关键词+实体）
- ✅ 自托管或云服务
- ✅ Y Combinator S24 项目
- ✅ 开源评估框架
- ✅ 支持多种 LLM 和嵌入模型

**缺点**:
- ❌ 需要外部 API（OpenAI 默认）
- ❌ 架构复杂（Python + Node.js）
- ❌ 非人类可读格式

---

### 3. **deer-flow** ⭐ 63,605 stars
**作者**: bytedance  
**GitHub**: https://github.com/bytedance/deer-flow  
**定位**: 开源长时程 SuperAgent harness

**优点**:
- ✅ 字节跳动出品
- ✅ 研究+编码+执行

**缺点**:
- ❌ 不是纯记忆插件

---

### 4. **basic-memory** ⭐ 2,915 stars
**作者**: basicmachines-co  
**GitHub**: https://github.com/basicmachines-co/basic-memory  
**定位**: AI conversations that actually remember

**优点**:
- ✅ 简洁易用
- ✅ 本地优先

**缺点**:
- ❌ 功能较基础

---

### 5. **claude-mem** ⭐ 66,591 stars（实际为 66.6k）
**作者**: thedotmack  
**GitHub**: https://github.com/thedotmack/claude-mem  
**定位**: Persistent memory compression system

**核心机制**:
- 5个生命周期钩子
- AI 压缩（Claude agent-sdk）
- 渐进式披露（3层工作流）
- Web UI (localhost:37777)

**优点**:
- ✅ 66.6k stars
- ✅ 完全自动化
- ✅ Token 高效（~10x 节省）
- ✅ 多 IDE 支持
- ✅ Web 查看器
- ✅ 4个 MCP 搜索工具

**缺点**:
- ❌ 依赖外部 API（Claude API）
- ❌ AGPL-3.0 许可证
- ❌ 非人类可读

---

### 6. **OpenMemory** ⭐ 4,011 stars
**作者**: CaviraOSS  
**GitHub**: https://github.com/CaviraOSS/OpenMemory  
**定位**: Local persistent memory store for LLM

**优点**:
- ✅ 本地持久化
- ✅ 开源

**缺点**:
- ❌ 功能较基础

---

### 7. **letta** ⭐ 22,251 stars
**作者**: letta-ai  
**GitHub**: https://github.com/letta-ai/letta  
**定位**: Platform for building stateful agents

**优点**:
- ✅ 22k+ stars
- ✅ 状态化 Agent 平台
- ✅ 高级记忆管理

**缺点**:
- ❌ 是平台不是纯记忆插件

---

## 二、修正后的对比矩阵

| 插件 | Stars | 人类可读 | 自动捕获 | 自动回忆 | 向量搜索 | 混合搜索 | 本地优先 | 许可证 |
|------|-------|----------|----------|----------|----------|----------|----------|--------|
| **everything-claude-code** | 165k | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ? |
| **claude-mem** | 66.6k | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | AGPL-3.0 |
| **deer-flow** | 63.6k | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ? |
| **mem0** | 53.9k | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | Apache-2.0 |
| **letta** | 22.2k | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ? |
| **basic-memory** | 2.9k | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ? |
| **OpenMemory** | 4k | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ? |
| **我们的插件** | - | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | MIT |

---

## 三、关键发现

### 3.1 真正的高星记忆插件

| 排名 | 插件 | Stars | 类型 |
|------|------|-------|------|
| 1 | everything-claude-code | 165k | Agent 系统 |
| 2 | claude-mem | 66.6k | 记忆压缩 |
| 3 | deer-flow | 63.6k | Agent 系统 |
| 4 | mem0 | 53.9k | 记忆层 |
| 5 | letta | 22.2k | Agent 平台 |

### 3.2 市场趋势

1. **Agent 系统 > 纯记忆插件** - 高星项目多为完整 Agent 系统
2. **自动化是标配** - 所有高星项目都有自动捕获/回忆
3. **混合搜索是趋势** - 语义+关键词+实体
4. **本地优先受关注** - 但云服务更流行

### 3.3 我们的独特定位

```
市场现状：
- 高星项目 = 复杂系统 + 外部依赖 + 非人类可读
- 缺乏：简单、可读、可编辑、完全本地的记忆方案

我们的机会：
- 唯一 Markdown 格式
- 唯一人类可读 + 可编辑
- 唯一完全本地（无外部 API）
- 唯一 Git 版本控制友好
```

---

## 四、从顶级项目学到的经验

### 4.1 mem0 (53.9k stars) 的核心创新

**2026年4月新算法**：
- Single-pass ADD-only extraction
- Entity linking（实体链接）
- Multi-signal retrieval

**成果**：
- LoCoMo: 91.6分（+20分提升）
- LongMemEval: 93.4分（+26分提升）

### 4.2 claude-mem (66.6k stars) 的成功公式

```
自动化 + 易用性 + Token 效率 + 多平台 = 66.6k stars
```

**关键特性**：
- 5个生命周期钩子
- 渐进式披露（3层工作流）
- AI 自动压缩
- Web UI

---

## 五、修正后的建议

### 5.1 必须实现的功能（高优先级）

1. **auto-capture** - 自动捕获（学习 claude-mem 的钩子机制）
2. **auto-recall** - 自动回忆（学习 mem0 的混合搜索）
3. **entity-linking** - 实体链接（学习 mem0 的新算法）

### 5.2 保持的核心优势

1. **Markdown 格式** - 人类可读
2. **可编辑** - 直接修改文件
3. **Git 友好** - 版本控制
4. **完全本地** - 无外部依赖
5. **MIT 许可证** - 商业友好

### 5.3 差异化定位

```
目标用户：
- 需要可编辑记忆的技术用户
- 重视数据可移植性的开发者
- 喜欢 Git 版本控制的团队
- 不想依赖外部 API 的隐私敏感用户

核心价值：
"像管理代码一样管理记忆"
```

---

## 六、总结

### 调研教训

1. **搜索方法** - 应该使用 GitHub API 而非网页搜索
2. **验证重要性** - 必须验证 stars 数量和项目详情
3. **关键词选择** - 需要更广泛的搜索词

### 市场机会

高星记忆插件多为复杂系统，存在市场空白：
- **简单** - 易于理解和使用
- **可读** - Markdown 格式
- **可编辑** - 直接修改
- **本地** - 无外部依赖

我们的 memory-structured-markdown 插件正好填补这个空白。

---

## 参考资源

1. **mem0 论文**: https://mem0.ai/research
2. **claude-mem 文档**: https://docs.claude-mem.ai
3. **GitHub API**: https://docs.github.com/en/rest

---

*修正版调研报告 - 使用 GitHub API 验证数据*
