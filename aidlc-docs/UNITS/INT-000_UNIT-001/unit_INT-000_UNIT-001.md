# INT-000 UNIT-001: 備品貸出管理Webアプリ

## Purpose（目的）
備品の貸出・返却・マスタ管理・履歴確認を一体的に提供するWebアプリケーション全体を担うUnit。
スマートフォンのブラウザからQRコードスキャンで貸出・返却が行え、
管理者がPCブラウザから備品マスタ管理・状況確認ができる単一WebアプリをPoC実装する。

## Boundaries（境界）
- このUnitが担う機能:
  - 備品マスタ管理（FR-001）
  - QRコードスキャンによる貸出・返却（FR-002）
  - 貸出状況ダッシュボード・返却期限アラート（FR-003）
  - 貸出履歴一覧・検索（FR-004）
- このUnitが担わない機能:
  - ユーザー認証・権限管理（PoC対象外）
  - 外部システム連携
  - ネイティブモバイルアプリ

## Dependencies（依存）
- Neon (PostgreSQL): データ永続化
- Netlify Functions: APIエンドポイント
- Next.js (TypeScript): フロントエンドフレームワーク
- Drizzle ORM: DBアクセス層

## Bolts（実装単位）
| Bolt ID | 内容 | 対応US |
|---|---|---|
| Bolt-001 | 備品マスタ管理（登録・編集・一覧・QRコード発行） | US-001 |
| Bolt-002 | QRコードスキャンによる貸出・返却処理 | US-002, US-003 |
| Bolt-003 | 貸出状況ダッシュボード・返却期限アラート・履歴 | US-004, US-005 |

## Current Status
- Bolt-001: In Progress
- Bolt-002: Not Started
- Bolt-003: Not Started
