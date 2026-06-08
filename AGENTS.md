# AGENTS.md

## RTK

シェルコマンドは必ず `rtk` を付ける。

```bash
rtk git status
rtk cargo test
rtk bun run build
```

`Read` / `Grep` / `Glob` は RTK 経由にならない。代わりに `rtk read` / `rtk grep` / `rtk find` を使う。

詳細なコマンド一覧・フラグ・セットアップは [.cursor/rules/RTK.mdc](./.cursor/rules/RTK.mdc) を参照。
