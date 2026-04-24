# memory-structured-markdown

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw Plugin](https://img.shields.io/badge/OpenClaw-Plugin-blue.svg)](https://github.com/openclaw/openclaw)

> Structured markdown memory for OpenClaw - each memory is a separate markdown file with YAML frontmatter.

中文 | [English](#english)

## 简介

`memory-structured-markdown` 是一个 OpenClaw 记忆插件，将每条记忆存储为独立的 Markdown 文件，带有 YAML frontmatter 元数据。人类可读、可编辑，支持可选的语义搜索。

### 特点

- **人类可读 & 可编辑**：每条记忆都是独立的 Markdown 文件，可直接阅读和编辑
- **类型组织**：内置 6 种记忆类型（user, feedback, project, reference, knowledge, event）+ 自定义
- **自动重要性衰减**：不常访问的记忆重要性随时间降低，低重要性记忆自动归档
- **可选语义搜索**：启用 Embedding 时支持混合关键词 + 向量搜索
- **自动索引维护**：自动更新 METADATA.json（机器）和 MEMORY.md（人类）索引
- **原子写入**：安全的并发访问，使用文件锁和原子重命名
- **文件监视**：外部编辑 Markdown 文件自动检测并重新索引

## 设计灵感

基于对 Claude Code 和 Hermes-agent 记忆系统的分析：

- 结合 Claude 的人类可读方法与 Hermes 的插件架构
- 通过更好的组织和自动维护进行改进

## 安装

### 方法 1：作为 OpenClaw 插件安装

1. 克隆此仓库到 OpenClaw 扩展目录：

```bash
cd ~/.openclaw/extensions
git clone https://github.com/yourusername/memory-structured-markdown.git
```

2. 在 OpenClaw 配置中启用插件：

```yaml
memory:
  provider: memory-structured-markdown
  'memory-structured-markdown':
    rootDir: "~/.openclaw/memory/structured"
    enableEmbedding: true
    importanceDecayEnabled: true
    importanceDecayRate: 0.005
    minImportance: 0.1
    embedding:
      apiKey: "your-api-key-here"
      model: "text-embedding-3-small"
```

### 方法 2：手动复制

将 `memory-structured-markdown` 目录复制到 `~/.openclaw/extensions/`，然后重启 OpenClaw。

## 配置

| 设置 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `rootDir` | string | ✅ | - | 记忆文件存储根目录 |
| `enableEmbedding` | boolean | - | `false` | 启用向量嵌入语义搜索 |
| `embedding.apiKey` | string | ✅ (启用时) | - | 嵌入服务 API 密钥 |
| `embedding.model` | string | - | `text-embedding-3-small` | 嵌入模型名称 |
| `embedding.baseUrl` | string | - | - | 自定义 API 基础 URL |
| `embedding.dimensions` | number | - | - | 向量维度（非 OpenAI 模型必需） |
| `importanceDecayEnabled` | boolean | - | `true` | 启用重要性衰减 |
| `importanceDecayRate` | number | - | `0.005` | 每日衰减率（0.005 = 0.5%/天） |
| `minImportance` | number | - | `0.1` | 低于此重要性的记忆自动归档 |

### 国内服务商配置示例

**智谱 AI:**
```yaml
embedding:
  apiKey: "${ZHIPU_API_KEY}"
  model: "embedding-2"
  baseUrl: "https://open.bigmodel.cn/api/paas/v4"
  dimensions: 1024
```

**通义千问 (阿里):**
```yaml
embedding:
  apiKey: "${DASHSCOPE_API_KEY}"
  model: "text-embedding-v1"
  baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1"
  dimensions: 1536
```

## 存储结构

```
{rootDir}/
├── METADATA.json          # 机器可读元数据索引
├── MEMORY.md              # 人类可读记忆索引
├── user/                  # 用户信息（角色、偏好）
├── feedback/              # 反馈和纠正
├── project/               # 项目信息（目标、决策）
├── reference/             # 参考资料（链接、文档）
├── knowledge/             # 通用知识和经验教训
├── event/                 # 历史事件
├── custom/                # 自定义记忆
└── archive/              # 归档的低重要性记忆
```

## 记忆文件格式

每条记忆都是标准 Markdown 文件，带 YAML frontmatter：

```markdown
---
id: a1b2c3d4-1234-5678-9012-abcdef123456
type: user
title: 用户偏好
createdAt: 1713700000000
updatedAt: 1713700000000
accessCount: 5
lastAccessedAt: 1713800000000
importance: 0.85
tags: ['preferences', 'coding']
---

用户偏好简洁的回复，使用 TypeScript，2 空格缩进。
```

可以直接用任何文本编辑器编辑这些文件 —— 插件会自动检测更改并更新索引。

## 工作原理

- **重要性衰减**：自上次访问以来，每天重要性降低 `decayRate`
- **访问提升**：每次访问记忆时，重要性略微增加
- **自动归档**：当重要性低于 `minImportance` 时，记忆移动到 `archive/` 目录
- **文件监视**：自动检测外部编辑并更新索引

---

## English

## Features

- **Human readable & editable**: Every memory is a separate markdown file that you can read and edit directly
- **Type organization**: Built-in 6 memory types (user, feedback, project, reference, knowledge, event) plus custom
- **Automatic importance decay**: Memories lose importance over time if not accessed, low importance memories get auto-archived
- **Optional semantic search**: Hybrid keyword + vector search when embedding is enabled
- **Automatic index maintenance**: METADATA.json (machine) and MEMORY.md (human) are automatically updated
- **Atomic writes**: Safe concurrent access with file locking and atomic rename
- **File watching**: External edits to markdown files are automatically detected and reindexed

## Design

Based on analysis of Claude Code and Hermes-agent memory systems:

- Combines Claude's human-readable approach with Hermes's plugin architecture
- Improves on both with better organization and automatic maintenance

## Features

- **Human readable & editable**: Every memory is a separate markdown file that you can read and edit directly
- **Type organization**: Built-in 6 memory types (user, feedback, project, reference, knowledge, event) plus custom
- **Automatic importance decay**: Memories lose importance over time if not accessed, low importance memories get auto-archived
- **Optional semantic search**: Hybrid keyword + vector search when embedding is enabled
- **Automatic index maintenance**: METADATA.json (machine) and MEMORY.md (human) are automatically updated
- **Atomic writes**: Safe concurrent access with file locking and atomic rename
- **File watching**: External edits to markdown files are automatically detected and reindexed

## Installation

### Method 1: As OpenClaw Plugin

1. Clone this repo to OpenClaw extensions directory:

```bash
cd ~/.openclaw/extensions
git clone https://github.com/yourusername/memory-structured-markdown.git
```

2. Enable in OpenClaw config:

```yaml
memory:
  provider: memory-structured-markdown
  'memory-structured-markdown':
    rootDir: "~/.openclaw/memory/structured"
    enableEmbedding: true
    importanceDecayEnabled: true
    importanceDecayRate: 0.005
    minImportance: 0.1
    embedding:
      apiKey: "your-api-key-here"
      model: "text-embedding-3-small"
```

### Method 2: Manual Copy

Copy `memory-structured-markdown` directory to `~/.openclaw/extensions/`, then restart OpenClaw.

## Configuration

| Setting | Type | Required | Default | Description |
|---------|------|----------|---------|-------------|
| `rootDir` | string | ✅ | - | Root directory for storing memory files |
| `enableEmbedding` | boolean | - | `false` | Enable semantic search with vector embeddings |
| `embedding.apiKey` | string | ✅ (if enableEmbedding) | - | API key for embedding provider |
| `embedding.model` | string | - | `text-embedding-3-small` | Embedding model name |
| `embedding.baseUrl` | string | - | - | Custom base URL for self-hosted/compatible providers |
| `embedding.dimensions` | number | - | - | Vector dimensions (required for non-OpenAI models) |
| `importanceDecayEnabled` | boolean | - | `true` | Enable automatic importance decay over time |
| `importanceDecayRate` | number | - | `0.005` | Daily decay rate (0.005 = 0.5% per day) |
| `minImportance` | number | - | `0.1` | Memories below this importance get auto-archived |

## Storage Structure

```
{rootDir}/
├── METADATA.json          # Machine-readable metadata index
├── MEMORY.md              # Human-readable memory index
├── user/                  # User information (role, preferences)
│   └── *.md
├── feedback/              # Feedback and corrections
│   └── *.md
├── project/               # Project information (goals, decisions)
│   └── *.md
├── reference/             # Reference materials (links, docs)
│   └── *.md
├── knowledge/             # General knowledge and lessons learned
│   └── *.md
├── event/                 # Historical events
│   └── *.md
├── custom/                # Custom memories
│   └── *.md
└── archive/              # Archived low-importance memories
    └── ...
```

## Memory File Format

Each memory file is a standard markdown file with YAML frontmatter:

```markdown
---
id: a1b2c3d4-1234-5678-9012-abcdef123456
type: user
title: User Preferences
createdAt: 1713700000000
updatedAt: 1713700000000
accessCount: 5
lastAccessedAt: 1713800000000
importance: 0.85
tags: ['preferences', 'coding']
---

User prefers concise responses, uses TypeScript with 2-space indentation.
```

You can edit these files directly with any text editor — the plugin automatically detects changes and updates its index.

## How It Works

- **Importance Decay**: Every memory's importance decreases by `decayRate` per day since last access
- **Access Boost**: Each time a memory is accessed, its importance increases slightly
- **Auto-Archiving**: When importance drops below `minImportance`, the memory is moved to the `archive/` directory
- **File Watching**: External edits to memory files are automatically detected and the index is updated

## License

MIT License - see [LICENSE](LICENSE) file for details.
