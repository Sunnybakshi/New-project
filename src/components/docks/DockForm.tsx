"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Dock } from "@prisma/client";
import { dockSchema, type DockInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DockFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dock?: Dock | null;
  onSaved: () => void;
}

export default function DockForm({ open, onOpenChange, dock, onSaved }: DockFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DockInput>({ resolver: zodResolver(dockSchema) });

  useEffect(() => {
    if (dock) {
      reset({ name: dock.name, description: dock.description || "", isActive: dock.isActive });
    } else {
      reset({ name: "", description: "", isActive: true });
    }
  }, [dock, reset]);

  async function onSubmit(data: DockInput) {
    const url = dock ? `/api/docks/${dock.id}` : "/api/docks";
    const method = dock ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dock ? "Edit Dock" : "Add Dock"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dock-name">Name *</Label>
              <Input id="dock-name" placeholder="Dock A" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dock-desc">Description</Label>
              <Input
                id="dock-desc"
                placeholder="Main receiving dock"
                {...register("description")}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="dock-active"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                {...register("isActive")}
              />
              <Label htmlFor="dock-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
