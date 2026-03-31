"use client";

import { useEffect, useState } from "react";
import type { Dock } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DockForm from "./DockForm";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function DockList() {
  const [docks, setDocks] = useState<Dock[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editDock, setEditDock] = useState<Dock | null>(null);

  async function loadDocks() {
    const res = await fetch("/api/docks");
    const data = await res.json();
    setDocks(data);
    setLoading(false);
  }

  useEffect(() => {
    loadDocks();
  }, []);

  async function toggleActive(dock: Dock) {
    await fetch(`/api/docks/${dock.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !dock.isActive }),
    });
    loadDocks();
  }

  async function deleteDock(id: string) {
    if (!confirm("Delete this dock? All associated schedules will also be deleted.")) return;
    await fetch(`/api/docks/${id}`, { method: "DELETE" });
    loadDocks();
  }

  function handleEdit(dock: Dock) {
    setEditDock(dock);
    setFormOpen(true);
  }

  function handleAdd() {
    setEditDock(null);
    setFormOpen(true);
  }

  if (loading) return <p className="text-gray-500">Loading docks...</p>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Dock
        </Button>
      </div>

      {docks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No docks configured yet. Click &quot;Add Dock&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {docks.map((dock) => (
            <Card key={dock.id}>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{dock.name}</CardTitle>
                    <Badge variant={dock.isActive ? "default" : "secondary"}>
                      {dock.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(dock)}
                    >
                      {dock.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(dock)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => deleteDock(dock.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {dock.description && (
                  <p className="text-sm text-gray-500 mt-1">{dock.description}</p>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <DockForm
        open={formOpen}
        onOpenChange={setFormOpen}
        dock={editDock}
        onSaved={loadDocks}
      />
    </div>
  );
}
