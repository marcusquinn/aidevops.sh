# Agent Instructions

This directory contains project-specific agent context. The [aidevops](https://aidevops.sh)
framework is loaded separately via the global config (`~/.aidevops/agents/`).

## Purpose

Files in `.agents/` provide project-specific instructions that AI assistants
read when working in this repository. Use this for:

- Domain-specific conventions not covered by the framework
- Project architecture decisions and patterns
- API design rules, data models, naming conventions
- Integration details (third-party services, deployment targets)

## Adding Agents

Create `.md` files in this directory for domain-specific context:

```text
.agents/
  AGENTS.md              # This file - overview and index
  api-patterns.md        # API design conventions
  deployment.md          # Deployment procedures
  data-model.md          # Database schema and relationships
```

Each file is read on demand by AI assistants when relevant to the task.

## Security

This is a static website project. No AI/LLM dependencies or features that process untrusted content through language models. Standard web security practices apply (CSP headers, input sanitization, dependency auditing).

For framework-level security guidance (prompt injection defense, credential isolation, worker sandboxing), see the [aidevops framework docs](https://github.com/marcusquinn/aidevops) `tools/security/prompt-injection-defender.md`.
