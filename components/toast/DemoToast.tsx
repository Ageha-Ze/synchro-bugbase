"use client"; // wajib kalau pakai hook / state di client
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DemoToast() {
  return (
    <Button
      onClick={() => {
        toast.success("Bug berhasil ditambahkan!");
      }}
    >
      Tambah Bug
    </Button>
  );
}
