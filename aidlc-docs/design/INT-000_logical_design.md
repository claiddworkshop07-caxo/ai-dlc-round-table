# INT-000 Logical Design: 備品貸出管理アプリ

## アーキテクチャ概要

```
[スマートフォン / PCブラウザ]
        |
        | HTTPS
        |
[Next.js App (Netlify)]
  ├── Pages (App Router)
  │     ├── / (ダッシュボード)
  │     ├── /equipment (備品一覧)
  │     ├── /equipment/new (備品登録)
  │     ├── /equipment/[id] (備品詳細・QRコード)
  │     ├── /scan (QRコードスキャン画面)
  │     ├── /scan/[id] (貸出・返却フォーム)
  │     └── /history (貸出履歴)
  │
  ├── API Routes (Next.js / Netlify Functions)
  │     ├── GET/POST /api/equipment
  │     ├── GET/PUT/DELETE /api/equipment/[id]
  │     ├── GET /api/lending
  │     ├── POST /api/lending (貸出)
  │     └── PUT /api/lending/[id]/return (返却)
  │
  └── DB Layer (Drizzle ORM)
        |
        | 接続
        |
[Neon PostgreSQL]
  ├── equipment テーブル
  └── lending_records テーブル
```

---

## 画面フロー

### 備品マスタ管理フロー
```
/equipment (一覧)
  → [新規登録ボタン] → /equipment/new → 登録完了 → /equipment
  → [備品行クリック] → /equipment/[id] (詳細・編集・QRコード)
                          → [QRコードダウンロード]
                          → [編集保存] → /equipment/[id]
                          → [削除] → /equipment（利用可能時のみ）
```

### 貸出フロー
```
スマートフォン
  → QRコードスキャン（カメラ起動）
  → /scan/[equipment_id] へ遷移
  → 備品情報・ステータス表示
  → [ステータス: 利用可能] → 貸出フォーム（借用者名・返却予定日）
                            → [貸出実行] → 完了画面
  → [ステータス: 貸出中]   → 返却確認画面
                            → [返却実行] → 完了画面
```

### ダッシュボードフロー
```
/ (ダッシュボード)
  → 貸出中一覧（期限超過・期限間近をハイライト）
  → [備品行クリック] → /scan/[equipment_id]（返却フォーム）
  → /history (全履歴)
```

---

## API設計

### Equipment API

| Method | Path | 説明 | Request Body | Response |
|---|---|---|---|---|
| GET | /api/equipment | 備品一覧取得 | - | Equipment[] |
| POST | /api/equipment | 備品登録 | EquipmentInput | Equipment |
| GET | /api/equipment/[id] | 備品詳細取得 | - | Equipment |
| PUT | /api/equipment/[id] | 備品更新 | EquipmentInput | Equipment |
| DELETE | /api/equipment/[id] | 備品削除（論理） | - | 204 / 409(貸出中) |

### Lending API

| Method | Path | 説明 | Request Body | Response |
|---|---|---|---|---|
| GET | /api/lending | 貸出記録一覧（フィルタ可） | query params | LendingRecord[] |
| POST | /api/lending | 貸出開始 | LendingInput | LendingRecord |
| PUT | /api/lending/[id]/return | 返却処理 | - | LendingRecord |

---

## データフロー

### 貸出処理のデータフロー
1. クライアント: POST /api/lending { equipment_id, borrower_name, due_date }
2. API: equipment.statusが'available'か確認（'borrowed'なら409）
3. API: lending_recordsにINSERT (status='active')
4. API: equipment.statusを'borrowed'に UPDATE（トランザクション）
5. レスポンス: 作成されたLendingRecord

### 返却処理のデータフロー
1. クライアント: PUT /api/lending/[id]/return
2. API: lending_record.statusが'active'か確認
3. API: lending_record.returned_at = NOW(), status='returned' にUPDATE
4. API: equipment.statusを'available'にUPDATE（トランザクション）
5. レスポンス: 更新されたLendingRecord
