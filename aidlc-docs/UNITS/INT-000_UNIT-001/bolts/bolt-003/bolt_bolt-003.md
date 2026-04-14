# Bolt: bolt-003 — 貸出状況ダッシュボード・返却期限アラート・貸出履歴

## 0. Bolt Purpose
- Target Intent: INT-000
- Target Unit: INT-000_UNIT-001
- Target User Stories: US-004, US-005
- Goal (Definition of Done):
  - トップページ（/）が貸出状況ダッシュボードになっている
  - 貸出中一覧・返却期限超過アラートをリアルタイムで確認できる
  - 貸出履歴一覧ページ（/history）で全貸出記録を確認できる

## 1. Scope

### In Scope
- トップページ（/）の刷新: ダッシュボード表示
  - 貸出中備品の一覧（借用者名・返却予定日・期限超過バッジ）
  - 期限超過件数のサマリーカード
  - クイックアクション（スキャン・備品管理へのリンク）
- 貸出履歴ページ（/history）
  - 全貸出記録の一覧（貸出中・返却済み）
  - 返却予定日でのソート
- 貸出履歴取得API（GET /api/lending）の追加

### Out of Scope
- CSVエクスポート（PoC対象外）
- 検索・フィルタリング（PoC対象外）

## 2. Dependencies & Prerequisites
- Dependencies: Bolt-001（equipmentテーブル）、Bolt-002（lending_recordsテーブル）
- Prerequisites: Bolt-001・Bolt-002の実装完了

## 3. Design Diff
- 変更ページ: / （コメント画面 → ダッシュボード）
- 追加ページ: /history
- 追加API: GET /api/lending

## 4. Implementation & Tests
- Target paths:
  - `app/page.tsx`（上書き）
  - `app/history/page.tsx`（新規）
  - `app/api/lending/route.ts`（GET追加）

## 5. Deployment Units
- Affected deployment units: Netlify
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

## Next Bolt
- What to do next: 全Bolt完了。本番デプロイ・動作確認
