# Repository Guidelines

この AGENTS.md の変更は厳しく制限されており行ってはならない。

## プロジェクト構成（TypeScript）

- ルート: `api/`（Hono + Prisma + SQLite）, `front/`（Vite + React + Mantine）。
- 推奨配置: `api/src/`（ルート/ハンドラ）, `api/src/lib/`（DB/Auth 等）, `api/prisma/schema.prisma`。
- フロントは `front/src/pages/`, `front/src/components/` の 2 レイヤで簡潔に。

## モジュール分離（最重要）

- 疎結合を徹底。レイヤは以下を分離し、片方向依存にする。
  - DB 管理: `DbClient` クラス（Prisma を隠蔽）。CRUD だけ公開。
  - リクエスト処理: `RideController` 等のクラス。DB にはインターフェイス経由で依存。
  - 認証: `auth.ts` モジュール（`getUserId(req)`）。ハッカソンでは `X-User-Id` を使用。
- 例: `RideController` → `DbClient`（IF）→ Prisma、`auth` はリクエスト境界のみで使用。

## ビルド/実行

- pnpm を実行する際は `corepack pnpm` で実行せよ
- 依存: 各ワークスペースで `pnpm install`。
- API: `cd api && pnpm prisma migrate dev && pnpm dev`（scripts 例は下記）。
- Front: `cd front && pnpm dev`。
- 依存をインストールするときは `pnpm install` を使い最新版を入れること
- 例: `api/package.json`

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p ."
  }
}
```

## コーディング規約と命名

- 2 スペース, UTF-8, LF。Prettier/ESLint を前提（`pnpm lint` 任意）。
- 命名: camelCase（変数/関数）, PascalCase（クラス/React）, kebab-case（ファイル）。
- 1 ファイル 1 責務。200 行を超えそうなら分割。
- if には必ず波括弧を使うこと。
- コードを詰め込みすぎず、処理の区切りに空行を入れ読みやすい状態を保つこと。
- expr as unknown as T, expr as any as T を使ってはいけない。
- any 型は絶対に使ってはいけない
- as による型キャストは極力使ってはいけない。キャストするのではなく証明すること。オブジェクト型の証明には zod が便利である。
- 型や同じ処理の繰り返しを避け、適切に関数化、エイリアス化をすること。

## テストについて

- ハッカソンで使うコードなのでテストは不要
