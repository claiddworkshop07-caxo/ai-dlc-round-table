# INT-000 Domain Design: 備品貸出管理アプリ

## ドメイン概念

備品貸出管理ドメインは「備品（Equipment）」と「貸出記録（LendingRecord）」を中心に構成される。
備品は登録・QRコード発行の対象であり、貸出記録によって誰がいつ借りたかを追跡する。

---

## 用語定義

| 用語 | 定義 |
|---|---|
| 備品 (Equipment) | 貸出対象となる物品。QRコードで一意に識別される |
| 貸出記録 (LendingRecord) | 1回の貸出・返却を表すトランザクションレコード |
| 借用者 (Borrower) | 備品を借りる人（PoC段階では名前のみ、認証なし） |
| QRコード (QR Code) | 備品IDを埋め込んだ二次元バーコード。備品に物理的に貼り付ける |
| 返却期限 (Due Date) | 借用者が約束した返却予定日 |
| 期限超過 (Overdue) | 返却予定日を過ぎても返却されていない状態 |
| 利用可能 (Available) | 貸出中でなく、借りることができる状態 |
| 貸出中 (Borrowed) | 現在誰かが借りている状態 |

---

## エンティティ定義

### Equipment（備品）

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK, NOT NULL | 備品の一意識別子（QRコードに埋め込む） |
| name | VARCHAR(255) | NOT NULL | 備品名 |
| category | VARCHAR(100) | nullable | カテゴリ（例: PC、AV機器、工具） |
| description | TEXT | nullable | 備品の説明・特記事項 |
| location | VARCHAR(255) | nullable | 通常の保管場所 |
| status | ENUM | NOT NULL | available / borrowed |
| created_at | TIMESTAMP | NOT NULL | 登録日時 |
| updated_at | TIMESTAMP | NOT NULL | 最終更新日時 |
| deleted_at | TIMESTAMP | nullable | 論理削除日時（NULLなら有効） |

### LendingRecord（貸出記録）

| フィールド | 型 | 制約 | 説明 |
|---|---|---|---|
| id | UUID | PK, NOT NULL | 貸出記録の一意識別子 |
| equipment_id | UUID | FK → equipment.id, NOT NULL | 対象備品 |
| borrower_name | VARCHAR(255) | NOT NULL | 借用者名 |
| borrowed_at | TIMESTAMP | NOT NULL | 貸出日時（自動設定） |
| due_date | DATE | NOT NULL | 返却予定日 |
| returned_at | TIMESTAMP | nullable | 返却日時（返却時に設定） |
| memo | TEXT | nullable | 備考 |
| status | ENUM | NOT NULL | active（貸出中）/ returned（返却済み） |
| created_at | TIMESTAMP | NOT NULL | レコード作成日時 |

---

## エンティティ関係

```
Equipment 1 ----< LendingRecord
（1つの備品に対して複数の貸出記録が存在する）
（ある時点でstatusがactiveなLendingRecordは最大1件）
```

---

## ビジネスルール

1. 「利用可能」な備品のみ貸出処理できる（貸出中の備品を二重貸出不可）
2. 「貸出中」の備品のみ返却処理できる
3. 「貸出中」の備品は削除できない
4. 返却日時（returned_at）が設定されると、対象備品のstatusを「利用可能」に戻す
5. 貸出記録のstatusと備品のstatusは常に整合性を保つ

---

## QRコードのデータ形式

QRコードには以下のURLパスを埋め込む:

```
/scan/{equipment_id}
```

スマートフォンでスキャンするとWebアプリのスキャンページに遷移し、
該当備品の貸出・返却フォームが表示される。
