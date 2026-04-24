# 记忆插件调研报告（最终修正版）

## 调研时间
2026-04-24（最终修正版）

## 调研方法
使用 GitHub API 进行程序化搜索，数据准确可靠。

---

## 一、高星记忆插件列表（按 Stars 排序）

### 1. **mem0** ⭐ 53,945 stars
**作者**: mem0ai  
**GitHub**: https://github.com/mem0ai/mem0  
**许可证**: Apache-2.0  
**定位**: Universal memory layer for AI Agents

**核心机制**:
- 2026年4月新算法（LoCoMo 91.6分，LongMemEval 93.4分）
- Single-pass ADD-only extraction
- Entity linking（实体链接）
- Multi-signal retrieval（语义+BM25+实体匹配）

**优点**:
- ✅ 53.9k stars，最知名的专业记忆层
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

### 2. **memvid** ⭐ 15,105 stars
**作者**: memvid  
**GitHub**: https://github.com/memvid/memvid  
**定位**: Memory layer for AI Agents

**优点**:
- ✅ 15k+ stars
- ✅ Serverless, single-file
- ✅ 替换复杂 RAG 管道

**缺点**:
- ❌ 功能较新，文档可能不完善

---

### 3. **Memori** ⭐ 13,683 stars
**作者**: MemoriLabs  
**GitHub**: https://github.com/MemoriLabs/Memori  
**定位**: Agent-native memory infrastructure

**优点**:
- ✅ 13k+ stars
- ✅ LLM-agnostic
- ✅ Agent 原生设计

**缺点**:
- ❌ 架构复杂

---

### 4. **byterover-cli** ⭐ 4,627 stars
**作者**: campfirein  
**GitHub**: https://github.com/campfirein/byterover-cli  
**定位**: Portable memory layer for autonomous coding agents

**优点**:
- ✅ 4.6k stars
- ✅ 便携式设计
- ✅ 专为编码 Agent 设计

**缺点**:
- ❌ 功能较基础

---

### 5. **MemMachine** ⭐ 3,531 stars
**作者**: MemMachine  
**GitHub**: https://github.com/MemMachine/MemMachine  
**定位**: Universal memory layer for AI Agents

**优点**:
- ✅ 3.5k stars
- ✅ 可扩展
- ✅ 通用设计

**缺点**:
- ❌ 知名度较低

---

### 6. **MoltBrain** ⭐ 248 stars
**作者**: nhevers  
**GitHub**: https://github.com/nhevers/MoltBrain  
**定位**: Long-term memory layer for OpenClaw & MoltBook agents

**优点**:
- ✅ OpenClaw 专用
- ✅ 长期记忆

**缺点**:
- ❌ Stars 较少

---

### 7. **ClawMem** ⭐ 132 stars
**作者**: yoloshii  
**GitHub**: https://github.com/yoloshii/ClawMem  
**定位**: On-device memory layer for AI agents

**优点**:
- ✅ 完全本地
- ✅ 支持 Claude Code, Hermes, OpenClaw

**缺点**:
- ❌ 配置复杂

---

## 二、对比矩阵

| 插件 | Stars | 人类可读 | 自动捕获 | 自动回忆 | 向量搜索 | 混合搜索 | 本地优先 | 许可证 |
|------|-------|----------|----------|----------|----------|----------|----------|--------|
| **mem0** | 53.9k | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | Apache-2.0 |
| **memvid** | 15.1k | ❌ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ? |
| **Memori** | 13.7k | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ? |
| **byterover-cli** | 4.6k | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ? |
| **MemMachine** | 3.5k | ❌ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ? |
| **MoltBrain** | 248 | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ? |
| **ClawMem** | 132 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ? |
| **我们的插件** | - | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | MIT |

---

## 三、关键发现

### 3.1 市场领导者

| 排名 | 插件 | Stars | 特点 |
|------|------|-------|------|
| 1 | mem0 | 53.9k | 专业记忆层，混合搜索，实体链接 |
| 2 | memvid | 15.1k | Serverless，单文件 |
| 3 | Memori | 13.7k | Agent 原生，LLM 无关 |

### 3.2 技术趋势

1. **混合搜索** - 语义+关键词+实体匹配
2. **实体链接** - 跨记忆关联实体
3. **分层记忆** - User/Session/Agent 多级
4. **本地优先** - 减少外部依赖

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

### 4.2 关键设计模式

1. **分层存储** - User/Session/Agent 多级记忆
2. **混合检索** - 语义+关键词+实体
3. **自动捕获** - 对话自动提取
4. **自动回忆** - 上下文自动注入

---

## 五、建议

### 5.1 必须实现的功能（高优先级）

1. **auto-capture** - 自动捕获（学习 mem0 的实体链接）
2. **auto-recall** - 自动回忆（学习混合搜索）
3. **分层记忆** - User/Session/Agent 多级

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

1. **使用 GitHub API** - 确保数据准确
2. **验证 stars 数量** - 避免错误信息
3. **分析核心机制** - 学习优秀设计

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
2. **GitHub API**: https://docs.github.com/en/rest

---

*最终修正版调研报告 - 使用 GitHub API 验证数据*
