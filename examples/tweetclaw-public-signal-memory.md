# TweetClaw Public Signal Memory Example

This example shows how to turn reviewed public X/Twitter results into a structured markdown memory. TweetClaw gathers source context; `memory-structured-markdown` stores only the reviewed packet.

## Setup

```bash
openclaw plugins install @xquik/tweetclaw
openclaw config set tools.alsoAllow '["explore", "tweetclaw", "memory_store", "memory_recall"]'
```

Configure TweetClaw with your local Xquik environment variable:

```bash
openclaw config set plugins.entries.tweetclaw.config.apiKey "$XQUIK_API_KEY"
```

## Collection Prompt

Ask OpenClaw to collect public source context before storing memory:

```text
Use TweetClaw to search tweets and tweet replies for "openclaw memory plugin".
Return 5 public source candidates with tweet URL, tweet ID, handle, posted time,
query used, and a 1 sentence relevance note. Do not store anything yet.
```

Review the returned packet. Remove low-quality, private, or action-oriented material before saving.

## Memory File

The plugin can store the reviewed packet through `memory_store`, or you can create a file directly because the memory format is plain markdown.

```markdown
---
id: tweetclaw-public-signal-openclaw-memory-2026-05-24
type: reference
title: TweetClaw Public Signals - OpenClaw Memory Plugin Feedback
createdAt: 1779627600000
updatedAt: 1779627600000
accessCount: 0
lastAccessedAt: 1779627600000
importance: 0.72
tags: ['tweetclaw', 'x-twitter', 'public-sources', 'openclaw-memory']
---

## Query

`openclaw memory plugin`

## Reviewed Public Sources

| Source | Why It Matters |
| --- | --- |
| `<tweet-url-1>` | Public discussion asking for editable memory files and Git-friendly history. |
| `<tweet-url-2>` | Reply thread comparing Markdown memories with vector-only memory stores. |

## Agent Notes

- Store source URLs, IDs, handles, and short relevance notes.
- Do not store direct messages, login material, or unapproved post drafts.
- Use this memory for future product research, documentation planning, and follow-up search queries.
```

## Follow-Up

Later, recall the packet before writing docs or planning product work:

```text
Use memory_recall for TweetClaw public signals about OpenClaw memory plugins.
Then suggest documentation updates, citing only reviewed public source URLs.
```
