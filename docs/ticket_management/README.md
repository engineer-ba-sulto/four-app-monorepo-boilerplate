# チケット管理

実装タスクの正本。仕様・設計は [`docs/reference/`](../reference/) を参照する。

## レイアウト

| パス | 用途 |
| --- | --- |
| `docs/ticket_management/todo/` | 未完了 |
| `docs/ticket_management/done/YYYY-MM-DD/` | 完了（移動時に日付フォルダを作成） |

## 命名

`YYYY-MM-DD_<連番>_<task_name>.md`

- **チケット ID**（コミット用）: `YYYY-MM-DD_<連番>`（例: `2026-06-07_1`）
- `<連番>`: 実施順（`_1_`, `_2_`, …）

## コミット

チケット対応のコミット件名に ID を含める。手順: [`.cursor/commands/create-commit-message-with-id+ticket.md`](../../.cursor/commands/create-commit-message-with-id+ticket.md)

ルール詳細: [`.cursor/rules/ticket-management.mdc`](../../.cursor/rules/ticket-management.mdc)
