# Motion Canvas

Motion Canvas is the visual reasoning surface of Motion Hub. It converts natural language or structured JSON into editable diagram documents. The Jarvis chat and the direct Canvas command bar use the same `CommandManager` contract.

## Data flow

```text
Jarvis / CommandBar / Import
             |
             v
       CommandManager
             |
      structured document
             |
   +---------+----------+
   |                    |
NodeManager        EdgeManager
   |                    |
   +------ EventBus ----+
             |
       CanvasEngine
          (Konva)
```

The interface never draws nodes directly. UI actions become commands, commands update the document model, and the renderer incrementally reconciles visible shapes.

## Modules

| Module | Responsibility |
| --- | --- |
| `CanvasPage` | Composition root, Motion Hub lifecycle and module shell. |
| `CanvasEngine` | Konva rendering, node/edge reconciliation and viewport virtualization. |
| `NodeManager` | Normalized editable node model and grouping. |
| `EdgeManager` | Connection model and cleanup when nodes are removed. |
| `LayoutEngine` | Mind map, flow, roadmap, grid and layered architecture layouts. |
| `SelectionManager` | Single/multiple selection, Transformer and keyboard operations. |
| `HistoryManager` | Undo/redo snapshots independent from rendering. |
| `CommandManager` | Shared natural-language/JSON engine and incremental updates. |
| `ViewportManager` | Infinite pan, pointer-relative zoom, fit and focus. |
| `ExportManager` | PNG, SVG, PDF, JSON and Markdown output. |
| `ImportManager` | JSON, Markdown and plain-text ingestion. |
| `PersistenceManager` | Debounced local document persistence. |
| `Toolbar` | Structured edit commands and node creation. |
| `Inspector` | Editable properties for single and multiple selections. |
| `MiniMap` | Lightweight document and viewport overview. |
| `CommandBar` | Direct Jarvis input surface. |
| `CanvasSettings` | Grid, snap and minimap preferences. |
| `EventBus` | Module-neutral events and request contracts. |

## Document contract

```json
{
  "type": "mindmap",
  "title": "Sistema SaaS",
  "nodes": [
    { "id": "root", "type": "title", "title": "Sistema SaaS" },
    { "id": "api", "type": "api", "title": "API" }
  ],
  "connections": [
    { "from": "root", "to": "api" }
  ]
}
```

## Performance model

- The document model keeps every node, but `CanvasEngine` instantiates only nodes inside the viewport plus an overscan buffer.
- Node changes reconcile by ID instead of rebuilding the Stage.
- Edge and node layers use batched redraws.
- MiniMap output is capped at 1,000 DOM markers while the Canvas document may contain more.
- Persistence is debounced to prevent storage writes during drag sequences.

## Extension points

- **Real AI provider:** replace `ai:generate` parsing while preserving the document contract.
- **Realtime collaboration:** replicate `command:committed` events and apply remote commands through `CommandManager`.
- **Comments:** attach comment entities by node ID without changing renderer ownership.
- **Versioning:** persist History snapshots as named versions.
- **Templates:** feed predefined JSON documents to `command:execute` with `action: generate`.
- **Motion Hub projects:** add adapters that produce nodes and edges from projects, tasks and goals.
- **Automatic documentation:** consume the same document through `ExportManager.markdown()` or a richer documentation adapter.
- **Custom node plugins:** register render factories in `CanvasEngine` keyed by node type.
