#+ データ構造とエンドポイント（Hackathon）

## 前提/認証
- 帰宅のみを対象。出発地は「キャンパス」固定、到着地は湘南台駅/辻堂駅のみ。
- 認証はダミー。`X-User-Id: <ascii lowercase>`（例: `kawaemon`）。存在しなければ初回操作時に作成。

## ユーザーフロー（最小）
1) 一覧で目的地（湘南台/辻堂）とキャンパス内乗車位置（G駐車場/デルタ裏/正面交差点前）を確認。
2) 時間が合えばライドを作成（運転者）または参加（同乗者）。
3) 自分が作成/参加したライドを確認。必要なら離脱/削除。

## エンドポイント
- GET `/rides?destination=shonandai|tsujido&fromSpot=g_parking|delta_back|main_cross&date=YYYY-MM-DD`
- POST `/rides`（作成）
- GET `/rides/:id`（詳細）
- POST `/rides/:id/join`（参加）/ POST `/rides/:id/leave`（離脱）
- DELETE `/rides/:id`（運転者のみ）
- GET `/me/rides?role=driver|member|all`（自分関連）

### リクエスト/レスポンス例
- POST `/rides`
```json
{
  "destination": "shonandai",
  "fromSpot": "g_parking",
  "departsAt": "2025-09-07T18:00:00Z",
  "capacity": 3,
  "note": "G駐車場集合"
}
```
- Ride Resource
```json
{
  "id": 12,
  "driver": { "id": "kawaemon", "name": "Kawae" },
  "destination": "shonandai",
  "fromSpot": "g_parking",
  "departsAt": "2025-09-07T18:00:00Z",
  "capacity": 3,
  "membersCount": 2,
  "joined": true
}
```

## データモデル（Prisma）
```prisma
enum Destination { shonandai tsujido }
enum FromSpot { g_parking delta_back main_cross }

model User {
  id    String @id   // ascii lowercase user id
  name  String
}

model Ride {
  id         Int          @id @default(autoincrement())
  driverId   String
  destination Destination
  fromSpot    FromSpot
  departsAt   DateTime
  capacity    Int
  note        String      @default("")
  createdAt   DateTime    @default(now())
  driver      User        @relation(fields: [driverId], references: [id])
  members     RideMember[]
  @@index([departsAt])
}

model RideMember {
  rideId   Int
  userId   String
  joinedAt DateTime @default(now())
  ride     Ride    @relation(fields: [rideId], references: [id])
  user     User    @relation(fields: [userId], references: [id])
  @@id([rideId, userId])
}
```

## ルール/制約
- 目的地は `shonandai`/`tsujido`、乗車位置は `g_parking`/`delta_back`/`main_cross` に限定。
- `X-User-Id` は小文字英数字/ハイフンのみ想定（例: `^[a-z0-9-]{1,32}$`）。
- `capacity >= 1`。満席時は参加不可。重複参加不可。
- 削除は運転者のみ。`departsAt` の過去作成は許容（簡略化）。
- バリデーション: `departsAt` は ISO8601、`capacity` は整数（例: 1..6）。

## ページ構成案（Front: Vite + React + Mantine）
- 共通: ヘッダーからログインモーダルを開き、`id` と `password` を入力。
  - `password` は検証しない。`id` を `X-User-Id` としてインメモリ保持（Context/State）。
  - タブごとに独立したセッション。ページ再読込で値は消える（デモ容易化）。
  - `localStorage`/`sessionStorage` は使用しない。
- `/` ライド一覧・フィルタ
  - コンポーネント: `Select(destination)`, `Select(fromSpot)`, `DatePickerInput(date)`, `RideCard[]`
  - アクション: 新規作成ボタン（`/ride/new`）、カードから詳細へ遷移。
- `/ride/new` ライド作成フォーム
  - フィールド: `destination`, `fromSpot`, `departsAt`, `capacity`, `note`
  - 送信で作成 → 作成したライド詳細へ。
- `/ride/:id` ライド詳細
  - 内容: 概要、参加者数/定員、参加/離脱ボタン（自分が運転者なら削除ボタン）。
- `/me` 自分のライド
  - タブ: `driver`（自分が運転）、`member`（参加）、`all`。

実装メモ
- データ取得は素の `fetch` + `useEffect` で十分。複雑化を避ける。
- UIはMantineの`AppShell`, `Stack`, `Group`, `Card`, `Button` を中心に最小構成。
- ルーティングは `react-router-dom`（`/`, `/ride/new`, `/ride/:id`, `/me`）。
 - 対応ブラウザ: 最新 Chrome のみ（ビルド/トランスパイルターゲットは `esnext`）。

## 画面遷移フロー（概略）
```mermaid
flowchart TD
  A[Home /rides 一覧] -->|新規作成| B[Create /ride/new]
  A -->|カードを開く| C[Detail /ride/:id]
  C -->|参加/離脱| C
  C -->|戻る| A
  B -->|作成成功| D[Detail /ride/:id]
  D --> E[Me /me]
  A --> E
  E -->|詳細へ| C
  C -->|削除(運転者)| A
```

## フロントのAPI接続
- `front/src/api/client.ts` は実APIのみを使用。
- 接続先は `front/.env` の `VITE_API_BASE` で指定（例: `http://localhost:8787`）。
- 認証は `X-User-Id` ヘッダーで送信（ハッカソン仕様）。
- 使い方（ページから呼び出す想定）:
  - `import { api } from "./api/client";`
  - 例: `api.listRides({ destination: "shonandai" }, userId)`
