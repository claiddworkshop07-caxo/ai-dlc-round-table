# Bolt: bolt-001 — 備品マスタ管理（登録・編集・一覧・QRコード発行）

## 0. Bolt Purpose
- Target Intent: INT-000
- Target Unit: INT-000_UNIT-001
- Target User Stories: US-001
- Goal (Definition of Done):
  - 備品の登録・編集・論理削除ができる
  - 備品一覧でステータス（利用可能/貸出中）を確認できる
  - 備品詳細でQRコードを表示・ダウンロードできる
  - DBスキーマ（equipmentテーブル）が作成されている

## 1. Scope

### In Scope
- DBスキーマ定義（equipmentテーブル）+ Drizzle マイグレーション
- 備品CRUD API（Netlify Functions または Next.js API Routes）
  - GET /api/equipment (一覧)
  - POST /api/equipment (登録)
  - GET /api/equipment/[id] (詳細)
  - PUT /api/equipment/[id] (編集)
  - DELETE /api/equipment/[id] (論理削除)
- フロントエンドページ
  - /equipment: 備品一覧ページ（検索・フィルタ付き）
  - /equipment/new: 備品登録フォーム
  - /equipment/[id]: 備品詳細・QRコード表示・編集
- QRコード生成（qrcode ライブラリ）
- QRコードPNGダウンロード機能

### Out of Scope
- 認証・ユーザー管理
- 貸出・返却処理（Bolt-002で実装）
- 貸出状況ダッシュボード（Bolt-003で実装）

## 2. Dependencies & Prerequisites
- Dependencies: Neon DB接続（DATABASE_URL 環境変数）、Drizzle ORM
- Prerequisites: Netlify環境変数にDATABASE_URLが設定済み
- Constraints: 既存コメント画面（/comment）との共存、既存DBスキーマへの影響なし

## 3. Design Diff
- Domain/Component設計を本Boltで新規作成
- 追加テーブル: equipment
- 追加API: /api/equipment (CRUD)
- 追加ページ: /equipment, /equipment/new, /equipment/[id]
- エラーハンドリング: 貸出中備品の削除試行時に409エラーを返す

## 4. Implementation & Tests
- Target paths:
  - `src/db/schema.ts` (equipmentテーブル追加)
  - `src/app/api/equipment/` (API Routes)
  - `src/app/equipment/` (UIページ)
  - `src/components/equipment/` (備品関連コンポーネント)
- Unit test viewpoints:
  - 備品登録APIが正しくDBに保存できること
  - 貸出中備品削除APIが409を返すこと
  - QRコード生成が備品IDを含むデータURLを返すこと

## 5. Deployment Units
- Affected deployment units: Netlify（フロントエンド + API Routes）
- Deployment procedures: `netlify deploy --prod` または GitHub mainブランチへのpush
- Rollback: Netlifyコンソールから前のデプロイメントへのロールバック

## 6. Approval Gate
- [x] Scope is agreed upon
- [x] Design diff is appropriate
- [x] Test viewpoints are appropriate
- [x] Deployment/rollback is appropriate

Approver: ワークショップ参加者
Approval Date: 2026-04-15

## Outcome
- What was completed: （実装後に記入）
- What could not be completed: （実装後に記入）
- Changed design/assumptions: （実装後に記入）

## Open Issues
- QRコードのデータ形式: `/equipment/{id}` のURLパス形式を採用予定（要最終確認）

## Next Bolt
- What to do next: Bolt-002 — QRコードスキャンによる貸出・返却処理
- Required input for next: Bolt-001のequipmentテーブル・APIが完成していること
- Risks: スマートフォンブラウザのカメラAPIアクセス（HTTPS必須）
