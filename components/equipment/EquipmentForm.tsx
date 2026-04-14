"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface EquipmentFormProps {
  mode: "create" | "edit";
  defaultValues?: {
    id?: string;
    name: string;
    category: string;
    description: string;
    location: string;
  };
}

export function EquipmentForm({ mode, defaultValues }: EquipmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [category, setCategory] = useState(defaultValues?.category ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [location, setLocation] = useState(defaultValues?.location ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/equipment"
          : `/api/equipment/${defaultValues?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category, description, location }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "エラーが発生しました");
      }

      const data = await res.json();
      if (mode === "create") {
        router.push(`/equipment/${data.id}`);
      } else {
        router.push(`/equipment/${defaultValues?.id}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg shadow-md">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "備品を登録する" : "備品を編集する"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "備品情報を入力して登録します。"
            : "備品情報を変更して保存します。"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">備品名 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: MacBook Pro 14インチ"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">カテゴリ</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="例: PC、AV機器、工具"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">保管場所</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例: 棚A-3、会議室B"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">説明・特記事項</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="備品の詳細や注意事項を記入してください"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "保存中..."
                : mode === "create"
                  ? "登録する"
                  : "更新する"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
