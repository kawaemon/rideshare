# Repository Guidelines

## プロジェクト構成（TypeScript）
- ルート: `api/`（Hono + Prisma + SQLite）, `front/`（Vite + React + Mantine）。
- 推奨配置: `api/src/`（ルート/ハンドラ）, `api/src/lib/`（DB/Auth 等）, `api/prisma/schema.prisma`。
- フロントは `front/src/pages/`, `front/src/components/` の2レイヤで簡潔に。

## モジュール分離（最重要）
- 疎結合を徹底。レイヤは以下を分離し、片方向依存にする。
  - DB 管理: `DbClient` クラス（Prisma を隠蔽）。CRUD だけ公開。
  - リクエスト処理: `RideController` 等のクラス。DB にはインターフェイス経由で依存。
  - 認証: `auth.ts` モジュール（`getUserId(req)`）。ハッカソンでは `X-User-Id` を使用。
- 例: `RideController` → `DbClient`（IF）→ Prisma、`auth` はリクエスト境界のみで使用。

## ビルド/実行
- 依存: 各ワークスペースで `pnpm install`。
- API: `cd api && pnpm prisma migrate dev && pnpm dev`（scripts 例は下記）。
- Front: `cd front && pnpm dev`。
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
- 2スペース, UTF-8, LF。Prettier/ESLint を前提（`pnpm lint` 任意）。
- 命名: camelCase（変数/関数）, PascalCase（クラス/React）, kebab-case（ファイル）。
- 1ファイル1責務。200行を超えそうなら分割。
- if には必ず波括弧を使うこと。
- コードを詰め込みすぎず、処理の区切りに空行を入れ読みや。い状態を保つこと。

## テストについて
- ハッカソンではテストは不要。テストコードの追加は行わない。

## コミット/PR
- 作業しやすい最小単位でコミット（機能/修正/リファクタ単位）。
- 件名は簡潔な命令形: `add ride join endpoint`。
- PR は要約、関連 Issue、スクショ（UI）/サンプルリクエスト（API）、確認手順を記載。
