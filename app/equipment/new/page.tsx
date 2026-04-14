import { EquipmentForm } from "@/components/equipment/EquipmentForm";

export default function NewEquipmentPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/40 px-4 py-16">
      <EquipmentForm mode="create" />
    </div>
  );
}
