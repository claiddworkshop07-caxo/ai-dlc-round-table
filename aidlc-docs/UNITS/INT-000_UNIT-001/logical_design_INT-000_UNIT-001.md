# INT-000 UNIT-001 Logical Design: 備品貸出管理Webアプリ

## 概要
INT-000全体のLogical Designと同一。UNIT-001はアプリ全体を単一Unitとして実装するため、
全体Logical Designを参照する。

参照: `aidlc-docs/design/INT-000_logical_design.md`

---

## Bolt-001スコープのロジック焦点

### 実装対象API（Bolt-001）

| Method | Path | 説明 |
|---|---|---|
| GET | /api/equipment | 備品一覧（deleted_atがNULLのみ） |
| POST | /api/equipment | 備品登録 |
| GET | /api/equipment/[id] | 備品詳細 |
| PUT | /api/equipment/[id] | 備品更新 |
| DELETE | /api/equipment/[id] | 備品論理削除（status='borrowed'なら409） |

### 実装対象ページ（Bolt-001）

| ページ | パス | 説明 |
|---|---|---|
| 備品一覧 | /equipment | 検索・フィルタ付きテーブル |
| 備品登録 | /equipment/new | 登録フォーム |
| 備品詳細 | /equipment/[id] | 詳細・編集・QRコード表示 |

### データフロー（Bolt-001）

```
[/equipment/new フォーム]
  → POST /api/equipment
  → DBにINSERT (status='available')
  → 登録完了 → /equipment へリダイレクト

[/equipment/[id] 編集]
  → PUT /api/equipment/[id]
  → DBにUPDATE
  → 更新完了 → /equipment/[id] 再表示

[/equipment/[id] 削除]
  → DELETE /api/equipment/[id]
  → status='borrowed'チェック → 409 or deleted_at=NOW()のUPDATE
  → 削除完了 → /equipment へリダイレクト

[/equipment/[id] QRコード]
  → クライアントサイドでqrcodeライブラリを使用してcanvas描画
  → ダウンロードボタンでPNG保存
```
