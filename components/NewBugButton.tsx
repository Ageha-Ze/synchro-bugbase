"use client";

import { useState } from "react";
import NewBugModal from "@/app/(dashboard)/projects/[id]/NewBugModal";
import { Button } from "@/components/ui/button";

export default function NewBugButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
        + Add New Bug
      </Button>
      {open && <NewBugModal projectId={projectId} onClose={() => setOpen(false)} />}
    </>
  );
}
