# INT-000 UNIT-001 Component Design: 備品貸出管理Webアプリ

## 概要
INT-000全体のComponent Designと同一。UNIT-001はアプリ全体を単一Unitとして実装するため、
全体Component Designを参照する。

参照: `aidlc-docs/design/INT-000_component_design.md`

---

## Bolt-001スコープのコンポーネント焦点

### 実装対象ファイル（Bolt-001）

```
src/
├── app/
│   ├── equipment/
│   │   ├── page.tsx                  # 備品一覧ページ
│   │   ├── new/
│   │   │   └── page.tsx              # 備品登録フォームページ
│   │   └── [id]/
│   │       └── page.tsx              # 備品詳細・編集・QRコードページ
│   └── api/
│       └── equipment/
│           ├── route.ts              # GET / POST
│           └── [id]/
│               └── route.ts          # GET / PUT / DELETE
├── components/
│   └── equipment/
│       ├── EquipmentList.tsx         # 備品一覧テーブル
│       ├── EquipmentForm.tsx         # 登録・編集フォーム
│       ├── EquipmentDetail.tsx       # 備品詳細カード
│       └── QRCodeDisplay.tsx         # QRコード表示・ダウンロード
├── db/
│   ├── schema.ts                     # equipmentテーブル定義（追加）
│   └── index.ts                      # DB接続（既存流用）
└── lib/
    └── equipment.ts                  # 備品ビジネスロジック関数
```

### 各コンポーネントの詳細

#### EquipmentList.tsx
```tsx
// Props
interface Props {
  equipments: Equipment[]
}
// shadcn/ui: Table, Badge, Input, Button
// - 検索Input（クライアントサイドフィルタ）
// - ステータスBadge: available=緑, borrowed=黄
// - 各行クリック → /equipment/[id]
// - 「新規登録」ボタン → /equipment/new
```

#### EquipmentForm.tsx
```tsx
// Props
interface Props {
  equipment?: Equipment  // 編集時はデータを渡す
  onSubmit: (data: EquipmentInput) => Promise<void>
}
// shadcn/ui: Form, Input, Textarea, Button, Label
// react-hook-form + zod バリデーション
// 必須: name / 任意: category, description, location
```

#### QRCodeDisplay.tsx
```tsx
// Props
interface Props {
  equipmentId: string
  equipmentName: string
}
// qrcode ライブラリで canvas に描画
// QRコードURL: `${window.location.origin}/scan/${equipmentId}`
// ダウンロードボタン: canvas.toDataURL → <a download> でPNG保存
```

### DBスキーマ追記（Bolt-001で追加）

既存の `src/db/schema.ts` に以下を追記:

```typescript
import { pgEnum, pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const equipmentStatusEnum = pgEnum('equipment_status', ['available', 'borrowed'])

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
```

### 追加パッケージ（Bolt-001）
- `qrcode` + `@types/qrcode`: QRコード生成
- `react-hook-form`: フォーム管理
- `zod` + `@hookform/resolvers`: バリデーション
