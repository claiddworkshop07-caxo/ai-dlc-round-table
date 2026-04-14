# INT-000 Component Design: 備品貸出管理アプリ

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                      # ダッシュボード（貸出中一覧・アラート）
│   ├── equipment/
│   │   ├── page.tsx                  # 備品一覧ページ
│   │   ├── new/
│   │   │   └── page.tsx              # 備品登録フォームページ
│   │   └── [id]/
│   │       └── page.tsx              # 備品詳細・編集・QRコードページ
│   ├── scan/
│   │   ├── page.tsx                  # QRコードスキャンページ（カメラ起動）
│   │   └── [id]/
│   │       └── page.tsx              # 貸出・返却フォームページ
│   ├── history/
│   │   └── page.tsx                  # 貸出履歴一覧ページ
│   └── api/
│       ├── equipment/
│       │   ├── route.ts              # GET（一覧）/ POST（登録）
│       │   └── [id]/
│       │       └── route.ts          # GET / PUT / DELETE
│       └── lending/
│           ├── route.ts              # GET（一覧）/ POST（貸出）
│           └── [id]/
│               └── return/
│                   └── route.ts      # PUT（返却）
├── components/
│   ├── equipment/
│   │   ├── EquipmentList.tsx         # 備品一覧テーブル（検索・フィルタ付き）
│   │   ├── EquipmentForm.tsx         # 備品登録・編集フォーム
│   │   ├── EquipmentDetail.tsx       # 備品詳細カード
│   │   └── QRCodeDisplay.tsx         # QRコード表示・ダウンロード
│   ├── lending/
│   │   ├── LendingForm.tsx           # 貸出フォーム（借用者名・返却予定日）
│   │   ├── ReturnConfirm.tsx         # 返却確認ダイアログ
│   │   ├── LendingStatusBadge.tsx    # 貸出ステータスバッジ
│   │   └── OverdueAlert.tsx          # 返却期限アラートコンポーネント
│   ├── scan/
│   │   └── QRScanner.tsx             # カメラ起動・QRコードスキャン（html5-qrcode）
│   └── layout/
│       ├── Header.tsx                 # アプリヘッダー・ナビゲーション
│       └── MobileNav.tsx             # スマートフォン用ボトムナビ
├── db/
│   ├── schema.ts                     # Drizzle スキーマ定義
│   └── index.ts                      # DB接続
└── lib/
    ├── equipment.ts                  # 備品ビジネスロジック
    └── lending.ts                    # 貸出ビジネスロジック
```

---

## 主要コンポーネント仕様

### QRCodeDisplay.tsx
- Props: `equipmentId: string`, `equipmentName: string`
- qrcodeライブラリでcanvasにQRコード描画
- QRコードのデータ: `{origin}/scan/{equipmentId}`
- ダウンロードボタン: canvas.toDataURL('image/png') でPNGダウンロード

### QRScanner.tsx
- html5-qrcode または @yudiel/react-qr-scanner を使用
- カメラ起動後、QRコードを検出したら `/scan/{id}` へルーティング
- スマートフォンの背面カメラを優先
- HTTPS環境必須（Netlifyデプロイで対応）

### EquipmentList.tsx
- shadcn/ui Table コンポーネント使用
- 列: 備品名、カテゴリ、保管場所、ステータス、操作
- 検索: クライアントサイドフィルタリング（備品名・カテゴリ）
- ステータス: shadcn/ui Badge（green: 利用可能, yellow: 貸出中）

### LendingForm.tsx
- Props: `equipmentId: string`, `equipmentName: string`
- 入力: 借用者名（Input）、返却予定日（DatePicker）、メモ（Textarea）
- 送信後: 完了メッセージ → / (ダッシュボード) にリダイレクト

### OverdueAlert.tsx
- 返却期限超過: 赤色バッジ + 背景ハイライト
- 期限間近（1日以内）: 黄色バッジ + 背景ハイライト
- shadcn/ui Alert / Badge コンポーネント使用

---

## DBスキーマ（Drizzle）

```typescript
// src/db/schema.ts

import { pgTable, uuid, varchar, text, timestamp, date, pgEnum } from 'drizzle-orm/pg-core'

export const equipmentStatusEnum = pgEnum('equipment_status', ['available', 'borrowed'])
export const lendingStatusEnum = pgEnum('lending_status', ['active', 'returned'])

export const equipment = pgTable('equipment', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  location: varchar('location', { length: 255 }),
  status: equipmentStatusEnum('status').default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const lendingRecords = pgTable('lending_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  equipmentId: uuid('equipment_id').references(() => equipment.id).notNull(),
  borrowerName: varchar('borrower_name', { length: 255 }).notNull(),
  borrowedAt: timestamp('borrowed_at').defaultNow().notNull(),
  dueDate: date('due_date').notNull(),
  returnedAt: timestamp('returned_at'),
  memo: text('memo'),
  status: lendingStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

---

## 使用ライブラリ（追加予定）

| ライブラリ | 用途 |
|---|---|
| qrcode | QRコード生成 |
| html5-qrcode または @yudiel/react-qr-scanner | QRコードスキャン（カメラ） |
| date-fns | 日付操作（期限計算等） |
| react-hook-form | フォーム管理 |
| zod | バリデーション |
