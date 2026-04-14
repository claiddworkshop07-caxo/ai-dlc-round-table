# INT-000 UNIT-001 Domain Design: 備品貸出管理Webアプリ

## 概要
INT-000全体のDomain Designと同一。UNIT-001はアプリ全体を単一Unitとして実装するため、
全体Domain Designを参照する。

参照: `aidlc-docs/design/INT-000_domain_design.md`

---

## Bolt-001スコープのドメイン焦点

Bolt-001（備品マスタ管理）では以下のドメイン概念を実装する。

### 対象エンティティ
- **Equipment（備品）**: 全フィールドを実装
  - id, name, category, description, location, status, created_at, updated_at, deleted_at

### Bolt-001時点のビジネスルール
1. 備品は登録時にstatus='available'で作成される
2. deleted_atがNULLの備品のみ一覧に表示する（論理削除）
3. status='borrowed'の備品は削除不可（409エラー）
4. QRコードのデータ形式: `{origin}/scan/{equipment_id}`

### Bolt-001では実装しないドメイン概念
- LendingRecord（貸出記録）: Bolt-002で実装
- 返却期限アラートロジック: Bolt-003で実装
