# Bolt: bolt-002 — QRコードスキャンによる貸出・返却処理

## 0. Bolt Purpose
- Target Intent: INT-000
- Target Unit: INT-000_UNIT-001
- Target User Stories: US-002, US-003
- Goal (Definition of Done):
  - スマートフォンのカメラでQRコードをスキャンして、対象備品の貸出・返却ページに遷移できる
  - 貸出フォームで借用者名・返却予定日を入力して貸出を記録できる
  - 返却確認画面で返却を記録できる
  - 貸出・返却によって備品のstatusが正しく更新される

## 1. Scope

### In Scope
- QRコードスキャンページ（カメラ起動・QRコード読み取り）
  - `/scan` ページ（html5-qrcode または jsQR で実装）
- 備品スキャン後の貸出・返却ページ
  - `/scan/[id]` ページ（備品状態に応じて貸出フォーム or 返却確認を表示）
- 貸出API
  - POST /api/lending（借用者名・返却予定日・メモを受け取り、lending_recordを作成、equipmentをborrowedに更新）
- 返却API
  - PUT /api/lending/[id]/return（lending_recordのstatus→returned、returned_atを設定、equipmentをavailableに更新）

### Out of Scope
- ユーザー認証（PoC対象外）
- 貸出履歴一覧（Bolt-003で実装）
- ダッシュボード（Bolt-003で実装）

## 2. Dependencies & Prerequisites
- Dependencies: Bolt-001のequipmentテーブル・APIが完成していること
- Prerequisites: HTTPS環境（Netlify）でカメラAPIが動作すること
- Constraints: スマートフォンブラウザのカメラ権限が必要

## 3. Design Diff
- 追加API: POST /api/lending、PUT /api/lending/[id]/return
- 追加ページ: /scan、/scan/[id]
- 追加コンポーネント: QRScanner.tsx（クライアントコンポーネント）
- ビジネスロジック: 貸出中の備品は貸出不可、利用可能の備品のみ返却不可

## 4. Implementation & Tests
- Target paths:
  - `app/api/lending/route.ts`
  - `app/api/lending/[id]/return/route.ts`
  - `app/scan/page.tsx`
  - `app/scan/[id]/page.tsx`
  - `components/scan/QRScanner.tsx`
- Unit test viewpoints:
  - 貸出中備品への貸出APIが409を返すこと
  - 利用可能備品への返却APIが400を返すこと
  - 貸出成功後に備品statusがborrowedになること
  - 返却成功後に備品statusがavailableになること

## 5. Deployment Units
- Affected deployment units: Netlify（フロントエンド + API Routes）
- Deployment procedures: GitHub mainブランチへのpushで自動デプロイ
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
- QRコードスキャンライブラリ: jsQR（追加パッケージなし・軽量）を採用予定

## Next Bolt
- What to do next: Bolt-003 — 貸出状況ダッシュボード・返却期限アラート・履歴
- Required input for next: Bolt-002のlending APIが完成していること
- Risks: なし
