"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Warehouse } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user?.role;
  const name = session.user?.name;

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Nav links */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
              <Warehouse className="h-5 w-5" />
              DockScheduler
            </Link>

            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>

              {role === "CARRIER" && (
                <Link
                  href="/book"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Book a Slot
                </Link>
              )}

              {role === "STAFF" && (
                <>
                  <Link
                    href="/admin/docks"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Docks
                  </Link>
                  <Link
                    href="/admin/schedule"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Schedule
                  </Link>
                  <Link
                    href="/admin/blackouts"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Blackouts
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: User info + sign out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-700">{name}</span>
              <Badge variant={role === "STAFF" ? "default" : "secondary"}>
                {role}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
